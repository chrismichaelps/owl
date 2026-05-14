State_ID: BigInt(0x0000000000000064)
Git_SHA: 45c6800bcea148e9ab367104707f7e30b7d58ca3
Source_SHA256: 12b9e90412ebf1415df7eb2aa09fbccfe54329f4d6f6ec5103baed30dfd74884
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Model (src/commands/management/model.ts)

### [Signatures]
- `makeModelCommand() => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.30 — SHALLOW (informational static output)
- seam_capacity: INTERNAL
- leverage: NONE (informational only)
- SIG_ID: SIG-cmd-management-model-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Informational command showing active model and operational modes
- Returns static message listing available command modes
- No dependency on any service, purely informational
