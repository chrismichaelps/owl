State_ID: BigInt(0x000000000000005d)
Git_SHA: f62c2f2f8df5bb172147a5ae827784dac4718a11
Source_SHA256: 9493d981415257e96a265593f9263acbefd822241582cdfcd271d5b9c3d21d87
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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
