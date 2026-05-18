State_ID: BigInt(0x2b2e225ca8777959)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 2b2e225ca877795983d3a7c02f5ff0ab73536497454d4f111ee7c0002b18920e
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
