State_ID: BigInt(0x00000000000000a0)
Git_SHA: a0b1c2d3e4f5a6b7
Source_SHA256: a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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
