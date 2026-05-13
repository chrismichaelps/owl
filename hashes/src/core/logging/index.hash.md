---
State_ID: BigInt(0x000000000000002C)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: a97c27e81d609cf402af49c07180a78dde324f84f79a69440421191725254576
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
