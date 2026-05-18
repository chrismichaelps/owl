State_ID: BigInt(0x36d1c4d629d5e66a)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 36d1c4d629d5e66a32d9c8e322c77ba0ec0750ef9b6fd5e6f7284050b17ffa5b
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
