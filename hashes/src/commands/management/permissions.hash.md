State_ID: BigInt(0x7da04798221e38b1)
Git_SHA: d3c6a7c5049212a7869cdca8b4988e784a0a45b0
Source_SHA256: 7da04798221e38b1fd335b883ae339db110f8b07a01cd355ceb6882d70ea4aca
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T03:05:00Z

---

## @Owl.Commands.Management.Permissions (src/commands/management/permissions.ts)

### [Signatures]

- `makePermissionsCommand(state: ToolPermissionStateService) => CommandHandler`

### [Governance]

- depth_score: 0.68
- depth_status: MEDIUM
- seam_capacity: INTERNAL
- SIG_ID: SIG-commands-management-permissions-7da04798

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Domain: `docs/CONTEXT.md#Permission`
- Dependency: `@root/hashes/src/tools/permissionState.hash.md`

### [Architecture]

- Slash command facade for session Permission mode.
- Does not execute tools.
