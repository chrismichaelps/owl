State_ID: BigInt(0x78001649fcae3b92)
Git_SHA: d3c6a7c5049212a7869cdca8b4988e784a0a45b0
Source_SHA256: 78001649fcae3b9292403db50caa632aa46b0eb4f3e709dbe13d32ad99bc9e6f
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
- SIG_ID: SIG-cli-runtime-78001649

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
- ToolPermissionState is shared so `/permissions` affects `/tools` visibility.
