# 05 — CLI, Startup, Graph Persistence, REST/Static Server, System Utilities

> ⚠️ This subsystem contains the most consequential bugs found in the whole codebase: **the graph save format cannot be reloaded by the graph loader.** See §3. A C rewrite must make a deliberate decision here — see open question in `00-README.md`.

## 1. CLI command tree

Root command: `pink2web`. Global options (apply to every subcommand):

| Flag | Type | Default | Effect |
|---|---|---|---|
| `--warn` | bool | false | log level ≥ Warn |
| `--info` | bool | false | log level ≥ Info |
| `--fine` | bool | false | log level ≥ Fine (most verbose) |
| `--basedir` | string | `"."` | base directory |
| `--confdir` | string | `"/etc/pink2web"` | configuration directory |

Precedence when multiple log-level flags are set: `fine > info > warn > Error` (Error is the implicit default when none are passed — i.e. **least** verbose by default).

Subcommands:
- `list types` — prints every registered block type name to stdout.
- `describe type <typename>` — prints the JSON descriptor of one block type.
- `describe topology <filename>` — loads a graph file (standalone, not attached to a running engine) and prints its `Graph.describe()` JSON, then shuts down.
- `run [options] process <filenames>` — `filenames` is a **colon-separated** list (`a.json:b.json`). Starts a `RuntimeEngine`, then loads each file in order via `engine.load_graph(filename)`.
- `run [options] daemon` — starts a `RuntimeEngine`, then walks `$BASEDIR/graphs/` and calls `engine.load_graph(name)` for **every directory entry** (no extension filtering — any file in that directory is attempted as a graph).

`run`'s own options (shared by `process` and `daemon`):

| Flag | Type | Default | Notes |
|---|---|---|---|
| `--id` | string | `"dev-1234"` | engine id, used in the `RuntimeMessage` sent to clients |
| `--webdir` | string | `""` | if empty, resolved to `Path.cwd() + "/frontend/src"` |
| `--startpage` | string | `""` | if empty, resolved to `"login"` — **currently unused by the REST server**, see §5 |
| `--host` | string | `"0.0.0.0"` | |
| `--users` | string | `""` | path to users/passwords file; if empty, falls back to a hardcoded `niclas=123` user (marked `TODO: Remove soon` in source) |
| `--port` | i64 | `3568` | REST/HTTP port. **Known CLI-library bug**: default sometimes parses as 0; code force-overrides back to 3568 if so |
| `--load-drivers` | string seq | (none) | driver instance names; each resolves to `$CONFDIR/drivers/<name>.conf` |

**Users file format**: plain text, one `key=value` line per user (`line.split("=")`).

An `Authorizer` is always constructed before dispatch, even for `list`/`describe` commands that don't need it.

## 2. Graph-file JSON — LOAD schema (`app/loader`)

Entry points: `load_from_file(pathname, promise)` (resolves `<base_directory>/graphs/<pathname>`) and `load_from_text(json, promise)` (parses a raw string — used by the websocket graph protocol).

**Top level:**
```json
{
  "id": "...",            // optional; if both id and name missing, both become "<unknown>"; if only one present, the other is copied from it
  "name": "...",           // optional, same cross-fill rule as id
  "description": "...",    // optional, default "<unknown>"
  "icon": "...",           // optional, default "<unknown>"
  "blocks": { ... },        // REQUIRED, must be a JSON OBJECT keyed by block instance name
  "connections": [ ... ],   // required array (checked separately, after blocks); missing -> logged error, connections simply skipped, load still "succeeds"
  "inports": [ ... ],       // optional array
  "outports": [ ... ]       // optional array (if EITHER inports or outports lookup throws, BOTH are skipped)
}
```

If `"blocks"` is missing or not an object: logs `Error, "A 'blocks' object must exist in root object."` and returns **without ever fulfilling the caller's promise** — this is a real defect (§7, item 13): the caller hangs forever rather than getting an error callback.

