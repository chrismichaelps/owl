State_ID: BigInt(0x0000000000000026)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 317be9f9f36987b027b9d94a72b529a3fd60bd35e11e158b7d13aecb0f91b885
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
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
