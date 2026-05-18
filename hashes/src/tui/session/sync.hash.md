State_ID: BigInt(0x080090e3eb526868)
Git_SHA: 185e899580c525113a3ee902cef52174ecabeee9
Source_SHA256: 080090e3eb526868a663e83de6c4ef7f7669dc3eeb2278d8cadb5911046ca4d6
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T14:55:43Z

---

## @root/src/tui/session/sync.ts

### [Signatures]

- `sessionTurnsToConversationTurns(turns: Chunk<SessionTurn>) => readonly ConversationTurn[]`

### [Governance]

- depth_score: 0.70
- depth_status: DEEP
- seam_capacity: INTERNAL
- SIG_ID: SIG-tui-session-sync-080090e3

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tui/hooks/useOwlRuntimeActions.hash.md`
- Dependencies: `@root/hashes/src/engine/memory/index.contract.json`, `@root/hashes/src/tui/state.contract.json`

### [Architecture]

- Centralizes SessionMemory-to-TUI projection for Session lifecycle commands.
- Preserves Session turn order and tolerates older records without Provider metadata.
