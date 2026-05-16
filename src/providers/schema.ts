/**
 * @Owl.Providers.Schema - Provider capability and streaming schemas
 */
import { Schema } from "effect"

/**
 * @Owl.Providers.Schema.Capability - Model and pricing metadata schema
 */
export const ProviderCapabilitySchema = Schema.Struct({
  providerId: Schema.String,
  modelId: Schema.String,
  contextWindow: Schema.Number,
  maxOutputTokens: Schema.Number,
  inputCostPer1k: Schema.Number,
  outputCostPer1k: Schema.Number,
  supportsStreaming: Schema.Boolean,
  reasoningDepth: Schema.Literal("low", "medium", "high"),
  supportsFunctionCalling: Schema.Boolean,
  supportsVision: Schema.Boolean,
})
export type ProviderCapability = Schema.Schema.Type<
  typeof ProviderCapabilitySchema
>

/**
 * @Owl.Providers.Schema.Routing - Selection context and constraints
 */
export const RoutingContextSchema = Schema.Struct({
  taskId: Schema.String,
  mode: Schema.String,
  estimatedInputTokens: Schema.Number,
  requiresReasoning: Schema.Boolean,
  requiresVision: Schema.Boolean,
  latencyBudgetMs: Schema.Number,
  costBudgetUsd: Schema.optional(Schema.Number),
  preferredProvider: Schema.optional(Schema.String),
})
export type RoutingContext = Schema.Schema.Type<typeof RoutingContextSchema>

/**
 * @Owl.Providers.Schema.Streaming - Chunk-based response contracts
 */
export const StreamChunkSchema = Schema.Struct({
  type: Schema.Literal("text", "thinking", "tool_use", "stop", "usage"),
  content: Schema.optional(Schema.String),
  index: Schema.Number,
  usage: Schema.optional(
    Schema.Struct({
      inputTokens: Schema.Number,
      outputTokens: Schema.Number,
      cacheReadTokens: Schema.Number,
      cacheWriteTokens: Schema.Number,
      estimatedCostUsd: Schema.Number,
    }),
  ),
})
export type StreamChunk = Schema.Schema.Type<typeof StreamChunkSchema>

export const RoutingDecisionSchema = Schema.Struct({
  selectedProvider: Schema.String,
  selectedModel: Schema.String,
  score: Schema.Number,
  fallbackProviders: Schema.Array(Schema.String),
  reasoning: Schema.String,
  estimatedCostUsd: Schema.Number,
})
export type RoutingDecision = Schema.Schema.Type<typeof RoutingDecisionSchema>
