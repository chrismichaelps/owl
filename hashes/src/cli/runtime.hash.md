---
State_ID: BigInt(0x0000000000000022)
Git_SHA: 05b86b3
Source_SHA256: 087c472447ccc9e004475bd7e83e99cc4c3ace8b3e690640d57c9c8260f52f53
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
