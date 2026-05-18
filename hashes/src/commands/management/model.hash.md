State_ID: BigInt(0x6a0d78385b7b4b5a)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 6a0d78385b7b4b5aa831ede09f0fda6a1ba2fe10a25f26fe16aaa6088f128f0e
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Management.Model (src/commands/management/model.ts)

### [Signatures]
- `makeModelCommand(routingPreferences: RoutingPreferencesService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.62 — MEDIUM (Command Interface over RoutingPreference state)
- seam_capacity: CRITICAL
- leverage: MEDIUM
- SIG_ID: SIG-cmd-management-model-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`, `@root/hashes/src/providers/preferences/index.hash.md`

### [Architecture]
- Shows, sets, and clears the active RoutingPreference.
- Validates Provider ids through centralized constants.
- Delegates all runtime state to RoutingPreferences service.
