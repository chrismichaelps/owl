/**
 * @Owl.Core.Schema - Schema-first type definitions for the Owl system
 *
 * Uses Effect Schema for:
 * - Type inference from schemas
 * - Runtime validation
 * - Documentation of valid values
 *
 * All schemas are exported for use in validation pipelines.
 */
import { Schema } from "effect"

/**
 * @Owl.Core.Schema.Primitives - Base literals and enums
 *
 * Mode: Operating mode (affects token budget and provider selection)
 * MessageRole: Participant in conversation
 */

/** Operating mode affecting token budget and provider routing */
export const ModeSchema = Schema.Literal(
  "standard",
  "deep",
  "quick",
  "economy",
  "god",
)
export type Mode = Schema.Schema.Type<typeof ModeSchema>

/** Conversation participant role */
export const MessageRoleSchema = Schema.Literal("user", "assistant", "system")
export type MessageRole = Schema.Schema.Type<typeof MessageRoleSchema>

/**
 * @Owl.Core.Schema.Chat - Messaging and task contracts
 */

/** A single message in the conversation */
export const MessageSchema = Schema.Struct({
  role: MessageRoleSchema,
  content: Schema.String,
  timestamp: Schema.String,
})
export type Message = Schema.Schema.Type<typeof MessageSchema>

/** A task submitted for inference */
export const TaskSchema = Schema.Struct({
  id: Schema.String,
  prompt: Schema.String,
  mode: ModeSchema,
  createdAt: Schema.String,
  files: Schema.optional(Schema.Array(Schema.String)),
  adaptiveRouting: Schema.optional(Schema.Boolean),
})
export type Task = Schema.Schema.Type<typeof TaskSchema>

/**
 * @Owl.Core.Schema.Provider - Capability and usage models
 */

/** Supported provider identifiers */
export const ProviderIdSchema = Schema.Literal(
  "anthropic",
  "openai",
  "google",
  "xai",
  "ollama",
)
export type ProviderId = Schema.Schema.Type<typeof ProviderIdSchema>

/** A provider's model specification */
export const ProviderModelSchema = Schema.Struct({
  id: Schema.String,
  provider: ProviderIdSchema,
  contextWindow: Schema.Number,
  maxOutputTokens: Schema.Number,
  inputCostPer1k: Schema.Number,
  outputCostPer1k: Schema.Number,
  supportsStreaming: Schema.Boolean,
  reasoningDepth: Schema.Literal("low", "medium", "high"),
})
export type ProviderModel = Schema.Schema.Type<typeof ProviderModelSchema>

/** Token usage breakdown */
export const TokenUsageSchema = Schema.Struct({
  inputTokens: Schema.Number,
  outputTokens: Schema.Number,
  cacheReadTokens: Schema.Number,
  cacheWriteTokens: Schema.Number,
  estimatedCostUsd: Schema.Number,
})
export type TokenUsage = Schema.Schema.Type<typeof TokenUsageSchema>

/**
 * @Owl.Core.Schema.Inference - Request/Response lifecycle types
 */

/** Inference request sent to provider */
export const InferenceRequestSchema = Schema.Struct({
  taskId: Schema.String,
  messages: Schema.Array(MessageSchema),
  model: Schema.String,
  maxTokens: Schema.Number,
  temperature: Schema.optional(Schema.Number),
  systemPrompt: Schema.optional(Schema.String),
  stream: Schema.Boolean,
  /** Extended thinking budget in tokens (Anthropic-only, deep/god modes) */
  thinkingBudget: Schema.optional(Schema.Number),
})
export type InferenceRequest = Schema.Schema.Type<typeof InferenceRequestSchema>

/** Inference response from provider */
export const InferenceResponseSchema = Schema.Struct({
  taskId: Schema.String,
  content: Schema.String,
  stopReason: Schema.Literal(
    "end_turn",
    "max_tokens",
    "stop_sequence",
    "tool_use",
  ),
  usage: TokenUsageSchema,
  model: Schema.String,
  provider: ProviderIdSchema,
  latencyMs: Schema.Number,
  /** Submitted user mode before adaptive routing decisions */
  requestedMode: Schema.optional(ModeSchema),
  /** Effective mode used for provider routing */
  routingMode: Schema.optional(ModeSchema),
})
export type InferenceResponse = Schema.Schema.Type<
  typeof InferenceResponseSchema
>

/** Target for a single file mutation */
export const MutationTargetSchema = Schema.Struct({
  file: Schema.String,
  startLine: Schema.Number,
  endLine: Schema.Number,
  content: Schema.String,
})
export type MutationTarget = Schema.Schema.Type<typeof MutationTargetSchema>

/** A complete mutation with multiple targets */
export const MutationSchema = Schema.Struct({
  id: Schema.String,
  taskId: Schema.String,
  targets: Schema.Array(MutationTargetSchema),
  createdAt: Schema.String,
  approved: Schema.Boolean,
})
export type Mutation = Schema.Schema.Type<typeof MutationSchema>

/**
 * @Owl.Core.Schema.Governance - FMCF registry and seam metadata
 */

/** Seam capacity classification guiding deepening investment */
export const SeamCapacitySchema = Schema.Literal(
  "BACKBONE",
  "CRITICAL",
  "EXPLORATORY",
  "INTERNAL",
)
export type SeamCapacity = Schema.Schema.Type<typeof SeamCapacitySchema>

/** DEPTH_SCORE classification */
export const DepthStatusSchema = Schema.Literal("DEEP", "MEDIUM", "SHALLOW")
export type DepthStatus = Schema.Schema.Type<typeof DepthStatusSchema>
