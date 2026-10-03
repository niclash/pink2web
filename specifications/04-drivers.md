# 04 — Drivers & Hardware IO Layer

> Status key used throughout this document: **REAL** (implemented and reachable at runtime), **PARTIAL** (some real logic, but incomplete/buggy/unreachable in part), **STUB** (interface-shaped placeholder, no logic), **DEAD** (code exists but nothing calls it), **ASPIRATIONAL** (described only in `docs/`, no corresponding code at all).

## 0. Where this fits

`RuntimeEngine` (see `02-wire-protocol.md`/`05-app-lifecycle...`) is the only place a `Drivers` registry object is constructed: `Drivers(context, graphs)`. For each driver name passed via `--load-drivers`, it calls `drivers.load(name)`, then `drivers.available(p)` (see below — this is fake), then `drivers.start()`. **There is no `drivers.stop()` call anywhere** in the current codebase — a C rewrite should decide whether to add a clean shutdown path or faithfully omit it.

`system/io`'s `Io` object (`set_output(logical_name, value)`, `set_drivers(drivers)`) is a scaffolding stub: `set_output` is a no-op match that does nothing even when `_drivers` is set, and **`set_drivers` is never called anywhere in the codebase**, so in a live process `_drivers` stays unset forever. Treat `Io` as dead scaffolding for a future logical-IO-mapping feature.

## 1. `Driver` interface contract (drivers/drivers)

Every driver implementation provides:
- a constructor taking `(context, config: map of string→string, drivers_registry)`
- `start()`
- `stop()`
- `get_physical_ports(callback)` — reports discovered ports asynchronously, one at a time, via a callback/future
- `add_physical_port_config_listener(listener)` / `remove_physical_port_config_listener(listener)`
- `add_physical_port_value_listener(listener)` / `remove_physical_port_value_listener(listener)`

Listener interfaces (`drivers/physicalioport`):
- `PhysicalPortConfigNotify.ports_config_updated(driver, port: PhysicalIoPortInfo, state: Presence)` — `Presence = (Present | Absent)`.
- `PhysicalPortValueNotify.port_value_updated(port: PhysicalIoPortInfo, value: Linkable)`.

**`PhysicalIoPortInfo`** (an immutable value record): `id: String` (URN form `urn:<driver_name>:<port_identifier>`), `port_type: String` ("boolean"/"I64"/"F64"), `description: String`, `schema: String`, `required: Bool`, `addressable: Bool`. Equality/hash keyed on `id` only.

**Finding: `PhysicalIoPortInfo` is never instantiated anywhere in the codebase.** Every driver's `get_physical_ports` is a no-op; the callback is never fulfilled. All four listener add/remove operations are no-ops in all seven drivers. This entire port-discovery API is **DEAD** — present in the interface, exercised by nothing.

## 2. `Drivers` registry (drivers/drivers)

State: `_drivers: Map[String,Driver]` (keyed by **instance name**, not kind — multiple instances of one kind are structurally possible), `_input_map: Map[PhysicalIoPortInfo,String]`, `_output_map: Map[String,PhysicalIoPortInfo]`, `_graphs: Graphs`.

- `load(name)` — **REAL**. Path: `<confdir>/drivers/<name>.conf`, parsed as INI. The **section name inside the file must equal `name`** (the instance name), and must contain key `driver=<kind>`. Kind dispatch:
  | `driver=` value | implementation constructed |
  |---|---|
  | `colibri7` | `Colibri7` |
  | `emulator` | `Emulator` |
  | `link2web` | `Link2Web` |
  | `raspi` | `RaspberryPi` |
  | `modbus-tcp` | `ModbusTcp` |
  | `modbus-rtu` | `ModbusRtu` |
  | anything else | `NullDriver` |

  Loading has no error path at all — any failure (missing file, missing section, missing `driver` key) is silently swallowed: nothing logged, nothing stored. **A C rewrite should decide explicitly whether to fail loudly here** — the existing system fails silently, which is almost certainly a bug rather than intended behavior, but "faithful rewrite" vs. "fix obvious bug" is a judgment call for the user.
