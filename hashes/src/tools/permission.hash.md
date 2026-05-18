State_ID: BigInt(0x3552f24b15491d4e)
Git_SHA: 5bdeb9e46595c197a80043cc29039e5cc6934f58
Source_SHA256: 3552f24b15491d4ea3315abb4e62fa2dee8a9518da26b6fa3f2bf1bbc4c55e65
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T02:35:00Z

---

## @Owl.Tools.Permission (src/tools/permission.ts)

### [Signatures]

- `resolveToolPermission(risk: ToolRiskAssessment, mode?: ToolPermissionMode) => ToolPermissionDecision`
- `formatToolPermission(decision: ToolPermissionDecision) => string`

### [Governance]

- depth_score: 0.76
- depth_status: DEEP
- seam_capacity: CRITICAL
- SIG_ID: SIG-tools-permission-3552f24b

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tools/index.hash.md`
- Domain: `docs/CONTEXT.md#Permission`
- Dependency: `@root/hashes/src/tools/risk.hash.md`
- Dependency: `@root/hashes/src/core/constants/tools.hash.md`

### [Architecture]

- Pure Permission resolver.
- Consumes ToolRisk without executing tools.
- Mirrors ref-cli external Permission mode vocabulary.
