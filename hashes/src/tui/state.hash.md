State_ID: BigInt(0x00000000000000b1)
Git_SHA: f516840da54d9d72a5141f0078265ba0b73828a4
Source_SHA256: 58aaf3d62e629b4716034ed5c8aa81b5b9ccff0349ad9f400d026e9cd8780a6f
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

**State factory & reducer**
- `INITIAL_STATE: OwlAppState` — zero-value initial state
- `owlReducer(state: OwlAppState, action: OwlAction) => OwlAppState` — pure state transition function

### [Governance]
- depth_score: 0.80 — DEEP (pure state transition logic)
- seam_capacity: INTERNAL (tui state)
- leverage: HIGH (manages logs, token counts, status, and responses)
- SIG_ID: SIG-tui-state-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: `@root/hashes/src/core/schema/index.hash.md`

### [Architecture]
- Pure reducer pattern — owlReducer is a pure function with no side effects
- useReducer pattern with discriminated union OwlAction for type-safe dispatch
- Tracks total token usage, cost, and turn counts across the session
- Log buffer capped at TUI_CONSTANTS.MAX_LOG_LINES (100 entries) — oldest entries dropped
- ConversationTurn union enables type-narrowing at render time (inference vs command)
- AgentStatus and ActiveRole drive FMCF pipeline animation in AgentPipeline component
