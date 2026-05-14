---
State_ID: BigInt(0x0000000000000023)
Git_SHA: ab6351e112283cee8f3f93705b2f6b52ce55934d
Source_SHA256: 919f16c53af251f981ddbea16eb44fe70e8670b7bd4586b37ebb64b651f2535e
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
