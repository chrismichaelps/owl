State_ID: BigInt(0xb985d391aa0da446)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: b985d391aa0da446efa1336cc32a2a9fa148d1861d9fc1c5eaa8d399075d9279
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
