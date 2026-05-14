State_ID: BigInt(0x0000000000000060)
Git_SHA: 304674677fdf6b201510653edce843bdc8c76ea6
Source_SHA256: 01318162618dc265b1a64c5b8589fa91e2aedc7fba363a11c7138aaa8dfb3770
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.CLI.Runtime (src/cli/runtime.ts)

### [Signatures]
- `OwlRuntime: ManagedRuntime<Orchestrator | CommandRegistry, ConfigError>`
- `makeOwlRuntime(projectRoot) => OwlRuntime`
- `ProviderBootstrapLive` dependency forced before exposed Orchestrator
- `TokenBudgetLive` dependency available to Orchestrator

### [Governance]
- depth_score: 0.93 — DEEP (composition root plus Provider bootstrap and TokenBudget enforcement)
- seam_capacity: BACKBONE (managed runtime lifecycle)
- leverage: CRITICAL (wires Orchestrator, Context, Memory, Router)
- SIG_ID: SIG-cli-runtime-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/engine/orchestrator/index.js`, `@root/src/engine/context/index.js`, `@root/src/engine/memory/index.js`, `@root/src/tokens/budget/index.js`, `@root/src/providers/router/index.js`, `@root/src/providers/bootstrap.js`, Provider adapter Layers

### [Architecture]
- ManagedRuntime factory for the CLI environment.
- Composes Provider adapters, ProviderBootstrap, TokenBudget, Orchestrator, EditingPipeline, and CommandRegistry.
- ProviderBootstrap populates ProviderRouter before TUI or Command dispatch can execute Inference.
