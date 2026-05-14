---
State_ID: BigInt(0x0000000000000060)
Git_SHA: 6fbaa71a291dc181fb847d9944dcf5c09c0eb7f0
Source_SHA256: 85621d2d2fdba7988c9d83571710a24e6849790b558c673514c41c43114a01bb
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Editing.Undo (src/commands/editing/undo.ts)

### [Signatures]
- `makeUndoCommand(rollback: RollbackSystemService, projectRoot: string) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.72 — DEEP (rollback execution with filesystem restore)
- seam_capacity: BACKBONE (restores files from snapshots)
- leverage: HIGH (reverts previous mutations)
- SIG_ID: SIG-cmd-editing-undo-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/editor/rollback/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /undo <mutationId> command to RollbackSystemService
- Requires mutationId argument
- Restores files to previous snapshots
- Reports number of files rolled back