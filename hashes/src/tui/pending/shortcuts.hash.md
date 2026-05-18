State_ID: BigInt(0xd7835d0b0243124f)
Git_SHA: 17aac6a64ad21f503da780d4cc8d5f7b2be5e041
Source_SHA256: d7835d0b0243124f5e3b0515b17c488b648caa7f09acc675ca0bac4c5327baf5
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T01:55:00Z
---

## @Owl.TUI.Pending.Shortcuts (src/tui/pending/shortcuts.ts)

### [Signatures]
- `resolvePendingApprovalShortcut(input: string, focusedPanel: string, pendingMutationIds: Chunk<string>) => Option<PendingApprovalShortcut>`

### [Governance]
- depth_score: 0.70
- depth_status: DEEP
- seam_capacity: INTERNAL
- SIG_ID: SIG-tui-pending-shortcuts-d7835d0b

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Domain: `docs/CONTEXT.md#Mutation`
- Dependency: `@root/hashes/src/core/constants/tui.hash.md`

### [Architecture]
- Pure shortcut resolver.
- Keeps pending Mutation approval policy out of App.
- Does not touch runtime services or state.
