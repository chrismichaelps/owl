State_ID: BigInt(0xf53e76af02df526b)
Git_SHA: 8c574e7ae88d2c472e80f4908473ef70cbfe5469
Source_SHA256: f53e76af02df526b593d14f6015124e93962902bc798162de898f0a623fb1e0d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.CLI.Runtime (src/cli/runtime.ts)

### [Signatures]
- `OwlRuntime: ManagedRuntime<Orchestrator | CommandRegistry | ToolPermissionState, ConfigError>`
- `makeOwlRuntime(projectRoot) => OwlRuntime`
- `ProviderBootstrapLive` dependency forced before exposed Orchestrator
- `TokenBudgetLive` dependency available to Orchestrator
- `UsageMetricsLive` shared between Orchestrator and CommandRegistry
- `RoutingPreferencesLive` shared between Orchestrator and CommandRegistry

### [Governance]
- depth_score: 0.95 — DEEP (composition root plus Provider bootstrap, TokenBudget, UsageMetrics, and RoutingPreference enforcement)
- seam_capacity: BACKBONE (managed runtime lifecycle)
- leverage: CRITICAL (wires Orchestrator, Context, Memory, Router)
- SIG_ID: SIG-cli-runtime-f53e76af

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
- ToolPermissionState is exposed to the TUI runtime so session chrome can display the active Permission mode.
