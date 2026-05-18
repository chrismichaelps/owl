State_ID: BigInt(0x4cd3ec185baa65c4)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 4cd3ec185baa65c45b2f9f996299145e50510b586a9909d540261239adc2c0ef
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Providers.Cost (src/providers/cost.ts)

### [Signatures]
- `estimateCapabilityCostUsd(capability, inputTokens, outputTokens) => number`
- `estimateModelCostUsd(capabilities, modelId, inputTokens, outputTokens) => number`

### [Governance]
- depth_score: 0.70 — MEDIUM (provider-specific cost delegation over core/cost)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-providers-cost-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/providers/types.hash.md`
- Deps: `@root/hashes/src/core/cost.hash.md`, `@root/hashes/src/providers/types.hash.md`

### [Architecture]
- Delegates to core/cost for math — provider layer adds capability lookup
- estimateModelCostUsd returns 0 when modelId not found (not an error)
- Pure functions — no side effects, no I/O
