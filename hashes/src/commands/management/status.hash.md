State_ID: BigInt(0x0000000000000075)
Git_SHA: b08b51254f38dd6138e55dbe56ad187ff73866f5
Source_SHA256: ef1b23d1c3b316caec0a54a8f47140b949112991cf3562f6602db3c7adf29302
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Status (src/commands/management/status.ts)

### [Signatures]
- `makeStatusCommand(sessionMemory: SessionMemoryService, usageMetrics: UsageMetricsService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`
- `formatCacheHitRate(hitRate: number) => string`

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
- Reports session turn count, memory tokens, Inference calls, Provider totals, cache hit rate, and latency
- Includes last turn timestamp if available
