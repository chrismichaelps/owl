State_ID: BigInt(0x858e1f5a0dbf5d89)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 858e1f5a0dbf5d890e3bb5812ed3a65a6def98f7c9a989bec418e28fdfeea068
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Power.God (src/commands/power/god.ts)

### [Signatures]
- `makeGodCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.75 — DEEP (maximum context window mode)
- seam_capacity: EXPLORATORY
- leverage: HIGH (full 200k context for complex tasks)
- SIG_ID: SIG-cmd-power-god-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /god <prompt> command to Orchestrator
- Mode: god (200k context window, maximum resources)
- Requires prompt argument
- Returns raw content from orchestrator
