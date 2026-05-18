State_ID: BigInt(0xca66ae0c7938645b)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: ca66ae0c7938645ba5af9e945a12afe84dfd6cdcbfd3684d83d1cd04e697fae2
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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
