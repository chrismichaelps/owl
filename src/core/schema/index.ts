/** @Owl.Core.Schema - Schema-first type definitions for the Owl system */
import { Schema } from "effect"

export const ModeSchema = Schema.Literal(
  "standard",
  "deep",
  "quick",
  "economy",
  "god",
)
export type Mode = Schema.Schema.Type<typeof ModeSchema>

export const MessageRoleSchema = Schema.Literal("user", "assistant", "system")
export type MessageRole = Schema.Schema.Type<typeof MessageRoleSchema>

export const MessageSchema = Schema.Struct({
  role: MessageRoleSchema,
  content: Schema.String,
  timestamp: Schema.String,
})
export type Message = Schema.Schema.Type<typeof MessageSchema>

export const TaskSchema = Schema.Struct({
  id: Schema.String,
  prompt: Schema.String,
  mode: ModeSchema,
  createdAt: Schema.String,
  files: Schema.optional(Schema.Array(Schema.String)),
})
export type Task = Schema.Schema.Type<typeof TaskSchema>

export const ProviderIdSchema = Schema.Literal(
  "anthropic",
  "openai",
  "google",
  "xai",
  "ollama",
)
export type ProviderId = Schema.Schema.Type<typeof ProviderIdSchema>

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

export const TokenUsageSchema = Schema.Struct({
  inputTokens: Schema.Number,
  outputTokens: Schema.Number,
  cacheReadTokens: Schema.Number,
  cacheWriteTokens: Schema.Number,
})
export type TokenUsage = Schema.Schema.Type<typeof TokenUsageSchema>

export const InferenceRequestSchema = Schema.Struct({
  taskId: Schema.String,
  messages: Schema.Array(MessageSchema),
  model: Schema.String,
  maxTokens: Schema.Number,
  temperature: Schema.optional(Schema.Number),
  systemPrompt: Schema.optional(Schema.String),
  stream: Schema.Boolean,
})
export type InferenceRequest = Schema.Schema.Type<typeof InferenceRequestSchema>

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
})
export type InferenceResponse = Schema.Schema.Type<
  typeof InferenceResponseSchema
>

export const MutationTargetSchema = Schema.Struct({
  file: Schema.String,
  startLine: Schema.Number,
  endLine: Schema.Number,
  content: Schema.String,
})
export type MutationTarget = Schema.Schema.Type<typeof MutationTargetSchema>

export const MutationSchema = Schema.Struct({
  id: Schema.String,
  taskId: Schema.String,
  targets: Schema.Array(MutationTargetSchema),
  createdAt: Schema.String,
  approved: Schema.Boolean,
})
export type Mutation = Schema.Schema.Type<typeof MutationSchema>

export const SeamCapacitySchema = Schema.Literal(
  "BACKBONE",
  "CRITICAL",
  "EXPLORATORY",
  "INTERNAL",
)
export type SeamCapacity = Schema.Schema.Type<typeof SeamCapacitySchema>

export const DepthStatusSchema = Schema.Literal("DEEP", "MEDIUM", "SHALLOW")
export type DepthStatus = Schema.Schema.Type<typeof DepthStatusSchema>
