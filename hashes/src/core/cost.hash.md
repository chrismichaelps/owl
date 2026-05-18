State_ID: BigInt(0xc99e404e68cbbc5c)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: c99e404e68cbbc5cee8d471d23f2ce48ac4a4f301d7b86e05f67549c4488dd62
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
---

## @Owl.Core.Cost (src/core/cost.ts)

### [Signatures]
- `estimateTokenCostUsd({inputTokens, outputTokens, inputCostPer1k, outputCostPer1k}) => number`
- `roundEstimatedCostUsd(costUsd: number) => number`
- `formatEstimatedCostUsd(costUsd: number) => string`

### [Governance]
- depth_score: 0.75 — DEEP (pure math behind 3-function interface, hides precision constants)
- seam_capacity: INTERNAL
- leverage: HIGH
- SIG_ID: SIG-core-cost-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/core/constants/index.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Pure deterministic cost math — no side effects, no I/O
- Precision boundary controlled by COST_CONSTANTS — never hardcoded
- formatEstimatedCostUsd switches decimal places at LOW_COST_THRESHOLD_USD
- Used by providers/cost and commands/management/providers
