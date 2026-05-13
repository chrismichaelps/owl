---
State_ID: BigInt(0x0000000000000023)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: e640d20f46dca4be4641ce008ad2e2de38892c107b72e4258355f8e6ca14f9f3
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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
