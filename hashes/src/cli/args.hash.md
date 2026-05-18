State_ID: BigInt(0xd81c6282ff3282e3)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: d81c6282ff3282e3184d9a490d489905d725cc7699d02dc3fa352576462539e7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
