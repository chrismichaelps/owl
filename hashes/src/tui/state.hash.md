---
State_ID: BigInt(0x0000000000000030)
Git_SHA: e37aab2
Source_SHA256: 0343820574d722efc8a8240743389b65d084048b1e370b434fd98730cac1b176
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.State (src/tui/state.ts)

### [Signatures]
- `owlReducer(state: OwlAppState, action: OwlAction) => OwlAppState`
- `INITIAL_STATE: OwlAppState`
- `ResponseSnapshot: Interface`

### [Governance]
- depth_score: 0.80 — DEEP (pure state transition logic)
- seam_capacity: INTERNAL (tui state)
- leverage: HIGH (manages logs, token counts, status, and responses)
- SIG_ID: SIG-tui-state-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]
- Centralized state management for the Ink TUI
- useReducer pattern with discriminated union actions
- Tracks total token usage and turn counts across sessions
- Implements a log buffer capped at 100 entries
