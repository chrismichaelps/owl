State_ID: BigInt(0x816eeca2cca4bdc0)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 816eeca2cca4bdc0b394129fd8b7a9ce30785e117244dc929cf89a80ec7802ed
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
