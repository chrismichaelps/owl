State_ID: BigInt(0x4b94cd40bd3d7cfc)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 4b94cd40bd3d7cfcca34602a03855ce0d2093445d60ddd5b0f133b764cd096f7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Core.Deep (src/commands/core/deep.ts)

### [Signatures]
- `makeDeepCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.75 — DEEP (deep mode inference dispatch)
- seam_capacity: EXPLORATORY
- leverage: HIGH (runs deep analysis on arbitrary prompts)
- SIG_ID: SIG-cmd-core-deep-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /deep <prompt> command to Orchestrator
- Mode: deep (full analysis with higher token budget)
- Requires prompt argument
- Returns raw content from orchestrator
