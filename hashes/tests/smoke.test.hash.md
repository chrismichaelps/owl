---
State_ID: BigInt(0x0000000000000003)
Git_SHA: 44a17ae7e05b03b0eb671680d905bac99d0e47c9
Source_SHA256: 5a93a003a7ac9559e8bdce643ddebc291fcc371b22a0966a1798e950d0da1a32
Grammar_Lock: "@root/hashes/grammar/vitest/vitest.hash.md"
---

## @Owl.Smoke (tests/smoke.test.ts)

### [Signatures]
- `describe("bootstrap")` — 3 test cases validating Effect-TS runtime integration
  - `it("runs an Effect successfully")` — Effect.succeed(42) → result === 42
  - `it("captures tagged errors in Exit")` — Effect.fail → Exit.isFailure === true
  - `it("runs Effect.gen correctly")` — generator combinator 10 + 20 === 30

### [Governance]
- Module: `@root/tests/smoke.test.ts`
- Role: Phase 0 bootstrap validation
- Fidelity: Active
- SIG_ID: SIG-smoke-44a17ae7

### [Semantic Hash]
- Source SHA256: 5a93a003a7ac9559e8bdce643ddebc291fcc371b22a0966a1798e950d0da1a32
- Verified: 2026-05-12 — [TEST: PASSED] — 3/3 tests green, vitest v2.1.9

### [Linkage]
- Grammar: `@root/hashes/grammar/vitest/vitest.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/local.map.json`

### [Architecture]
- depth_score: N/A (test file)
- seam_capacity: INTERNAL
- notes: Phase 0 smoke test. All 3 Effect primitives validated.
