State_ID: BigInt(0x0000000000000081)
Git_SHA: bcdef1234567890abcdef1234567890abcdef123
Source_SHA256: bcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Utils.Prompt (src/commands/utils/prompt.ts)

### [Signatures]
- `requireCommandText(commandName, args, label) => Effect<string, CommandParseError>`

### [Governance]
- depth_score: 0.68 — MEDIUM (Effect-wrapped validation, centralizes prompt guards)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-cmd-utils-prompt-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Joins args and validates min/max length bounds from COMMAND_CONSTANTS
- Returns Effect.fail(CommandParseError) on validation failure
- Centralizes prompt text validation — all commands delegate here
