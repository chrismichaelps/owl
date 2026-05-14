---
State_ID: BigInt(0x000000000000005A)
Git_SHA: 6fbaa71a291dc181fb847d9944dcf5c09c0eb7f0
Source_SHA256: a73d71ff56d99a7ebd4deb9cb9645ff06efd3a40ee59f17b8783f3020bbdf199
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Editing.Apply (src/commands/editing/apply.ts)

### [Signatures]
- `makeApplyCommand() => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.30 — SHALLOW (informational only, no actual operation)
- seam_capacity: INTERNAL
- leverage: NONE (no-op command, explains behavior)
- SIG_ID: SIG-cmd-editing-apply-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Informational command explaining that edits are applied immediately
- Returns static message: "Edits are applied immediately when using /edit or /inject..."
- No dependency on any service, purely informational