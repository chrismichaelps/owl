---
State_ID: BigInt(0x0000000000000057)
Git_SHA: 4f73af824a093a64419faed765a702836965fe50
Source_SHA256: 21aaeb7dba7453782332d6c211da87ee6ace44ce46649b4f8c9538a16e0af4d2
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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