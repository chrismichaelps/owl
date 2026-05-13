---
State_ID: BigInt(0x0000000000000011)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 7d3876cbd574c9d43a9f56765e7b438ea6d9b212e5a3e21a5be9272a8f92ca74
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
---

## @Owl.Entry (src/main.ts)

### [Signatures]
- `main: Effect<void, never, never>` — synchronous Effect that logs startup message
- Entry: `Effect.runSync(main)`

### [Governance]
- depth_score: 0.10
- depth_status: SHALLOW (intentional — entry point, not a business module)
- seam_capacity: INTERNAL
- leverage: LOW
- SIG_ID: SIG-main-44a17ae7

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/local.map.json`

### [Architecture]
- Phase 0 bootstrap entry point. Replaced in Phase 1 with full CLI layer.