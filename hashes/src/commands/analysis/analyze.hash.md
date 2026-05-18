State_ID: BigInt(0x0af7d926d6563664)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 0af7d926d65636642c00d57b6bc3508bac33b4879d9239747d5e8f66deb511f5
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Analysis.Analyze (src/commands/analysis/analyze.ts)

### [Signatures]
- `makeAnalyzeCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.75 — DEEP (FMCF analysis dispatch)
- seam_capacity: INTERNAL
- leverage: MEDIUM (analyzes but doesn't modify)
- SIG_ID: SIG-cmd-analysis-analyze-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /analyze command to Orchestrator
- Uses PREAMBLE for FMCF deep analysis prompt
- Mode: deep, requires subject argument
