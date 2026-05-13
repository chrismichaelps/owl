---
State_ID: BigInt(0x0000000000000029)
Git_SHA: fa98d110fe8b60149f9bf130b0ca3e06766d0e11
Source_SHA256: 4d436bf4f5fe26e9a350130ebc736b48b2a77d3ab99fb873e102f050160be165
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
