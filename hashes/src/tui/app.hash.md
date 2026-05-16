State_ID: BigInt(0x00000000000000b2)
Git_SHA: 695c5f2d1abff2c7b2db1bdd2f54e72b44c1839d
Source_SHA256: 0e99fa80a00e0632469fe00203d01ea8a35eacc0e3b86ddbbe617e1276bc4902
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
Drift_Fixed: 2026-05-16T16:06:00Z
---

## @Owl.TUI.App (src/tui/app.tsx)

### [Signatures]
- `App: React.FC<AppProps>` — main TUI application component (memo-wrapped)
- `interface AppProps` — { mode, initialPrompt, projectRoot, runtime: ManagedRuntime<...>, mcpManager? }

### [Governance]
- depth_score: 0.82 — DEEP (main layout shell)
- seam_capacity: BACKBONE (connects all TUI components)
- leverage: CRITICAL (renders entire UI)
- SIG_ID: SIG-tui-app-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Child: `@root/hashes/src/tui/state.hash.md`
- Child: `@root/hashes/src/tui/components/WelcomePanel.hash.md`
- Child: `@root/hashes/src/tui/components/ConversationThread.hash.md`
- Child: `@root/hashes/src/tui/components/PromptInput.hash.md`
- Child: `@root/hashes/src/tui/components/MetaPanel.hash.md`
- Child: `@root/hashes/src/tui/components/StatusBar.hash.md`
- Child: `@root/hashes/src/tui/components/LogPanel.hash.md`
- Child: `@root/hashes/src/tui/components/ShortcutsOverlay.hash.md`
- Child: `@root/hashes/src/tui/components/CommandPalette.hash.md`
- Child: `@root/hashes/src/tui/components/FileMentionPalette.hash.md`
- Parent: `@root/hashes/src/cli/run.hash.md`

### [Architecture]
- Root application shell using Ink + React (memo-wrapped for render stability)
- State managed via useReducer(owlReducer, INITIAL_STATE) — no external state library
- Keyboard input dispatched via Ink useInput at the root level
- Orchestrator streaming events dispatch to reducer via callback — no shared refs
- Layout: WelcomePanel (top) / ConversationThread (scroll) / CommandPalette | FileMentionPalette (overlays) / PromptInput (bottom) / MetaPanel + StatusBar + LogPanel (fixed)
- Mounts McpManager from AppProps.mcpManager — optional (no MCP = servers=[])  
