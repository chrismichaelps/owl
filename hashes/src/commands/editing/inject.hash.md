State_ID: BigInt(0x5955f59b1573da3a)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 5955f59b1573da3a78141945000a2bddba234cc83e2c84e2a3c9d125d1f218b7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
