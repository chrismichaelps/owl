State_ID: BigInt(0xa6d9d4743703d722)
Git_SHA: 17c4050cfdac862684e6092f1faff2daa7394d47
Source_SHA256: a6d9d4743703d722fdddf6057625b8e74a8b0488b92baaed8f1313870c6c45ce
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.CLI.Runtime (src/cli/runtime.ts)

### [Signatures]
- `OwlRuntime: ManagedRuntime<Orchestrator | CommandRegistry, ConfigError>`
- `makeOwlRuntime(projectRoot) => OwlRuntime`
- `ProviderBootstrapLive` dependency forced before exposed Orchestrator
- `TokenBudgetLive` dependency available to Orchestrator
- `UsageMetricsLive` shared between Orchestrator and CommandRegistry
- `RoutingPreferencesLive` shared between Orchestrator and CommandRegistry

### [Governance]
- depth_score: 0.95 — DEEP (composition root plus Provider bootstrap, TokenBudget, UsageMetrics, and RoutingPreference enforcement)
- seam_capacity: BACKBONE (managed runtime lifecycle)
- leverage: CRITICAL (wires Orchestrator, Context, Memory, Router)
- SIG_ID: SIG-cli-runtime-a6d9d474

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/engine/orchestrator/index.js`, `@root/src/engine/context/index.js`, `@root/src/engine/metrics/index.js`, `@root/src/engine/memory/index.js`, `@root/src/tokens/budget/index.js`, `@root/src/providers/router/index.js`, `@root/src/providers/preferences/index.js`, `@root/src/providers/bootstrap.js`, Provider adapter Layers

### [Architecture]
- ManagedRuntime factory for the CLI environment.
- Composes Provider adapters, ProviderBootstrap, TokenBudget, UsageMetrics, RoutingPreferences, Orchestrator, EditingPipeline, and CommandRegistry.
- ProviderBootstrap populates ProviderRouter before TUI or Command dispatch can execute Inference.
- UsageMetrics is shared so Orchestrator recording appears in `/status`.
- RoutingPreferences is shared so `/model` affects the next Orchestrator Inference.
- ToolPermissionState is shared so `/permissions` affects `/tools` visibility and built-in tool execution.
