State_ID: BigInt(0x277860af4f4696fe)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 277860af4f4696fee15184d194b23505c3c99dd6cc3d4999bdaf80ec8641030c
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Management.Role (src/commands/management/role.ts)

### [Signatures]
- `makeRoleCommand(roleCtx: RoleContextService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.70 — MEDIUM (FMCF role transition)
- seam_capacity: INTERNAL
- leverage: MEDIUM (switches specialist role context)
- SIG_ID: SIG-cmd-management-role-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/fmcf/roles/architect.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /role <name> command to RoleContextService
- Validates role name against valid roles: architect, dna-engineer, shadow, guardian
- Transitions to the specified FMCF specialist role
- Returns "Active role: <roleName>" on success
