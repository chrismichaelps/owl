---
State_ID: BigInt(0x0000000000000019)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 024889e1f472710d113b9245bead6d072258f943e9be9f6798fae3f793715d0e
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.FMCF.Roles.Guardian (src/fmcf/roles/guardian.ts)

### [Signatures]
- `GUARDIAN_ROLE: RoleDefinition`

### [Governance]
- depth_score: 0.55 — MEDIUM (simple constant definition)
- seam_capacity: INTERNAL
- leverage: MEDIUM (defines role contract)
- SIG_ID: SIG-fmcf-guardian-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/fmcf/roles/architect.hash.md`

### [Architecture]
- Forensic Guardian role definition
- Responsibilities: registry-updates, chronos-tracking, integrity-checks, traceability
- Prohibited: propose-architecture, write-implementation