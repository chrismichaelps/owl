---
State_ID: BigInt(0x0000000000000054)
Git_SHA: da56a6d328d9b1fae041e91050918aa0b6e21494
Source_SHA256: 543345a8341a6909f1383ff236d0fa6578c0ae3988c07296458e2181572951e0
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Analysis.Grill (src/commands/analysis/grill.ts)

### [Signatures]
- `makeGrillCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.80 — DEEP (FMCF grilling loop with probing questions)
- seam_capacity: EXPLORATORY
- leverage: HIGH (challenges architectural assumptions)
- SIG_ID: SIG-cmd-analysis-grill-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /grill <subject> command to Orchestrator
- Uses PREAMBLE for FMCF grilling loop prompt
- Mode: deep, requires subject argument
- Preamble: "You are an FMCF v3.5 Architect running the Grilling Loop..."