State_ID: BigInt(0x0000000000000022)
Git_SHA: 05b86b3aa43ac55765dd5d109c34c9269b99a6c9
Source_SHA256: cc3f5e81c275182659bb7b911ced8645c4f9a40f7cf7fd1f7219d77b8368a6b1
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
