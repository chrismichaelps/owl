State_ID: BigInt(0xa40b2495f35d3f96)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: a40b2495f35d3f9644f082089a7808f148f374a04c3d912ac4a00e52e6f3bf27
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Engine.Memory.Persistence (src/engine/memory/persistence.ts)

### [Signatures]
- `makeEmptyState(sessionId: string) => SessionMemoryState`
- `boundTurns(turns: readonly SessionTurn[]) => readonly SessionTurn[]`
- `decodeSessionTurn(turn) => Effect<SessionTurn, SessionMemoryValidationError>`
- `decodePersistedSessionState(storagePath, raw) => Effect<SessionMemoryState, SessionMemoryPersistenceError>`

### [Governance]
- depth_score: 0.78 — DEEP (validation + persistence logic behind 4-function surface)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-engine-memory-persist-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/memory/index.hash.md`
- Deps: `@root/hashes/src/engine/memory/schema.hash.md`, `@root/hashes/src/core/errors/index.hash.md`, `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- All SessionMemory I/O validation is concentrated here
- decodeSessionTurn validates tokensUsed/estimatedCostUsd/latencyMs >= 0
- decodePersistedSessionState enforces schema version gating
- boundTurns enforces MAX_TURNS sliding window
