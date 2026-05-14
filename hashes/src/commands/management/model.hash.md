State_ID: BigInt(0x0000000000000063)
Git_SHA: 1cd37ce367ad7a684a8a32d7049f5f665e95a599
Source_SHA256: bb76e257923186f5155046d344c587033b970baf2868b95b1d12933d5f126192
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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
