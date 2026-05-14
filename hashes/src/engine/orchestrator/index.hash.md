State_ID: BigInt(0x000000000000005f)
Git_SHA: 304674677fdf6b201510653edce843bdc8c76ea6
Source_SHA256: 93f38968fd5b3351de4f0cf40dcbdb104b39217fe37a9afaaf98724d042822f6
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
- depth_score: 0.80 — DEEP (orchestration logic, TokenBudget enforcement, provider seam crossing)
- seam_capacity: CRITICAL (seam-engine-provider crossing point)
- leverage: HIGH (composes ContextManager, SessionMemory, ProviderRouter)
- SIG_ID: SIG-engine-orchestrator-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/context/index.hash.md`
- Imports: `@root/src/engine/context/index.js`, `@root/src/engine/memory/index.js`, `@root/src/providers/router/index.js`, `@root/src/tokens/pruning/index.js`, `@root/src/tokens/budget/index.js`

### [Architecture]
- Main agent loop — seam-engine-provider crossing point
- Composes ContextManager + SessionMemory + TokenBudget + ProviderRouter
- Mode-aware TokenBudget enforcement before Provider execution and before Turn recording
- Session turn recording after each task