**`blocks` object** — `"<instance-name>": { "component": "<typename>", "metadata": { "x": <num>, "y": <num> } }`
- `component` required; malformed entries (not an object, or missing `component`) are logged (`Error, "Component '<name>' has invalid structure."`) and that block is skipped entirely.
- `metadata` optional. If the whole key is absent → `x=50, y=50`. If present but `x`/`y` individually absent → that one defaults to `20`. (Inconsistent defaults — noted as a quirk, not necessarily a bug worth fixing.)
- **Component-name resolution is NOT validated at parse time.** `create_block` is called unconditionally; resolution happens async later via `BlockTypes.get`. An unknown type name silently resolves to a `DummyFactory` block rather than failing the load (§7, item 12).
- A synchronization barrier (`_continue_with_pass2`) busy-polls `graph.list_blocks(...)` repeatedly until every declared block name appears in the returned map (i.e. until all async block-creation has completed), **before** connections/ports are processed. This exists purely because block creation in the existing system is asynchronous — a C rewrite with synchronous block creation does not need this polling loop at all.

**`connections` array** — each entry `{ "src": {...}, "tgt": {...} }`. Each side is read via fields **`"node"`** and **`"port"`** (and `src` additionally via `"data"`).

> ⚠️ **Schema mismatch (critical, §7 item 2):** `docs/example.json` and the test fixtures use the field name **`"process"`**, not `"node"`, inside `src`/`tgt`. As the loader is currently written, parsing `docs/example.json` would silently turn every connection's node/port into empty strings rather than connecting real blocks — because the `try` swallows the missing-key exception into an `else` branch returning `("","","")`. **This is either a renamed field that was never back-ported to the example/docs, or a bug where the loader should read `"process"`.** Flagged as an open question for the user — see `00-README.md`.

- **Normal edge** (no `"data"` key on `src`): `graph.connect(src_node, src_port, tgt_node, tgt_port)`. Both ends must be a `String` or the whole connection entry is dropped with a logged error.
- **Initial value** (`src.data` is `String`/`Bool`/`I64`/`F64`): `graph.set_initial(tgt_node, tgt_port, data_value)`. `src.node`/`src.port` are irrelevant in this case. (Example: `{"src":{"data":12}, "tgt":{"process":"block8","port":"in1"}}`.)
- `src.data` being an object/array: logged as unsupported, connection dropped.
- A connection referencing a block name that doesn't exist: **not** caught by the loader — `Graph.connect`/`Graph.set_initial` themselves log an error and silently drop it; no exception propagates back to the loader's promise.

**`inports`/`outports` array** — each `{ "name": "...", "node": "...", "port": "..." }` (here the field IS `"node"`, consistent — only the `connections` endpoints have the `node` vs. `process` discrepancy noted above). Maps to `graph.add_inport(name,node,port)` / `add_outport(...)`.

## 3. Graph-file JSON — SAVE schema (`Graph.describe()` / `persist()`) — ⚠️ round-trip is BROKEN

`persist()` writes `describe()`'s JSON to `<graph_directory>/<graph-id>` (no `.json` extension appended).

Produced shape:
```json
{
  "id": "...", "name": "...", "description": "...", "icon": "...",
  "blocks": [
    { "name": "...", "type": "...", "started": true,
      "inputs": [ {"id","value","initial","description","descriptor":{"id","description","type","addressable"}} ],
      "outputs": [ {"id","value","links":["<dest_block>.<dest_input>", ...],"description","descriptor":{...}} ],
      "metadata": {"x":..., "y":...} }
  ],
  "inports":  [ {"name","node","port"}, ... ],
  "outports": [ {"name","node","port"}, ... ]
}
```

**This does NOT match the load schema in §2:**
1. `blocks` is an **array** here but the loader requires an **object** keyed by instance name.
2. Each block uses field `"type"` here but the loader requires `"component"`.
3. **`"connections"` is never emitted at all** — reloading a persisted graph would hit the "missing connections" path and **lose every edge and every initial value**.
4. `inports`/`outports` DO match between save and load — this part round-trips correctly.
5. Top-level `id`/`name`/`description`/`icon` round-trip correctly.

**This means: as the code stands today, saving a running graph and reloading it loses all topology (blocks keep their types but all wiring disappears, since even the block list itself is in the wrong container shape).** This is almost certainly an unintentional regression (the two schemas likely diverged over time) rather than a deliberate asymmetric design. **The C rewrite must pick one canonical schema for both load and save** — recommend unifying on the *load* schema (object-keyed blocks, `component` field, explicit `connections` array) since that's the one the frontend/example files already target, and have `persist()` match it. Flagged as an open question for the user to confirm.

