State_ID: BigInt(0x00000000000000b0)
Git_SHA: 9e5c31596b36f990f88d402b533fcfc1104cbe87
Source_SHA256: ec465f33e00393e78899df024a0d8ac0275ef64c7786cdcc4f4d977cccc6582b
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
Drift_Fixed: 2026-05-16T16:04:00Z
---

## @Owl.Core.Constants (src/core/constants/index.ts)

### [Signatures]
**Budget & Limits**
- `TOKEN_LIMITS` — CONTEXT_WINDOW_DEFAULT=200k, MAX_OUTPUT_TOKENS=8192, MARKOV_WINDOW_SIZE=2
- `MODE_TOKEN_BUDGETS` — per-mode token caps: economy=2k, quick=8k, standard=32k, deep=100k, god=200k
- `MODE_THINKING_BUDGETS` — per-mode thinking budget (undefined=disabled, god=10k)
- `SHARD_SPLIT_THRESHOLD = 0.15`
- `SEAM_COLLAPSE_MONTHS = 6`
- `DEPTH_THRESHOLDS` — DEEP=0.7, SHALLOW=0.4
- `SEAM_CAPACITY_SCORES` — BACKBONE=9, CRITICAL=6, EXPLORATORY=3, INTERNAL=0

**Networking**
- `PROVIDER_TIMEOUTS` — DEFAULT_MS=30s, STREAM_CHUNK_TIMEOUT_MS=5s, OLLAMA_DEFAULT_MS=60s
- `RETRY_CONFIG` — MAX_ATTEMPTS=3, BASE_DELAY_MS=1s, MAX_DELAY_MS=30s, BACKOFF_FACTOR=2
- `HTTP_STATUS` — OK=200, UNAUTHORIZED=401, TOO_MANY_REQUESTS=429, INTERNAL_SERVER_ERROR=500

**Providers**
- `PROVIDER_IDS` — supported Provider id strings for RoutingPreference parsing
- `PROVIDER_ID_SET: HashSet<string>` — fast O(1) lookup version of PROVIDER_IDS
- `CONFIG_CONSTANTS` — API key env vars, default config file paths
- `ANTHROPIC_MODELS` — canonical Anthropic model id strings
- `OPENAI_MODELS` — canonical OpenAI model id strings
- `GOOGLE_MODELS` — canonical Google model id strings
- `XAI_MODELS` — canonical xAI model id strings
- `OLLAMA_MODELS` — canonical Ollama model id strings
- `THINKING_MODES: HashSet<string>` — modes that enable extended thinking
- `PROVIDER_CONSTANTS` — min/max reasoning effort, default model fallbacks
- `PROVIDER_STREAM_LOG` — stream event label strings

**Routing**
- `ROUTING_WEIGHTS` — COMPLEXITY=0.35, COST=0.25, LATENCY=0.25, RELIABILITY=0.15
- `ROUTING_LIMITS` — max normalized cost, fast model output threshold, fallback Provider count
- `ROUTING_REASONING_SCORES: HashMap<string, number>` — per-reasoning-depth scores
- `ROUTING_MODE_REASONING_DEMAND: HashMap<string, number>` — per-mode reasoning demand
- `ROUTING_SCORE_DEFAULTS` — baseline cost/latency/reliability scores

**Memory & Metrics**
- `CACHE_CONSTANTS` — ContextCache retention, trust-score bounds, persistence schema version
- `SESSION_MEMORY_CONSTANTS` — MAX_TURNS, PERSISTENCE_SCHEMA_VERSION, storage path
- `METRICS_CONSTANTS` — bounded UsageMetrics retention and cache hit-rate display constants
- `COST_CONSTANTS` — TOKEN_UNIT=1000, DECIMAL_BASE=10, ESTIMATE_PRECISION_DECIMALS, LOW_COST_THRESHOLD_USD

**MCP**
- `MCP_CONSTANTS` — CONFIG_DIR='.owl', CONFIG_FILE='mcp_servers.json'

**TUI**
- `TUI_CONSTANTS` — log line cap, history max, palette visible count (via COMMAND_CONSTANTS)
- `TUI_ANIMATION` — FRAME_INTERVAL_MS, FMCF_ROLE_FLOW array (4 roles)
- `TUI_WELCOME` — MIN_WIDTH for WelcomePanel
- `TUI_SHORTCUTS` — array of [key, description] keyboard shortcut pairs
- `TUI_SHORTCUTS_LAYOUT` — KEY_COLUMN_WIDTH, PANEL_WIDTH for ShortcutsOverlay
- `TUI_PANEL_WIDTHS` — MetaPanel, LogPanel, OutputPanel fixed widths

**CLI & Commands**
- `CLI_CONSTANTS` — VERSION string, app name
- `COMMAND_CONSTANTS` — MIN_PROMPT_LENGTH, MAX_PROMPT_LENGTH, ID_PREFIX, ID_HASH_LENGTH, PALETTE_VISIBLE_COUNT
- `COMPACT_CONSTANTS` — COMMAND_NAME, MIN_MESSAGES, SYSTEM_PROMPT, TASK_PROMPT, MODE, CONTEXT_PREFIX
- `MENTION_CONSTANTS` — MAX_FILE_BYTES=500KB, MAX_IMAGE_BYTES=5MB, MAX_TOTAL_TEXT_BYTES=2MB, display labels

**Editor & Pipeline**
- `EDITOR_CONSTANTS` — DIFF_CONTEXT_LINES=3, DIFF_TIMEOUT_MS=5s, MAX_FILE_SIZE_BYTES, AMPERSAND/DOLLAR tokens
- `PIPELINE_STAGES` — analysis, planning, diff, impact, approval, tli, verification
- `PROJECT_CONTEXT_CONSTANTS` — CLAUDE_MD filename, git log line count, git status max chars
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
- Single source of truth for all magic numbers across every subsystem
- No business logic, only data declarations
- Divided into groups: Budgets · Networking · Providers · Routing · Memory/Metrics · MCP · TUI · CLI/Commands · Editor/Pipeline
- Consumers must import named constants — hardcoding magic numbers is a prohibited pattern
- PROVIDER_ID_SET and THINKING_MODES use HashSet for O(1) lookup at runtime
- ROUTING_REASONING_SCORES and ROUTING_MODE_REASONING_DEMAND use HashMap for O(1) scoring
