State_ID: BigInt(0x9c93284dd840bde4)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 9c93284dd840bde4141ce11c1801ee687c6e14c96c7641252e9d0aa154679729
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
- SIG_ID: SIG-engine-memory-schema-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/engine/memory/index.hash.md`
- Deps: `@root/hashes/src/engine/memory/persistence.hash.md`

### [Architecture]
- Defines Effect Schema validation contracts for session memory structures
- SessionTurnSchema captures all per-turn metadata (tokens, cost, latency)
- All optional fields use Schema.optional — callers must handle undefined
- Single source of truth for memory shape — no duplication allowed