## 4. End-to-end startup sequence

Both `run process` and `run daemon`:

1. Parse CLI → build `SystemContext(auth, stdout, stderr, level, basedir, confdir, Io)`. `FileLocations` auto-creates `base_directory` and `base_directory/graphs` if missing; hard-exits the process (`Fail()` → `exit(1)`) if `base_directory` still doesn't exist after `mkdir()`.
2. Construct `BlockTypes(context)` — registers all intrinsic block types (see `03-block-types.md`).
3. Construct `Authorizer` from `--users` file or the hardcoded fallback user.
4. Build `RuntimeConfiguration` from `run`'s options.
5. Construct `RuntimeEngine`:
   - Opens a **WebSocket listener** on `host:(port+1)` for the FBP protocol (e.g. REST on 3568 → websocket on 3569 — the websocket port is always exactly REST-port + 1, not independently configurable).
   - Opens a **RestServer** on `host:port` serving `config.webdir`.
   - Loads every `--load-drivers` entry (reading `$CONFDIR/drivers/<name>.conf`) and calls `drivers.start()`.
6. `run process <filenames>`: split on `:`, call `engine.load_graph(name)` for each, resolved under `$BASEDIR/graphs/<name>`.
7. `run daemon`: walk `$BASEDIR/graphs/` and call `engine.load_graph(name)` for every entry found (unfiltered).

**Directory layout:**
- `$BASEDIR/graphs/` — both the load directory and the persist/save directory and (for `daemon`) the auto-load directory.
- `$CONFDIR/drivers/<name>.conf` — per-driver INI config.
- `$BASEDIR/custom-types.json` — user-defined nested/composite block types (see `03-block-types.md`). **Note: `BlockTypes.save_to_file`/`load_from_file` are never actually called from `main` or `RuntimeEngine`** in any path examined — this persistence mechanism exists but is currently unwired/dead at startup and shutdown.

## 5. REST / static file server

Uses the existing system's `http_server` library (NOT `jennet` — see note on dead code below). `RestServer.create(host, port, basedir, redirectTo, ctx)` starts a TCP listener with max 50 concurrent connections. If `basedir` doesn't canonicalize, logs an error and the server simply never starts (no crash, no retry).

**There is no REST API distinct from the websocket FBP protocol — this server only does static file serving.** Routing logic (`FileSender.send_response`, keyed on `request.uri().path`):
- Only `GET` is allowed (anything else → `405`, body `"only GET is allowed"`).
- `/assets/*` → served directly from `basedir/assets/*`.
- exactly `favicon.ico` → `basedir/favicon.ico`.
- **everything else** → `basedir/index.html` (classic SPA fallback).
- MIME type via `MimeTypes(path)`. Responses ≤8192 bytes are sent with `Content-Length`; larger files are streamed as `Transfer-Encoding: chunked` in 8192-byte chunks.
- Any file-read failure → `500`, body `"Error reading from file"`.

**Bug**: the `--startpage` config value (default `"login"`) is threaded all the way into `BackendMaker`/`BackendHandler` construction but **is never actually read inside `FileSender.send_response`** — the fallback path is hardcoded to the literal string `"index.html"` regardless of `--startpage`. Treat `--startpage` as currently inert.

