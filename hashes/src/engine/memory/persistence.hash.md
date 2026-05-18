State_ID: BigInt(0x1855d91624d4094c)
Git_SHA: c97f45a6ba4e73cb435d7470064364c5f231ab85
Source_SHA256: 1855d91624d4094cba55fa7723e6747062e7e614b8916e6e2ed8de328c90da00
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T15:15:47Z

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
- SIG_ID: SIG-engine-memory-persist-1855d916

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/memory/index.hash.md`
- Deps: `@root/hashes/src/engine/memory/schema.hash.md`, `@root/hashes/src/core/errors/index.hash.md`, `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]

- All SessionMemory I/O validation is concentrated here
- decodeSessionTurn validates tokensUsed/estimatedCostUsd/latencyMs >= 0
- decodePersistedSessionState enforces schema version gating
- boundTurns enforces MAX_TURNS sliding window
- Decodes and bounds every persisted Session while retaining backward-compatible active Session turns.
