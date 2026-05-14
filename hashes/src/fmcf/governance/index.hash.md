State_ID: BigInt(0x000000000000001C)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 90c8ed64ebdc0ed8b004102c729da317d4586d4ce33f65e869d148bcd59164d7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.FMCF.Governance (src/fmcf/governance/index.ts)

### [Signatures]
- `GovernanceEngine: Context.Tag<GovernanceEngine, GovernanceEngineService>`
- `GovernanceEngineLive: Layer.succeed<GovernanceEngine, GovernanceEngineService>`
- `validateImportInvariant(subsystemId, invariants, importedFromSubsystem) => Effect<void, GovernanceViolationError>`
- `validateTLIScope(file, changedLines, totalLines) => Effect<"OK" | "SHARD_SPLIT">`
- `validateRoleTransition(from, to, allowedFlow) => Effect<void, GovernanceViolationError>`

### [Governance]
- depth_score: 0.85 — DEEP (constitutional enforcement, rule validation)
- seam_capacity: BACKBONE (FMCF v3.5 constitutional enforcement)
- leverage: CRITICAL (blocks invalid operations at runtime)
- SIG_ID: SIG-fmcf-governance-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/fmcf/roles/architect.hash.md`
- Imports: `@root/src/core/errors/index.js`, `@root/src/core/constants/index.js`

### [Architecture]
- Constitutional enforcement for FMCF v3.5 invariants
- validateImportInvariant: checks MUST NOT rules against imports
- validateTLIScope: enforces 15% TLI threshold → SHARD_SPLIT
- validateRoleTransition: enforces DEEPENING_FLOW order
