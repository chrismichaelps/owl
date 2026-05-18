State_ID: BigInt(0xd3db759b466b8781)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: d3db759b466b8781b4eaff193b349e4539ca5b9e710d433a697e9002702b84d9
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