- `start()`/`stop()` — **REAL**, trivial fan-out over every loaded driver.
- `port_detected(port)` / `port_gone(port)` — **DEAD**: both are no-ops, zero callers anywhere.
- `available()` — **FAKE**: hardcoded to report `"raspi"`, `"link2web"`, `"emulator"` regardless of what's actually loaded or compiled in. Omits `colibri7`, `modbus-tcp`, `modbus-rtu`, `null` entirely. Do not treat this as a real capability list.
- `list(promise)` — **REAL**: reflects actual configured instance names in `_drivers`.
- `_input_map`/`_output_map` — **DEAD**: declared, never written, never read anywhere else in the codebase.

### Config file format
One `.conf` INI file per driver instance at `<confdir>/drivers/<instance-name>.conf`. Only `driver=<kind>` is contractually required by the loader; each driver kind may read further keys from its own section (see §4). Two real example files ship in `dist/etc/drivers/`:

```ini
# default.conf
[emulator]
driver=emulator

# link2web.conf
[link2web]
driver=link2web
gpiochip=gpiochip0
reset_pin=19
multiplexor_address=112
```

Note: `multiplexor_address` appears in the example but is **never read** by `Link2Web`, which hardcodes the I2C multiplexer address to `0x70` — an inconsistency between example config and actual code.

## 3. Physical-port binding model — ASPIRATIONAL, not implemented

`docs/drivers.md` describes a "bindings json file which will map ports of the processes to ports of the driver." `docs/bindings-emulator.json` shows the intended shape:

```json
{
  "version": "1",
  "driver": "emulator",
  "bindings": [
    { "process": {"node": "block1", "port": "in1"}, "env": {"port": "analog-in", "index": 1} }
  ]
}
```

**This file format is not read, parsed, or referenced by any `` file in the repository.** It is a documentation/planning artifact only.

