State_ID: BigInt(0x0000000000000029)
Git_SHA: fa98d110fe8b60149f9bf130b0ca3e06766d0e11
Source_SHA256: bb2e7a9dd142d13020bf7664c2f19cad5c21f8162860133ff5dee7c36226e62a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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
