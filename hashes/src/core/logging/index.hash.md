State_ID: BigInt(0x000000000000002C)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: b61200868d30ba33007ed8dcff1a55d8dcd6e4a4e76cbdce964ba40497f9e300
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
