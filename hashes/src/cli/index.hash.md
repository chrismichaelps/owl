State_ID: BigInt(0x318bc3bcaba44137)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 318bc3bcaba44137f668444a6dd87bd10690b8b5e29b26775e0430a4e7e44af0
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
---

## @Owl.CLI.Entry (src/cli/index.ts)

### [Signatures]
- `main() => Promise<void>`

### [Governance]
- depth_score: 0.60 — MEDIUM (process entry point, side-effects)
- seam_capacity: BACKBONE (app entry)
- leverage: HIGH (initializes Ink, ManagedRuntime, and App)
- SIG_ID: SIG-cli-entry-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/README.md`
- Imports: `@root/src/tui/app.js`, `@root/src/cli/runtime.js`, `@root/src/cli/args.js`

### [Architecture]
- Main process entry point for the Owl CLI
- Orchestrates Ink rendering lifecycle
- Disposes of ManagedRuntime on exit
