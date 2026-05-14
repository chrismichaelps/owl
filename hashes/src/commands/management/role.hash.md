---
State_ID: BigInt(0x0000000000000066)
Git_SHA: 6761e2231cf557af57aa655249d13198dfa1ea22
Source_SHA256: 62eb54f1bde8401b00c1640f8a5b5a0fcf3f82bbd0724437025ebf6ba32ef0f5
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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