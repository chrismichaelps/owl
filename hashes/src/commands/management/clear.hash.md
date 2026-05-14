---
State_ID: BigInt(0x0000000000000062)
Git_SHA: 45c6800bcea148e9ab367104707f7e30b7d58ca3
Source_SHA256: d19deed1a3077e537748e840ea9b0a37e42d869a3d47dde0f085ae8209ed325a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Clear (src/commands/management/clear.ts)

### [Signatures]
- `makeClearCommand(contextManager: ContextManagerService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.55 — MEDIUM (context clearing operation)
- seam_capacity: INTERNAL
- leverage: LOW (clears context, no persistent effect)
- SIG_ID: SIG-cmd-management-clear-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/context/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /clear command to ContextManagerService
- Clears the active context window
- Returns "Context window cleared." on success