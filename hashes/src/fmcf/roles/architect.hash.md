State_ID: BigInt(0x0000000000000016)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 55fe4fb63a4e1ea080e913d26e3308eb4a90802a23f1e5b286effcfa36c14858
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.FMCF.Roles.Architect (src/fmcf/roles/architect.ts)

### [Signatures]
- `RoleContext: Context.Tag<RoleContext, RoleContextService>`
- `RoleContextLive: Layer.effect<RoleContext, RoleContextService>`
- `DEEPENING_FLOW: readonly RoleId[]`
- `ARCHITECT_ROLE: RoleDefinition`
- `current() => Effect<RoleId>`
- `transition(to: RoleId) => Effect<void, GovernanceViolationError>`
- `reset() => Effect<void>`

### [Governance]
- depth_score: 0.78 — DEEP (role state machine, transition validation)
- seam_capacity: INTERNAL
- leverage: HIGH (foundational for all FMCF roles)
- SIG_ID: SIG-fmcf-architect-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/fmcf/governance/index.hash.md`
- Imports: `@root/src/core/errors/index.js`

### [Architecture]
- RoleContext service with Deepening Flow enforcement
- RoleId: "architect" | "dna-engineer" | "shadow" | "guardian"
- ARCHITECT_ROLE responsibilities: topology, friction-discovery, seam-analysis, deepening, grilling-loop
- ARCHITECT_ROLE prohibited: write-code, write-contracts, edit-registry
- Validates transitions follow DEEPENING_FLOW order
