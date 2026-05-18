State_ID: BigInt(0xb1447ab03a939922)
Git_SHA: b6ce7584f4fbf0625faa2c5993c2a623affadc17
Source_SHA256: b1447ab03a939922c761836989f0fb53797fe8af7f99f84c022719b7ca6b5988
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T15:18:19Z

---

## @Owl.Engine.Memory (src/engine/memory/index.ts)

### [Signatures]

- `SessionMemory: Context.Tag<SessionMemory, SessionMemoryService>`
- `SessionMemoryLive: Layer.effect<SessionMemory, SessionMemoryService>`
- `startSession(sessionId?: string) => Effect<string>`
- `recordTurn(turn: SessionTurn) => Effect<void>`
- `getTurns() => Effect<readonly SessionTurn[]>`
- `listSessions() => Effect<Chunk<string>>`
- `summarize() => Effect<string>`

### [Governance]

- depth_score: 0.68 — MEDIUM (in-memory only, no persistence)
- seam_capacity: INTERNAL
- leverage: MEDIUM (used by Orchestrator for session tracking)
- SIG_ID: SIG-engine-memory-b1447ab0

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/orchestrator/index.hash.md`

### [Architecture]

- In-memory session turn history with session lifecycle management
- Tracks SessionTurn[] per session in Effect Ref
- Lists known Sessions in deterministic lexical order
- Generates deterministic Session ids
- Provides summary with turn count and total tokens used
- For MVP: session memory is in-memory only (no persistence)
- Persists all known Sessions and advances generated Session counters after hydration.
- Unknown Session resume creates an empty Session instead of copying active Session turns.
