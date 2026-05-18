State_ID: BigInt(0x201fb97a8eee7596)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 201fb97a8eee75962396993c5d74722f2c738c6bece54597f13bf0224c4f827e
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
