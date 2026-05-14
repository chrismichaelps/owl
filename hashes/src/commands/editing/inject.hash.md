---
State_ID: BigInt(0x000000000000005E)
Git_SHA: 6fbaa71a291dc181fb847d9944dcf5c09c0eb7f0
Source_SHA256: 835ea475016111c83ad199b70bf55d77cf204bb93b7d5e1683465cceef84422d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Editing.Inject (src/commands/editing/inject.ts)

### [Signatures]
- `makeInjectCommand(pipeline: EditingPipelineService, projectRoot: string) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.75 — DEEP (content insertion after specific string)
- seam_capacity: BACKBONE (modifies project files)
- leverage: HIGH (inserts code at specific locations)
- SIG_ID: SIG-cmd-editing-inject-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/editor/pipeline/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /inject <file> "<after>" "<content>" command
- Requires file, after string, and content arguments
- Appends content after the "after" string with newline
- Uses EditingPipelineService, auto-approves changes