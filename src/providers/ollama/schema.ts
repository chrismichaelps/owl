/**
 * @Owl.Providers.Ollama.Schema - Internal API schemas
 */
import { Schema } from "effect"

export const OllamaGenerateResponseSchema = Schema.Struct({
  response: Schema.String,
})

export const OllamaStreamResponseSchema = Schema.Struct({
  response: Schema.optional(Schema.String),
  done: Schema.Boolean,
})
export type OllamaStreamResponse = Schema.Schema.Type<
  typeof OllamaStreamResponseSchema
>
