---
State_ID: BigInt(0x0000000000000002)
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
- Module: `@root/src/main.ts`
- Role: CLI entry point — smoke-test target for Phase 0 bootstrap
- Fidelity: Active
- SIG_ID: SIG-main-44a17ae7

### [Semantic Hash]
- Source SHA256: b31cb8764054852270b7e5388e8403f3b248298a263670b5ee5cd95c0eba2764
- Verified: 2026-05-12 — [TEST: PASSED] — dist/main.js emits "Owl — AI coding agent"

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/local.map.json`

### [Architecture]
- depth_score: 0.10
- depth_status: SHALLOW (intentional — entry point, not a business module)
- seam_capacity: INTERNAL
- leverage: LOW
- locality: HIGH
- notes: Phase 0 bootstrap entry point only. Replaced in Phase 1 with full CLI layer.
