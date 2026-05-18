State_ID: BigInt(0xa77f1027eb38e7cb)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: a77f1027eb38e7cb1599602796448b895ebc4c58862e2b31efa66bd8171dbf2a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Providers.Router.Scoring (src/providers/router/scoring.ts)

### [Signatures]
- `scoreProvider(cap, ctx): number` — weighted score: cost×0.25, complexity×0.35, latency×0.25, reliability×0.15
- `rankProviders(capabilities, ctx): readonly ProviderCapability[]`
- `selectBestProvider(capabilities, ctx): ProviderCapability | null`

### [Governance]
- depth_score: 0.68 — MEDIUM (scoring logic + deterministic fallback ranking)
- seam_capacity: INTERNAL
- SIG_ID: SIG-providers-scoring-00000001
