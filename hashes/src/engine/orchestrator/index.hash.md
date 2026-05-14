State_ID: BigInt(0x0000000000000013)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: d469b23b0d7e4cd071a47ec199717ff20cb20f055600dd71c0048bc964b15043
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Engine.Orchestrator (src/engine/orchestrator/index.ts)

### [Signatures]
- `Orchestrator: Context.Tag<Orchestrator, OrchestratorService>`
- `OrchestratorLive: Layer.effect<Orchestrator, OrchestratorService>`
- `run(task: Task) => Effect<Either<InferenceResponse, AnyProviderError | ProviderUnavailableError>>`
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
