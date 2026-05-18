State_ID: BigInt(0x57a3bbdc74a6e4c7)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 57a3bbdc74a6e4c75676fd3d3ef51b967b2100678d38963437ad00fe8340a02a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
- Records UsageMetrics, including prompt cache read/write Tokens, only after output TokenBudget enforcement succeeds.
- Streaming Inference maps ProviderRouter cache Tokens into InferenceResponse usage and UsageMetrics.
- RoutingPreference is applied by RoutingContext, never by direct adapter selection
- Session turn recording after each task
