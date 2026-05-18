State_ID: BigInt(0x23cfac6d5aee94c3)
Git_SHA: fce688042c97859fe34944133550418daa486e91
Source_SHA256: 23cfac6d5aee94c3a8a6f882cabb74a827bd95d07a13a3d9b6ac809ce3d11fd7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T02:18:00Z
---

## @Owl.Tools.Risk (src/tools/risk.ts)

### [Signatures]
- `classifyToolRisk(toolName: string, input?: Record<string, unknown>) => ToolRiskAssessment`
- `formatToolRisk(assessment: ToolRiskAssessment) => string`

### [Governance]
- depth_score: 0.74
- depth_status: DEEP
- seam_capacity: CRITICAL
- SIG_ID: SIG-tools-risk-23cfac6d

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tools/index.hash.md`
- Domain: `docs/CONTEXT.md#ToolRisk`
- Dependency: `@root/hashes/src/core/constants/tools.hash.md`

### [Architecture]
- Pure ToolRisk classifier.
- Establishes Permission policy seam without runtime mutation.
- Uses centralized constants for command safety vocabulary.
