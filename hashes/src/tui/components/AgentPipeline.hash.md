State_ID: BigInt(0x2b9b4b7384eed767)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 2b9b4b7384eed7671fbe533b0ca009ea1bdfc51cb3dea9cce36af88035e54ef0
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
---

## @Owl.TUI.Components.AgentPipeline (src/tui/components/AgentPipeline.tsx)

### [Signatures]
- `AgentPipeline: React.FC<{ activeRole, frame }>`
- `getPipelineState(role, activeRole) => 'complete' | 'active' | 'pending'`

### [Governance]
- depth_score: 0.68 — MEDIUM (visual pipeline with animated role states)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-tui-cmp-agentpipeline-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Deps: `@root/hashes/src/tui/hooks/useTerminalAnimation.hash.md`, `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Renders FMCF 4-role pipeline (Architect→DNA→Shadow→Guardian) with live animation
- getPipelineState is a pure function deriving role visual state from activeRole
- Animates active role spinner using frame counter from useTerminalAnimation
- Role colors and labels are constants — never hardcoded inline
