State_ID: BigInt(0x0000000000000075)
Git_SHA: f67890abcdef1234567890abcdef123456789abc
Source_SHA256: f67890abcdef1234567890abcdef123456789012345678901234567890abcdef
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Help (src/commands/management/help.ts)

### [Signatures]
- `makeHelpCommand(registry: CommandRegistryService) => CommandHandler`

### [Governance]
- depth_score: 0.45 — MEDIUM (registry delegation, no logic)
- seam_capacity: INTERNAL
- leverage: LOW
- SIG_ID: SIG-cmd-management-help-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/commands/registry.hash.md`

### [Architecture]
- Lists all registered slash commands sorted alphabetically
- Delegates entirely to CommandRegistryService.list()
- No business logic — pure formatting over registry output
