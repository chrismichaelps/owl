State_ID: BigInt(0xa1ac504f4128f8e5)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: a1ac504f4128f8e554e5e54c8c4a8d7c292be6c8c892ae1aada74634bbf29471
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
