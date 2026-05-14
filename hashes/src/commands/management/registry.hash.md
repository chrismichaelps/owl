---
State_ID: BigInt(0x0000000000000065)
Git_SHA: 45c6800bcea148e9ab367104707f7e30b7d58ca3
Source_SHA256: af88317e0d1c89ba6679431105df50245a415b3a105014aa20750ad1db70560c
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Registry (src/commands/management/registry.ts)

### [Signatures]
- `makeRegistryCommand(hashRegistry: HashRegistryService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.75 — DEEP (full registry summary display)
- seam_capacity: INTERNAL
- leverage: LOW (read-only, displays registry state)
- SIG_ID: SIG-cmd-management-registry-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/fmcf/registry/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /registry command to HashRegistryService
- Reads both subsystems and seams from registry
- Formats as "Subsystems (n):" and "Seams (n):" with details