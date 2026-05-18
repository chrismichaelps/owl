State_ID: BigInt(0x4aa7252d2e6290cc)
Git_SHA: a1dda9dfdf74a634867fb73d2a0ff5d22f9afb87
Source_SHA256: 4aa7252d2e6290ccf409c50ff90a2f8f968144fff0cadb0293a7266a51561abf
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T15:23:42Z

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
- SIG_ID: SIG-engine-memory-4aa7252d

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
- Exposes listSessionSummaries for deterministic per-Session turn-count observability.
