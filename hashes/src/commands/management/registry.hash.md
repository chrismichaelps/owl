State_ID: BigInt(0xf702c3d94315b418)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: f702c3d94315b418670574bcc84732620d3069ed66fe48d76368b343e1fb8f19
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
