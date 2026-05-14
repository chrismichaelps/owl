State_ID: BigInt(0x0000000000000063)
Git_SHA: 45c6800bcea148e9ab367104707f7e30b7d58ca3
Source_SHA256: dd65c591bb32503f7bef8d91581972721ae68c2aabce3e0b5a3748842dcb5061
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Memory (src/commands/management/memory.ts)

### [Signatures]
- `makeMemoryCommand(sessionMemory: SessionMemoryService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.65 — MEDIUM (session history display)
- seam_capacity: INTERNAL
- leverage: LOW (read-only, displays history)
- SIG_ID: SIG-cmd-management-memory-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/memory/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /memory command to SessionMemoryService
- Retrieves session turn history
- Formats output with timestamp, tokens, truncated prompt/response
- Truncates long content to 80 characters with "..."
