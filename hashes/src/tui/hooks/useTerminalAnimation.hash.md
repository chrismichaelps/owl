State_ID: BigInt(0x0000000000000098)
Git_SHA: c9d8e7f6a5b4c3d2
Source_SHA256: c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Hooks.Animation (src/tui/hooks/useTerminalAnimation.ts)

### [Signatures]
- `useTerminalAnimation(enabled: boolean, intervalMs?: number) => number`
- `getFrame<T>(frames: readonly T[], frame: number, fallback: T) => T`

### [Governance]
- depth_score: 0.65 — MEDIUM (setInterval frame clock with enable guard)
- seam_capacity: INTERNAL
- leverage: LOW
- SIG_ID: SIG-tui-hooks-animation-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- useTerminalAnimation returns monotonically incrementing frame counter
- Interval paused when enabled=false — cleanup via clearInterval in useEffect
- getFrame uses modulo for safe frame selection with fallback on undefined
- intervalMs defaults to TUI_ANIMATION.FRAME_INTERVAL_MS constant
