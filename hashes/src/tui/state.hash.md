State_ID: BigInt(0xc39b75de66e36b75)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: c39b75de66e36b756187900be5137357f7f006d14ab5927d24ed7dea85783e27
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
