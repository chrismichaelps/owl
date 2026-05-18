State_ID: BigInt(0x72a804e2f6119b7a)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 72a804e2f6119b7a956464c2f818239654d40d7c6d5bdd66df9399f84889072b
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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
