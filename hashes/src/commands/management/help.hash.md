State_ID: BigInt(0xa84ce9c01dde98b2)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: a84ce9c01dde98b211992f79feaed75e252f1c8b83cc667bff1005af59285391
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
