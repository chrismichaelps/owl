State_ID: BigInt(0x7ebb9c0bd91f4d92)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 7ebb9c0bd91f4d92ab3e754354460f4ce48be0ba848470663acb983fe89499e5
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Types (src/commands/types.ts)

### [Signatures]
- `ParsedCommand: { name: string, args: readonly string[], raw: string }`
- `CommandResult: { output: string }`
- `CommandHandler: { name: string, description: string, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.50 — MEDIUM (type definitions, no runtime behavior)
- seam_capacity: INTERNAL
- leverage: NONE (pure type definitions)
- SIG_ID: SIG-cmd-types-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Shared interfaces for the command pipeline
- ParsedCommand: output of parseCommand(), contains name/args/raw
- CommandResult: successful command output wrapper
- CommandHandler: interface every command must implement
- All commands must provide name, description, and Effect-based execute function
