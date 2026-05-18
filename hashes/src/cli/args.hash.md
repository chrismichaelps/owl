State_ID: BigInt(0xc6ea54b48d67ec04)
Git_SHA: 290d9fe3c5c3311e78b1ee35bc6206ea32ffe2b5
Source_SHA256: c6ea54b48d67ec04ae4b8adcb4d7442585a84a582f068bfc6fc423b147bac082
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE

---

## @Owl.CLI.Args (src/cli/args.ts)

### [Signatures]

- `VALID_MODES: readonly string[]`
- `parseArgs(argv: readonly string[]) => ParsedArgs`
- `ParsedArgs: { mode: Mode; prompt: string | null; permissionMode: ToolPermissionMode }`

### [Governance]

- depth_score: 0.85 — DEEP (pure functional argument parsing)
- seam_capacity: INTERNAL (cli utility)
- leverage: HIGH (handles all cli flags and positional logic)
- SIG_ID: SIG-cli-args-c6ea54b4

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]

- Pure argument parser with no side-effects
- Supports --mode=value, --mode value, --model=value, --model value, --privacy, --privacy-mode=value, --privacy-mode value, --permission-mode=value, --permission-mode value, permission bypass alias, short flags (-q, -d), and positional prompts
- Fallback logic for invalid modes to 'standard'
