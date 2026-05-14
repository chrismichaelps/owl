---
State_ID: BigInt(0x0000000000000050)
Git_SHA: da56a6d328d9b1fae041e91050918aa0b6e21494
Source_SHA256: d1b96afae92d4c44609f6d4caeec4e376a755061b4a5c3652ab0370d75a48163
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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