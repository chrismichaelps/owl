State_ID: BigInt(0x0000000000000000)
Git_SHA: PENDING
Source_SHA256: PENDING_SOURCE
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: SIGNATURE
Registry_Sync: 2026-05-18T01:48:00Z
---

## @Owl.TUI.Pending.Shortcuts (src/tui/pending/shortcuts.ts)

### [Signatures]
- `resolvePendingApprovalShortcut(input: string, focusedPanel: string, pendingMutationIds: Chunk<string>) => Option<PendingApprovalShortcut>`

### [Governance]
- depth_score: 0.70
- depth_status: DEEP
- seam_capacity: INTERNAL
- SIG_ID: SIG-tui-pending-shortcuts-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Domain: `docs/CONTEXT.md#Mutation`
- Dependency: `@root/hashes/src/core/constants/tui.hash.md`

### [Architecture]
- Pure shortcut resolver.
- Keeps pending Mutation approval policy out of App.
- Does not touch runtime services or state.
