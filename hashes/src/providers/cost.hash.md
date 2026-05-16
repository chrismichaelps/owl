State_ID: BigInt(0x0000000000000093)
Git_SHA: d6e5f4a3b2a1b0c9
Source_SHA256: d6e5f4a3b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6a5
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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
