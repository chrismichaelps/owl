State_ID: BigInt(0x07f55ede14825609)
Git_SHA: 9f2a29b549054b8680582668d3106ca892bb7f4c
Source_SHA256: 07f55ede14825609a34673195de19f53c562e7a9fe9932be16fecd05b34175c0
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
- SIG_ID: SIG-cli-args-07f55ede

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]

- Pure argument parser with no side-effects
- Supports --mode, --permission-mode=value, --permission-mode value, short flags (-q, -d), and positional prompts
- Fallback logic for invalid modes to 'standard'
