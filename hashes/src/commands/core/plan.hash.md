State_ID: BigInt(0x65daff9142dad8c6)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 65daff9142dad8c6a80a075e3473f3edadb8beff4b8a3bd3a6aa44c3efeb3367
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Core.Plan (src/commands/core/plan.ts)

### [Signatures]
- `makePlanCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.82 — DEEP (architect preamble with step-by-step planning)
- seam_capacity: EXPLORATORY
- leverage: HIGH (generates implementation plans)
- SIG_ID: SIG-cmd-core-plan-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /plan <prompt> command to Orchestrator
- Uses PLAN_PREAMBLE for FMCF Architect planning prompt
- Mode: deep, requires prompt argument
- Preamble: "You are an FMCF Architect. Produce a step-by-step implementation plan..."
