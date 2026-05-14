---
State_ID: BigInt(0x000000000000006A)
Git_SHA: 6761e2231cf557af57aa655249d13198dfa1ea22
Source_SHA256: 98279b25e748da087cdc98908346464412624d8d6799b0fd9b28889a2e49fba7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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