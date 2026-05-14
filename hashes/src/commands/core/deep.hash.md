State_ID: BigInt(0x0000000000000056)
Git_SHA: 4f73af824a093a64419faed765a702836965fe50
Source_SHA256: e896a1ded86c4bb28a0ac07814172fb42dd4ab883221ef986480edf1e3f0985d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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
