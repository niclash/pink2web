# 03 — Block Type Library & Execution Model

## 1. Value model

`Linkable = (String | I64 | F64 | Metric | Bool | None)`. Every port holds exactly one `Linkable` — there is no list/array value type.

**Metric**: a tagged physical-unit value. Each unit category (acceleration, angle, area, current, density, distance, energy, flow, force, frequency, gravity, humidity, mass, periodicity, power, pressure, ratio, resistance, temperature, velocity, voltage, volume) is a class holding an `F64` magnitude + a fixed unit string (e.g. `Acceleration` ⇒ `"m/s²"`). `parse(text)` splits on the first space into `(F64 value, String unit)` and matches the unit string against the category's fixed unit. No cross-category unit conversion exists in the code read. **C model**: `struct { double value; const char* unit; enum category; }` + a parser that splits `"<number> <unit>"` and matches against per-category unit tables.

**Type conversions** (`graphs/typeconverters`), verbatim:
```
ToF64(v):  F64→v; I64→v.f64(); Metric→v.value(); Bool→1.0:0.0; String→parse f64 else 0; None→0.0
ToI64(v):  F64→v.i64(); I64→v; Metric→v.value().i64(); Bool→1:0; String→parse i64 else 0; None→0
ToU64(v):  F64→v.u64(); I64→v.u64(); Metric→v.value().u64(); Bool→1:0; String→parse u64 else 0; None→0
ToBool(v): Bool→v; F64→v!=0.0; Metric→v.value()!=0.0; I64→v!=0; String→(v=="true") [exact match only]; None→false
DefaultValue(typename): "bool"→false; "number"→F64(0); "string"→""; else→F64(0)
```
`DefaultConverter.string(v)` casts to `Stringable`, else returns the literal `"<not stringable>"`.

Port descriptors: `InputDescriptor{name, description, typ, addressable, target}`, `OutputDescriptor{name, description, taip (sic — typo in source, serializes as JSON key "type"), addressable, source}`. `target`/`source` are only meaningful on NestedBlock ports (§5). `addressable` is pure passthrough metadata — nothing in the runtime indexes by address.

## 2. Execution model — critical for the C rewrite's concurrency story

Every block is an independent, single-threaded unit of state: each operation (`update`, `refresh`, `connect`, ...) is queued into that block's own inbox; a block never runs two operations concurrently against itself, but calls between two different blocks are asynchronous (queued), never nested/synchronous calls.

