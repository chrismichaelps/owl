State_ID: BigInt(0x0000000000000069)
Git_SHA: 8a91a98ecac3bf6be3ffa105496ef48e08cc429b
Source_SHA256: 50a30153ed3d70fd3cdab2626543efb60bcc394b35215601a487c20706fff13d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Engine.Metrics (src/engine/metrics/index.ts)

### [Signatures]
- `InferenceMetric` — task, Mode, Provider, Model, Token, latency, timestamp record
- `ProviderUsageMetrics` — Provider aggregate totals
- `ModelUsageMetrics` — Model aggregate totals
- `UsageMetricsSnapshot` — total, Provider, Model, and recent records
- `UsageMetricsService` — recordInference, snapshot, reset
- `UsageMetrics: Context.Tag<UsageMetrics, UsageMetricsService>`
- `UsageMetricsLive: Layer<UsageMetrics>`

### [Governance]
- depth_score: 0.78 — DEEP (small Interface aggregating Session UsageMetrics)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-engine-metrics-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/orchestrator/index.hash.md`
- Imports: `@root/src/core/constants/index.js`, `@root/src/core/schema/index.js`

### [Architecture]
- Ref-backed deterministic UsageMetrics storage for the active Session.
- Aggregates Inference totals by Provider and Model.
- Retains bounded recent Inference records using `METRICS_CONSTANTS`.
