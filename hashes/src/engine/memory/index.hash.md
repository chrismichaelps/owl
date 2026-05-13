---
State_ID: BigInt(0x0000000000000014)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 5e8855229329351a11d4c09b3a5e752d6e309dd079d4c1a649faca32c541f6ab
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