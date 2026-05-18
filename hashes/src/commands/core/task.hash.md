State_ID: BigInt(0x27c98bee121fbc65)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 27c98bee121fbc65f3bf680cb023a37d896f8e388786d9e0bfd6464d014ea1e0
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
