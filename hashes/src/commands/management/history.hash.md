State_ID: BigInt(0x0000000000000076)
Git_SHA: 7890abcdef1234567890abcdef123456789abcde
Source_SHA256: 7890abcdef1234567890abcdef123456789abcde1234567890abcdef12345678
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.History (src/commands/management/history.ts)

### [Signatures]
- `makeHistoryCommand(sessionMemory: SessionMemoryService) => CommandHandler`

### [Governance]
- depth_score: 0.52 — MEDIUM (Effect over memory read, display formatting)
- seam_capacity: INTERNAL
- leverage: LOW
- SIG_ID: SIG-cmd-management-history-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/memory/index.hash.md`, `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Displays session turn history with turn number, mode, provider, token counts
- Shows truncated prompt/response previews
- Reads from SessionMemoryService — no direct state access
