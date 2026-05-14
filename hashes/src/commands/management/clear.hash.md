State_ID: BigInt(0x0000000000000062)
Git_SHA: 45c6800bcea148e9ab367104707f7e30b7d58ca3
Source_SHA256: b985d391aa0da446efa1336cc32a2a9fa148d1861d9fc1c5eaa8d399075d9279
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
