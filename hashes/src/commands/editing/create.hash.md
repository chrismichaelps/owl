---
State_ID: BigInt(0x000000000000005B)
Git_SHA: 351f83d540578973bad72f3aaa487f0496b76cc8
Source_SHA256: e6356b9e5ce5fb697f3e81ef3e0f113a66e74978a84df5e1d776057e3565f6e2
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Editing.Create (src/commands/editing/create.ts)

### [Signatures]
- `makeCreateCommand(fs: FileSystem.FileSystem, projectRoot: string) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.68 — MEDIUM (file creation with filesystem dependency)
- seam_capacity: BACKBONE (creates files in project)
- leverage: HIGH (directly modifies filesystem)
- SIG_ID: SIG-cmd-editing-create-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /create <file> "<content>" command
- Requires file path and content arguments
- Uses FileSystem service to write file at projectRoot + file path
- Returns "Created <filename>" on success