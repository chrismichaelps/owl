---
State_ID: BigInt(0x0000000000000058)
Git_SHA: 4f73af824a093a64419faed765a702836965fe50
Source_SHA256: fd470aa6a58a98fdc32140291538f22348154af161273e487f498c1ff13ce71f
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Core.Quick (src/commands/core/quick.ts)

### [Signatures]
- `makeQuickCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.65 — MEDIUM (quick mode, faster but less thorough)
- seam_capacity: EXPLORATORY
- leverage: MEDIUM (fast inference, lower token usage)
- SIG_ID: SIG-cmd-core-quick-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /quick <prompt> command to Orchestrator
- Mode: quick (fast inference, lower token budget)
- Requires prompt argument
- Returns raw content from orchestrator