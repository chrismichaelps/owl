---
State_ID: BigInt(0x000000000000005F)
Git_SHA: 6fbaa71a291dc181fb847d9944dcf5c09c0eb7f0
Source_SHA256: b3f68c772b952e9159ee525ecf23127a256d89060c9574d2f39fcfe377799ffc
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Editing.Refactor (src/commands/editing/refactor.ts)

### [Signatures]
- `makeRefactorCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.78 — DEEP (FMCF refactoring with deep mode)
- seam_capacity: EXPLORATORY
- leverage: HIGH (provides actionable refactoring steps)
- SIG_ID: SIG-cmd-editing-refactor-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /refactor <prompt> command to Orchestrator
- Uses PREAMBLE for FMCF refactoring expert prompt
- Mode: deep, requires prompt argument
- Preamble: "You are a refactoring expert applying FMCF v3.5 principles..."