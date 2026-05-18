State_ID: BigInt(0x1ac34c2c4d688013)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 1ac34c2c4d688013ac356aab22d37e0d2d95660b4a364e06a293d33d8736d5f9
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
