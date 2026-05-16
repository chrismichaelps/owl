State_ID: BigInt(0x0000000000000082)
Git_SHA: cdef1234567890abcdef1234567890abcdef1234
Source_SHA256: cdef1234567890abcdef1234567890abcdef12345678901234567890abcdef12
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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
