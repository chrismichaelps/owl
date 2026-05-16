import { HashSet } from "effect"

/** @Owl.Core.Constants.Networking - Timeout and retry policies */
export const PROVIDER_TIMEOUTS = {
  DEFAULT_MS: 30_000,
  STREAM_CHUNK_TIMEOUT_MS: 5_000,
  CONNECT_TIMEOUT_MS: 10_000,
  OLLAMA_DEFAULT_MS: 60_000,
} as const

/**
 * @Owl.Core.Constants.Retry - Exponential backoff retry configuration
 *
 * MAX_ATTEMPTS: Total retry attempts before giving up
 * BASE_DELAY_MS: Initial delay between retries
 * MAX_DELAY_MS: Maximum delay cap
 * BACKOFF_FACTOR: Multiplier for each subsequent retry
 * JITTER_FACTOR: Random factor to prevent thundering herd
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 1_000,
  MAX_DELAY_MS: 30_000,
  BACKOFF_FACTOR: 2,
  JITTER_FACTOR: 0.1,
} as const

/** @Owl.Core.Constants.Providers - Supported Provider identifiers */
export const PROVIDER_IDS = [
  "anthropic",
  "openai",
  "google",
  "xai",
  "ollama",
] as const

/** @Owl.Core.Constants.ProviderSet - Provider identifier membership lookup */
export const PROVIDER_ID_SET: HashSet.HashSet<string> =
  HashSet.fromIterable(PROVIDER_IDS)

/** @Owl.Core.Constants.LocalProviders - Provider identifiers allowed in privacy mode */
export const LOCAL_PROVIDER_IDS = ["ollama"] as const

/** @Owl.Core.Constants.LocalProviderSet - Local provider membership lookup */
export const LOCAL_PROVIDER_ID_SET: HashSet.HashSet<string> =
  HashSet.fromIterable(LOCAL_PROVIDER_IDS)

/** @Owl.Core.Constants.Config - Environment configuration defaults */
export const CONFIG_CONSTANTS = {
  DEFAULT_OLLAMA_BASE_URL: "http://localhost:11434",
  DEFAULT_MODE: "standard",
  DEFAULT_LOG_LEVEL: "info",
  DEFAULT_MAX_CONCURRENT_PROVIDERS: 3,
  DEFAULT_TELEMETRY_ENABLED: false,
  MISSING_PROVIDER_API_KEY: "missing-provider-api-key",
} as const

/**
 * @Owl.Core.Constants.AnthropicModels - Canonical Anthropic model IDs
 *
 * Single source of truth for all model identifier strings.
 * Never compare against raw string literals — always reference these keys.
 */
export const ANTHROPIC_MODELS = {
  OPUS_4_7: "claude-opus-4-7",
  SONNET_4_6: "claude-sonnet-4-6",
  HAIKU_4_5: "claude-haiku-4-5-20251001",
} as const
export type AnthropicModelId =
  (typeof ANTHROPIC_MODELS)[keyof typeof ANTHROPIC_MODELS]

/** @Owl.Core.Constants.OpenAIModels - Canonical OpenAI model IDs */
export const OPENAI_MODELS = {
  GPT_4O: "gpt-4o",
  GPT_4_1: "gpt-4.1",
  O3: "o3",
  O4_MINI: "o4-mini",
  GPT_5: "gpt-5",
} as const

/** @Owl.Core.Constants.GoogleModels - Canonical Google model IDs */
export const GOOGLE_MODELS = {
  GEMINI_2_5_FLASH: "gemini-2.5-flash",
  GEMINI_2_5_PRO: "gemini-2.5-pro",
} as const

/** @Owl.Core.Constants.XAIModels - Canonical xAI model IDs */
export const XAI_MODELS = {
  GROK_3: "grok-3",
} as const

/** @Owl.Core.Constants.OllamaModels - Canonical local model IDs */
export const OLLAMA_MODELS = {
  LLAMA_3_2: "llama3.2",
  CODE_LLAMA: "codellama",
} as const

/**
 * @Owl.Core.Constants.ThinkingModes - Modes that activate extended thinking
 *
 * Used for O(1) membership checks without scattered string comparisons.
 * Effect HashSet gives structural equality for future non-string keys.
 */
export const THINKING_MODES: HashSet.HashSet<string> = HashSet.fromIterable([
  "deep",
  "god",
])

/** @Owl.Core.Constants.ProviderRuntime - Provider adapter runtime limits */
export const PROVIDER_CONSTANTS = {
  TOKEN_ESTIMATION_CHARS_PER_TOKEN: 4,
  ANTHROPIC_MAX_TOOL_ITERATIONS: 10,
  OLLAMA_GENERATE_PATH: "/api/generate",
  OLLAMA_TAGS_PATH: "/api/tags",
  OLLAMA_STREAM_DELIMITER: "\n",
  OLLAMA_EMPTY_STREAM_BODY_MESSAGE: "Ollama stream response body is empty",
  XAI_BASE_URL: "https://api.x.ai/v1",
} as const

/** @Owl.Core.Constants.ProviderStreamLog - Stream event log formatting */
export const PROVIDER_STREAM_LOG = {
  PREVIEW_CHARS: 80,
  THINKING_PREFIX: "◌ Thinking",
  TOOL_PREFIX: "⚙ Tool",
} as const

/** @Owl.Core.Constants.StreamChunkTypes - Strict chunk type constants */
export const STREAM_CHUNK_TYPES = {
  TEXT: "text",
  THINKING: "thinking",
  TOOL_USE: "tool_use",
  STOP: "stop",
  USAGE: "usage",
} as const

/** @Owl.Core.Constants.ProviderAuto - Magic string replacement for auto routing */
export const PROVIDER_AUTO = "auto"
