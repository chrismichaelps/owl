State_ID: BigInt(0x000000000000006a)
Git_SHA: 8a91a98ecac3bf6be3ffa105496ef48e08cc429b
Source_SHA256: 92f2885bee8fb2a4ef5da38b830d93f5a2693e819f16bccad94129f835a22d39
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Engine.Orchestrator (src/engine/orchestrator/index.ts)

### [Signatures]
- `Orchestrator: Context.Tag<Orchestrator, OrchestratorService>`
- `OrchestratorLive: Layer.effect<Orchestrator, OrchestratorService>`
- `run(task: Task) => Effect<InferenceResponse, AnyProviderError | ProviderUnavailableError | TokenBudgetExceededError>`
- `runStream(task: Task, onChunk: (text: string) => void) => Effect<InferenceResponse, AnyProviderError | ProviderUnavailableError | TokenBudgetExceededError>`
- `getSessionSummary() => Effect<string>`

### [Governance]
- depth_score: 0.84 — DEEP (orchestration logic, TokenBudget enforcement, UsageMetrics, RoutingPreference, provider seam crossing)
- seam_capacity: CRITICAL (seam-engine-provider crossing point)
- leverage: HIGH (composes ContextManager, SessionMemory, ProviderRouter)
- SIG_ID: SIG-engine-orchestrator-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/context/index.hash.md`
- Imports: `@root/src/engine/context/index.js`, `@root/src/engine/metrics/index.js`, `@root/src/engine/memory/index.js`, `@root/src/providers/router/index.js`, `@root/src/providers/preferences/index.js`, `@root/src/tokens/pruning/index.js`, `@root/src/tokens/budget/index.js`

### [Architecture]
- Main agent loop — seam-engine-provider crossing point
- Composes ContextManager + SessionMemory + UsageMetrics + TokenBudget + RoutingPreferences + ProviderRouter
- Mode-aware TokenBudget enforcement before Provider execution and before Turn recording
- Records UsageMetrics only after output TokenBudget enforcement succeeds
- RoutingPreference is applied by RoutingContext, never by direct adapter selection
- Session turn recording after each task
