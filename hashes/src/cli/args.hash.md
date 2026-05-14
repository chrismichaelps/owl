State_ID: BigInt(0x0000000000000021)
Git_SHA: 816d84367cc581e1ee0ba3f45f9c6d7a369275c4
Source_SHA256: ba64e2073f5cdf5414f257734578227ed1c3d9113de35c4388138704a047b2dd
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
