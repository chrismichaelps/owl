State_ID: BigInt(0x89b01fb38b541881)
Git_SHA: e44dbd9d3e552a3bc9b1aa2e5c8ab21d64ca7da6
Source_SHA256: 89b01fb38b54188114d7eaa2de969a9f201a84207599cb1d527c2be57417aa54
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T15:08:52Z

---

## @Owl.TUI.App (src/tui/app.tsx)

### [Signatures]

- `App: React.FC<AppProps>` — main TUI application component (memo-wrapped)
- `interface AppProps` — { mode, initialPrompt, projectRoot, runtime: ManagedRuntime<...>, mcpManager? }

### [Governance]

- depth_score: 0.82 — DEEP (main layout shell)
- seam_capacity: BACKBONE (connects all TUI components)
- leverage: CRITICAL (renders entire UI)
- SIG_ID: SIG-tui-app-89b01fb3

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
- Passes Permission mode state into StatusBar and MetaPanel for session visibility
- Applies startup Permission mode, optional Session resume, Privacy mode, and Provider override before optional initial prompt execution
- Mounts McpManager from AppProps.mcpManager — optional (no MCP = servers=[])
- Passes execution stage state into the left rail, metrics rail, and bottom status bar.
