---
State_ID: BigInt(0x0000000000000031)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Router.Scoring (src/providers/router/scoring.ts)

### [Signatures]
- `scoreProvider(cap, ctx): number` — weighted score: cost×0.25, complexity×0.35, latency×0.25, reliability×0.15
- `selectBestProvider(capabilities, ctx): ProviderCapability | null`

### [Governance]
- depth_score: 0.60 — MEDIUM (scoring logic + mode/reasoning demand maps)
- seam_capacity: INTERNAL
- SIG_ID: SIG-providers-scoring-00000001
