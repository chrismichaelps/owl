State_ID: BigInt(0x4de1465ac05aec70)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 4de1465ac05aec701cd397508c8d3eb591a541b96ddee2b3f91f6d066bb56f32
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
