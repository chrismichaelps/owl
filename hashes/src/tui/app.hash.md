State_ID: BigInt(0x752288a5aa9201fc)
Git_SHA: 8c574e7ae88d2c472e80f4908473ef70cbfe5469
Source_SHA256: 752288a5aa9201fc07723c0c6c936c3b49c79e1b9b0aad12b25c1382e6a80f7b
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
- SIG_ID: SIG-tui-app-752288a5

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
- Passes Permission mode state into StatusBar and MetaPanel for ref-cli-aligned session visibility
- Mounts McpManager from AppProps.mcpManager — optional (no MCP = servers=[])  
