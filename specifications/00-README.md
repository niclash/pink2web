# Pink2Web — C Rewrite Specifications

## Purpose and scope

This directory specifies a ground-up rewrite, in C, of the Pink2Web flow-based-programming (FBP) runtime, currently implemented as an existing reference system. The analysis is based on a full read of that system's source (excluding vendored third-party packages under `_corral/`), cross-checked against the frontend's actual protocol usage (`frontend/src/components/protocols/*.ts`, `frontend/src/components/floweditor/ReteController.vue`) and the project's own design docs (`docs/`, `todo.md`, `raspberry-pi.md`).

**The frontend is explicitly out of scope and will not change.** `02-wire-protocol.md` documents the exact wire contract the C rewrite must satisfy for the existing frontend to keep working.

## ⚠️ Target platforms (read this first — it changes the whole architecture)

The reason for this rewrite is that the real deployment targets are **MCUs with no Linux, running Zephyr RTOS**: RP2354 (RP2350 family) and possibly STM32H5/STM32H7/STM32N6. x86_64 is for development, via Zephyr's `native_sim` board (keeps the dev build on the same codebase/RTOS). Raspberry Pi compatibility should be retained at the end (exact meaning is an open question — see below). **Hardware bring-up (devicetree, board support, peripheral drivers) is owned by a separate effort**; pink2web consumes Zephyr's device driver subsystem rather than talking to hardware directly.

This is a late-stage pivot in how these specs were written — `01-architecture-overview.md` and `04-drivers.md` were revised after this was clarified; earlier working assumptions (POSIX/Linux, epoll, libgpiod, i2c-dev, directory-of-JSON-files persistence) are preserved in those documents only as a historical/behavioral record of what the existing reference system does, not as the forward design. Confirmed target-specific decisions:

- The MCU runs the **full WebSocket/FBP protocol server directly** — no Linux-host gateway.
- Runtime model: **Zephyr RTOS** (not bare-metal superloop).
- Graph persistence: **flash + a LittleFS-style filesystem**.
- Hardware IO: **discovered at boot via Zephyr's device driver subsystem** (devicetree-derived), not reimplemented GPIO/I2C wrappers. See `04-drivers.md` §9.

## Document index

| File | Covers |
|---|---|
| `00-README.md` | This file — scope, target platforms, decision log, open questions |
| `01-architecture-overview.md` | Core graph/block/port data model, concurrency model (single-threaded FIFO queue → Zephyr thread), module map, library guidance |
| `02-wire-protocol.md` | The complete WebSocket FBP-derived protocol — the frontend compatibility contract. Includes a §7 resolving which quirks are preserved (frontend contract) vs. fixed (internal bugs) |
| `03-block-types.md` | Every block type's exact algorithm, the execution model (GenericBlock/Function2-3-4/CyclicBlock/NestedBlock), value/type conversion rules. Includes a §7 bug-fix resolution |
| `04-drivers.md` | Historical analysis of the existing driver subsystem (§§0–8, mostly stub/dead code) plus §9, the actual forward design: Zephyr devicetree-based hardware discovery and binding |
| `05-app-lifecycle-persistence.md` | CLI, startup sequence, graph persistence format (now unified), REST/static server, logging, test coverage. Includes a §9 bug-fix resolution and §10 Zephyr-target implications |

**Read order recommendation**: this file → `01` → `02` → `03` → `04` → `05`. The bug-fix resolution sections at the end of `02`, `03`, `04`, and `05` depend on the project-wide policy decisions recorded below, so read the decision log before treating any individual "bug" finding as settled.

## Decision log (confirmed by the user, 2026-10-03)

