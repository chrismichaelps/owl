/** @Owl.Providers.OpenAICompatible.Schema - Runtime response contracts */
import { Schema } from "effect"

const UsageSchema = Schema.Struct({
  prompt_tokens: Schema.Number,
  completion_tokens: Schema.Number,
})

/** @Owl.Providers.OpenAICompatible.ChatCompletion - Non-stream response */
export const OpenAICompatibleChatCompletionSchema = Schema.Struct({
  choices: Schema.Array(
    Schema.Struct({
      message: Schema.Struct({
        content: Schema.NullOr(Schema.String),
      }),
    }),
  ),
  usage: Schema.optional(UsageSchema),
  model: Schema.String,
})

export type OpenAICompatibleChatCompletion = Schema.Schema.Type<
  typeof OpenAICompatibleChatCompletionSchema
>

/** @Owl.Providers.OpenAICompatible.StreamChunk - Streaming response chunk */
export const OpenAICompatibleStreamChunkSchema = Schema.Struct({
  choices: Schema.Array(
    Schema.Struct({
      delta: Schema.Struct({
        content: Schema.optional(Schema.String),
      }),
    }),
  ),
  usage: Schema.optional(Schema.NullOr(UsageSchema)),
})

export type OpenAICompatibleStreamChunk = Schema.Schema.Type<
  typeof OpenAICompatibleStreamChunkSchema
>

export const decodeOpenAICompatibleChatCompletion = Schema.decodeUnknownSync(
  OpenAICompatibleChatCompletionSchema,
)

export const decodeOpenAICompatibleStreamChunk = Schema.decodeUnknownSync(
  OpenAICompatibleStreamChunkSchema,
)
