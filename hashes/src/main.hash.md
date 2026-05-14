State_ID: BigInt(0x0000000000000011)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: b78c070155f3335193dae518fcdd89660c8bd8af52c2733349840e97ad9a03b9
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
