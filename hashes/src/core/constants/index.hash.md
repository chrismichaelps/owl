---
State_ID: BigInt(0x0000000000000035)
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Core.Constants (src/core/constants/index.ts)

### [Signatures]
- `TOKEN_LIMITS` — CONTEXT_WINDOW_DEFAULT, MAX_OUTPUT_TOKENS, MARKOV_WINDOW_SIZE, etc.
- `MODE_TOKEN_BUDGETS` — per-mode token caps: economy=2k, quick=8k, standard=32k, deep=100k, god=200k
- `PROVIDER_TIMEOUTS` — DEFAULT_MS=30s, STREAM_CHUNK_TIMEOUT_MS=5s
- `RETRY_CONFIG` — MAX_ATTEMPTS=3, BASE_DELAY_MS=1s, MAX_DELAY_MS=30s
- `DEPTH_THRESHOLDS` — DEEP=0.7, SHALLOW=0.4
- `ROUTING_WEIGHTS`, `SEAM_CAPACITY_SCORES`, `TUI_*`
- `HTTP_STATUS` — OK, UNAUTHORIZED, TOO_MANY_REQUESTS, ANTHROPIC_OVERLOADED (529), etc.

### [Governance]
- depth_score: 0.15 — SHALLOW (pure constants, no logic)
- seam_capacity: INTERNAL
- SIG_ID: SIG-core-constants-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/local.map.json`
