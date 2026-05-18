State_ID: BigInt(0x6a369b3d2db3f0c4)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 6a369b3d2db3f0c4a24c9ac937987bf04e71a7172e9f12989fe98e42ee389316
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
