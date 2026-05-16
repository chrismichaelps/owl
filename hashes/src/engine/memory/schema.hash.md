State_ID: BigInt(0x0000000000000086)
Git_SHA: 1234567890abcdef1234567890abcdef12345678
Source_SHA256: 1234567890abcdef1234567890abcdef123456789012345678901234567890ab
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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
