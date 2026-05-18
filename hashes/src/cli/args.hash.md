State_ID: BigInt(0x18290091d9d45abd)
Git_SHA: f1b13413fd4d8ec3343ed363319d201316149bc6
Source_SHA256: 18290091d9d45abde4d2b6f0d51202c8e077614c5334fe716f80b30a357691e4
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T03:29:56Z

---

## @Owl.CLI.Args (src/cli/args.ts)

### [Signatures]

- `VALID_MODES: readonly string[]`
- `parseArgs(argv: readonly string[]) => ParsedArgs`
- `ParsedArgs: { mode: Mode; prompt: string | null; permissionMode: ToolPermissionMode; providerOverride: ProviderId | null; privacyMode: boolean; resumeSessionId: string | null }`

### [Governance]

- depth_score: 0.85 — DEEP (pure functional argument parsing)
- seam_capacity: INTERNAL (cli utility)
- leverage: HIGH (handles all cli flags and positional logic)
- SIG_ID: SIG-cli-args-18290091

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]

- Pure argument parser with no side-effects
- Supports --mode=value, --mode value, --model=value, --model value, --privacy, --privacy-mode=value, --privacy-mode value, --resume=value, --resume value, --permission-mode=value, --permission-mode value, permission bypass alias, short flags (-q, -d), and positional prompts
- Fallback logic for invalid modes to 'standard'
