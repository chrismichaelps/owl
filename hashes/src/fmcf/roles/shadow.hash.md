---
State_ID: BigInt(0x0000000000000018)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 142310ac70df601a6774cbf2f452912af49910e2ce8ec602185e2383be13e6bb
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.FMCF.Roles.Shadow (src/fmcf/roles/shadow.ts)

### [Signatures]
- `SHADOW_ROLE: RoleDefinition`

### [Governance]
- depth_score: 0.50 — MEDIUM (simple constant definition)
- seam_capacity: INTERNAL
- leverage: MEDIUM (defines role contract)
- SIG_ID: SIG-fmcf-shadow-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/fmcf/roles/architect.hash.md`

### [Architecture]
- Shadow role definition (TLI only)
- Responsibilities: targeted-line-injection, surgical-code-changes
- Prohibited: change-contracts, change-seams, change-registry