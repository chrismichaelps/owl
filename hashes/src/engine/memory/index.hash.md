---
State_ID: BigInt(0x0000000000000013)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Engine.Memory (src/engine/memory/index.ts)

### [Signatures]
- `SessionMemory: Context.Tag<SessionMemory, SessionMemoryService>`
- `SessionMemoryLive: Layer.effect<SessionMemory, SessionMemoryService>`
- `startSession(sessionId?: string) => Effect<string>`
- `recordTurn(turn: SessionTurn) => Effect<void>`
- `getTurns() => Effect<readonly SessionTurn[]>`
- `summarize() => Effect<string>`

### [Governance]
- depth_score: 0.68 — MEDIUM (in-memory only, no persistence)
- seam_capacity: INTERNAL
- leverage: MEDIUM (used by Orchestrator for session tracking)
- SIG_ID: SIG-engine-memory-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/orchestrator/index.hash.md`

### [Architecture]
- In-memory session turn history with session lifecycle management
- Tracks SessionTurn[] per session in Effect Ref
- Generates session IDs with timestamp + random suffix
- Provides summary with turn count and total tokens used
- For MVP: session memory is in-memory only (no persistence)