State_ID: BigInt(0xb05236f9138f2fbc)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: b05236f9138f2fbca2fc687826ec611c360323205fd9b0adf0fc7288ca825fa1
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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
