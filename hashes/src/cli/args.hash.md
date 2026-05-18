State_ID: BigInt(0xc62f58789937757f)
Git_SHA: 84d512ddd2cd99db921d9545589d2f38f9617df9
Source_SHA256: c62f58789937757f6667c03ba5f4260525d30fb14e1c26f8296cc5c3f5a14050
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
- SIG_ID: SIG-cli-args-c62f5878

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]

- Pure argument parser with no side-effects
- Supports --mode=value, --mode value, --permission-mode=value, --permission-mode value, permission bypass alias, short flags (-q, -d), and positional prompts
- Fallback logic for invalid modes to 'standard'
