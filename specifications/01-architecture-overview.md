# 01 — Core Architecture: Graph Engine, Concurrency Model, Module Map

> **Target platforms (confirmed 2026-10-03):** the real deployment targets are MCUs with no Linux — RP2354 (RP2350 family) and possibly STM32H5/STM32H7/STM32N6 — running **Zephyr RTOS**. x86_64 is for development (via Zephyr's `native_sim` board, which runs a Zephyr application as a native host process — this keeps the dev build on the *same* codebase/RTOS rather than a parallel POSIX port). Raspberry Pi compatibility should be retained at the end; whether that means Zephyr-on-Raspberry-Pi or a separate Linux-native build is an open question (see `00-README.md`). Hardware bring-up (devicetree, board support, peripheral drivers) is owned by a **separate effort**; pink2web consumes Zephyr's device driver subsystem rather than talking to hardware directly. This changes §3 (concurrency), §6 (module map), and all of `04-drivers.md` §9 relative to what a Linux-only reading of the existing source would suggest — read those sections with this target in mind.

## 1. What this system is

Pink2Web is a **flow-based programming (FBP) runtime**: users wire "blocks" (components with named typed input/output ports) into a dataflow graph. There is no separate edit/run mode — the graph is always live; any structural change (add/remove/connect/rename) or value change takes effect immediately, mid-execution, exactly like rewiring electronics while powered. Each block recomputes its outputs whenever its inputs change (or, for a few block types, on a fixed timer), and every output change is pushed synchronously-in-effect to every connected downstream input. A WebSocket protocol (`02-wire-protocol.md`) — a modified dialect of the standard FBP network protocol — lets a browser-based editor (the frontend, out of scope for this rewrite) observe and mutate the running graph in real time.

## 2. Core data model

### 2.1 Value type — `Linkable`
Every port holds exactly one dynamically-typed value: `String | I64 | F64 | Metric | Bool | None`. `Metric` is a physical-unit-tagged double (temperature, pressure, voltage, etc. — see `03-block-types.md` §1). There is no array/list value type anywhere in the system. Type name strings used in descriptors are `"bool"`, `"number"`, `"string"` (plus implicitly `"link"` for inter-graph port placeholders) — see `graphs/typeconverters`'s `DefaultValue`.

### 2.2 Entities and ownership

```
Graphs  (process-wide registry)
 └─ Graph  (one dataflow network; has an id, name, description, icon)
     ├─ Block[]        (named instances of a BlockType)
     │    ├─ Input[]   (named, typed, holds current value + optional "initial" value)
     │    └─ Output[]  (named, typed, holds current value + list of Links to downstream Input-bearing targets)
     ├─ Port[] (inports)   — a graph-level named input that forwards into one inner Block's Input
     └─ Port[] (outports)  — a graph-level named output that is fed by one inner Block's Output
```

- **`Graphs`**: owns the `id → Graph` map, a periodic timer (fires once per second, used only to accumulate each graph's `uptime` counter), and the list of **subscribers** (see §4) that every structural/lifecycle event is broadcast to. Also exposes link-value subscription plumbing (`subscribe_links`/`unsubscribe_links`, forwarded down to the target `Graph`).
- **`Graph`**: owns its `Block`s (keyed by instance name) and its exported `Port`s (inports/outports, keyed by exported name). Tracks `_started`/`_running`/`_debug`/`_uptime`/`_time_started`. Every mutating operation (`create_block`, `connect`, `disconnect`, `remove_block`, `rename_block`, `add_inport`, etc.) performs the mutation **and** reports it to `Graphs`, which fans it out to every subscriber — this is the sole mechanism driving the wire protocol's broadcast messages (`graph:addnode`, `graph:addedge`, etc. — see `02-wire-protocol.md` §3.4).
- **`Block`** (an interface in the existing system; in C, a struct + vtable/function-pointer set): the uniform contract every block type implements — `update(input,value)`, `get_input`/`get_output`, `set_initial`, `connect`/`disconnect_edge`/`disconnect_block`, `rename`/`rename_of`, `change(x,y)`, `start`/`stop`/`destroy`, `refresh`, `describe`, `subscribe_link`/`unsubscribe_link`. See `03-block-types.md` for every concrete block type and its exact execution semantics (GenericBlock vs. the Function2/3/4 arithmetic engine vs. CyclicBlock vs. NestedBlock).
- **`Input`**: holds `value`, `initial` (the UI-facing "stored default," distinct from the live value), a `TypeConverter` for stringification, and a list of **live-value subscriptions** (`LinkSubscription`) used by the `network:edges` wire feature (`02-wire-protocol.md` §4.2) to push a value stream to a specific websocket client.
- **`Output`**: holds `value` and a list of `Link`s — each a `(destination_block, destination_input_name)` pair. Setting an output's value iterates every `Link` and calls `destination_block.update(destination_input_name, value)` — **this is the single propagation primitive the entire dataflow engine is built on.**
- **`Port`** (inport/outport): a lightweight pass-through block-like object that sits at the graph boundary — functionally an `Output`+`Updateable` pair with one fixed destination, letting a `Graph` be nested as if it were itself a `Block` (used by exported inports/outports; note: distinct from, and simpler than, the `NestedBlock` composite-type mechanism in `03-block-types.md` §5, which is for reusable block *types*, not single graph-boundary ports).

### 2.3 Naming convention
A fully-qualified port reference is the string `"<block-instance-name>.<port-name>"`. The **canonical parse rule is "split on the LAST `.`"** (`BlockName` primitive) — this matters because block/graph instance names are user-chosen and could theoretically contain dots; always split from the right, never the first `.`. (Note: one internal helper, `OutputImpl`'s own renaming/disconnect logic, uses a more fragile first-dot `split(".")` instead of this canonical rule — flagged as a bug to fix in `03-block-types.md` §7, item 12 — the C rewrite should use one single, correct "parse `block.port`" function everywhere, no exceptions.)

## 3. Propagation semantics — the single most important section for a correct rewrite

### 3.1 Concurrency semantics of the existing system
Every block is an independent, single-threaded unit of state. Its operations (`update`, `refresh`, `connect`, ...) are queued into that block's own inbox and run one at a time, to completion, never overlapping with another operation on the *same* block. But a call from one block into another (e.g. `Output.set()` calling `downstream_block.update(...)`) is an asynchronous **message send** — it enqueues work on the receiving block and returns immediately; that block processes it whenever its own turn comes, not synchronously inside the sender's call stack. Within one block, though, a `refresh()` call triggered from inside `update()` is effectively "the next thing this block does to itself" (it enqueues work on itself, which — since nothing else can run on this block in between — is next in line), so a single block's own chain (`update` → set input → `refresh` → compute → `set output`) *looks* synchronous from that block's perspective, but **anything that crosses to another block is never a nested/recursive call — it's queued work.**

### 3.2 What the rewrite must do (per the single-threaded event-loop decision)
Model the whole engine as **one thread with one global FIFO work queue** of pending `(target_block, input_port, value)` update messages:

1. `output_set(output, value)`: store the new value on the output; for each downstream `Link`, **push `(link.block, link.input, value)` onto the global queue** — do not call into the downstream block directly/recursively.
2. A **drain loop** pops the queue head, dispatches `block_update(block, input, value)` (sets the input, and — depending on block kind — synchronously runs that block's own compute-and-propagate step, which itself may push more work onto the same queue), and repeats until the queue is empty.
3. This reproduces the existing system's actual observable behavior: **FIFO ordering per block** (a block always processes its queued updates in the order they arrived) and **breadth-first propagation overall** (a block's own refresh completes and re-queues its downstream effects before any of *those* effects are processed) — without needing real threads, locks, or a scheduler.
4. **Cycles do not deadlock** under this model (they just keep enqueuing/draining); do not add cycle detection beyond this — the original has none, and the queue model tolerates cycles the same way the existing system's per-block message queues do (each pass around the cycle is just more queued work; a truly unconditional feedback loop will spin forever consuming CPU in both the original and the rewrite — this is a property of the graph the user builds, not something the engine should guard against).
5. There is **no cross-block global ordering guarantee stronger than "FIFO per block, BFS overall."** Do not invent a stronger guarantee (e.g. a specific global sequence across independent branches) than the existing system's own scheduler actually provides — two independent chains' relative interleaving in the original is not deterministic, so the rewrite is free to serialize them in any consistent order (e.g. the order they were enqueued) without that being an observable spec violation.
6. **Per-block-type exceptions to "update always triggers propagation":** `CyclicBlock`-style timer-driven blocks (and the single real timer type, `timing/Interval`) do **not** propagate on `update()` — new input values are stored but only take effect on the next timer tick. `GenericBlock`/`Function2/3/4Block` **do** propagate synchronously (relative to the queue model) on every `update()`. See `03-block-types.md` §2 for the exact per-type behavior table (`start`/`stop`/`destroy`/`connect`/`subscribe_link` each have their own specific "does it trigger one more refresh?" rule, which must be preserved exactly per block type).
7. **Timers**: the engine needs a real timer facility for `timing/Interval` and, if later used, `CyclicBlock`-style blocks, plus the once-per-second `Graphs.tick()` uptime counter. Timer callbacks should inject their resulting updates into the same global FIFO queue, not call block logic directly from the timer-firing context, to keep all propagation going through one consistent code path.
8. **WebSocket I/O and the FBP protocol dispatch** should also integrate with this single event loop (socket readability and timer expiry driven from the same place), rather than running on separate threads — this keeps the entire system single-threaded and deterministic, matching the chosen concurrency model and avoiding the need for any synchronization primitives at all in the core engine.

### 3.2.1 Running this under Zephyr specifically
The target RTOS is **Zephyr** (confirmed — not a bare-metal superloop, and not Linux). The single-threaded FIFO-queue design above maps directly onto **one Zephyr thread** (or the system work queue): the "global queue" can be a `k_fifo`/`k_msgq`, or — since everything runs on one thread anyway with no cross-thread contention to guard against — a plain ring buffer/array is equally valid and simpler. Timers (`timing/Interval`, the once-per-second uptime tick) should use `k_timer`, with the expiry callback pushing work onto the same queue rather than mutating block state directly from interrupt/system-workqueue context (Zephyr timer callbacks typically run in ISR or system-workqueue context — keep them to "enqueue and return"; do the actual block computation only from the engine's own thread, so the core engine needs no locking at all). Socket I/O (see §6) should be polled/driven from the same thread via Zephyr's `zsock_poll`, interleaved with queue-draining and timer checks in one loop: `poll(sockets, timeout) → drain readable sockets into protocol dispatch → drain the update queue → repeat` — the RTOS-thread equivalent of a bare-metal superloop, using Zephyr's own primitives throughout instead of POSIX/Linux ones.

### 3.3 Promises → direct calls
The existing system makes pervasive use of futures (used for async "describe this graph," "resolve this block type," etc.) purely because calls between blocks are asynchronous there. In a single-threaded C engine, most of these collapse to **plain synchronous function calls with return values** — e.g. `BlockTypes.get(name)` returning a `BlockFactory*` directly instead of resolving a future, `Graph.describe()` building and returning a JSON value directly instead of joining several futures. The one place genuine asynchrony must be preserved is anything that waits on **I/O** (socket reads/writes, timers, file I/O) — those should go through the event loop, not futures. The graph-loading module's (`app/loader`) busy-poll-until-all-blocks-registered pattern (`05-app-lifecycle-persistence.md` §2) is a direct symptom of the existing system's asynchronous block creation and **should not be ported at all** — in a synchronous single-threaded engine, `create_block` just returns once the block exists; there is nothing to poll for.

## 4. Event subscription / broadcast model

`GraphNotify` is the callback interface `Graphs` fans every structural/lifecycle event out to (added/removed/renamed/changed block; added/removed connection; added/removed/renamed in/outport; added/removed initial; graph created/deleted/started/stopped/status; generic error). Each currently-open WebSocket connection registers one `GraphNotify` implementation (`Subscription`, optionally wrapped in a `GraphFilterSubscription` once the client has done `graph:connect` — see `02-wire-protocol.md` §4.1) that turns each callback directly into an outgoing wire message. In the C rewrite, this is naturally a list of `(connection, optional_graph_filter)` registrations that the `Graph`/`Graphs` mutation functions iterate and notify synchronously (no async needed — notification is just "write JSON to this connection's outgoing buffer," which the event loop then flushes).

## 5. Startup / module wiring (see `05-app-lifecycle-persistence.md` for full detail)

```
CLI args → SystemContext (file locations, log level, auth)
         → BlockTypes (registers all intrinsic block types)
         → Authorizer (user/password → secret issuance)
         → RuntimeEngine
             ├─ Graphs  (graph registry)
             ├─ Fbp     (protocol dispatcher: environment/runtime/network/graph/component/trace)
             ├─ WebSocket listener on port+1   → routes text frames into Fbp.execute
             ├─ RestServer on port             → static file serving only, no REST API
             └─ Drivers (per 04-drivers.md — mostly stubs in this rewrite's scope)
         → Loader.load_from_file(...) for each configured/discovered graph JSON file
```

## 6. Suggested C module map (mirrors the existing system's package layout; adjust freely — this is a starting point, not a mandate)

| Existing package | Rewrite responsibility | Spec reference |
|---|---|---|
| `graphs/` | Core engine: Graph, Graphs, Block vtable, Input, Output, Port, Link, GraphNotify dispatch, Linkable value type + converters | this doc, §2–4 |
| `blocktypes/` | Block type registry + all concrete block implementations (math, process/Linear, timing/Interval, io/* stubs, NestedBlock) | `03-block-types.md` |
| `protocol/` | JSON envelope parsing, the six sub-protocol dispatchers, every request/response/broadcast message builder | `02-wire-protocol.md` |
| `system/` | SystemContext equivalent (file locations, logging, Authorizer), config file parsing | `05-app-lifecycle-persistence.md` §1,4,6 |
| `app/` | Graph-file JSON load/save (now unified on one schema per the persistence decision) | `05-app-lifecycle-persistence.md` §2–3 |
| `web/` | WebSocket transport + static file server | `05-app-lifecycle-persistence.md` §5; `02-wire-protocol.md` §0 |
| `drivers/` | Driver registry + stub driver implementations | `04-drivers.md` |
| `engine/` | Top-level wiring/startup sequence | `05-app-lifecycle-persistence.md` §4 |
| `collectors/` | A future-joining helper — **likely has no C equivalent**, since futures mostly collapse to direct calls (§3.3) | this doc, §3.3 |
| `mail/`, contact-form parts of `web/` | **Not ported** (dead/unreachable code, per `05-app-lifecycle-persistence.md` §5) | — |

Recommended C-level building blocks, revised for the **Zephyr RTOS** target (libraries to consider, not a final decision — flagged as an open question for the user if they have preferences):
- **Event loop / scheduling**: Zephyr's own kernel primitives — `zsock_poll` for socket multiplexing, `k_timer` for timers, one Zephyr thread running the loop described in §3.2.1. No epoll/libuv/libev — those are Linux-specific and not needed on Zephyr, including on the `native_sim` dev board (Zephyr abstracts this uniformly across targets).
- **Networking transport**: Zephyr's native BSD-sockets-style API (`zephyr/net/socket.h`) for TCP, since the MCU hosts the full WebSocket/FBP server directly (confirmed target — no Linux-host gateway). For the WebSocket framing/handshake layer itself: Zephyr already has a minimal WebSocket implementation in its networking subsystem (`zephyr/net/websocket.h`, used today for Zephyr's shell-over-websocket feature) — evaluate whether it's sufficient as-is or needs a thin from-scratch RFC6455 layer akin to what the existing system vendors as its own WebSocket implementation, ported to Zephyr sockets. Either way, avoid Linux-only libraries like `libwebsockets`.
- **JSON**: the existing system uses a small hand-rolled parser — no observed behavior depends on a specific library's quirks, only on exact field names/shapes (documented in `02-wire-protocol.md`). Prefer a small, allocator-friendly C JSON library suited to constrained memory (e.g. one that supports arena/static allocation) over a heap-heavy one — exact choice is open; `cJSON` is commonly used in Zephyr samples and is a reasonable default if nothing more specialized is preferred.
- **Persistence**: Zephyr's built-in **LittleFS** integration (confirmed target for graph storage) — see `05-app-lifecycle-persistence.md` for the JSON schema that gets stored; the storage medium itself is now Zephyr's filesystem subsystem over flash, not a POSIX directory tree.
- **GPIO/I2C/hardware IO**: **not** pink2web's concern directly — per `04-drivers.md` §9, a separate effort owns hardware bring-up via Zephyr device trees; pink2web consumes Zephyr's device driver subsystem (`zephyr/drivers/gpio.h`, `zephyr/drivers/i2c.h`, etc.) for whatever devices that effort exposes, discovered at boot rather than hardcoded.
- **Development target**: Zephyr's `native_sim` board (runs a Zephyr app as a native host process) is the recommended way to satisfy the "x86_64 for development" requirement — this keeps development on the exact same codebase/RTOS as the MCU targets, rather than maintaining a parallel POSIX-native build.

## 7. Document map

| File | Covers |
|---|---|
| `00-README.md` | Entry point, scope, consolidated open-questions/decision log |
| `01-architecture-overview.md` (this file) | Core graph/block/port model, concurrency model, module map |
| `02-wire-protocol.md` | The complete WebSocket FBP-derived protocol — the frontend compatibility contract |
| `03-block-types.md` | Every block type's exact algorithm, the execution model (GenericBlock/Function*/CyclicBlock/NestedBlock), value/type conversion rules |
| `04-drivers.md` | Driver subsystem — scoped to current (mostly stub) behavior per the driver-scope decision |
| `05-app-lifecycle-persistence.md` | CLI, startup sequence, graph persistence format (now unified), REST/static server, logging, test coverage |
