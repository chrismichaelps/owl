---
State_ID: BigInt(0x000000000000001E)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Tokens.Budget (src/tokens/budget/index.ts)

### [Signatures]
- `TokenBudget: Context.Tag<TokenBudget, TokenBudgetService>`
- `TokenBudgetLive: Layer.effect<TokenBudget, TokenBudgetService>`
- `initSession(mode: string, budget?: number) => Effect<void>`
- `consume(taskId: string, tokens: number) => Effect<void, TokenBudgetExceededError>`
- `remaining() => Effect<number>`
- `totalConsumed() => Effect<number>`
- `reset() => Effect<void>`

### [Governance]
- depth_score: 0.70 — DEEP (budget enforcement, error throwing)
- seam_capacity: CRITICAL (runtime token enforcement)
- leverage: HIGH (prevents runaway costs)
- SIG_ID: SIG-tokens-budget-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tokens/pruning/index.hash.md`
- Imports: `@root/src/core/errors/index.js`, `@root/src/core/constants/index.js`

### [Architecture]
- Runtime token budget enforcement with Effect Ref
- Mode-aware budgets via MODE_TOKEN_BUDGETS
- Throws TokenBudgetExceededError when budget exceeded
- Tracks sessionBudget, consumed, mode in Ref
- Provides remaining() and totalConsumed() queries