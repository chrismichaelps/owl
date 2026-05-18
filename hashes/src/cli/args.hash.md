State_ID: BigInt(0xabf67835b3a7c2ea)
Git_SHA: f47cd6855f93081e4222c7b3c31dc9b4151717f5
Source_SHA256: abf67835b3a7c2ea4eda4cd4a22d8dbfc5130be0ba7b3e7a6d5719175789eec1
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
- SIG_ID: SIG-cli-args-abf67835

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]

- Pure argument parser with no side-effects
- Supports --mode, --permission-mode, short flags (-q, -d), and positional prompts
- Fallback logic for invalid modes to 'standard'
