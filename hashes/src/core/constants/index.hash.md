State_ID: BigInt(0x0000000000000061)
Git_SHA: 1cd37ce367ad7a684a8a32d7049f5f665e95a599
Source_SHA256: 2128c3b57f30b2b51766b6f17f0051443065bccb6c7b3c0d185dfb13b8ad4c5b
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Core.Constants (src/core/constants/index.ts)

### [Signatures]
- `TOKEN_LIMITS` — CONTEXT_WINDOW_DEFAULT=200k, MAX_OUTPUT_TOKENS=8192, MARKOV_WINDOW_SIZE=2, etc.
- `MODE_TOKEN_BUDGETS` — per-mode token caps: economy=2k, quick=8k, standard=32k, deep=100k, god=200k
- `PROVIDER_TIMEOUTS` — DEFAULT_MS=30s, STREAM_CHUNK_TIMEOUT_MS=5s, OLLAMA_DEFAULT_MS=60s
- `RETRY_CONFIG` — MAX_ATTEMPTS=3, BASE_DELAY_MS=1s, MAX_DELAY_MS=30s, BACKOFF_FACTOR=2
- `PROVIDER_IDS` — supported Provider ids for RoutingPreference parsing
- `ROUTING_LIMITS` — max normalized cost, fast model output threshold, fallback Provider count
- `DEPTH_THRESHOLDS` — DEEP=0.7, SHALLOW=0.4
- `SHARD_SPLIT_THRESHOLD = 0.15`
- `SEAM_COLLAPSE_MONTHS = 6`
- `ROUTING_WEIGHTS` — COMPLEXITY=0.35, COST=0.25, LATENCY=0.25, RELIABILITY=0.15
- `TUI_MAX_LOG_LINES = 100`
- `HTTP_STATUS` — OK=200, UNAUTHORIZED=401, TOO_MANY_REQUESTS=429, INTERNAL_SERVER_ERROR=500, etc.
- `EDITOR_CONSTANTS` — DIFF_CONTEXT_LINES=3, DIFF_TIMEOUT_MS=5s, MAX_FILE_SIZE_BYTES=1GB, AMPERSAND/DOLLAR tokens
- `PIPELINE_STAGES` — analysis, planning, diff, impact, approval, tli, verification
- `PipelineStage` type

### [Governance]
- depth_score: 0.15 — SHALLOW (pure constants, no logic)
- seam_capacity: INTERNAL
- leverage: LOW
- SIG_ID: SIG-core-constants-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/core/index.hash.md`
- Used by: All subsystems (tokens, providers, editor, fmcf, tui)

### [Architecture]
- Single source of truth for all magic numbers
- No business logic, only data declarations
- Divided into logical groups: Budgets, Networking, Providers, FMCF, Routing, TUI, HTTP, Editor, Pipeline
