State_ID: BigInt(0x3a07b5213356405a)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 3a07b5213356405a4009dab2f7e27a0d851d9a059646efdc97d125d802bb8992
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Parser (src/commands/parser.ts)

### [Signatures]
- `parseCommand(raw: string) => Effect<ParsedCommand, CommandParseError>`
- `tokenize(input: string) => string[]`

### [Governance]
- depth_score: 0.68 — MEDIUM (quote-aware tokenization and validation)
- seam_capacity: INTERNAL
- leverage: MEDIUM (parses commands, enables dispatch)
- SIG_ID: SIG-cmd-parser-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/errors/index.hash.md`, `@root/hashes/src/commands/types.hash.md`

### [Architecture]
- Quote-aware tokenizer handling single and double quotes
- Validates slash-command format (must start with "/")
- Splits command name from arguments
- Returns ParsedCommand: { name, args, raw }
- Validates command name is not empty
