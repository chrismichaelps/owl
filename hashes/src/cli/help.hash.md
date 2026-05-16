State_ID: BigInt(0x0000000000000070)
Git_SHA: a1b2c3d4e5f6789012345678901234567890abcd
Source_SHA256: a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.CLI.Help (src/cli/help.ts)

### [Signatures]
- `formatFatalError(error: unknown) => string`
- `printVersion() => void`

### [Governance]
- depth_score: 0.42 — MEDIUM (pure formatting, no side effects)
- seam_capacity: INTERNAL
- leverage: LOW
- SIG_ID: SIG-cli-help-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Formats fatal errors for stderr output
- Prints version string from package metadata
- No I/O — pure string transformation functions
