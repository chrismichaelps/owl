State_ID: BigInt(0x0000000000000059)
Git_SHA: 4f73af824a093a64419faed765a702836965fe50
Source_SHA256: e2ca381f250d7079609fe526eb7741b219919d75adb3fdc4b93a8d2290e04edb
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Core.Task (src/commands/core/task.ts)

### [Signatures]
- `makeTaskCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.70 — MEDIUM (standard mode inference)
- seam_capacity: EXPLORATORY
- leverage: MEDIUM (default mode, balanced performance)
- SIG_ID: SIG-cmd-core-task-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /task <prompt> command to Orchestrator
- Mode: standard (default inference mode)
- Requires prompt argument
- Returns raw content from orchestrator
