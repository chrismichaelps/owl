---
State_ID: BigInt(0x000000000000006D)
Git_SHA: c3f2b5abc62ee688864cde7596e58a65bbee312a
Source_SHA256: 5ca65d8f7b559e5672230619bcaf4504b7c2faf060b0b90ea6a5deaa11916d48
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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