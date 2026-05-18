State_ID: BigInt(0x4fdaf6cbe0763de7)
Git_SHA: f1b13413fd4d8ec3343ed363319d201316149bc6
Source_SHA256: 4fdaf6cbe0763de75ad8473a694de94b3c201f7632887ead083c4d73953b1692
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T03:29:56Z

---

## @Owl.CLI.Runtime (src/cli/runtime.ts)

### [Signatures]

- `OwlRuntime: ManagedRuntime<Orchestrator | CommandRegistry | ToolPermissionState | SessionMemory, ConfigError>`
- `makeOwlRuntime(projectRoot) => OwlRuntime`
- `ProviderBootstrapLive` dependency forced before exposed Orchestrator
- `TokenBudgetLive` dependency available to Orchestrator
- `UsageMetricsLive` shared between Orchestrator and CommandRegistry
- `RoutingPreferencesLive` shared between Orchestrator and CommandRegistry

### [Governance]

- depth_score: 0.95 — DEEP (composition root plus Provider bootstrap, TokenBudget, UsageMetrics, and RoutingPreference enforcement)
- seam_capacity: BACKBONE (managed runtime lifecycle)
- leverage: CRITICAL (wires Orchestrator, Context, Memory, Router)
- SIG_ID: SIG-cli-runtime-4fdaf6cb

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
- SessionMemory is exposed to the TUI runtime so startup can target a specific Session before initial prompt execution.
