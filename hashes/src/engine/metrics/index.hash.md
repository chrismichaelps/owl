State_ID: BigInt(0x0000000000000073)
Git_SHA: b08b51254f38dd6138e55dbe56ad187ff73866f5
Source_SHA256: ee59f20a0b4bdbe7aa62930089cc6745905460a323292dbe23393fbd151452ba
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Engine.Metrics (src/engine/metrics/index.ts)

### [Signatures]
- `InferenceMetric` — task, Mode, Provider, Model, Token, cache Token, latency, timestamp record
- `RecordInferenceMetric` — writable Inference metric with optional cache Token fields
- `ProviderUsageMetrics` — Provider aggregate totals with cache read/write Token totals
- `ModelUsageMetrics` — Model aggregate totals with cache read/write Token totals
- `UsageMetricsSnapshot` — total, cache efficiency, Provider, Model, and recent records
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
- Aggregates Inference totals and prompt cache efficiency by Provider and Model.
- Normalizes missing cache read/write Tokens to zero at the write boundary.
- Retains bounded recent Inference records using `METRICS_CONSTANTS`.
