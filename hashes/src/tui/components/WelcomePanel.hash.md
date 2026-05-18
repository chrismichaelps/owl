State_ID: BigInt(0x5bdae9376843db27)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 5bdae9376843db271cc9cd8724e0fcbd83bb9697ac17c627da6bcc1269bb3293
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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