1. **Bug-fix policy**: fix obvious/clear-cut bugs by default (documenting each), rather than faithfully reproducing every defect. Exception: anything that is part of the **frontend wire-protocol contract** is preserved exactly even when it reads as a "bug," because fixing it would break the unchanging frontend — see `02-wire-protocol.md` §7 for the precise preserve-vs-fix split.
2. **Concurrency model**: single-threaded engine with a global FIFO work queue reproducing the existing system's concurrency semantics deterministically (`01-architecture-overview.md` §3). Confirmed to run as one Zephyr thread/work-queue on the real targets (§3.2.1).
3. **Driver/hardware scope**: originally decided as "spec current stub behavior only, hardware wiring out of scope" under a Linux-target assumption; **superseded** once the Zephyr/devicetree target was clarified — see `04-drivers.md` §9 for the actual forward design, which *does* specify a real (if intentionally thin) hardware-discovery-and-binding mechanism, because Zephyr makes that mechanism tractable in a way the old Linux-specific approach never was.
4. **Persistence schema**: unify graph load and save on the **loader's** existing schema (object-keyed `blocks` map with `component` field, explicit `connections` array) — `persist()`/`describe()` must be fixed to emit this shape instead of its current, differently-shaped, non-reloadable output. Storage medium is flash + LittleFS on the real targets (`05-app-lifecycle-persistence.md` §10).
5. **Auth hardening**: fix the auth model's internal weaknesses (global secret pool with no per-connection/user binding, secrets logged in plaintext on invalid attempts) while keeping the login/secret wire protocol itself unchanged for the frontend. The passive-subscription-is-unauthenticated behavior (`02-wire-protocol.md` §2, "critical asymmetry") is part of the wire contract's *observable* behavior (what a connected-but-unauthenticated client receives) — flagged for the user to explicitly confirm whether to close that gap or preserve it, since closing it is a behavior change an unauthenticated frontend session would notice, not a purely internal fix. **See open questions below.**
6. **Network topology**: the MCU runs the full WebSocket/FBP server directly (no Linux-host gateway).
7. **Runtime model**: Zephyr RTOS.
8. **MCU persistence medium**: flash + LittleFS-style filesystem.

## Open questions (not yet resolved — need your input before/while implementation starts)

These are flagged throughout the detailed documents; compiled here so they're not lost:

1. **Raspberry Pi compatibility — what does it mean under a Zephyr-based rewrite?** Zephyr has some Raspberry Pi board support (mainly Pico-class, RP2040/2350), but the existing system's "Raspberry Pi" target was a full Linux SBC (Model 3B+/4/CM4). Does "retain Raspberry Pi compatibility in the end" mean (a) running this same Zephyr codebase on a Zephyr-supported Pi board, (b) a separate Linux-native build path for a full Raspberry Pi SBC, or (c) something else? This materially affects whether a non-Zephyr build target needs to be designed at all.
2. **Does the MCU serve the frontend's static assets too, or only the WebSocket protocol?** The original serves the SPA bundle itself (REST server on `port`, FBP protocol on `port+1`). Hosting a modern JS/HTML/CSS bundle from MCU flash is a nontrivial storage/flash-size budget question. Clarify whether static asset hosting stays in scope for the MCU, moves to a separate host, or is dropped (`05-app-lifecycle-persistence.md` §10, item 3).
3. **Passive-subscription auth gap**: should an unauthenticated WebSocket connection continue to receive all graph-change broadcasts and log output (current behavior), or should the rewrite require a valid secret before any event delivery, not just before mutating requests? This is an observable behavior change, not just an internal hardening fix (decision log item 5).
4. **`timing/Interval`'s oneshot-vs-repeat semantics** are internally inconsistent in the original (cached-at-arm-time vs. read-at-fire-time, and "oneshot" never actually produces a defined pulse value). The bug-fix policy calls for a redesign here rather than a mechanical fix — confirm the desired semantic (recommended: "oneshot fires exactly once, output pulses `true` for one tick, then stops") before implementing (`03-block-types.md` §7).
5. **`graph:addgroup`/`removegroup`/`renamegroup`/`changegroup`**: the spec resolution calls for implementing these for real (frontend already has complete plumbing, backend files are empty) rather than leaving them as no-ops. Confirm this is actually wanted now, versus deferring group support to a later round (`02-wire-protocol.md` §7).
6. **PID controller and `timing/Schedule`**: both are empty files in the original — nothing to port, would be new design. Currently scoped as out-of-scope/future-work per your answer. Revisit if/when wanted.
7. **Devicetree binding-table mechanism** (`04-drivers.md` §9.2): how a logical `blocktypes/io/*` port gets associated with a specific discovered Zephyr device (graph-JSON metadata field vs. a separate boot-time config) is left as an implementation decision in the spec — confirm a preference if you have one, otherwise the implementer can choose.
8. **Hot-plug / modular-hardware liveness**: Zephyr's device model is largely static per build; if the hardware is truly hot-swappable at runtime, confirm whether the separate hardware effort exposes a liveness/presence signal pink2web should poll, or whether "modular" here just means "configurable per build/board variant" rather than true runtime hot-plug (`04-drivers.md` §9.2, item 5).

## How these documents were produced

Four parallel research passes read every non-vendored source file of the existing reference system (protocol layer, block types, drivers, app/lifecycle/persistence), cross-checked against the frontend's TypeScript protocol classes and Vue components, and were synthesized into the documents above. Every concrete claim (field name, formula, default value, bug) is traceable to a specific source file; the detailed documents cite file paths throughout so any claim can be independently re-verified against that source if needed.
