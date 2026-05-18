State_ID: BigInt(0x6ad89f06d19adab1)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 6ad89f06d19adab1c24fc2ce4403a4db6ff901280703bb99286b5d8a5dd45b29
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
