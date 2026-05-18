State_ID: BigInt(0xb85b9079df44ed28)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: b85b9079df44ed280bfec6761cae08742304fbbdc1ec41204df6d689c304a4d1
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