`docs/driver-discussion-gemini.md` proposes a fuller design: logical Input/Output blocks resolved at runtime against physical ports, an extended `Driver.get_physical_ports()` returning an array directly (vs. the actual code's one-at-a-time `Promise`), and three new FBP-protocol message types — `runtime/ports` (driver→UI port advertisement), `environment/current_mapping` (driver→UI active bindings), `environment/apply_mapping` (UI↔driver bind/unbind commands with `logical_io_id`/`physical_port_id`/`state`). **None of these three message types exist anywhere in `protocol/`.** Treat the entire logical↔physical binding/mapping layer as a design intention with zero corresponding implementation.

**Recommendation for the C spec:** do not attempt to "complete" this layer during the rewrite unless the user asks — faithfully port the current (non-)behavior: driver *kind* selection works, port/value mapping does not exist.

## 4. Per-driver catalog

All drivers share the `Driver` interface shape. "No-op" = the operation's body does nothing at all.

### NullDriver — STUB
Fallback for unrecognized `driver=` kind. Every operation is a no-op. No IO types, no hardware, no config keys read.

### Emulator — STUB
Per `docs/drivers.md`, intended to expose `digital-in`, `digital-out`, `analog-in`, `analog-out`, `counter-in` for WebUI/CLI-driven testing. Actual implementation: identical no-op shape to `NullDriver`; `_config` stored but never read.

`drivers/emulator/gpio` defines `EmulGpioInputAlgorithm` (a `CyclicAlgorithm`) and `EmulGpioOutputAlgorithm` (an `Algorithm`) — hooks intended to plug emulated GPIO into the block execution model (see `03-block-types.md` for `CyclicAlgorithm`/`Algorithm`), but both `apply(...)` bodies are empty. No value ever flows.

### RaspberryPi ("raspi") — STUB
Per docs: `gpio-in`, `gpio-out`, `adc`. Actual: pure stub identical to `NullDriver`, despite importing `gpiod`. `drivers/raspi/gpio` mirrors the emulator's empty `RaspiGpioInputAlgorithm`/`RaspiGpioOutputAlgorithm`. No GPIO chip is ever opened by this driver.

### Colibri7 — PARTIAL
Its own source header says, verbatim: *"This driver is ONLY copied from the Link2Web driver and changed the names. NOTHING ELSE has been considered or fixed to make it work on Colibri yet."* Treat as a known-incomplete port of Link2Web.

- **Config keys**: `reset_pin` (USize, default 19), `gpiochip` (String, default `"gpiochip0"`).
- **On construct**: opens I2C bus 0 (`I2C.bus(0, FileAuth(...))`); opens GPIO chip by name; requests the reset-pin line as output; builds a `Colibri7Multiplexer` wrapping `I2CDevice(0x70, bus)` (hardcoded TCA9548-style multiplexer address) plus the reset line. Any failure → logged Error, `_multiplexer`/`_gpio` left `None`.
- **`start()` → `_find_devices()`**: for each of 8 mux slots, selects the slot (`write_byte(1<<slot)` to `0x70`), reads a 256-byte EEPROM at `0x50`, and on success calls `Colibri7ExpansionFactory.createFactory(slot, data, context, driver)`.
- **`createFactory`** parses manufacturer ID (bytes 0-1 LE U16), device ID (bytes 2-3), revision (bytes 4-5). Only `manufacturer == 0` ("Bali Automation") handled. Device-ID → card class:
  | id | card |
  |---|---|
  | 1 | ColibriAiv |
  | 2 | ColibriAic |
  | 3 | ColibriAqv |
  | 4 | ColibriTriac1 |
  | 5 | ColibriPid1 **and** ColibriPt1000 (duplicate match pattern — **bug**: `ColibriPt1000` branch is unreachable dead code) |
  | 9 | ColibriDii **and** ColibriDiu (same duplicate-pattern bug — `ColibriDiu` unreachable) |
  | 10 | ColibriRs485u |

  `ColibriFet` and `ColibriSsr` exist as files but are **never referenced by the factory at all** — orphaned code, unreachable by any device ID.
- **Every card implementation** (`ColibriAic`, `ColibriAiv`, `ColibriAqv`, `ColibriDii`, `ColibriDiu`, `ColibriFet`, `ColibriPid1`, `ColibriPt1000`, `ColibriSsr`, `ColibriTriac1`, `ColibriRs485u`) is the same template: `_update(): Linkable` returns a **hardcoded constant** (`I64(0)` for analog/current/PID cards, `false` for digital/relay/triac/SSR cards, `F64(0)` for PT1000, `""` for RS485) and notifies listeners with it. **No actual I2C register read of card data ever happens.**
- **Nothing ever calls `update()` or `add_listener()` on any card.** The `_UpdateHandler` `TimerNotify` (meant to poll every ~10 min and re-scan) is defined but **never instantiated/scheduled**. `_update_devices()` is a no-op.
- As built (see §5 below), the underlying I2C bus is dead-emulated anyway, so this entire chain is unreachable even if the above were wired up.

### Link2Web — PARTIAL
Structurally identical to Colibri7 (the base it was copied from), with the same class of gaps, minus the duplicate-pattern bug:
- Config keys: `reset_pin` (default 19), `gpiochip` (default `gpiochip0`).
- Contains leftover numbered debug log statements (`"Niclas 1"` through `"Niclas 13"`) — explicit evidence of active, unfinished debugging (matches the recent commit "Putting a StatusMessage print out in the 'help' command to aid in chasing down a bug").
- Same 8-slot I2C mux scan at `0x70`/EEPROM at `0x50`.
- `Link2WebExpansionFactory`: device-ID map 1→Aq, 2→Fallback, 3→Ai, 4→Triac, 5→Pt1000, 6→Relay, 7→explicitly `None` (comment: "Link2WebLora ... never got produced"), 8→Rtd, 9→Di, 10→explicitly commented out (`Link2WebU485` referenced only in a comment; the file doesn't exist).
- Same pattern: all 8 cards return hardcoded dummy values from `_update()`; nothing ever calls `update()`/`add_listener`; `_UpdateHandler` defined but never scheduled.

### ModbusRtu / ModbusTcp — STUB
Byte-for-byte the same empty template as `NullDriver`, just renamed. **Zero protocol logic**: no function codes (Read Coils, Read/Write Holding Registers, etc.), no PDU/ADU framing, no CRC16 (RTU) or MBAP header (TCP), no serial/socket handling, no register mapping, no config keys read. `docs/drivers.md` describes intended semantics (RTU over RS-485, up to 247 addresses/30 in practice; TCP as the same protocol over sockets) but none of it is implemented. **Treat as intentionally-unimplemented placeholders** for the C rewrite unless told otherwise.

## 5. GPIO and I2C — what Linux APIs are actually targeted

### GPIO (`_corral/.../gpiod/*`)
Wraps **libgpiod v2's character-device uAPI** (modern `/dev/gpiochipN` ioctl interface, *not* the deprecated sysfs GPIO interface), via direct FFI to libgpiod C functions (`@gpiod_chip_open`, `@gpiod_chip_request_lines`, `@gpiod_line_config_*`, `@gpiod_line_request_get/set_value(s)`, `@gpiod_line_request_wait_edge_events`/`read_edge_events`, `@gpiod_chip_watch_lineinfo`/`wait_info_event`/`read_info_event`), linked via `use "lib:gpiod"`. **A C rewrite should target libgpiod v2's C API directly** (or reimplement its ioctl protocol against `/dev/gpiochipN` per `linux/gpio.h`'s `GPIO_V2_*` ioctls).

Key operations used by Colibri7/Link2Web: open chip by path/name (default `gpiochip0`), build line config for one offset (`reset_pin`, default 19) as `GpioLineDirectionOutput`, `request_lines(...)` → `GpioLineRequest`, then toggle `Inactive`→(timer delay)→`Active` to pulse-reset the I2C mux/expansion bus. **This GPIO call path has no `ifdef` guard — it is real, unconditional FFI** that actually executes on real hardware if libgpiod is linked and the chip path is valid.

Enums mirror libgpiod 1:1: `GpioLineValue{Error=-1,Inactive=0,Active=1}`, `GpioLineDirection{AsIs,Input,Output}`, `GpioLineEdge{None,Rising,Falling,Both}`, `GpioLineBias{AsIs,Unknown,Disabled,PullUp,PullDown}`, `GpioLineDrive{PushPull,OpenDrain,OpenSource}`, `GpioLineClock{Monotonic,Realtime,Hte}`.

### I2C (`_corral/.../i2c/i2c`)
Wraps the Linux **`/dev/i2c-N` character device via raw POSIX syscalls** (`@open`, `@write`, `@read`, `@ioctl`, `@close` — bare libc FFI, not the `libi2c`/SMBus helper library). Issues the classic `I2C_SLAVE` ioctl (`0x0703`) to select the target 7-bit address, then plain `read`/`write` byte streams — the standard "i2c-dev" protocol, not SMBus block messages (an `I2CSMBUS` constant `0x0720` is defined but never used). Several other ioctl constants are defined but unused (`I2CRetries`, `I2CTIMEOUT`, `I2CSLAVEFORCE`, `I2CTENBIT`, `I2CFUNCS`, `I2CRDWR`, `I2CPEC`). **A faithful C rewrite should use `open("/dev/i2c-N", O_RDWR)` + `ioctl(fd, I2C_SLAVE, addr)` + `write()`/`read()`.**

### ⚠️ Critical finding: the I2C layer is dead in every build configuration present in the repo
`I2CBusPhys` (real hardware) gates its bodies behind a `i2c` compile-time feature flag. But **which implementation gets selected** (`I2CBusPhys` vs `I2CBusEmulator`) inside `I2C.bus(...)` is gated behind a *different* flag, `wiringpi`. None of the build scripts (`build.sh`, `compile-aarch64.sh`, `compile-armhf.sh`) actually define either of these two compile-time feature flags (the ARM build only passes an OpenSSL version flag and links `-lwiringPi` at the C linker level, which is unrelated to the feature-flag check). **Consequence: `I2C.bus()` always resolves to `I2CBusEmulator`, every operation of which does nothing at all — it never calls back, meaning any code awaiting an I2C callback hangs forever.** So in every build present in this repo, Colibri7's and Link2Web's I2C scan logic is unreachable dead code at runtime, even on real Raspberry Pi hardware.

There is also an independent bug in `I2CBusPhys.read_bytes(device, expected, callback)`: it calls `_read_bytes(device, 1)`, **hardcoding the read length to 1 and ignoring the caller's `expected` parameter** — so even with the defines fixed, the 256-byte EEPROM scan would only ever receive 1 byte, and manufacturer/device/revision parsing (which needs offsets 0-5) would fail.

**These are both almost certainly bugs, not intended behavior.** For the C rewrite, the user should decide: (a) faithfully reproduce "I2C never works" as current behavior, or (b) treat this as a defect to fix. Flagged as an open question in `00-README.md`.

## 6. Status summary table

| Component | Status |
|---|---|
| `Drivers.load()` INI parsing + kind dispatch | REAL (but silently swallows all errors) |
| `Drivers.start()/stop()` | REAL, trivial |
| `Drivers.available()` | FAKE — hardcoded list unrelated to reality |
| `Drivers.list()` | REAL |
| `Drivers.port_detected/port_gone` | DEAD |
| `Drivers._input_map/_output_map` | DEAD |
| `PhysicalIoPortInfo` | DEAD — never instantiated |
| `get_physical_ports` / port listeners (all drivers) | STUB — no-op everywhere |
| `NullDriver` | STUB (intentional) |
| `Emulator` (+ gpio algorithms) | STUB |
| `RaspberryPi` (+ gpio algorithms) | STUB |
| `Colibri7` | PARTIAL — real I2C/GPIO scan code exists but unreachable (see §5), two dead match-arm bugs, cards return hardcoded values, polling never scheduled |
| `Link2Web` | PARTIAL — same shape, no duplicate-pattern bug, contains debug leftovers |
| `ModbusRtu` / `ModbusTcp` | STUB — zero protocol logic |
| gpiod FFI bindings | REAL, complete, unconditional, actually exercised (reset-pin pulse) |
| i2c FFI bindings | REAL code exists but DEAD at runtime (wrong build flag) + has an independent read-length bug |
| `docs/bindings-emulator.json` format | ASPIRATIONAL — no code reads it |
| `docs/driver-discussion-gemini.md` protocol messages | ASPIRATIONAL — not implemented |

## 7. IO blocktypes ↔ drivers: confirmed NOT wired

`blocktypes/io/{analoginput,analogoutput,digitalinput,digitaloutput}` are near-identical block types. Each has exactly one `refresh()` operation, equivalent in all four files to:

```
refresh():
  if started:
    // TODO, connect to IoMapping system
    (does nothing)
```

This is called from `start()`, `stop()`, `destroy()`, `update()`/`set_initial()` (inputs), and `subscribe_link`/`unsubscribe_link` (outputs) — i.e. wired into every lifecycle point where a driver push/pull would occur, but it's a no-op with an explicit `TODO`. None of the four files import `drivers` or reference `Drivers`/`Io`. `Io.set_drivers()` is never called (§0).

**Conclusion: there is currently no live path from a block's input/output value to any driver, or back.** The four IO blocktypes behave as plain logical pass-through points in the dataflow graph, identical in effect to any other block type — physical binding is 100% unimplemented. For the C rewrite, model this chain (block ↔ `Io` ↔ `Drivers` ↔ driver ↔ card/GPIO/I2C) as the same set of stub call-sites with the `TODO` preserved, **unless** the user wants this iteration of the rewrite to actually complete the wiring — flagged as an open question.

## 8. Resolution per project-wide bug policy (driver scope = stub behavior only)

Decision: **the driver/hardware-IO layer is specified as a faithful port of its current (mostly stub) behavior only.** Completing the real hardware-binding design (GPIO/I2C wiring, physical-port mapping, the `docs/driver-discussion-gemini.md` protocol extensions) is explicitly **out of scope for this rewrite round**. Concretely, for the C port:

- `Drivers.load()`/`start()`/`stop()`/`list()` — port as real, working code (these aren't bugs, they work).
- `Drivers.available()` — **fix**: either make it reflect reality (actually-loaded driver instances, same as `list()`) or remove it as redundant with `list()`; the current hardcoded fake list serves no purpose.
- Every driver kind (`NullDriver`, `Emulator`, `RaspberryPi`, `Colibri7`, `Link2Web`, `ModbusRtu`, `ModbusTcp`) — port as **stubs with the same shape** (construct, start, stop, no-op port/listener methods). Do not implement real GPIO/I2C scanning, card polling, or Modbus protocol logic in this round.
- The GPIO reset-pin-pulse logic in Colibri7/Link2Web is the one piece of *real* hardware interaction that exists — port it faithfully if/when those two drivers are ported at all, but it has no observable effect without the (out-of-scope) I2C layer behind it, so treat porting it as low-priority/optional for this round.
- The I2C dead-code bug (wrong build flag selecting the emulator unconditionally) and the `read_bytes` length bug are **not fixed** under this scope decision — moot, since the I2C layer itself isn't being built out now.
- `io/AnalogInput` etc. block types — ported as pure in-memory value stores (per `03-block-types.md` §4), matching current behavior; the `TODO` driver-wiring is preserved as a literal gap, not implemented.
- Revisit this entire section as a dedicated follow-up spec if/when the user wants real hardware support built.

**⚠️ Superseded by §9 below.** §§1–8 above were written assuming the rewrite's target was still Linux (x86/Raspberry Pi) and that completing the hardware layer was simply out of scope. After clarifying the actual target platforms, §9 replaces the driver-scope conclusion for anything touching physical IO: the old Linux-specific approach (libgpiod, i2c-dev, Colibri7/Link2Web I2C-EEPROM card scanning) is **not** the forward design — it is retained above purely as a historical/behavioral record of what the existing system did. Read §9 for what the C rewrite should actually target.

## 9. Target design: Zephyr RTOS + devicetree-based hardware discovery

**Context**: the real deployment targets are MCUs with no Linux — RP2354 (RP2350 family) and possibly STM32H5/STM32H7/STM32N6 — running **Zephyr RTOS**, plus x86_64 for development (via Zephyr's `native_sim` board) and continued Raspberry Pi compatibility (exact meaning — Zephyr-on-RPi vs. a parallel Linux-native build — is an open question, see `00-README.md`). **A separate effort owns hardware bring-up via Zephyr device trees.** Pink2web's job is narrower than the existing system attempted: don't write GPIO/I2C bus wrappers, don't scan for expansion cards — **consume Zephyr's device driver subsystem.**

### 9.1 What this replaces
Everything in §§1–8 that targets Linux kernel interfaces is superseded:
- `libgpiod` v2 character-device API → replaced by Zephyr's **GPIO driver API** (`<zephyr/drivers/gpio.h>`: `gpio_pin_configure_dt`, `gpio_pin_get_dt`, `gpio_pin_set_dt`, `gpio_pin_interrupt_configure_dt` for edge events).
- Raw `/dev/i2c-N` ioctl+read/write → replaced by Zephyr's **I2C driver API** (`<zephyr/drivers/i2c.h>`: `i2c_write_dt`, `i2c_read_dt`, `i2c_write_read_dt`, or the higher-level `i2c_burst_read_dt`/`i2c_reg_*` helpers).
- The Colibri7/Link2Web I2C-multiplexer-plus-EEPROM-scan "discover what expansion card is in each slot" mechanism → **replaced entirely by Zephyr's own device/devicetree model.** Zephyr already knows what's on the bus at build time (devicetree) and at runtime (`device_is_ready()`), via whatever drivers the separate hardware-bring-up effort provides. Pink2web does not need to invent its own hardware-identification protocol.
- `PhysicalIoPortInfo`/the dead bindings-file concept (§2–3) → this is the one piece of the old design that was architecturally *right* but never implemented. It is now implementable for real, backed by Zephyr instead of custom tooling (§9.2).

### 9.2 The discovery-and-binding model
1. **At boot**, enumerate the devices Zephyr has brought up (iterate the device list / use `DEVICE_DT_GET`-style handles generated from devicetree; check `device_is_ready(dev)` for each). This yields the live set of "physical IO points" — the modern equivalent of the old `PhysicalIoPortInfo` list, but populated from real devicetree data instead of an I2C EEPROM scan or a dead `Promise` that was never fulfilled.
2. Build a table mapping **devicetree node label/alias → capability** (e.g. `"gpio0.pin4"` → digital IO, `"ads1115_0.ch2"` → analog input, keyed however the devicetree exposes it — exact key scheme is an implementation decision for whoever designs this against the real devicetree, not something to over-specify here).
3. **Binding**: a logical `blocktypes/io/*` port (e.g. `AnalogInput` block instance `"sensor1"`'s `out` port) needs to be associated with one discovered physical device/channel. This is the direct replacement for `blocktypes/io/*`'s dead `// TODO, connect to IoMapping system` comment (`03-block-types.md` §4) — the binding table is the "IoMapping system" that was never built. Recommend exposing this binding via the graph JSON itself (an extra field on the block's metadata, e.g. `{"component":"io/AnalogInput","metadata":{"x":...,"y":...,"physical":"ads1115_0.ch2"}}`) or via a small dedicated config loaded at boot alongside the graph — either is reasonable; which one is a product decision, not something this analysis can resolve on the project's behalf.
4. At `refresh()` time, instead of the old inert `TODO` no-op, an `AnalogInput`/`DigitalInput` block reads its bound Zephyr device via the GPIO/I2C/ADC/sensor API and calls the same `set()`/propagation path as any other block's output (per `01-architecture-overview.md` §3). `AnalogOutput`/`DigitalOutput` do the mirror: on `update()`, write to the bound device.
5. **Hot-plug / modular hardware**: since the user describes the hardware as modular (boards can be swapped), the discovery step in (1) should be re-run or kept live (Zephyr's device subsystem is primarily static/compile-time per build, but board-level presence — e.g. "is this expansion board actually plugged in and responding" — may still need a runtime liveness check depending on what the separate hardware effort exposes). Treat the exact hot-plug mechanics as owned by that separate effort; pink2web's responsibility is to handle "device not ready" gracefully (log + leave the bound block's value at its default) rather than crash.

### 9.3 What pink2web still owns
- The `blocktypes/io/*` block types themselves (their FBP-facing behavior: types, defaults, propagation) — per `03-block-types.md`.
- The binding table / discovery-to-logical-port mapping (§9.2).
- Graceful degradation when a bound device isn't ready.
- **Not** owned by pink2web: devicetree authorship, Zephyr board support packages, driver implementations for specific sensors/expansion boards — all of that is the separate hardware-management effort's responsibility.

### 9.4 Networking and transport implications (ties into `01-architecture-overview.md`)
Since the MCU runs the full WebSocket/FBP server directly (confirmed target — browsers connect straight to the device, no Linux-host gateway), the transport stack must also run on Zephyr: Zephyr's native networking subsystem (`net/socket.h` BSD-sockets-style API, or Zephyr's own WebSocket support in `net/websocket.h`, used today for Zephyr's shell-over-websocket feature) rather than any Linux-specific library. See `01-architecture-overview.md` §6 for the updated module/library guidance.

### 9.5 Modbus / expansion-card concepts — status under the new target
`ModbusRtu`/`ModbusTcp` (§4, STUB in the original) and the Colibri7/Link2Web expansion-card concept are not being carried forward as Linux-specific code, but the **functional idea** (addressable expansion IO over a shared bus) may still be relevant if the new hardware lineup includes Modbus-connected devices or similar I2C expansion boards — if so, implement them as Zephyr-native drivers behind the same devicetree-discovery model (§9.2), not as a pink2web-internal bus-scanning subsystem. Whether any of this is actually needed depends on the separate hardware effort's design — out of scope to specify further here.
