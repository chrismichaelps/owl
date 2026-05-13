---
State_ID: BigInt(0x0000000000000011)
Git_SHA: 44a17ae7e05b03b0eb671680d905bac99d0e47c9
Source_SHA256: b31cb8764054852270b7e5388e8403f3b248298a263670b5ee5cd95c0eba2764
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