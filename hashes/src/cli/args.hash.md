---
State_ID: BigInt(0x0000000000000021)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: 11048b1a6453ae02e75c25918133830be02ea90e6ad7301940bd71199e8913eb
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.CLI.Args (src/cli/args.ts)

### [Signatures]
- `VALID_MODES: readonly string[]`
- `parseArgs(argv: readonly string[]) => ParsedArgs`
- `ParsedArgs: { mode: Mode; prompt: string | null }`

### [Governance]
- depth_score: 0.85 — DEEP (pure functional argument parsing)
- seam_capacity: INTERNAL (cli utility)
- leverage: HIGH (handles all cli flags and positional logic)
- SIG_ID: SIG-cli-args-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]
- Pure argument parser with no side-effects
- Supports --mode, short flags (-q, -d), and positional prompts
- Fallback logic for invalid modes to 'standard'
