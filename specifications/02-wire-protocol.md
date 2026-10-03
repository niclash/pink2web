# 02 — WebSocket Wire Protocol (FBP-derived, modified)

> This protocol is what the frontend speaks. The frontend will not change, so this document is the **contract** the C rewrite must honor exactly — including its bugs, asymmetries, and dead branches, unless the user explicitly asks to fix something (tracked in `00-README.md`).

## 0. Transport

One WebSocket per browser tab, at `ws://<host>:<port+1>/` (the FBP protocol always runs on `REST_port + 1`; see `05-app-lifecycle-persistence.md`). One JSON object per frame, no batching/framing beyond what the WebSocket protocol itself provides.

## 1. Envelope

### Client → Server
```json
{ "protocol": "environment|runtime|network|graph|component|trace",
  "command": "<string>",
  "payload": { ... },
  "secret": "<string>" }
```
Parsed ad-hoc in `Fbp.execute` — all four fields are required and type-checked as `String`/`String`/`JObj`/`String` inside one `try`. **Any missing/mistyped field (including `payload` not being an object) rejects the entire message** with:
```json
{"protocol":"network","command":"error","payload":{"stack":"","message":"Badly formatted request: <raw text>"}}
```
`secret` must always be present as a string — `""` is fine, `null`/absent is not. `payload` must always be a JSON object, `{}` for commands with no arguments.

### Server → Client
Built via the `Message` primitive: `{protocol, command, payload}` **plus `+("secret", NotSet)`**. Because the underlying JSON library treats adding a `NotSet` value as a key **deletion**, not a null, **every server-originated message omits the `"secret"` key entirely** (not even `"secret":null`). Two handlers build envelopes by hand (`environment:login`, `environment:logout`) with the same omission.

**Two messages deviate from the `{protocol,command,payload:object}` convention — must be special-cased:**
- `component:componentsready` — payload is a **bare JSON integer**, not an object: `{"protocol":"component","command":"componentsready","payload":7}`.
- `environment:logout` reply has **no `"payload"` key at all**: `{"protocol":"environment","command":"logout"}`.

### Error format (used for every failure, across all sub-protocols)
```json
{"protocol":"network","command":"error","payload":{"stack":"","message":"<text>"[,"graph":"<id>"]}}
```
`"stack"` is always `""`. `"graph"` is present only when a graph id was known at the error site (usually absent — most call sites pass `None`). **Every sub-protocol's errors — environment, runtime, graph, component, trace — are reported as `network:error`.** There is no `graph:error`/`component:error`/`runtime:error`; the frontend has unused listener code expecting some of these that the backend never sends.

## 2. Authentication / authorization

### `Authorizer` (system/auth) semantics
- `authorize(user, pass)`: on match, mints `secret = UUID.v4().string()`, appends to a flat `_secrets: Array[String]`, returns it. No retry-on-collision (collision → silent "bad login," astronomically unlikely).
- `clearAuthorization(secret)`: removes one matching entry; no-op (no error) if not found.
- `isValid(secret)`: `true` iff present in `_secrets`. **On failure, logs the invalid secret AND every currently-valid secret at Info level** — a real information-leak-to-logs bug to note.
- **No session/user binding** — any client holding any currently-valid secret can use it, regardless of which login minted it or which socket it arrived on. Secrets never expire except via explicit logout or process restart (in-memory only). Logging out clears the secret **globally** — two tabs sharing one secret: logging out in one invalidates the other.

### `environment:login`
Request: `{"user":"...", "password":"..."}`. Unauthenticated (no secret check). Success → `{"protocol":"environment","command":"login","payload":{"secret":"<uuid>"}}`. Failure (bad credentials or missing payload keys) → generic `network:error` with message `"Bad Login"` or `"Invalid payload"` — no distinction between "unknown user" and "wrong password."

### `environment:logout`
Request: `{}`, with `secret` = the secret to clear. Calls `clearAuthorization(secret)` unconditionally (no prior validity check — clearing garbage is a silent no-op). **Always** replies `{"protocol":"environment","command":"logout"}` — no `payload` key (see §1).

