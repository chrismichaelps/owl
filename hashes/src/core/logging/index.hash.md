State_ID: BigInt(0x0a6ff3b18ce23bf5)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 0a6ff3b18ce23bf5ef1f7614da0b4a2549226a7925ccad3d4204bbccc598fcdd
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
