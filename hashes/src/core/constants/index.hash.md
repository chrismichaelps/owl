State_ID: BigInt(0x0000000000000076)
Git_SHA: 9e5c31596b36f990f88d402b533fcfc1104cbe87
Source_SHA256: ec465f33e00393e78899df024a0d8ac0275ef64c7786cdcc4f4d977cccc6582b
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
- `CACHE_CONSTANTS` — ContextCache retention, trust-score bounds, and persistence schema version
- `METRICS_CONSTANTS` — bounded UsageMetrics retention and cache hit-rate display constants
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
- Single source of truth for all magic numbers, including ContextCache bounds and UsageMetrics display coefficients
- No business logic, only data declarations
- Divided into logical groups: Budgets, Networking, Providers, Metrics, FMCF, Routing, TUI, HTTP, Editor, Pipeline
