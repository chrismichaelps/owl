State_ID: BigInt(0x15997ec9a0f8ebed)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 15997ec9a0f8ebedb70737fa12f7b2807fd987c04516a6d545a918d932d06565
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Editing.Diff (src/commands/editing/diff.ts)

### [Signatures]
- `makeDiffCommand(rollback: RollbackSystemService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.65 — MEDIUM (rollback entry display)
- seam_capacity: INTERNAL
- leverage: LOW (read-only, displays rollback entries)
- SIG_ID: SIG-cmd-editing-diff-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/editor/rollback/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /diff <mutationId> command to RollbackSystemService
- Requires mutationId argument
- Retrieves rollback entries for given mutation
- Formats output as "file (snapshot at timestamp)"
