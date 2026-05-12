/** @Owl.Core.Config - Centralized Effect Config for all environment variables */
import { Config, Context, Layer, Effect } from "effect"
import type { Mode } from "../schema/index.js"

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

export class OWL_CONFIG extends Context.Tag("OWL_CONFIG")<
  OWL_CONFIG,
  OwlConfig
>() { }

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

export const OWLConfigLive = Layer.effect(OWL_CONFIG, owlConfigEffect)
