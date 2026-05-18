State_ID: BigInt(0x0000000000000000)
Git_SHA: PENDING
Source_SHA256: PENDING_SOURCE
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: SIGNATURE
Registry_Sync: 2026-05-18T02:08:00Z
---

## @Owl.Tools.Risk (src/tools/risk.ts)

### [Signatures]
- `classifyToolRisk(toolName: string, input?: Record<string, unknown>) => ToolRiskAssessment`
- `formatToolRisk(assessment: ToolRiskAssessment) => string`

### [Governance]
- depth_score: 0.74
- depth_status: DEEP
- seam_capacity: CRITICAL
- SIG_ID: SIG-tools-risk-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tools/index.hash.md`
- Domain: `docs/CONTEXT.md#ToolRisk`
- Dependency: `@root/hashes/src/core/constants/tools.hash.md`

### [Architecture]
- Pure ToolRisk classifier.
- Establishes Permission policy seam without runtime mutation.
- Uses centralized constants for command safety vocabulary.
