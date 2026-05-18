State_ID: BigInt(0x4835e48813c389d0)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 4835e48813c389d040a5ee86f0fcd46d92650fcc18aa961c45e55bffcdd7791f
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
