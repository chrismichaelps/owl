State_ID: BigInt(0x0000000000000052)
Git_SHA: da56a6d328d9b1fae041e91050918aa0b6e21494
Source_SHA256: 5a24eb5fe528a74ae6283dfce14052f654abe696b2c1a6389e517e34481e2033
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Analysis.Depth (src/commands/analysis/depth.ts)

### [Signatures]
- `makeDepthCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.78 — DEEP (FMCF analysis dispatch with scoring preamble)
- seam_capacity: EXPLORATORY
- leverage: MEDIUM (analyzes with FMCF metrics)
- SIG_ID: SIG-cmd-analysis-depth-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /depth <subject> command to Orchestrator
- Uses PREAMBLE for FMCF DEPTH_SCORE computation prompt
- Mode: standard, requires subject argument
- Preamble: "You are an FMCF v3.5 Architect. Compute the DEPTH_SCORE..."
