---
State_ID: BigInt(0x000000000000002B)
Git_SHA: fa98d110fe8b60149f9bf130b0ca3e06766d0e11
Source_SHA256: 149535bc2871d5e5636af8bbe98c43294bae77bd7decfe9fc3ea1f6e46f0a2f7
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
