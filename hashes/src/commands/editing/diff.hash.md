---
State_ID: BigInt(0x000000000000005C)
Git_SHA: 6fbaa71a291dc181fb847d9944dcf5c09c0eb7f0
Source_SHA256: f067594677f4a87e685e6cc2c1a69f0239b5509257fd7a5c82465ab59fc1fba7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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