import { Chunk, HashSet } from "effect"

/** @Owl.Core.Constants.MCP - MCP configuration paths and naming */
export const MCP_CONSTANTS = {
  CONFIG_DIR: ".owl",
  CONFIG_FILE: "mcp_servers.json",
  TOOL_SEPARATOR: "__",
} as const

/** @Owl.Core.Constants.Cache - ContextCache retention and validation bounds */
export const CACHE_CONSTANTS = {
  MAX_ENTRIES: 100,
  MIN_TRUST_SCORE: 0,
  MAX_TRUST_SCORE: 1,
  PERSISTENCE_SCHEMA_VERSION: 1,
  STORAGE_DIR: ".owl",
  STORAGE_FILE: "context-cache.json",
} as const

/** @Owl.Core.Constants.SessionMemory - Session persistence and retention bounds */
export const SESSION_MEMORY_CONSTANTS = {
  MAX_TURNS: 100,
  PERSISTENCE_SCHEMA_VERSION: 1,
  STORAGE_DIR: ".owl",
  STORAGE_FILE: "session-memory.json",
  SESSION_ID_PREFIX: "sess",
  SESSION_ID_COUNTER_PAD: 6,
} as const

/** @Owl.Core.Constants.Metrics - Runtime UsageMetrics constraints */
export const METRICS_CONSTANTS = {
  RECENT_INFERENCE_LIMIT: 10,
  STATUS_MODEL_LIMIT: 5,
  STATUS_RECENT_LIMIT: 3,
  CACHE_HIT_RATE_PERCENT_MULTIPLIER: 100,
  CACHE_HIT_RATE_DECIMAL_PLACES: 1,
} as const

/** @Owl.Core.Constants.Cost - Cost estimation and display constraints */
export const COST_CONSTANTS = {
  TOKEN_UNIT: 1_000,
  DECIMAL_BASE: 10,
  ESTIMATE_PRECISION_DECIMALS: 6,
  LOW_COST_THRESHOLD_USD: 0.5,
  LOW_COST_DECIMAL_PLACES: 4,
  STANDARD_COST_DECIMAL_PLACES: 2,
} as const

/** @Owl.Core.Constants.Orchestrator - Engine response composition constants */
export const ORCHESTRATOR_CONSTANTS = {
  PARALLEL_RESPONSE_SEPARATOR: "\n\n---\n\n",
} as const

/** @Owl.Core.Constants.Format - Shared display formatting units */
export const FORMAT_CONSTANTS = {
  BYTE_UNIT: 1_024,
  BYTE_DECIMAL_PLACES: 1,
  BYTE_SUFFIX: "b",
  KILOBYTE_SUFFIX: "kb",
  MEGABYTE_SUFFIX: "mb",
} as const

/** @Owl.Core.Constants.FileExtensions - Common file extensions */
export const FILE_EXTENSIONS = {
  MD: ".md",
  JSON: ".json",
} as const

/** @Owl.Core.Constants.Modes - Operational modes */
export const MODES = {
  STANDARD: "standard",
  QUICK: "quick",
  DEEP: "deep",
  ECONOMY: "economy",
  GOD: "god",
} as const

/** @Owl.Core.Constants.ModeIds - Ordered operational mode identifiers */
export const MODE_IDS: Chunk.Chunk<string> = Chunk.make(
  MODES.STANDARD,
  MODES.QUICK,
  MODES.DEEP,
  MODES.ECONOMY,
  MODES.GOD,
)

/** @Owl.Core.Constants.ModeIdSet - Operational mode membership lookup */
export const MODE_ID_SET: HashSet.HashSet<string> =
  HashSet.fromIterable(MODE_IDS)

/** @Owl.Core.Constants.Roles - Deepening Flow role IDs */
export const ROLES = {
  ARCHITECT: "architect",
  DNA_ENGINEER: "dna-engineer",
  SHADOW: "shadow",
  GUARDIAN: "guardian",
} as const

/** @Owl.Core.Constants.Effect - Internal Effect-TS tags */
export const EFFECT_TAGS = {
  SOME: "Some",
  NONE: "None",
  RIGHT: "Right",
  LEFT: "Left",
  INTERRUPTED: "Interrupted",
  FAILURE: "Failure",
  SUCCESS: "Success",
} as const

/** @Owl.Core.Constants.JS - Native JavaScript types */
export const JS_TYPES = {
  OBJECT: "object",
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  FUNCTION: "function",
  UNDEFINED: "undefined",
} as const

/** @Owl.Core.Constants.Registry - HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  ANTHROPIC_OVERLOADED: 529,
} as const