### Secret gating on every other sub-protocol
`runtime`, `network`, `graph`, `component`, `trace` dispatchers each validate `secret` via `Authorizer.isValid` **before** dispatching the command. On invalid secret: `network:error` with message `"Invalid secret: <echoed secret>"` (the client's own submitted value is echoed back — low risk since it's their own data, but note for the rewrite). `environment` itself is not secret-gated (login obviously can't be; logout takes secret as its payload purpose, not a gate).

### ⚠️ Critical asymmetry: passive event reception is never gated
`Fbp.subscribe(websocket)` is called unconditionally the instant any WebSocket connects — **before login**. This means **every open, unauthenticated connection immediately receives all graph-change broadcasts and all stdout/stderr mirroring for the entire runtime.** Only *active* request commands (addnode, start, etc.) require a valid secret. This is either an intentional "read is public, write requires auth" design or an oversight — flagged as an open question for the user.

## 3. Protocol namespaces

### 3.1 `environment` — `login`, `logout` only (§2). Anything else → generic error.

### 3.2 `runtime` (secret-gated)

| command | request payload | behavior |
|---|---|---|
| `getruntime` | `{}` | Cascade: (1) one `runtime:runtime` push (§3.2.1); (2) one `component:component` per registered block type; (3) one `component:componentsready` with the count; (4) **side effect**: as part of the ready-callback, `graph.status()` fires for every existing graph, broadcasting `network:status` **to every connected client**, not just the requester. |
| `new_graph` | `{"id"?,"name"?,"description"?,"icon"?}` all optional (`id`→fresh UUIDv4 if absent, `name`→`"<<new graph>>"`, others→`""`) | No direct reply — the only acknowledgement is the `runtime:new_graph` **broadcast to all subscribers** (§3.2.2), fired because `Graphs.create_graph` loops every subscriber. |
| `delete_graph` | `{"id","name"}` both required | No direct reply; broadcasts `runtime:delete_graph` to all subscribers (§3.2.3). |
| other | — | generic error |

**`runtime:runtime` push** (§3.2.1):
```json
{"protocol":"runtime","command":"runtime","payload":{
  "id":"<uuid, generated once at boot>",
  "label":"Pink2Web - flowbased programming engine written in Pony Language",  // current literal value — nothing parses/validates this string's content, so the C rewrite should update it to describe itself rather than preserve the old language name
  "version":"0.1.0",
  "allCapabilities":["network:status","network:persist","network:data","network:control","protocol:component","protocol:runtime","protocol:graph"],
  "capabilities":["...same array, literally identical..."],
  "type":"pink2web","namespace":"pink2web","repository":"","repositoryVersion":""
}}
```
**Bug**: `capabilities` and `allCapabilities` are always byte-identical — there is no actual per-secret capability scoping, despite the field names implying it.

**`runtime:new_graph` broadcast** (§3.2.2): `{"protocol":"runtime","command":"new_graph","payload":{"graph":"<id>","name":"<name>","description":"<descr>","icon":"<icon>"}}`.

**`runtime:delete_graph` broadcast** (§3.2.3): `{"protocol":"runtime","command":"delete_graph","payload":{"graph":"<id>","name":"<name>"}}`.

**`runtime/ports` is dead code**: builds a message by hand (not even via the `Message` primitive), always with empty `inPorts`/`outPorts` arrays, and **is never called from anywhere**. The frontend has listener plumbing expecting a richer port-descriptor shape that the backend never sends. Not part of the live protocol today.

### 3.3 `network` (secret-gated)

| command | request payload | behavior |
|---|---|---|
| `start` | `{"graph":String}` | `graph.start()`. No direct reply — `network:started` broadcasts (graph-filtered per subscriber, §4). Missing `graph` key → error; **unknown graph id is silently swallowed** (server-side log only, nothing sent to the client). |
| `stop` | `{"graph":String}` | `graph.stop()` → `network:stopped` broadcast. Same silent-unknown-graph behavior. |
| `getstatus` | `{"graph":String}` | `graph.status()` → `network:status` broadcast **to all subscribers**, not just requester. |
| `persist` | `{"graph":String}` | `graph.persist()` — serializes `graph.describe()` to `<graph_directory>/<graph-id>`. **No wire reply at all**, success or failure (failure only logs server-side + broadcasts `network:error` with message `"Unable to save graph: <name> (<id>)"`). See `05-app-lifecycle-persistence.md` for why the written file can't be reloaded. |
| `edges` | `{"graph":String,"edges":[{"src":{"node","port"["index"]},"tgt":{...}}]}` | Link-value subscription mechanism — see §4.2. Echoes payload back as `network:edges` ack, requester only. |
| `debug` | `{"enable":Bool,"graph":String}` | Matched but **no-op** — frontend sends this, backend does nothing. |
| `connect`/`disconnect`/`begingroup`/`endgroup` | — | Matched but **no-op**. These are the standard-FBP execution-tracing events; the backend never emits the corresponding push events either (`network:connect` etc. don't exist). |
| other | — | generic error |

**`network:started`**: `{"protocol":"network","command":"started","payload":{"graph":"<id>","time":"<ISO8601>","started":true,"running":true,"debug":false}}`.
**`network:stopped`**: `{"protocol":"network","command":"stopped","payload":{"graph":"<id>","time":"<ISO8601, original start time>","uptime":<I64 seconds>,"started":<bool>,"running":false,"debug":<bool>}}`.
**`network:status`**: `{"protocol":"network","command":"status","payload":{"graph":"<id>","name":"<name>","description":"<descr>","uptime":<I64>,"running":<bool>,"started":<bool>,"debug":<bool>}}` — note field order is `running` before `started` here, unlike `started`/`stopped` which put `started` first; harmless for JSON but noted for exactness.
**`network:data`** (link-value stream, §4.2): `{"protocol":"network","command":"data","payload":{"id":"unknown","graph":"<id>","src":{"node","port"},"tgt":{"node","port"},"data":"<stringified Linkable>"}}`. `"id"` is always the literal string `"unknown"`. `"data"` is **always a string**, even for numbers/bools — type information is lost on the wire.
**`network:edges`** ack: echoes the request payload verbatim back, requester only.
**`network:output`** / **`network:error`** (stdout/stderr mirroring, not gated by secret or graph — sent to every open connection via `RemoteOutStream`): `{"protocol":"network","command":"output","payload":{"type":"message","message":"<text>"}}`. Note: as established in `05-app-lifecycle-persistence.md`, this mirroring path is **currently inert by default** (`remote_log` defaults false) — so in practice `network:output`/mirrored `network:error` are not actually emitted today, only explicit protocol-error `network:error` calls are. Two logically distinct "error" sources share one wire command with no way to distinguish them.

### 3.4 `graph` (secret-gated)

| command | request payload | reply / broadcast |
|---|---|---|
| `list` | `{}` | No direct reply — triggers `graph.status()` for every graph → `network:status` broadcast to **all** subscribers. |
| `connect` | `{"id":String}` | Full graph replay to requester only — see §4.1 (two-phase, 500ms delayed edges/initials). Also switches this connection's event-subscription filter to this graph id. |
| `rename` | `{"id","from","to"}` | ⚠️ **No wire message is ever sent.** `Graphs.rename_graph` → `Graph.rename` does not fire any `GraphNotify` callback — a silent server-side mutation invisible to every client, including the requester. |
| `addnode` | `{"id","graph","component","metadata"?:{"x","y"}}` (id/graph/component required) | `graph:addnode` broadcast (graph-filtered) `{"graph","component","id","metadata":{"x":F64,"y":F64}}`. **Bug**: a missing required field triggers the error path **twice** (both the field-getter helper and its caller's `try/else` each fire `ErrorMessage`) — client receives two identical `network:error` messages for one bad request. |
| `removenode` | `{"id","graph"}` | `graph:removenode` broadcast `{"id","graph"}`. |
| `renamenode` | `{"from","to","graph"}` | `graph:renamenode` broadcast `{"graph","from","to"}`. |
| `changenode` | `{"id","metadata":{"x","y"},"graph"}` | `graph:changenode` broadcast `{"id","graph","metadata":{"x":F64,"y":F64}}`. |
| `addedge` | `{"src":{"node","port"["index"]},"tgt":{...},"graph","metadata"?}` | `graph:addedge` broadcast `{"graph","src":{"node","port"},"tgt":{"node","port"}}` — **`metadata` (route/schema/secure) is parsed from nothing (dead TODO) and always dropped, never echoed.** |
| `removeedge` | `{"src","tgt","graph"}` | `graph:removeedge` broadcast, same src/tgt shape. |
| `changeedge` | `{"src","tgt","metadata":{"route","secure"?,"schema"?},"graph"}` | ⚠️ **No broadcast at all** (mutation body is a TODO no-op). The handler instead echoes the raw request **only to the requester** as `graph:changeedge`. Other clients viewing the same graph never see this change. Real multi-client bug. |
| `addinitial` | `{"tgt":{"node","port"["index"]},"src":{"data":<Linkable>},"graph"}` | `graph:addinitial` broadcast `{"graph","src":{"data":<value>},"tgt":{"node","port"}}`. |
| `changeinitial` | same shape as `addinitial` | **Not a real command** — implemented as a remove+add pair (`graph:removeinitial` then `graph:addinitial`), never its own wire message. Also has a bug: `graph.set_initial` is called with the **stringified** value rather than typed `Linkable`, unlike `addinitial`. Frontend's own comment: *"changeinitial is not documented in FBP. It is an extension."* |
| `removeinitial` | `{"tgt":{...},"src":{"data":<ignored>}},"graph"}` | ⚠️ **Double-send quirk**: the handler echoes the raw request payload back to the requester as `graph:removeinitial`, AND separately the real `_removed_initial` broadcast fires with the **actual** old value to all subscribers — a client that's both requester and subscriber (always true) gets two `graph:removeinitial` messages, potentially with different `src.data` content. |
| `addinport` | `{"graph","node","port","public":String}` (field is literally **`"public"`**, not `"name"`) | `graph:addinport` broadcast `{"graph","name":<value of "public">,"node","port"}` — **reply key is `"name"`, request key is `"public"`**; must be preserved exactly. |
| `removeinport` | `{"graph","public"}` | `graph:removeinport` broadcast `{"graph","name"}`. |
| `renameinport` | `{"graph","from","to"}` | `graph:renameinport` broadcast `{"graph","from","to"}`. |
| `addoutport` | `{"graph","node","port","public"}` | `graph:addoutport` broadcast `{"graph","name","node","port"}`. |
| `removeoutport` | `{"graph","public"}` | `graph:removeoutport` broadcast `{"graph","name"}`. |
| `renameoutport` | `{"graph","from","to"}` | `graph:renameoutport` broadcast `{"graph","from","to"}`. |
| `addgroup`/`removegroup`/`renamegroup`/`changegroup` | — | **Fully unimplemented** — dispatcher cases exist but are no-ops, and the four underlying source files (`protocol/graph/addgroup`, `removegroup`, `changegroup`, `renamegroup`) are **empty (0 bytes)**. Frontend has full request+listener plumbing for all four, unused by any current UI component. |
| other | — | generic error |

**Known frontend bugs worth preserving-or-flagging** (not backend bugs, but relevant since the frontend won't change): `request_rename_graph()` sends `command:"delete"` instead of `"rename"` (hits the generic error path — currently unused by any UI component). `request_removegroup()` sends `command:"renamegroup"` instead of `"removegroup"` (copy-paste bug, also currently unused).

### 3.5 `component` (secret-gated)

| command | payload | reply |
|---|---|---|
| `list` | `{}` | One `component:component` per registered block type, then one `component:componentsready`. |
| `getsource` | (ignored) | Always a hardcoded, non-functional stub: `{"name":"main2","language":"json","library":"pink2web","code":"","tests":""}` — both frontend and backend treat this as a non-feature kept only for spec completeness. |
| other | — | generic error |

**`component:component` push**, one per type:
```json
{"protocol":"component","command":"component","payload":{
  "name":"<e.g. math/Add2>","description":"<string>","subgraph":false,"icon":"<icon name>",
  "inPorts":[{"id":"<port>","description":"<string>","type":"<number|bool|link|string>","addressable":false}, ...],
  "outPorts":[ same shape ]
}}
```
(Confirmed matches `docs/componentInfo-protocol.json`.) **No `fullId` field is ever sent**, though the frontend's TypeScript interface declares one expecting it — harmless (nothing downstream reads it) but a literal schema gap worth noting.

**`component:componentsready`**: bare-integer payload, see §1.

### 3.6 `trace` (secret-gated) — essentially a stub
Only `clear` is matched, and it's a no-op. Every other command (`start`/`stop`/`dump`, which the frontend has listener plumbing for but — note — **no request-sending methods at all**, confirming this sub-protocol is unused end-to-end today) falls to the generic error. Safe to implement as a stub in the C rewrite unless the user wants it built out.

## 4. Subscription model

### 4.1 Connection lifecycle and graph-event filtering
On **every** WebSocket connect, before login, `Fbp.subscribe` is called unconditionally: registers the socket for stdout/stderr mirroring (`add_remote`) and an **unfiltered** `Subscription` with `Graphs` — the new connection immediately receives every graph's change events, system-wide.

On `graph:connect {"id":X}`: the connection's subscription is **replaced** with a `GraphFilterSubscription(X, ...)` that drops any event whose `graph`/`graphid` argument != X, for: added/renamed/changed/removed block, added/removed connection, added/removed/renamed in/outport, added/removed initial, started, stopped. **It does NOT filter**: `err`, `created_graph`, `deleted_graph`, `status` — these four **always pass through regardless of which graph is connected**. So a client connected to graph A still receives `runtime:new_graph`, `runtime:delete_graph`, `network:status`, and `network:error` for every graph system-wide. Calling `graph:connect` again (different id) correctly swaps the filter (matched by connection identity). There is no `graph:disconnect` handler on the backend (frontend has the method, unused by current UI, would error if called).

### 4.1.1 `graph:connect` replay — timing hazard to replicate or fix
On `graph:connect`, the reply sequence is:
1. **Synchronously, immediately**: `graph:clear` (`{"id","name","main":true,"description","icon"}` — note: **no `"library"` field**, though the frontend type declares one), then one `graph:addnode` per block, then `graph:addinport`/`graph:addoutport` per port.
2. A **one-shot 500ms timer** fires, and only then: `graph:addinitial` per non-default initial value, and `graph:addedge` per link — re-parsed from the JObj snapshot captured at connect-time (so internally consistent with that moment, but not synchronized with any concurrent mutations that happen during the 500ms window).

**This means a client rendering the graph as soon as nodes/ports arrive shows an edge-less, initial-less graph for up to half a second.** No comment in the source explains the 500ms delay beyond a debug log line — it reads as a workaround/bug, not intentional design. **Recommend making this synchronous in the C rewrite** (send everything in one shot) — flagged as an open question, since it changes observable client-side behavior (for the better) but is a deliberate deviation from current behavior.

### 4.2 Link-value subscriptions (`network:edges`)
Request: `{"graph":"...","edges":[{"src":{"node","port"},"tgt":{"node","port"}}, ...]}`.
1. Each pair becomes a `LinkSubscription` with a callback that sends `network:data` back over the requesting connection.
2. A connection can have only **one active set** of link subscriptions at a time — a new `network:edges` request fully **replaces** the previous set (does not merge).
3. Subscribing finds the **destination** block's named input and calls `Input.subscribe`, which **immediately fires once with the input's current value** (so the client gets an instant snapshot), then on every subsequent `Input.set()`.
4. No explicit unsubscribe command exists — link subscriptions are torn down only by (a) sending a replacement `network:edges` request, or (b) WebSocket close (`Fbp.closing` unsubscribes everything for that connection, assuming — correctly in practice, but structurally fragile — that all of a connection's link subscriptions belong to one graph).
5. Reply to the requester only: `network:edges` echoing the request payload (pure ack).

## 5. Divergences from the vendored upstream FBP protocol spec (`fbp-protocol/spec/protocol.js.md`)

The vendored spec itself documents this fork as: **added** `graph:list`, `graph:connect`; **removed** `secret` from inside `payload` (claimed). The actual implementation:
1. **Reintroduces `secret` at the top level of the envelope** (not inside payload) — contradicting the vendored doc's claim it was removed outright.
2. **No `requestId`/`responseTo` correlation anywhere** — replies are matched to requests purely by protocol+command+client-side context/timing. This is the single biggest structural divergence from standard FBP/NoFlo and the frontend is built around its absence — **do not add request-id correlation**, the frontend never sends or expects it.
3. Invents a stateful `environment:login`/`logout` handshake (standard FBP treats `secret` as a static pre-shared credential on every message, not something obtained via login).
4. `graph:list` doesn't send a bulk list reply — it triggers N separate `network:status` broadcasts to every connected client.
5. `graph:connect` is non-standard and conflates "subscribe to this graph" with "replay its entire structure," via the two-phase/500ms-delayed mechanism in §4.1.1.
6. **No real capability scoping** — `capabilities`/`allCapabilities` are always identical; the spec's per-secret capability-restriction model isn't implemented.
7. **All errors funnel through `network:error`** rather than each sub-protocol having its own `<proto>:error` — frontend has unused listener code for `component:error`/`network:processerror` that the backend never emits.
8. **`network:icon`/`connect`/`disconnect`/`begingroup`/`endgroup`** (standard FBP execution-tracing events) are never emitted — frontend has full listener plumbing, backend has no corresponding message primitives at all.
9. **Values are always strings on the wire** (`network:data.data`, initial values) rather than native JSON types — numeric/boolean type information is lost in transit and must be re-parsed by the receiver.

## 6. Explicit cross-check: frontend ↔ backend gaps (compiled, for the rewrite's test plan)

**Frontend sends/expects something the backend doesn't fully implement:**
- `graph:disconnect`, `graph:addgroup`/`removegroup`/`renamegroup`/`changegroup`, `network:debug`, `network:connect`/`disconnect`/`begingroup`/`endgroup` — all no-ops or errors server-side. None are currently invoked by any live UI component (verified against `ReteController.vue` and other Vue components), so they're "latent API surface," not actively broken features.
- `component:error`, `network:processerror`, `network:icon`, `runtime:ports` (rich shape) — frontend has listener dispatch cases; backend never sends any of these under any code path.
- `component:getsource` — stub reply both sides agree is a non-feature.
- `trace:start`/`stop`/`dump` — frontend doesn't even have request-sending methods for these; fully unused end-to-end.

**Backend sends something the frontend's types claim but never populates (harmless but worth matching deliberately):**
- `graph:clear` omits `library`; `component:component` omits `fullId`.
- `addinport`/`addoutport`: request field `"public"` → reply field `"name"` (both sides agree on this convention — just easy to get wrong in a reimplementation, preserve exactly).
- `component:componentsready` (bare integer payload) and `environment:logout` (no payload key) both deviate from the uniform envelope shape — a strongly-typed C client must special-case both.

**Recommendation**: build the C rewrite's test suite directly against this section — each row is a concrete request/response pair to assert on.

## 7. Resolution per project-wide bug policy

Project-wide decision: **fix obvious bugs by default, document each fix.** For this document specifically, that policy is scoped carefully, because unlike the engine-internals specs, **this document is a compatibility contract with a frontend that will not change.** Anything the frontend actually sends/parses today must keep working identically — "fixing" a wire-format quirk the frontend depends on would break the frontend. Applying the policy here means:

- **Preserve as-is (frontend-dependent contract, not a bug to fix):** envelope shape (including the `secret`-key-omission quirk, the `componentsready` bare-integer payload, the `logout` payload-less reply), the complete absence of `requestId`/`responseTo` correlation, stringified `network:data`/initial values, the `addinport`/`addoutport` `"public"`→`"name"` field rename, the always-identical `capabilities`/`allCapabilities`, the unfiltered passthrough of `err`/`created_graph`/`deleted_graph`/`status` through `GraphFilterSubscription`, and the unauthenticated passive-subscription behavior (§2, "critical asymmetry") — changing any of these is an API break, not a bug fix, so they are **preserved exactly**.
- **Fix (implement properly rather than reproduce the gap):** `graph:rename` should actually broadcast a change event to subscribers (currently fires nothing at all); `graph:changeedge` should broadcast to all subscribers, not just echo to the requester; `graph:removeinitial`'s double-send should be collapsed to a single, correct broadcast; `graph:addgroup`/`removegroup`/`renamegroup`/`changegroup` should be implemented for real, since the frontend already has complete request/listener plumbing for all four and the current empty `` files are simply unfinished work, not an intentional contract; the duplicate-error-on-`addnode` quirk should be collapsed to one error message.
- **Make synchronous (behavior improvement, not a contract break):** the `graph:connect` two-phase/500ms-delayed replay (§4.1.1) should be sent as a single, immediate, consistent snapshot. The frontend has no logic depending on the delay itself (it just reacts to whichever messages arrive), so collapsing it to one atomic reply is safe and strictly better.
- **Leave as stubs (out of scope per the driver-scope decision, or genuinely unused):** `trace:*`, `network:debug`, `network:connect`/`disconnect`/`begingroup`/`endgroup`, `runtime:ports`, `component:getsource` — none of these are exercised by any live UI component today; implement as harmless no-ops/stubs exactly as now, revisit only if the user later wants these features built out.
