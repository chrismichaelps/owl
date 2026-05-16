State_ID: BigInt(0x0000000000000085)
Git_SHA: f1234567890abcdef1234567890abcdef1234567
Source_SHA256: f1234567890abcdef1234567890abcdef12345678901234567890abcdef123456
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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