**Dead/orphaned code**: `web/_contactrequest`, `web/_formhandler`, `web/_servefile` implement a contact-form feature built against the **`jennet`** HTTP framework — a different library from the `http_server` package `RestServer` actually uses. Nothing in `RestServer`/`RuntimeEngine`/`main` routes to `_ContactRequest`. This feature (and therefore `mail/sendmail`, which it's the only caller of) is **unreachable in the running system today**. `SendMail`'s `/usr/bin/mail` invocation also looks malformed against standard `mail`/`mailx` CLI conventions, consistent with it being untested dead code. **Recommendation: omit the contact-form/mail feature from the C rewrite** unless the user wants it revived — it was never live.

## 6. Logging and remote log streaming

Four levels, ordered `Fine(0) < Info(1) < Warn(2) < Error(3)`. `context(level)` returns true iff `level >= configured_minimum` — i.e. `--fine` shows everything, default (no flag) shows Error only. **Routing quirk**: messages at `Error` level go to stderr; **everything else (Fine/Info/Warn) always goes to stdout regardless of configured level** (the stdout/stderr choice is independent of the verbosity threshold). Log line format: `"<source-file-basename>:<line>:<col>: <message>"` — no level name or timestamp in the string itself. Idiomatic call site: `context(Level) and context.log(Level, "msg")` (short-circuit avoids building the string if below threshold).

**Remote log streaming**: `RemoteOutStream` wraps stdout/stderr and, for every write, also pushes the text to every currently-subscribed websocket client as either `{"protocol":"network","command":"output","payload":{"type":"message","message":"<text>"}}` (stdout) or `{"protocol":"network","command":"error","payload":{"stack":"","message":"<text>"[,"graph":"<name>"]}}` (stderr). Connections are registered via `SystemContext.add_remote`/`remove_remote`, called from `Fbp.subscribe`/`Fbp.closing`.

**Important caveat**: `SystemContext.create`'s `remote_log` parameter **defaults to `false` and is never passed `true` anywhere in the codebase** — so in every observed run configuration, `context.log(...)` writes straight to local stdout/stderr and **never** goes through `RemoteOutStream`. The remote-streaming machinery is fully wired (subscribe/unsubscribe hooks are live) but currently inert. Treat as a latent/optional feature, not a load-bearing one, for the C rewrite — implement if the user wants it, otherwise it's safe to omit or stub.

`Fail(loc)` — unconditional, unrecoverable "this should never happen" guard: prints a message with file+line to stderr and calls `exit(1)`. Used for programmer-error invariant violations (e.g. intrinsic block-type registration failing, or `base_directory` being uncreatable).

`Files` helper: `read_text_from_path` reads a file **line by line and concatenates with no separator** — meaning any literal-text round trip loses original newlines (harmless for JSON since JSON is whitespace-insensitive, but worth matching deliberately, not accidentally, in the C rewrite if exact byte-for-byte round trips ever matter elsewhere).

## 7. Test suite — honest current coverage

Files: `tests/testsuite`, `tests/assertions`, `tests/blocks/blocknametest`, `tests/add/{add-only,add-many,add-test}.json`.

**Only one test is demonstrably working**: `BlockNameTest` (`tests/blocks/blocknametest`) — a pure string-splitting unit test for the `BlockName` primitive (splits `"block.port"` on the *last* `.`), exercised across 24 combinations of name/port lengths. Self-contained, doesn't touch `SystemContext`/`Loader`.

**Everything else in the test suite is currently broken or unwired:**
- `tests/add/add-test.json` is a bare topology (not a harness-manifest), but `testsuite` loads it *as if* it were a manifest — would fail/error rather than test anything meaningful.
- `tests/add/add-only.json` and `add-many.json` ARE correctly shaped as harness-manifests (`{"<test-name>": {"topology","inputs","expects"}}`), but **are never referenced from `testsuite`'s `tests()`** — dead fixtures.
- Even if referenced, their topology's block-map key is `"processes"`, but the current Loader requires `"blocks"` — these fixtures are stale relative to a field rename that happened elsewhere in the code (same rename implicated in the `docs/example.json` `"process"`-vs-`"node"` mismatch above — likely two symptoms of the same historical schema change that wasn't fully propagated).
- `_BlockTest.setup()` constructs `SystemContext` with only 5 positional arguments; the current constructor requires at least 7 (`conf_dir`, `io'` have no defaults) — **this test file almost certainly does not compile** against the current `system/system`.

**Conclusion**: there is effectively **no working integration/regression coverage** of the Loader, graph persistence, or block execution pipeline today. A C rewrite should not assume any existing test can be used as a behavioral oracle beyond `BlockNameTest`'s trivial string-splitting semantics — new tests will need to be written from this specification instead.

## 8. Bugs / TODOs / inconsistencies catalogued here

