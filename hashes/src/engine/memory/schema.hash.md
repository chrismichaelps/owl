State_ID: BigInt(0xbc37ea765fd5824d)
Git_SHA: c97f45a6ba4e73cb435d7470064364c5f231ab85
Source_SHA256: bc37ea765fd5824d730ec8ca58b335a07851375978b607ca70bd1013bed3e116
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T15:15:47Z

---

## @Owl.Engine.Memory.Schema (src/engine/memory/schema.ts)

### [Signatures]

- `SessionTurnSchema: Schema.Struct`
- `SessionMemoryStateSchema: Schema.Struct`
- `type SessionTurn`
- `type SessionMemoryState`

### [Governance]

- depth_score: 0.55 — MEDIUM (schema types only — boundary between memory layer and persistence)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-engine-memory-schema-bc37ea76

### [Linkage]

- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/engine/memory/index.hash.md`
- Deps: `@root/hashes/src/engine/memory/persistence.hash.md`

### [Architecture]

- Defines Effect Schema validation contracts for session memory structures
- SessionTurnSchema captures all per-turn metadata (tokens, cost, latency)
- All optional fields use Schema.optional — callers must handle undefined
- Single source of truth for memory shape — no duplication allowed
- Adds StoredSessionSchema so persisted memory can retain multiple Sessions.
