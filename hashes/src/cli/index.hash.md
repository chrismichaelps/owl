State_ID: BigInt(0x0000000000000023)
Git_SHA: ab6351e112283cee8f3f93705b2f6b52ce55934d
Source_SHA256: 7afbbb497696ad72bd8eb45e93f9362837f9a009e6ba89b6f42f40a536db225f
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