1. **Save/load schema asymmetry** (§3) — critical, breaks persistence round-trip entirely.
2. **Loader reads `"node"`, example/fixtures use `"process"`** for connection endpoints (§2) — likely breaks loading the shipped example graph as-is.
3. **Test fixtures use `"processes"` instead of `"blocks"`** — stale vs. current Loader.
4. **`tests/testsuite`'s `SystemContext(...)` call has the wrong arity** — test file likely doesn't compile.
5. `add-only.json`/`add-many.json` are never invoked from the test runner.
6. **CLI `--port` default-0 bug**, worked around with a manual override to 3568.
7. Hardcoded fallback credentials `niclas=123` when `--users` is omitted (marked `TODO: Remove soon` in source).
8. `--startpage` is threaded through config but never actually used by the REST server's routing (always falls back to `index.html`).
9. Contact-form/mail feature (`_contactrequest`, `_formhandler`, `_servefile`, `mail/sendmail`) is built against an unused HTTP framework (`jennet`) and is unreachable from the live server — effectively dead code.
10. `mail/sendmail`'s `/usr/bin/mail` argument list looks malformed against standard `mail`/`mailx` conventions — consistent with it being untested.
11. Remote log-streaming-to-websocket is fully wired but inert by default (`remote_log` defaults false, never overridden).
12. Unknown block-type names silently resolve to a `DummyFactory` placeholder rather than failing graph load.
13. **`Loader._parse_root`'s missing-`"blocks"` failure path never fulfills the caller's promise** — caller hangs forever rather than getting an error callback (contrast with the top-level JSON-parse-failure path, which does resolve with `("", None)`).
14. Dead debug code in `main`'s help-text branch (constructs an unused JSON message purely to feed a `Debug()` print).
15. `BlockTypes.save_to_file`/`load_from_file` (`custom-types.json`) are never called from any startup/shutdown path — the custom-type persistence feature is unwired.

These are presented as findings, not fixes — the C rewrite should treat each as an explicit decision point (preserve the bug for compatibility vs. fix it), not something to silently "correct" without the user's sign-off. Several are compiled into the open-questions list in `00-README.md`.

## 9. Resolution per project-wide bug policy

Project-wide decisions: **fix obvious bugs by default** (documenting each), and **unify graph persistence on the LOADER's schema** (§3's recommendation is now final, not just a suggestion). Applied to every item in §8:

