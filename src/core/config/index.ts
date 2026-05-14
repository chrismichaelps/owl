/**
 * @Owl.Core.Config - Centralized Effect Config for all environment variables
 *
 * Uses Effect's Config module for type-safe environment variable reading.
 * All API keys are optional (providers gracefully fail if not configured).
 *
 * Required environment variables:
 * - ANTHROPIC_API_KEY: Required for primary inference
 *
 * Optional environment variables:
 * - OPENAI_API_KEY: OpenAI GPT models
 * - GOOGLE_API_KEY: Google Gemini models
 * - XAI_API_KEY: xAI Grok models
 * - OLLAMA_BASE_URL: Local Ollama server (default: http://localhost:11434)
 * - OWL_MODE: Default mode (default: standard)
 * - OWL_LOG_LEVEL: Logging level (default: info)
 * - OWL_MAX_CONCURRENT_PROVIDERS: Max parallel providers (default: 3)
 * - OWL_TELEMETRY: Enable telemetry (default: false)
 *
 * @example
 * const config = yield* OWL_CONFIG
 * const client = new Anthropic({ apiKey: config.anthropicApiKey })
 */
import { Config, Context, Layer, Effect } from "effect"
import type { Mode } from "../schema/index.js"

/**
 * @Owl.Core.Config.Contract - Environment variable interface
 */
export interface OwlConfig {
  readonly anthropicApiKey: string
  readonly openaiApiKey: string | undefined
  readonly googleApiKey: string | undefined
  readonly xaiApiKey: string | undefined
  readonly ollamaBaseUrl: string
  readonly defaultMode: Mode
  readonly logLevel: string
  readonly maxConcurrentProviders: number
  readonly telemetryEnabled: boolean
}

/** @Owl.Core.Config.Adapter - Effect-TS service definition */
export class OWL_CONFIG extends Context.Tag("OWL_CONFIG")<
  OWL_CONFIG,
  OwlConfig
>() {}

/** @Owl.Core.Config.Implementation - Type-safe environment resolution */
const owlConfigEffect = Effect.gen(function* () {
  const anthropicApiKey = yield* Config.string("ANTHROPIC_API_KEY")
  const openaiApiKey = yield* Config.option(Config.string("OPENAI_API_KEY"))
  const googleApiKey = yield* Config.option(Config.string("GOOGLE_API_KEY"))
  const xaiApiKey = yield* Config.option(Config.string("XAI_API_KEY"))
  const ollamaBaseUrl = yield* Config.withDefault(
    Config.string("OLLAMA_BASE_URL"),
    "http://localhost:11434",
  )
  const defaultMode = yield* Config.withDefault(
    Config.string("OWL_MODE"),
    "standard",
  )
  const logLevel = yield* Config.withDefault(
    Config.string("OWL_LOG_LEVEL"),
    "info",
  )
  const maxConcurrentProviders = yield* Config.withDefault(
    Config.integer("OWL_MAX_CONCURRENT_PROVIDERS"),
    3,
  )
  const telemetryEnabled = yield* Config.withDefault(
    Config.boolean("OWL_TELEMETRY"),
    false,
  )

  return {
    anthropicApiKey,
    openaiApiKey: openaiApiKey._tag === "Some" ? openaiApiKey.value : undefined,
    googleApiKey: googleApiKey._tag === "Some" ? googleApiKey.value : undefined,
    xaiApiKey: xaiApiKey._tag === "Some" ? xaiApiKey.value : undefined,
    ollamaBaseUrl,
    defaultMode: defaultMode as Mode,
    logLevel,
    maxConcurrentProviders,
    telemetryEnabled,
  } satisfies OwlConfig
})

/**
 * @Owl.Core.Config.Live - Layer for OWL_CONFIG
 *
 * @example
 * Layer.provide(OWLConfigLive, [...]) // OWL_CONFIG available in scope
 */
export const OWLConfigLive = Layer.effect(OWL_CONFIG, owlConfigEffect)
