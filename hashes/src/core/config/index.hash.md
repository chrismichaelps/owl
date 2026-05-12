---
State_ID: BigInt(0x0000000000000013)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Core.Config (src/core/config/index.ts)

### [Signatures]
- `OwlConfig` interface — anthropicApiKey, openaiApiKey?, googleApiKey?, xaiApiKey?, ollamaBaseUrl, defaultMode, logLevel, maxConcurrentProviders, telemetryEnabled
- `OWL_CONFIG extends Context.Tag` — Effect service tag
- `OWLConfigLive: Layer` — reads from env via Config primitives, withDefault for optional

### [Governance]
- depth_score: 0.55 — MEDIUM (Config service with Layer wiring)
- seam_capacity: INTERNAL
- dependencies: [core/schema]
- SIG_ID: SIG-core-config-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Deps: `@root/hashes/src/core/schema/index.hash.md`
- Parent: `@root/hashes/local.map.json`
