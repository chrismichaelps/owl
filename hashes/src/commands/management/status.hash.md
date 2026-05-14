State_ID: BigInt(0x000000000000006b)
Git_SHA: 8a91a98ecac3bf6be3ffa105496ef48e08cc429b
Source_SHA256: c626115bfc5d1a9854b1855dd5dc9feab4f89e6adfaef7de3371a9e0a4df631a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Status (src/commands/management/status.ts)

### [Signatures]
- `makeStatusCommand(sessionMemory: SessionMemoryService, usageMetrics: UsageMetricsService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.70 — DEEP (session and UsageMetrics display behind one Command)
- seam_capacity: INTERNAL
- leverage: LOW (read-only, displays session stats)
- SIG_ID: SIG-cmd-management-status-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/memory/index.hash.md`, `@root/hashes/src/engine/metrics/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /status command to SessionMemoryService and UsageMetricsService
- Reports session turn count, memory tokens, Inference calls, Provider totals, and latency
- Includes last turn timestamp if available
