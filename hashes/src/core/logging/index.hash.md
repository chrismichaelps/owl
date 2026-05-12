---
State_ID: BigInt(0x0000000000000014)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Core.Logging (src/core/logging/index.ts)

### [Signatures]
- `OwlLoggerService` interface — debug/info/warn/error(msg, ctx) → Effect<void>
- `OwlLogger extends Context.Tag` — Effect service tag
- `OwlLoggerLive: Layer` — backed by Effect.logDebug/Info/Warning/Error + annotateLogs
- `withContext(logger, ctx, fn)` — merges ctx into every log call inside fn

### [Governance]
- depth_score: 0.45 — MEDIUM (service interface + Layer pattern)
- seam_capacity: INTERNAL
- SIG_ID: SIG-core-logging-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/local.map.json`
