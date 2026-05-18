State_ID: BigInt(0x8e9287c17297011c)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 8e9287c17297011ca01b730cf328d9739ee80c9f0654bc769c7d651826f43335
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
