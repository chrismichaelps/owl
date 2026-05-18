State_ID: BigInt(0x1a9d4b7e71490684)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 1a9d4b7e71490684d5010aae2ca89ce6f468fd222a785091c1f4323092c12c7e
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
