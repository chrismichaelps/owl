State_ID: BigInt(0x5460814c2019fefd)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 5460814c2019fefdd63c587ad386b139917e2a5a3646e3a95ff44168a6f1cfbf
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
