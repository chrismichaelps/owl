State_ID: BigInt(0xca6839ffd3d36d4e)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: ca6839ffd3d36d4e5df16077b7e0153d3b0ad0acc4ce76ef848c7dc63fcd9021
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Core.Schema (src/core/schema/index.ts)

### [Signatures]
- `ModeSchema` — Literal union: standard | deep | quick | economy | god
- `MessageRoleSchema`, `MessageSchema`, `Message`
- `TaskSchema`, `Task`
- `ProviderIdSchema`, `ProviderModelSchema`, `ProviderId`
- `TokenUsageSchema`, `TokenUsage`
- `InferenceRequestSchema`, `InferenceResponseSchema`
- `MutationTargetSchema`, `MutationSchema`
- `SeamCapacitySchema`, `DepthStatusSchema`

### [Governance]
- depth_score: 0.75 — DEEP (all types derived from Schema, no runtime duplication)
- seam_capacity: INTERNAL
- leverage: HIGH (all subsystems import types from here)
- SIG_ID: SIG-core-schema-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/local.map.json`
