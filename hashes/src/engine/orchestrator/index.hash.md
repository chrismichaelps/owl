State_ID: BigInt(0x0000000000000065)
Git_SHA: 1cd37ce367ad7a684a8a32d7049f5f665e95a599
Source_SHA256: 56d429b75a199aac365b908486aead626cd21721a9a17a4eb69d9a3ccbc2339d
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
- depth_score: 0.82 — DEEP (orchestration logic, TokenBudget enforcement, RoutingPreference, provider seam crossing)
- seam_capacity: CRITICAL (seam-engine-provider crossing point)
- leverage: HIGH (composes ContextManager, SessionMemory, ProviderRouter)
- SIG_ID: SIG-engine-orchestrator-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/context/index.hash.md`
- Imports: `@root/src/engine/context/index.js`, `@root/src/engine/memory/index.js`, `@root/src/providers/router/index.js`, `@root/src/providers/preferences/index.js`, `@root/src/tokens/pruning/index.js`, `@root/src/tokens/budget/index.js`

### [Architecture]
- Main agent loop — seam-engine-provider crossing point
- Composes ContextManager + SessionMemory + TokenBudget + RoutingPreferences + ProviderRouter
- Mode-aware TokenBudget enforcement before Provider execution and before Turn recording
- RoutingPreference is applied by RoutingContext, never by direct adapter selection
- Session turn recording after each task