### GenericBlock (event-driven, generic multi-output engine)
- `update(input, value)`: finds the named `Input`, `.set(value)` (fires that input's live subscriptions synchronously), then unconditionally calls `refresh()`.
- `refresh()`: **no-op unless `_started`**. If started: snapshots every input into a `Map[String,Linkable]`, calls `_algorithm(this, inputs)` synchronously.
- `start()`: `_started=true; refresh()` (runs once immediately with current input values). `stop()`: `refresh()` **then** `_started=false` (one last propagate before stopping). `destroy()`: `refresh()`; `_started=false`; disconnect all outputs.
- `connect(output, dest, input)`: register the link, then `refresh()` — the new destination immediately receives the current value if started.
- `subscribe_link`/`unsubscribe_link`: **do NOT call `refresh()`** (inconsistent with Function2/3/4 below — flagged in §7).

### Function2Block / Function3Block / Function4Block (the actual intrinsic math/process engine)
Fixed named inputs `in1..inN` (renameable via `.named` factory), single output `out`. Parametrized by a plain closure `(in1,...,inN) -> Linkable`.
- `update(input, value)`: matches the literal input-name string, sets that input, unconditionally `refresh()`.
- `refresh()`: if `_started`, computes `_function(input1.value(), ..., inputN.value())` directly (no Map snapshot — simpler than GenericBlock) and calls `_output.set(result)`.
- `_output.set(value)`: for every downstream `Link`, sends `dest.update(new_value)` (an asynchronous message into the downstream block's own queue), **then** stores `_value = new_value` on itself.
- `start()`: `_started=true; refresh()`. `stop()`: `refresh()` then `_started=false`. `connect()`: wires then `refresh()` if the output name matches `"out"` (Function4Block logs+skips `refresh()` on an unrecognized name; Function2/3 call `refresh()` unconditionally regardless of match — a minor inconsistency).
- `subscribe_link`/`unsubscribe_link`: **always** call `refresh()` (unlike GenericBlock).

**Exact propagation chain**: `A.update("in1", v)` → `A.input1 := v` (fires A's own subscriptions) → if `A._started`: `out := f(inputs)` → `A.output := out` → for each downstream link `(B, portX)`: enqueue `B.update(portX, out)`.

**Guidance for the C rewrite's scheduler**: the existing system delivers this as true asynchronous message-passing — each block's own operations run strictly FIFO against itself, but there is no synchronous call stack across blocks. **The faithful single-threaded reproduction is a FIFO work queue, not direct recursive/depth-first calls.** When a block computes a new output, push `(downstream_block, downstream_port, value)` onto a queue and drain it breadth-first, exactly mirroring this per-block-inbox semantics, rather than recursing immediately into the downstream block's `update`. This also means **cycles in the graph never deadlock** (they just keep enqueuing) — do not add cycle detection beyond what's implied by this queue model, since none exists in the original. There is no global ordering guarantee across independent chains beyond "FIFO per block, BFS overall" — don't invent a stronger guarantee than the original provides.

### CyclicBlock (timer-driven; infrastructure only — zero intrinsic types actually use it)
- `start()`: no-op if already started (double-start is safe, unlike Function*/GenericBlock); else arms a repeating timer with period `(cycle_ms, cycle_ms)` — **note**: despite the name, the raw value is passed straight into the timer facility, which expects nanoseconds; whatever unit the descriptor's constant was defined in is what actually elapses. No intrinsic block in the current catalog instantiates `CyclicBlock` — it exists as unused infrastructure.
- Each tick calls `refresh()`: if started, snapshots inputs, calls `_algorithm(this, inputs, now_ms, last_ms)`, updates `last_ms`.
- **`update(input, value)` does NOT call `refresh()`** — new values only take effect on the next tick (purely timer-driven, event-insensitive between ticks). `destroy()`/`stop()` do **not** flush a final `refresh()` (unlike every other block type).

### Event-rate stats (`stats_update()`, identical boilerplate on every block type)
```
interval_s = PosixDate.time() - _time_since_last_eventrate_update   // whole seconds, I64
_eventrate = _eventcounter.f32() / interval_s.f32()
_time_since_last_eventrate_update = now
```
`_eventcounter` is never reset inside this call (would be a cumulative-average rate if ever invoked more than once). **This behavior is never called anywhere in the codebase** — fully dead code; `_eventrate` stays at its sentinel `-1` forever in practice. Safe to omit or stub identically inert in the C rewrite.

## 3. Complete table of intrinsic built-in block types

All built via `Function2BlockFactory`/`Function4BlockFactory` (event-driven, as above), ports default-named `in1..inN → out`, type `"number"` unless noted. This is the complete, verified list (registered in `blocktypes/blocktypes`).

| Name | Icon | Description | Formula (verbatim) |
|---|---|---|---|
| `math/Add4` | add | `out = in1+in2+in3+in4` | `ToF64(in1)+ToF64(in2)+ToF64(in3)+ToF64(in4)` |
| `math/Add2` | add | `out = in1+in2` | `ToF64(in1)+ToF64(in2)` |
| `math/Mult2` | close | `out = in1*in2` | `ToF64(in1)*ToF64(in2)` |
| `math/Divide` | *(empty)* | `out = in1/in2` | ⚠️ **BUG**: source computes `ToF64(in1)*ToF64(in2)` — multiplies, not divides |
| `math/Subtract` | remove | `out = in1-in2` | `ToF64(in1)-ToF64(in2)` |
| `math/Modulo` | percent | `out = in1 MOD in2` | `ToF64(in1) %% ToF64(in2)` (floored/Euclidean modulo) |
| `math/Remainder` | *(empty)* | `out = in1 REMAINDER in2` | `ToF64(in1) % ToF64(in2)` (truncating remainder) |
| `math/And2` | *(empty)* | `out = in1 AND in2` | `ToI64(in1) and ToI64(in2)` (bitwise) |
| `math/Or2` | *(empty)* | `out = in1 OR in2` | `ToI64(in1) or ToI64(in2)` |
| `math/Xor` | *(empty)* | `out = in1 XOR in2` | `ToI64(in1) xor ToI64(in2)` |
| `math/And4` | *(empty)* | `out = in1 AND in2 AND in3 AND in4` | `ToI64` chain, bitwise AND |
| `math/Or4` | *(empty)* | `out = in1 OR in2 OR in3 OR in4` | `ToI64` chain, bitwise OR |
| `math/Greater` | *(empty)* | `out = in1 > in2` | `ToF64(in1) > ToF64(in2)` (Bool result) |
| `math/Less` | *(empty)* | `out = in1 < in2` | `ToF64(in1) < ToF64(in2)` |
| `math/Equal` | *(empty)* | `out = in1 == in2` | `ToF64(in1) == ToF64(in2)` |
| `math/NotEqual` | *(empty)* | `out = in1 != in2` | `ToF64(in1) != ToF64(in2)` |
| `math/LessEqual` | *(empty)* | `out = in1 <= in2` | `ToF64(in1) <= ToF64(in2)` |
| `math/GreaterEqual` | *(empty)* | `out = in1 >= in2` | `ToF64(in1) >= ToF64(in2)` |
| `process/Linear` | *(empty)* | `out = k*in+m` | `(ToF64(in)*ToF64(k))+ToF64(m)`; ports literally named `in`,`k`,`m`→`out` (Function3, `.named`) |
| `timing/Interval` | timer | pulse/interval timer | see §3.1 |
| `io/DigitalInput` | digital-input.svg | logical digital input | stub, see §4 |
| `io/DigitalOutput` | digital-output.svg | logical digital output | stub, see §4 |
| `io/AnalogInput` | analog-input.svg | logical analog input | stub, see §4 |
| `io/AnalogOutput` | analog-output.svg | logical analog output | stub, see §4 |

**`math/Divide` is the single most consequential functional bug in the built-in library** — the C rewrite must get an explicit decision from the user on whether to fix it or faithfully reproduce it (see `00-README.md`).

**Two block types referenced in `todo.md`'s wishlist do not exist in the code at all:**
- `blocktypes/timing/scheduletimer` is a **0-byte empty file**. No schedule-timer logic exists anywhere.
- `blocktypes/process/pid` is a **0-byte empty file**. No PID controller exists anywhere — the only "process" block is the stateless `process/Linear`. Any PID algorithm in the C rewrite must be designed fresh, not transcribed.

### 3.1 `timing/Interval` — full algorithm (the one real timer block)
Ports: `interval` (number, ms, default `500`), `initial` (number, ms, default `500`), `run` (bool — **stored but never read/acted on anywhere**, dead input), `oneshot` (bool); output `out` (bool).
- `start()` arms `Timer(initial_ms * 1_000_000, interval_ms * 1_000_000)` (ms→ns conversion; comment in source calling this "scale to milliseconds" is itself wrong/misleading).
- Each tick: `_notify()` — if `ToBool(oneshot.value())`: stop the timer (output is **not** set to any particular value on the final tick — oneshot does not produce a "fire once with true" pulse, it only halts). Else: `output.set(not output.value())` (toggle).
- `TimerHandler`'s "repeat?" decision caches `ToBool(oneshot.value())` **once at arm time**; `_notify()` re-reads the live value on every fire — these two reads can disagree if `oneshot` changes after arming (bug).
- `update()` **never calls `refresh()`**, and `refresh()` is unconditionally a no-op (`_refresh() => None`) — changing `interval`/`initial` while running has zero effect until a manual stop/start; a `_rearm()` helper exists but is never called from anywhere.
- **Constructor bug**: the `oneshot` input's `InputImpl` is built from `_descriptor.input(2)` — the same descriptor index as `run` — instead of index 3. Value dispatch still works (string-keyed), but `describe()`'s JSON metadata for `oneshot` incorrectly reports `run`'s descriptor (name/type/description).
- `update(input, value)` dispatches by the **incoming value's runtime type** (`F64`/`Bool`/`String`), not purely by port name — sending a `Bool` to the `interval` port is silently ignored (no match arm reads it).

Preserve this algorithm (including the oneshot/run quirks) unless the user asks for a fix — flag as an open question.

## 4. IO block types ↔ Drivers — confirmed NOT wired

`io/AnalogInput`, `io/AnalogOutput`, `io/DigitalInput`, `io/DigitalOutput`: `AnalogInput`/`DigitalInput` have zero inputs, one output. `AnalogOutput`/`DigitalOutput` have one input, zero outputs. All four have an identical `refresh()` operation, equivalent to:
```
refresh():
  if started:
    // TODO, connect to IoMapping system
    (does nothing)
```
None of the four files import `drivers` or reference `Drivers`/`Io`. `system/io`'s `Io.set_output` is equally a no-op. **There is currently no live path from a block's value to any driver or back** — see `04-drivers.md` §7 for the full cross-check. These four block types today are pure in-memory value holders, functionally identical in effect to a `GenericBlock` with one port and no algorithm. `addressable` is hardcoded `false` on all four descriptors.

For the C rewrite: if "faithful" means matching current observable behavior, implement these as simple single-port value stores with an inert `refresh()`. Completing the physical wiring is new design work — flagged as an open question.

## 5. NestedBlock — user-defined composite/subgraph block types

### Runtime instance (`NestedBlock`)
On construction (all inside one `try` with **no `else`** — any single failure silently truncates the rest of construction with no diagnostic):
1. For every `(name, factory)` in the descriptor's block list: `factory.create_block(name, context, x, y)` — **all inner blocks are created at the same (x,y) as the outer NestedBlock**; no distinct inner layout survives at runtime.
2. For every outer input, parse its `target` (`"InnerBlock.port"`, split on **last** `.`) and map `outer_input_name → (inner_block, inner_port)`.
3. Symmetrically for every outer output via `source`.
4. For every initial value: calls `inner_block.update(target_input, source_value)` directly (note: **`update`, not `set_initial`** — a one-shot push bypassing normal "stored default" semantics).
5. For every edge `"Block.port"→"Block.port"`: wires `source_block.connect(src_port, dest_block, dest_port)`.

Outer-facing behaviors (`get_input`/`get_output`/`update`/`set_initial`/`connect`/`disconnect_edge`) all forward to the mapped inner `(block, port)`. `refresh()`/`destroy()` only act on the inner blocks referenced by `_outputs` — **any purely-internal inner block not feeding an outer output is never refreshed or destroyed** by the container's own lifecycle. `rename_of()` is an explicit `// TODO!!` no-op.

**⚠️ Critical defect: `NestedBlock.start()`/`stop()` only flip the outer block's own `_started` flag — they never call `start()`/`stop()` on any inner block.** Since every concrete block type gates `refresh()` on its own `_started` (default `false`), and inner blocks are constructed directly via `factory.create_block(...)` (not via `Graph.create_block`, which is what calls `.start()`), **inner blocks of a NestedBlock are never started and therefore never produce output** — the entire custom-block-type feature appears non-functional as currently implemented. This must be an explicit decision point for the C rewrite (fix vs. faithfully reproduce) — see `00-README.md`.

### Builder / persistence (`NestedBlockTypeBuilder`)
Authoring JSON schema (from source doc-comment, cross-checked against the actual parser):
```json
{
  "name": "Example Block", "icon": "timelapse", "description": "...",
  "blocks":   [ { "name": "Add1", "type": "Math/Add" }, ... ],
  "edges":    [ { "src": "Add1.out", "tgt": "Add3.in1" }, ... ],
  "initials": [ { "src": 23.5, "tgt": "Add1.in2" }, ... ],
  "inports":  [ { "name": "in1", "tgt": "Add1.in3", "type": "number", "description": "...", "addressable": false }, ... ],
  "outports": [ { "name": "out", "src": "Add3.out" } ]
}
```
(The source doc-comment omits `description`/`addressable` on inports even though the parser reads them — a stale-doc-comment bug, not a functional one.)

- `BlockTypes.create_new_block_type(json)` = `NestedBlockTypeBuilder.from_json(json, blocktypes)`.
- Block-type resolution for each inner `{name,type}` entry is async (`blocktypes.get(type, promise)`), following the same fallback chain as any block creation: `_intrinsic_types → _driver_types → _user_types → _dummy` (so nested types can reference other custom types, or silently fall back to `DummyFactory` on an unknown name).
- `build(factories)` sanity-checks `factories.size() == blocks.size()`, **logs `"ERROR!!!!"` on mismatch but proceeds anyway** — registers a possibly-incomplete type rather than aborting.
- Once built, `blocktypes.add_user_blocktype(factory)` registers it into `_user_types`, usable identically to an intrinsic type from then on.

**⚠️ Critical defect: custom-type save/load round-trip is broken.** `BlockTypes.save_to_file` serializes each user type via `factory.describe()`, which (because `NestedBlockDescriptor` doesn't override `describe()`) produces only `{"descriptor": {name, description, subgraph:false, icon, inPorts, outPorts}}` — **omitting `blocks`/`edges`/`initials` entirely**. `load_from_file`'s `from_json` expects the original authoring shape (`name`,`icon`,`description`,`blocks`,`edges`,`initials`,`inports`,`outports`) at the top level. **These do not match — a saved custom type cannot be reloaded.** Additionally, `save_to_file` writes to `<base_directory>/custom-types.json` while `load_from_file` reads the bare relative pathname `"custom-types.json"` (process CWD, not `base_directory`) — a second path inconsistency. Also note (per `05-app-lifecycle-persistence.md`) that **neither function is even called from any startup/shutdown path today** — this persistence feature is currently fully unwired in addition to being internally broken.

`subgraph` is hardcoded `false` in the default `BlockTypeDescriptor.describe()` interface implementation and `NestedBlockDescriptor` never overrides it — **every block type, including user-defined composites, reports `"subgraph": false"` in `describe()` output, with no exception anywhere in the codebase.** Treat this flag as dead/always-false metadata unless the rewrite chooses to fix it.

## 6. Consolidated bug/inconsistency list (for rewrite decision-making)

1. `math/Divide` multiplies instead of dividing.
2. `stats_update()`/event-rate is fully dead code (never called); even if wired up, the counter is never reset (cumulative, not windowed) and whole-second timing can divide by zero.
3. All four IO block types' `refresh()` are inert `TODO` stubs — no driver wiring exists.
4. `timing/Interval`: wrong descriptor index for `oneshot` input (metadata only); oneshot-vs-repeat decision cached at arm time vs. re-read at fire time can disagree; `update()` never triggers `refresh()` so live parameter changes don't take effect until restart; `refresh()` itself is permanently a no-op.
5. `GenericBlock.subscribe_link/unsubscribe_link` don't call `refresh()`, while the equivalent Function2/3/4 behaviors do — inconsistent immediate-push-on-subscribe behavior.
6. `Function4Block.connect`/`disconnect_edge` skip `refresh()` on an unrecognized output name (with a logged warning); Function2/3 don't have this guard.
7. **`NestedBlock` never starts/stops its inner blocks — the entire custom composite-block feature likely produces no output as currently implemented.**
8. `NestedBlock.refresh()`/`destroy()` only touch output-producing inner blocks, not all inner blocks — resource/refresh gap for internal-only blocks.
9. `NestedBlock` constructor wiring has no error reporting on malformed references — silent partial construction.
10. `NestedBlockTypeBuilder.build()` logs a mismatch error but proceeds anyway rather than aborting.
11. **Custom-type save/load round-trip is broken** (schema mismatch between `describe()`'s output and `from_json`'s expected input) **and currently unwired from startup/shutdown entirely.**
12. Two differing "parse `block.port`" implementations exist in the codebase: `BlockName` (correct — splits on the *last* `.`) vs. `OutputImpl`'s internal manual `split(".")` logic (assumes exactly one dot, taking the *first* fragment as block name) — a latent bug if any block name itself ever contains a `.`.
13. `OutputDescriptor`'s type field is named `taip` (typo) in source, though it serializes correctly to JSON key `"type"`.
14. `DummyDescriptor.describe()` returns a bare empty `JObj`, structurally different from every other block type's `describe()` shape — inconsistent schema for unknown/fallback types.
15. Fallback resolution order for any type-name lookup (block creation or nested-block factory resolution) is always: **intrinsic → driver (always empty, see below) → user → dummy**.
16. `BlockTypes.add_driver_blocktype` is declared but never called anywhere — `_driver_types` is permanently empty in the current system.
17. `blocktypes/timing/scheduletimer` and `blocktypes/process/pid` are empty files — these block types do not exist despite being named in `todo.md`'s wishlist.

These are findings to be resolved as explicit decisions during the rewrite, not assumptions to silently fix — compiled into the open-questions list in `00-README.md`.

## 7. Resolution per project-wide bug policy

Project-wide decision: **fix obvious bugs by default, document each fix.** Applied to the items in §6:

- **Fix**: (1) `math/Divide` — implement actual division (`ToF64(in1) / ToF64(in2)`); define the result for `in2 == 0` explicitly (recommend: follow IEEE-754 float semantics, i.e. `±Infinity`/`NaN`, since the value type is a double — note this in the C implementation). (4, partial) `timing/Interval`'s wrong-descriptor-index bug for `oneshot` — use its own descriptor (index 3), straightforward fix with no behavioral ambiguity. (7) **`NestedBlock` must start/stop its inner blocks** from its own `start()`/`stop()`/`destroy()` — this is the fix that makes the entire custom-composite-block feature actually functional; without it the feature is dead on arrival. (8) `NestedBlock.refresh()`/`destroy()` should act on all inner blocks, not just output-producing ones. (11) **Custom-type save/load round-trip** — make `describe()` (or a dedicated serializer) emit the full authoring shape (`name`,`icon`,`description`,`blocks`,`edges`,`initials`,`inports`,`outports`) so `load_from_file` can actually reconstruct it; also fix the save/load path inconsistency (both should resolve relative to `base_directory`). (12) `OutputImpl`'s fragile `split(".")` parsing should be replaced with the same last-dot-based `BlockName` logic used elsewhere, for consistency and correctness. (15) `_driver_types`/`add_driver_blocktype` dead-wiring: fix only if/when driver block types are actually introduced — not urgent on its own.
- **Fix, but flagged as a judgment call** (not purely mechanical — pick a clear semantic and implement it): `timing/Interval`'s `update()` should call `refresh()` so live parameter changes take effect without a manual restart; `GenericBlock.subscribe_link`/`unsubscribe_link` should call `refresh()` for consistency with Function2/3/4Block; `NestedBlockTypeBuilder.build()` should abort (not just log) on a factories/blocks count mismatch.
- **Preserve or explicitly redesign (ambiguous intent, not a clear "bug"):** `timing/Interval`'s oneshot-vs-repeat semantics (cached-at-arm-time vs. read-at-fire-time) is genuinely ambiguous in intent — recommend redesigning to a clear, single semantic ("oneshot: fire exactly once, output pulses true for one tick, then stop") rather than guessing at the original author's intent; flagged as an open question in `00-README.md` since it changes observable timer behavior.
- **Not applicable / out of scope**: items dependent on the driver layer (`io/*` block stubs, §4) stay stubs per the driver-scope decision. `stats_update()`/event-rate (dead code) can be omitted entirely or kept as an inert stub — low stakes either way, no fix needed since nothing calls it. The `subgraph` flag being permanently `false`: low-value cosmetic fix, optional.
- **Cannot fix — must design fresh**: `timing/Schedule` and `process/PID` don't exist in the source at all (empty files). These require new design, not bug-fixing. If the user wants them in the C rewrite, that's new scope to be specified separately, not part of this port.
