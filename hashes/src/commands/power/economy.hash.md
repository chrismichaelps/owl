---
State_ID: BigInt(0x0000000000000069)
Git_SHA: 6761e2231cf557af57aa655249d13198dfa1ea22
Source_SHA256: 9a9347edad418daf45f25af9e0db17385ab3886a321a91dcfdd825b12b1125e6
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Power.Economy (src/commands/power/economy.ts)

### [Signatures]
- `makeEconomyCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.65 — MEDIUM (low token budget constraint)
- seam_capacity: EXPLORATORY
- leverage: MEDIUM (constrained inference mode)
- SIG_ID: SIG-cmd-power-economy-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /economy <prompt> command to Orchestrator
- Mode: economy (2k token budget constraint)
- Requires prompt argument
- Returns raw content from orchestrator