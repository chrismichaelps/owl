State_ID: BigInt(0xf8cb9a341e2160d1)
Git_SHA: e44dbd9d3e552a3bc9b1aa2e5c8ab21d64ca7da6
Source_SHA256: f8cb9a341e2160d187180bb4de2488c89ac148f281212db897c404c238de0336
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE

---

## @Owl.TUI.Components.StatusBar (src/tui/components/StatusBar.tsx)

### [Signatures]

- `StatusBar(props: StatusBarProps) => ReactElement`

### [Governance]

- depth_score: 0.65 — SHALLOW (status display)
- seam_capacity: INTERNAL (status rendering)
- leverage: LOW (displays status text)
- SIG_ID: SIG-tui-components-StatusBar-f8cb9a34

### [Linkage]

- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]

- Bottom-anchored status display
- Shows current mode and status
- Shows current Permission mode in the persistent bottom chrome
- Simple text-based status indicator
- Shows current execution stage in the persistent bottom chrome.