1. **Persistence schema — fixed.** `persist()`/`describe()` must be changed to write the loader's schema: `blocks` as an object keyed by instance name with `{"component","metadata":{"x","y"}}`, plus an explicit top-level `"connections"` array (both normal edges and `data`-initial-value edges), so save→load round-trips correctly. `inports`/`outports` already match and stay as-is. This is the single most important fix in the whole persistence layer.
2. **Loader `"node"` vs. example/fixture `"process"` field name — resolved, not a bug to fix in the loader.** Cross-checking against `02-wire-protocol.md`, the live wire protocol's `graph:addedge`/`addinitial`/etc. already use `{"node","port"}` for src/tgt endpoints — i.e. the **loader's `"node"` field is the one consistent with the actual system**, and `docs/example.json` plus the stale test fixtures are the outliers. **Fix the example/docs file and the test fixtures to use `"node"`, not the loader.**
3. **Test fixtures (`"processes"` vs `"blocks"`, `SystemContext` arity mismatch)** — fix the fixtures to match current code (rename `processes`→`blocks`, correct the `SystemContext` constructor call) so the test suite actually compiles and runs; this is necessary groundwork for having any real regression coverage in the C rewrite's test porting effort.
4. **CLI `--port` default-0 bug** — not applicable to the C rewrite (this was specifically a bug in the existing system's command-line-argument-parsing library); just implement correct default-handling directly, no workaround needed.
5. **Hardcoded fallback credentials (`niclas=123`)** — fix: remove the hardcoded fallback. If no `--users` file is given, recommend failing closed (refuse to start, or run with no valid users) rather than silently accepting a known default login — the source's own `TODO: Remove soon` comment agrees this was never meant to stay.
6. **`--startpage` ignored by REST routing** — fix: make the static-file server actually use the configured startpage/redirect target instead of the hardcoded `"index.html"` literal.
7. **Contact-form/mail feature** — do not port. It was never reachable in the live system (built against an HTTP framework the server doesn't even use), so there is nothing "working" to preserve; omit it from the C rewrite unless the user separately asks for a contact-form feature to be designed fresh.
8. **Remote log streaming to websocket clients** — currently inert by default (`remote_log` always false). Since it's fully wired but never activated, treat as optional: port the mechanism (it's simple and already specified in §6) but keep it off by default, matching current behavior exactly.
9. **Unknown block-type names silently resolving to a dummy block** — preserve as-is; this is a reasonable, intentional-looking fallback behavior (graceful degradation for missing types), not a bug.
10. **`Loader`'s missing-`"blocks"` failure path never resolving the promise** — fix: the C rewrite's loader should always signal completion (success or a well-defined error), never leave a caller hanging. This is a correctness requirement for any callback/future-based C implementation, not just a nice-to-have.
11. **`BlockTypes.save_to_file`/`load_from_file` unwired at startup/shutdown** — fix: wire up loading `custom-types.json` at startup and (optionally) saving at a sensible point (e.g. on explicit request, or on shutdown) now that the format itself is also being fixed per `03-block-types.md` §7.

## 10. Target-platform implications (Zephyr RTOS, confirmed 2026-10-03)

Everything above describes the existing system's CLI/filesystem/REST model, which assumed a POSIX/Linux host. The real targets are Zephyr RTOS MCUs (RP2354, possibly STM32H5/H7/N6) plus x86_64 via Zephyr's `native_sim` for development (see `01-architecture-overview.md`'s target-platform note). This changes several concrete things that a literal port must not carry over unexamined:

1. **No argv-based CLI on the MCU.** The `list types`/`describe type`/`run process|daemon` command tree (§1) is a *development/ops* convenience, not something an embedded target typically has in the same form. Recommend: keep an equivalent command set available either (a) via Zephyr's shell subsystem (`zephyr/shell/shell.h`) for interactive use over a console/USB-CDC/telnet backend, and/or (b) collapse `run`'s configuration (host/port/webdir/startpage/drivers/users) into Kconfig + devicetree + a boot-time config structure, since there's no real argv to parse on boot. This is an open design question for whoever implements the Zephyr app shell — not fully resolved by this spec.
2. **Persistence directory conventions (`$BASEDIR/graphs/`, `$CONFDIR/drivers/*.conf`, `custom-types.json`) become paths inside a LittleFS mount** (confirmed target, see `01-architecture-overview.md` §6) rather than arbitrary POSIX directories — e.g. `/lfs/graphs/`, `/lfs/custom-types.json`. The JSON schema itself (§2–3, now unified per the persistence decision) is unaffected; only the storage medium changes. Driver `.conf` files may be unnecessary in the new design if driver/hardware config comes from devicetree instead (per `04-drivers.md` §9) — likely most of `$CONFDIR/drivers/*.conf` simply disappears, replaced by devicetree-driven discovery.
3. **The REST/static-file server's role is now an open question.** The original serves the frontend's static assets (HTML/JS/CSS bundle) itself on `port`, alongside the FBP protocol on `port+1`. Since the MCU is confirmed to run the full WS/FBP server directly, it's unclear whether it should *also* serve the entire frontend SPA bundle from flash (nontrivial storage/flash-size budget for a modern JS bundle) or whether the frontend will be hosted elsewhere (a separate web server, or served from a companion Linux host) while only the WebSocket protocol itself terminates on the MCU. **Flagged as an open question** — see `00-README.md`.
4. **Logging** (§6) — the `_Logger`/stdout-stderr model and the (currently-inert) remote-log-to-websocket mechanism both still make conceptual sense under Zephyr (Zephyr has its own logging subsystem, `zephyr/logging/log.h`, which could either wrap or replace the custom `_Logger`); exact integration is an implementation detail, not a behavioral spec change — the remote-log-to-websocket feature itself (§6) should still default to off, matching current behavior.
5. **Users/auth file (`--users`)** — per the auth-hardening decision (`02-wire-protocol.md` §7 context), credentials should not be a hardcoded fallback; on an embedded target, consider provisioning credentials via a dedicated config partition/mechanism rather than a flat `key=value` text file, though the exact mechanism is an implementation decision outside this spec's scope.
