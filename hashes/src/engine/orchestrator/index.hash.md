State_ID: BigInt(0x0000000000000054)
Git_SHA: b20ee4c34893a44169b22184057fe5d51b2047d3
Source_SHA256: 7aeaf427201e008377a016d403f4beed9553a846dcf504e50c12add1dc9bf8d2
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Engine.Orchestrator (src/engine/orchestrator/index.ts)

### [Signatures]
- `Orchestrator: Context.Tag<Orchestrator, OrchestratorService>`
- `OrchestratorLive: Layer.effect<Orchestrator, OrchestratorService>`
- `run(task: Task) => Effect<InferenceResponse, AnyProviderError | ProviderUnavailableError>`
- `runStream(task: Task, onChunk: (text: string) => void) => Effect<InferenceResponse, AnyProviderError | ProviderUnavailableError>`
- `getSessionSummary() => Effect<string>`

### [Governance]
- depth_score: 0.75 — DEEP (orchestration logic, provider seam crossing)
- seam_capacity: CRITICAL (seam-engine-provider crossing point)
- leverage: HIGH (composes ContextManager, SessionMemory, ProviderRouter)
- SIG_ID: SIG-engine-orchestrator-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/context/index.hash.md`
- Imports: `@root/src/engine/context/index.js`, `@root/src/engine/memory/index.js`, `@root/src/providers/router/index.js`, `@root/src/tokens/pruning/index.js`

### [Architecture]
- Main agent loop — seam-engine-provider crossing point
- Composes ContextManager + SessionMemory + ProviderRouter
- Mode-aware token budget application
- Session turn recording after each task
