State_ID: BigInt(0x00000000000000a5)
Git_SHA: f5a6b7c8d9e0f1a2
Source_SHA256: f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.WelcomePanel (src/tui/components/WelcomePanel.tsx)

### [Signatures]
- `WelcomePanel: React.FC<{ mode, status, activeRole, projectRoot, totalInputTokens, totalOutputTokens, totalEstimatedCostUsd }>`
- `formatProjectPath(projectRoot: string) => string`
- `resolveWelcomeWidth(columns: number) => number`

### [Governance]
- depth_score: 0.70 — MEDIUM (startup workbench panel with session metrics)
- seam_capacity: INTERNAL
- leverage: HIGH
- SIG_ID: SIG-tui-cmp-welcomepanel-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Deps: `@root/hashes/src/tui/components/AgentPipeline.hash.md`, `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/core/cost.hash.md`

### [Architecture]
- Renders Owl startup identity, mode badge, FMCF pipeline, and session token/cost metrics
- formatProjectPath abbreviates home directory to ~ for compact display
- resolveWelcomeWidth enforces MIN_WIDTH floor on narrow terminals
- Pure render — no side effects; AgentPipeline embedded as child
