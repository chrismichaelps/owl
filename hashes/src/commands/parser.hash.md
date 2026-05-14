State_ID: BigInt(0x0000000000000068)
Git_SHA: c3f2b5abc62ee688864cde7596e58a65bbee312a
Source_SHA256: db151a8558bebfcd91ab06d2e8e3b9ee5665042e1abf8eab453ea68cf9d5aa70
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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
