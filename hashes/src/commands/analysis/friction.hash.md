State_ID: BigInt(0x0000000000000053)
Git_SHA: 6761e2231cf557af57aa655249d13198dfa1ea22
Source_SHA256: 097f1fed5a9e3352dc9c7518a862d5c61182c03826f5340b9b30f7c4a5ba89e7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Analysis.Friction (src/commands/analysis/friction.ts)

### [Signatures]
- `makeFrictionCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.80 — DEEP (FMCF friction discovery with deep mode)
- seam_capacity: EXPLORATORY
- leverage: HIGH (identifies architectural friction points)
- SIG_ID: SIG-cmd-analysis-friction-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /friction <subject> command to Orchestrator
- Uses PREAMBLE for FMCF friction discovery prompt
- Mode: deep, requires subject argument
- Preamble: "You are an FMCF v3.5 Architect running Friction Discovery..."
