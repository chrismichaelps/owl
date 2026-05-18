State_ID: BigInt(0x09a6a92bdf38b5eb)
Git_SHA: 503dc07b88b4485ac4e370a60a3a8c8c6c9c7b89
Source_SHA256: 09a6a92bdf38b5eb0c827ce00ecefcc91c4a7a0925b4009c4648eb7501803f66
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
- SIG_ID: SIG-cli-args-09a6a92b

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]

- Pure argument parser with no side-effects
- Supports --mode, --permission-mode=value, --permission-mode value, permission bypass alias, short flags (-q, -d), and positional prompts
- Fallback logic for invalid modes to 'standard'
