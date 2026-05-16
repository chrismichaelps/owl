/** @Owl.Providers.Anthropic.Stream - Claude streaming and tool loop */
import type Anthropic from "@anthropic-ai/sdk"
import { Chunk, Effect } from "effect"
import * as Stream from "effect/Stream"
import {
  STREAM_CHUNK_TYPES,
  PROVIDER_CONSTANTS,
} from "../../core/constants/index.js"
import { ProviderStreamError } from "../../core/errors/index.js"
import { estimateModelCostUsd } from "../cost.js"
import {
  ANTHROPIC_CAPABILITIES,
  ANTHROPIC_INTERNAL_CONSTANTS,
  resolveThinking,
} from "./model.js"
import {
  executeAnthropicTool,
  loadAnthropicTools,
  toAnthropicMessages,
} from "./tools.js"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { McpManagerService } from "../../mcp/index.js"
import type { BuiltInToolsService } from "../../tools/index.js"
import type { StreamChunk } from "../types.js"
import type { AnthropicStreamParamsWithThinking } from "./model.js"

interface AnthropicStreamDependencies {
  readonly client: Anthropic
  readonly builtInTools: BuiltInToolsService | null
  readonly mcpManager: McpManagerService | null
}

interface AnthropicStreamUsage {
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens: number
  readonly cacheWriteTokens: number
}

const emptyUsage = (): AnthropicStreamUsage => ({
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
})

const addUsage = (
  current: AnthropicStreamUsage,
  usage: Anthropic.Usage,
): AnthropicStreamUsage => ({
  inputTokens: current.inputTokens + usage.input_tokens,
  outputTokens: current.outputTokens + usage.output_tokens,
  cacheReadTokens:
    current.cacheReadTokens + (usage.cache_read_input_tokens ?? 0),
  cacheWriteTokens:
    current.cacheWriteTokens + (usage.cache_creation_input_tokens ?? 0),
})

const makeSystemBlock = (systemPrompt: string | undefined) =>
  systemPrompt === undefined
    ? undefined
    : Chunk.toArray(
        Chunk.make({
          type: ANTHROPIC_INTERNAL_CONSTANTS.BLOCK_TYPE_TEXT,
          text: systemPrompt,
          cache_control: { type: "ephemeral" as const },
        }),
      )

/** @Owl.Providers.Anthropic.StreamFactory - Create streaming provider function */
export const makeAnthropicStream =
  ({ client, builtInTools, mcpManager }: AnthropicStreamDependencies) =>
  (
    request: InferenceRequest,
  ): Stream.Stream<StreamChunk, ProviderStreamError> =>
    Stream.async<StreamChunk, ProviderStreamError>((emit) => {
      const run = async () => {
        try {
          let messages = toAnthropicMessages(request.messages)
          const tools = await Effect.runPromise(
            loadAnthropicTools(builtInTools, mcpManager),
          )
          const systemBlock = makeSystemBlock(request.systemPrompt)
          const streamThinking = resolveThinking(request)

          let index = 0
          let iterations = 0
          let usageTotals = emptyUsage()
          let lastModel = request.model

          while (
            iterations < PROVIDER_CONSTANTS.ANTHROPIC_MAX_TOOL_ITERATIONS
          ) {
            const streamParams: AnthropicStreamParamsWithThinking = {
              model: request.model,
              max_tokens: request.maxTokens,
              messages: Chunk.toArray(messages),
              ...(!Chunk.isEmpty(tools) ? { tools: Chunk.toArray(tools) } : {}),
              ...(systemBlock !== undefined ? { system: systemBlock } : {}),
            }
            if (streamThinking !== undefined) {
              streamParams.thinking = streamThinking
            }

            const stream = client.messages.stream(streamParams)
            for await (const event of stream) {
              if (
                event.type !==
                ANTHROPIC_INTERNAL_CONSTANTS.EVENT_TYPE_CONTENT_BLOCK_DELTA
              ) {
                continue
              }

              if (
                event.delta.type ===
                ANTHROPIC_INTERNAL_CONSTANTS.DELTA_TYPE_TEXT_DELTA
              ) {
                await emit.single({
                  type: STREAM_CHUNK_TYPES.TEXT,
                  content: event.delta.text,
                  index: index++,
                })
              } else if (
                event.delta.type ===
                  ANTHROPIC_INTERNAL_CONSTANTS.DELTA_TYPE_THINKING_DELTA &&
                "thinking" in event.delta
              ) {
                await emit.single({
                  type: STREAM_CHUNK_TYPES.THINKING,
                  content: (event.delta as { thinking: string }).thinking,
                  index: index++,
                })
              }
            }

            const finalMsg = await stream.finalMessage()
            lastModel = finalMsg.model
            usageTotals = addUsage(usageTotals, finalMsg.usage)

            if (
              finalMsg.stop_reason !==
                ANTHROPIC_INTERNAL_CONSTANTS.STOP_REASON_TOOL_USE ||
              (mcpManager === null && builtInTools === null)
            ) {
              break
            }

            messages = Chunk.append(messages, {
              role: "assistant" as const,
              content: finalMsg.content,
            })

            let toolResults = Chunk.empty<Anthropic.ToolResultBlockParam>()
            for (const block of finalMsg.content) {
              if (
                block.type === ANTHROPIC_INTERNAL_CONSTANTS.BLOCK_TYPE_TOOL_USE
              ) {
                await emit.single({
                  type: STREAM_CHUNK_TYPES.TOOL_USE,
                  content: block.name,
                  index: index++,
                })
                const input = block.input as Record<string, unknown>
                const result = await Effect.runPromise(
                  executeAnthropicTool(
                    block.name,
                    input,
                    builtInTools,
                    mcpManager,
                  ),
                )
                toolResults = Chunk.append(toolResults, {
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: result,
                })
              }
            }

            messages = Chunk.append(messages, {
              role: "user" as const,
              content: Chunk.toArray(toolResults),
            })
            iterations++
          }

          await emit.single({
            type: STREAM_CHUNK_TYPES.USAGE,
            index: 0,
            usage: {
              inputTokens: usageTotals.inputTokens,
              outputTokens: usageTotals.outputTokens,
              cacheReadTokens: usageTotals.cacheReadTokens,
              cacheWriteTokens: usageTotals.cacheWriteTokens,
              estimatedCostUsd: estimateModelCostUsd(
                ANTHROPIC_CAPABILITIES,
                lastModel,
                usageTotals.inputTokens,
                usageTotals.outputTokens,
              ),
            },
          })
          await emit.end()
        } catch (e) {
          await emit.fail(
            new ProviderStreamError({ provider: "anthropic", cause: e }),
          )
        }
      }

      void run()
    })
