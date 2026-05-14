---
State_ID: BigInt(0x0000000000000067)
Git_SHA: 45c6800bcea148e9ab367104707f7e30b7d58ca3
Source_SHA256: df05ee2aef1a9d1b94621324160f8b3ac1ee07106612e1cdaf51875f627833e1
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Status (src/commands/management/status.ts)

### [Signatures]
- `makeStatusCommand(sessionMemory: SessionMemoryService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.62 — MEDIUM (session stats display)
- seam_capacity: INTERNAL
- leverage: LOW (read-only, displays session stats)
- SIG_ID: SIG-cmd-management-status-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/memory/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /status command to SessionMemoryService
- Reports session turn count and total tokens used
- Includes last turn timestamp if available