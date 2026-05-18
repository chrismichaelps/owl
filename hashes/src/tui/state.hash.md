State_ID: BigInt(0x330644c029aa137e)
Git_SHA: 8c574e7ae88d2c472e80f4908473ef70cbfe5469
Source_SHA256: 330644c029aa137ec4d7fbffb42c56c6069386735da686a84c6ea7af622317a8
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Drift_Fixed: 2026-05-16T16:05:00Z
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
- `permissionMode: ToolPermissionMode` — visible session Permission policy

**State factory & reducer**
- `INITIAL_STATE: OwlAppState` — zero-value initial state
- `owlReducer(state: OwlAppState, action: OwlAction) => OwlAppState` — pure state transition function

### [Governance]
- depth_score: 0.80 — DEEP (pure state transition logic)
- seam_capacity: INTERNAL (tui state)
- leverage: HIGH (manages logs, token counts, status, and responses)
- SIG_ID: SIG-tui-state-330644c0

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
- AgentStatus and ActiveRole drive FMCF pipeline animation in AgentPipeline component
