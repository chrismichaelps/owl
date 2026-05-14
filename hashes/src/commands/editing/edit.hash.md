---
State_ID: BigInt(0x000000000000005D)
Git_SHA: 6fbaa71a291dc181fb847d9944dcf5c09c0eb7f0
Source_SHA256: 496ed24829b248dcb6275a285fc5fda0b4bbe324c045d7f6840536ce2b4cfa33
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Editing.Edit (src/commands/editing/edit.ts)

### [Signatures]
- `makeEditCommand(pipeline: EditingPipelineService, projectRoot: string) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.78 — DEEP (TLI surgical string replacement)
- seam_capacity: BACKBONE (directly modifies project files)
- leverage: HIGH (surgical code modification via TLI)
- SIG_ID: SIG-cmd-editing-edit-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/editor/pipeline/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /edit <file> "<old>" "<new>" command
- Requires file, oldString, and newString arguments
- Uses EditingPipelineService for TLI (Targeted Line Injection)
- Auto-approves changes, reports diff stats (lines added/removed)