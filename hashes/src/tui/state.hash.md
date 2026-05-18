State_ID: BigInt(0x44d58707de5b9515)
Git_SHA: 185e899580c525113a3ee902cef52174ecabeee9
Source_SHA256: 44d58707de5b95155462eb0abda355d540f34848e6956c1c6f5254413e1362d3
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T14:55:43Z

---

## @Owl.TUI.State (src/tui/state.ts)

### [Signatures]

**State types**

- `type AgentStatus = 'idle' | 'processing' | 'streaming' | 'error'`
- `type ActiveRole = 'Architect' | 'DNA Engineer' | 'Shadow' | 'Forensic Guardian' | null`
- `interface InferenceConversationTurn` — prompt, response, tokensUsed, provider?, model?, estimatedCostUsd?, latencyMs?, timestamp, mode
- `interface CommandConversationTurn` — command, output, timestamp
- `type ConversationTurn = InferenceConversationTurn | CommandConversationTurn`
- `interface ResponseSnapshot` — streaming text buffer for live display
- `interface OwlAppState` — full application state shape (status, turns, logs, tokens, cost, activeRole, ...)
- `type OwlAction` — discriminated union of all dispatchable actions
- `SET_TURNS` — replace visible conversation turns after Session lifecycle commands
- `permissionMode: ToolPermissionMode` — visible session Permission policy

**State factory & reducer**

- `INITIAL_STATE: OwlAppState` — zero-value initial state
- `owlReducer(state: OwlAppState, action: OwlAction) => OwlAppState` — pure state transition function

### [Governance]

- depth_score: 0.80 — DEEP (pure state transition logic)
- seam_capacity: INTERNAL (tui state)
- leverage: HIGH (manages logs, token counts, status, and responses)
- SIG_ID: SIG-tui-state-44d58707

### [Linkage]

- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: `@root/hashes/src/core/schema/index.hash.md`

### [Architecture]

- Pure reducer pattern — owlReducer is a pure function with no side effects
- useReducer pattern with discriminated union OwlAction for type-safe dispatch
- Tracks total token usage, cost, and turn counts across the session
- Tracks session Permission mode so tool execution policy remains visible in the TUI chrome
- Log buffer capped at TUI_CONSTANTS.MAX_LOG_LINES (100 entries) — oldest entries dropped
- ConversationTurn union enables type-narrowing at render time (inference vs command)
- SET_TURNS allows Session lifecycle commands to refresh visible history without touching routing state
- AgentStatus and ActiveRole drive FMCF pipeline animation in AgentPipeline component
