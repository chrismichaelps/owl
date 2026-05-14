---
State_ID: BigInt(0x0000000000000030)
Git_SHA: b6b78075c6642d82327f887c2c3bdd57c3eeb2a1
Source_SHA256: f9e413648ceff129df077a6811e665df94d24199f738dd9df705583632985b83
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
