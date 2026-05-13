---
State_ID: BigInt(0x0000000000000022)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: 4b6e4890c4c8641429e17b71b667839422be08fda6133448a59e1ada18b43412
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.CLI.Runtime (src/cli/runtime.ts)

### [Signatures]
- `OwlLiveLayer: Layer<Orchestrator, never, any>`
- `makeOwlRuntime() => ManagedRuntime<Orchestrator, never>`
- `OwlRuntime: ManagedRuntime<Orchestrator, never>`

### [Governance]
- depth_score: 0.90 — DEEP (composition root for all core services)
- seam_capacity: BACKBONE (managed runtime lifecycle)
- leverage: CRITICAL (wires Orchestrator, Context, Memory, Router)
- SIG_ID: SIG-cli-runtime-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/engine/orchestrator/index.js`, `@root/src/engine/context/index.js`, `@root/src/engine/memory/index.js`, `@root/src/providers/router/index.js`

### [Architecture]
- ManagedRuntime factory for the CLI environment
- Composes all live Effect layers into a single production layer
- Provides a stable runtime for the TUI to execute Effects
