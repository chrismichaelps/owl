State_ID: BigInt(0xb17af0675b83f08b)
Git_SHA: 28016da38e6a87f9459ea519185c945fd6d89187
Source_SHA256: b17af0675b83f08bc966f11f9e8e900843e1078351c4db3b8a13356850c14ba8
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
- SIG_ID: SIG-tui-app-b17af067

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
- Applies startup Permission mode and Provider override before optional initial prompt execution
- Mounts McpManager from AppProps.mcpManager — optional (no MCP = servers=[])
