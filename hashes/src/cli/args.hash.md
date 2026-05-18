State_ID: BigInt(0x18d73d8a3b22bcab)
Git_SHA: 28016da38e6a87f9459ea519185c945fd6d89187
Source_SHA256: 18d73d8a3b22bcabbe85c66559513ed698e59b8ff8c47a8525db89e12d7ee5d5
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
- SIG_ID: SIG-cli-args-18d73d8a

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]

- Pure argument parser with no side-effects
- Supports --mode=value, --mode value, --model=value, --model value, --permission-mode=value, --permission-mode value, permission bypass alias, short flags (-q, -d), and positional prompts
- Fallback logic for invalid modes to 'standard'
