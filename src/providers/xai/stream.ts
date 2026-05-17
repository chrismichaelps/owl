/** @Owl.Providers.xAI.Stream - xAI streaming response adapter */
import { Data } from "effect"
import * as Stream from "effect/Stream"
import { STREAM_CHUNK_TYPES } from "../../core/constants/index.js"
import { ProviderStreamError } from "../../core/errors/index.js"
import { estimateModelCostUsd } from "../cost.js"
import { buildMessages, XAI_CAPABILITIES } from "./runtime.js"
import { decodeOpenAICompatibleStreamChunk } from "../openaiCompatible/schema.js"
import type OpenAI from "openai"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { StreamChunk } from "../types.js"

/** @Owl.Providers.xAI.StreamFactory - Create xAI stream function */
export const makeXAIStream =
  (client: OpenAI) =>
  (
    request: InferenceRequest,
  ): Stream.Stream<StreamChunk, ProviderStreamError> =>
    Stream.async<StreamChunk, ProviderStreamError>((emit) => {
      const run = async () => {
        try {
          const chunks = await client.chat.completions.create({
            model: request.model,
            max_tokens: request.maxTokens,
            messages: buildMessages(request),
            stream: true,
            stream_options: { include_usage: true },
          })
          let index = 0
          for await (const chunk of chunks) {
            const decoded = decodeOpenAICompatibleStreamChunk(chunk)
            const content = decoded.choices[0]?.delta.content
            if (content) {
              await emit.single({
                type: STREAM_CHUNK_TYPES.TEXT,
                content,
                index: index++,
              })
            }
            if (decoded.usage != null) {
              const inputTokens = decoded.usage.prompt_tokens
              const outputTokens = decoded.usage.completion_tokens
              await emit.single({
                type: STREAM_CHUNK_TYPES.USAGE,
                index,
                usage: Data.struct({
                  inputTokens,
                  outputTokens,
                  cacheReadTokens: 0,
                  cacheWriteTokens: 0,
                  estimatedCostUsd: estimateModelCostUsd(
                    XAI_CAPABILITIES,
                    request.model,
                    inputTokens,
                    outputTokens,
                  ),
                }),
              })
            }
          }
          await emit.end()
        } catch (cause) {
          await emit.fail(new ProviderStreamError({ provider: "xai", cause }))
        }
      }

      void run()
    })
