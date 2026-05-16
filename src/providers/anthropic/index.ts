/**
 * @Owl.Providers.Anthropic - Anthropic Claude adapter with MCP tool calling
 */
import Anthropic from "@anthropic-ai/sdk"
import { Chunk, Context, Effect, Layer, Option, Schedule } from "effect"
import { ProviderError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import {
  ANTHROPIC_MODELS,
  CONFIG_CONSTANTS,
  PROVIDER_CONSTANTS,
  RETRY_CONFIG,
} from "../../core/constants/index.js"
import { estimateModelCostUsd } from "../cost.js"
import { mapAnthropicError } from "./errors.js"
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
import { makeAnthropicStream } from "./stream.js"
import { McpManager } from "../../mcp/index.js"
import type { McpManagerService } from "../../mcp/index.js"
import { BuiltInTools } from "../../tools/index.js"
import type { BuiltInToolsService } from "../../tools/index.js"
import type { LLMProviderService } from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import type {
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderTimeoutError,
} from "../../core/errors/index.js"
import type { AnthropicNonStreamingParamsWithThinking } from "./model.js"

/** @Owl.Providers.Anthropic.Adapter - service definition */
export class AnthropicAdapter extends Context.Tag("AnthropicAdapter")<
  AnthropicAdapter,
  LLMProviderService
>() {}

/**
 * @Owl.Providers.Anthropic.Implementation - Production layer logic
 *
 * Uses Anthropic messages API with retry and streaming support.
 * Optionally integrates with McpManager for dynamic tool calling.
 */
export const AnthropicAdapterLive = Layer.effect(
  AnthropicAdapter,
  Effect.gen(function* () {
    const config = yield* OWL_CONFIG

    const client = new Anthropic({
      apiKey:
        config.anthropicApiKey ?? CONFIG_CONSTANTS.MISSING_PROVIDER_API_KEY,
    })

    // Optional MCP manager — present only when McpManager layer is provided
    const mcpManagerOpt = yield* Effect.serviceOption(McpManager)
    const mcpManager: McpManagerService | null = Option.isSome(mcpManagerOpt)
      ? mcpManagerOpt.value
      : null

    // Optional built-in tool registry — present when makeBuiltInToolsLive is provided
    const builtInToolsOpt = yield* Effect.serviceOption(BuiltInTools)
    const builtInTools: BuiltInToolsService | null = Option.isSome(
      builtInToolsOpt,
    )
      ? builtInToolsOpt.value
      : null

    const retrySchedule = Schedule.exponential("1 seconds", 2).pipe(
      Schedule.intersect(Schedule.recurs(RETRY_CONFIG.MAX_ATTEMPTS - 1)),
    )

    /** Single Anthropic API call with retry */
    const callApi = (
      messages: Anthropic.MessageParam[],
      request: InferenceRequest,
      tools: Anthropic.Tool[],
    ) =>
      Effect.tryPromise({
        try: () => {
          const params: AnthropicNonStreamingParamsWithThinking = {
            model: request.model,
            max_tokens: request.maxTokens,
            messages,
            ...(tools.length > 0 ? { tools } : {}),
            ...(request.systemPrompt
              ? {
                  system: [
                    {
                      type: ANTHROPIC_INTERNAL_CONSTANTS.BLOCK_TYPE_TEXT,
                      text: request.systemPrompt,
                      cache_control: { type: "ephemeral" as const },
                    },
                  ],
                }
              : {}),
          }
          const thinking = resolveThinking(request)
          if (thinking !== undefined) {
            params.thinking = thinking
          }
          return client.messages.create(params)
        },
        catch: mapAnthropicError,
      }).pipe(Effect.retry(retrySchedule))

    const complete = (
      request: InferenceRequest,
    ): Effect.Effect<
      InferenceResponse,
      | ProviderError
      | ProviderAuthError
      | ProviderRateLimitError
      | ProviderTimeoutError
    > =>
      Effect.gen(function* () {
        const startMs = Date.now()

        const tools = yield* loadAnthropicTools(builtInTools, mcpManager)
        let messages = toAnthropicMessages(request.messages)

        let response = yield* callApi(
          Chunk.toArray(messages),
          request,
          Chunk.toArray(tools),
        )
        let textContent = ""
        let iterations = 0

        // Tool-use loop: keep calling until end_turn or safety cap
        while (
          response.stop_reason ===
            ANTHROPIC_INTERNAL_CONSTANTS.STOP_REASON_TOOL_USE &&
          (mcpManager !== null || builtInTools !== null) &&
          iterations < PROVIDER_CONSTANTS.ANTHROPIC_MAX_TOOL_ITERATIONS
        ) {
          // Collect any text the model generated alongside the tool call
          for (const block of response.content) {
            if (block.type === ANTHROPIC_INTERNAL_CONSTANTS.BLOCK_TYPE_TEXT) {
              textContent += block.text
            }
          }

          // Append assistant's turn (with tool_use blocks) to history
          messages = Chunk.append(messages, {
            role: "assistant" as const,
            content: response.content,
          })

          // Execute each tool call and collect results
          let toolResults = Chunk.empty<Anthropic.ToolResultBlockParam>()
          for (const block of response.content) {
            if (
              block.type === ANTHROPIC_INTERNAL_CONSTANTS.BLOCK_TYPE_TOOL_USE
            ) {
              const input = block.input as Record<string, unknown>
              const result = yield* executeAnthropicTool(
                block.name,
                input,
                builtInTools,
                mcpManager,
              )
              toolResults = Chunk.append(toolResults, {
                type: "tool_result",
                tool_use_id: block.id,
                content: result,
              })
            }
          }

          // Append tool results as a user turn
          messages = Chunk.append(messages, {
            role: "user" as const,
            content: Chunk.toArray(toolResults),
          })
          response = yield* callApi(
            Chunk.toArray(messages),
            request,
            Chunk.toArray(tools),
          )
          iterations++
        }

        // Collect final text content
        for (const block of response.content) {
          if (block.type === ANTHROPIC_INTERNAL_CONSTANTS.BLOCK_TYPE_TEXT) {
            textContent += block.text
          }
        }

        return {
          taskId: request.taskId,
          content: textContent,
          stopReason: (response.stop_reason ??
            ANTHROPIC_INTERNAL_CONSTANTS.STOP_REASON_END_TURN) as InferenceResponse["stopReason"],
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
            cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
            estimatedCostUsd: estimateModelCostUsd(
              ANTHROPIC_CAPABILITIES,
              response.model,
              response.usage.input_tokens,
              response.usage.output_tokens,
            ),
          },
          model: response.model,
          provider: "anthropic" as const,
          latencyMs: Date.now() - startMs,
        } satisfies InferenceResponse
      })

    const stream = makeAnthropicStream({ client, builtInTools, mcpManager })

    const countTokens = (text: string, _modelId: string) =>
      Effect.succeed(
        Math.ceil(
          text.length / PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN,
        ),
      )

    const healthCheck = () =>
      Effect.tryPromise({
        try: () =>
          client.messages
            .create({
              model: ANTHROPIC_MODELS.HAIKU_4_5,
              max_tokens: 1,
              messages: [{ role: "user", content: "ping" }],
            })
            .then(() => true),
        catch: () =>
          new ProviderError({
            provider: "anthropic",
            message: "health check failed",
          }),
      })

    return {
      id: "anthropic",
      capabilities: ANTHROPIC_CAPABILITIES,
      complete,
      stream,
      countTokens,
      healthCheck,
    } satisfies LLMProviderService
  }),
)
