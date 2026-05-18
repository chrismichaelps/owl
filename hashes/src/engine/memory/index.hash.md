State_ID: BigInt(0x65fd3e01990305a0)
Git_SHA: c97f45a6ba4e73cb435d7470064364c5f231ab85
Source_SHA256: 65fd3e01990305a03bbeabcfa5243d4cedb149ad36985081faa268590db8e477
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T15:15:47Z

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
- SIG_ID: SIG-engine-memory-65fd3e01

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
