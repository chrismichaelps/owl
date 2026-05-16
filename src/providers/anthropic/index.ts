/**
 * @Owl.Providers.Anthropic - Anthropic Claude adapter with MCP tool calling
 *
 * Primary provider for deep reasoning tasks. Anthropic's Claude models excel at
 * complex analysis, code generation, and multi-step reasoning.
 *
 * Authentication: Requires ANTHROPIC_API_KEY environment variable.
 *
 * MCP Tool Use:
 * When McpManager is present in the Effect context, its tools are forwarded to
 * the Anthropic API. If the model returns stop_reason "tool_use", the adapter
 * executes each tool via McpManager, appends results, and re-calls the API
 * until stop_reason is "end_turn" or the 10-iteration safety cap is hit.
 *
 * Models:
 * - claude-opus-4-7: Highest capability, largest context (1M tokens)
 * - claude-sonnet-4-6: Balanced capability and cost
 * - claude-haiku-4-5: Fast, cost-effective for simpler tasks
 */
import Anthropic from "@anthropic-ai/sdk"
import { Chunk, Context, Data, Effect, Layer, Option, Schedule } from "effect"
import * as Stream from "effect/Stream"
import {
  ProviderError,
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderTimeoutError,
  ProviderStreamError,
} from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import {
  ANTHROPIC_MODELS,
  CONFIG_CONSTANTS,
  HTTP_STATUS,
  PROVIDER_TIMEOUTS,
  RETRY_CONFIG,
  STREAM_CHUNK_TYPES,
} from "../../core/constants/index.js"
import { estimateModelCostUsd } from "../cost.js"
import { parseImageBlocks } from "../image.js"
import { McpManager } from "../../mcp/index.js"
import type { McpManagerService } from "../../mcp/index.js"
import { BuiltInTools } from "../../tools/index.js"
import type { BuiltInToolsService } from "../../tools/index.js"
import type {
  LLMProviderService,
  ProviderCapability,
  StreamChunk,
} from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"

const MAX_TOOL_ITERATIONS = 10

const ANTHROPIC_INTERNAL_CONSTANTS = {
  BLOCK_TYPE_TEXT: "text",
  BLOCK_TYPE_TOOL_USE: "tool_use",
  STOP_REASON_TOOL_USE: "tool_use",
  STOP_REASON_END_TURN: "end_turn",
  EVENT_TYPE_CONTENT_BLOCK_DELTA: "content_block_delta",
  DELTA_TYPE_TEXT_DELTA: "text_delta",
  DELTA_TYPE_THINKING_DELTA: "thinking_delta",
  ROLE_USER: "user",
  ROLE_ASSISTANT: "assistant",
} as const

type AnthropicThinking =
  | { readonly type: "adaptive" }
  | { readonly type: "enabled"; readonly budget_tokens: number }

type AnthropicNonStreamingParamsWithThinking =
  Anthropic.MessageCreateParamsNonStreaming & {
    thinking?: AnthropicThinking
  }

type AnthropicStreamParamsWithThinking = Anthropic.MessageStreamParams & {
  thinking?: AnthropicThinking
}

const resolveThinking = (
  request: InferenceRequest,
): AnthropicThinking | undefined => {
  if (request.thinkingBudget === undefined) return undefined
  if (request.model === ANTHROPIC_MODELS.OPUS_4_7) {
    return Data.struct({ type: "adaptive" as const })
  }
  return Data.struct({
    type: "enabled" as const,
    budget_tokens: request.thinkingBudget,
  })
}

/**
 * @Owl.Providers.Anthropic.Capabilities - High-fidelity model specifications
 */
const ANTHROPIC_CAPABILITIES: readonly ProviderCapability[] = [
  {
    providerId: "anthropic",
    modelId: ANTHROPIC_MODELS.OPUS_4_7,
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
    inputCostPer1k: 0.005,
    outputCostPer1k: 0.025,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    providerId: "anthropic",
    modelId: ANTHROPIC_MODELS.SONNET_4_6,
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    providerId: "anthropic",
    modelId: ANTHROPIC_MODELS.HAIKU_4_5,
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputCostPer1k: 0.001,
    outputCostPer1k: 0.005,
    supportsStreaming: true,
    reasoningDepth: "low",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
]

/**
 * @Owl.Providers.Anthropic.ErrorMapping - Resilient error translation
 */
const mapAnthropicError = (
  e: unknown,
):
  | ProviderError
  | ProviderAuthError
  | ProviderRateLimitError
  | ProviderTimeoutError => {
  if (e instanceof Anthropic.AuthenticationError) {
    return new ProviderAuthError({ provider: "anthropic", reason: e.message })
  }
  if (e instanceof Anthropic.RateLimitError) {
    return new ProviderRateLimitError({ provider: "anthropic" })
  }
  if (e instanceof Anthropic.APIConnectionTimeoutError) {
    return new ProviderTimeoutError({
      provider: "anthropic",
      timeoutMs: PROVIDER_TIMEOUTS.DEFAULT_MS,
    })
  }
  if (
    e instanceof Anthropic.APIError &&
    (e.status === HTTP_STATUS.ANTHROPIC_OVERLOADED ||
      e.message.includes('"type":"overloaded_error"'))
  ) {
    return new ProviderError({
      provider: "anthropic",
      message: "Service overloaded — retry after backoff",
      statusCode: HTTP_STATUS.ANTHROPIC_OVERLOADED,
    })
  }
  const statusCode =
    e instanceof Anthropic.APIError ? (e.status as number) : undefined
  return new ProviderError({
    provider: "anthropic",
    message: e instanceof Error ? e.message : String(e),
    ...(statusCode !== undefined ? { statusCode } : {}),
  })
}

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

        // Load tools from both built-in registry and MCP manager
        const builtInToolDescriptors =
          builtInTools !== null ? builtInTools.getTools() : []
        const mcpTools = mcpManager !== null ? yield* mcpManager.getTools() : []
        const allToolDescriptors = Chunk.appendAll(
          Chunk.fromIterable(builtInToolDescriptors),
          Chunk.fromIterable(mcpTools),
        )
        const tools = Chunk.map(
          allToolDescriptors,
          (t): Anthropic.Tool => ({
            name: t.name,
            description: t.description,
            input_schema: t.input_schema as Anthropic.Tool["input_schema"],
          }),
        )

        let messages = Chunk.map(
          Chunk.fromIterable(request.messages),
          (m): Anthropic.MessageParam => {
            const imageBlocks = parseImageBlocks(m.content)
            return {
              role: m.role as "user" | "assistant",
              content: imageBlocks ?? m.content,
            }
          },
        )

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
          iterations < MAX_TOOL_ITERATIONS
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
              let result: string
              if (builtInTools?.hasTool(block.name)) {
                result = yield* builtInTools.callTool(block.name, input).pipe(
                  Effect.mapError(
                    (e) =>
                      new ProviderError({
                        provider: "anthropic",
                        message: `Tool ${block.name} failed: ${e.reason}`,
                      }),
                  ),
                )
              } else if (mcpManager !== null) {
                result = yield* mcpManager.callTool(block.name, input)
              } else {
                result = `Tool ${block.name} not found`
              }
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

    const stream = (request: InferenceRequest) =>
      Stream.async<StreamChunk, ProviderStreamError>((emit) => {
        const run = async () => {
          try {
            let messages = Chunk.map(
              Chunk.fromIterable(request.messages),
              (m): Anthropic.MessageParam => {
                const imageBlocks = parseImageBlocks(m.content)
                return {
                  role: m.role as "user" | "assistant",
                  content: imageBlocks ?? m.content,
                }
              },
            )

            // Load tools from both built-in registry and MCP manager
            const builtInStreamDescriptors =
              builtInTools !== null ? builtInTools.getTools() : []
            const mcpTools =
              mcpManager !== null
                ? await Effect.runPromise(mcpManager.getTools())
                : []
            const allStreamToolDescriptors = Chunk.appendAll(
              Chunk.fromIterable(builtInStreamDescriptors),
              Chunk.fromIterable(mcpTools),
            )
            const tools = Chunk.map(
              allStreamToolDescriptors,
              (t): Anthropic.Tool => ({
                name: t.name,
                description: t.description,
                input_schema: t.input_schema as Anthropic.Tool["input_schema"],
              }),
            )

            const systemBlock = request.systemPrompt
              ? Chunk.toArray(
                  Chunk.make({
                    type: "text" as const,
                    text: request.systemPrompt,
                    cache_control: { type: "ephemeral" as const },
                  }),
                )
              : undefined

            let index = 0
            let iterations = 0
            // Accumulate usage across all iterations for accurate totals
            let totalInputTokens = 0
            let totalOutputTokens = 0
            let totalCacheReadTokens = 0
            let totalCacheWriteTokens = 0
            let lastModel = request.model

            const streamThinking = resolveThinking(request)

            while (iterations < MAX_TOOL_ITERATIONS) {
              const streamParams: AnthropicStreamParamsWithThinking = {
                model: request.model,
                max_tokens: request.maxTokens,
                messages: Chunk.toArray(messages),
                ...(!Chunk.isEmpty(tools)
                  ? { tools: Chunk.toArray(tools) }
                  : {}),
                ...(systemBlock !== undefined ? { system: systemBlock } : {}),
              }
              if (streamThinking !== undefined) {
                streamParams.thinking = streamThinking
              }
              const s = client.messages.stream(streamParams)

              for await (const event of s) {
                if (
                  event.type ===
                  ANTHROPIC_INTERNAL_CONSTANTS.EVENT_TYPE_CONTENT_BLOCK_DELTA
                ) {
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
                    // Emit thinking tokens as a separate chunk type so the
                    // router can forward them to the log callback without
                    // polluting the response text.
                    await emit.single({
                      type: "thinking",
                      content: (event.delta as { thinking: string }).thinking,
                      index: index++,
                    })
                  }
                }
              }

              const finalMsg = await s.finalMessage()
              lastModel = finalMsg.model
              totalInputTokens += finalMsg.usage.input_tokens
              totalOutputTokens += finalMsg.usage.output_tokens
              totalCacheReadTokens +=
                finalMsg.usage.cache_read_input_tokens ?? 0
              totalCacheWriteTokens +=
                finalMsg.usage.cache_creation_input_tokens ?? 0

              if (
                finalMsg.stop_reason !==
                  ANTHROPIC_INTERNAL_CONSTANTS.STOP_REASON_TOOL_USE ||
                (mcpManager === null && builtInTools === null)
              ) {
                break
              }

              // Append assistant turn with tool_use blocks
              messages = Chunk.append(messages, {
                role: "assistant" as const,
                content: finalMsg.content,
              })

              // Emit indicator and execute each tool call
              let toolResults = Chunk.empty<Anthropic.ToolResultBlockParam>()
              for (const block of finalMsg.content) {
                if (
                  block.type ===
                  ANTHROPIC_INTERNAL_CONSTANTS.BLOCK_TYPE_TOOL_USE
                ) {
                  await emit.single({
                    type: "tool_use",
                    content: block.name,
                    index: index++,
                  })
                  const input = block.input as Record<string, unknown>
                  let result: string
                  if (builtInTools?.hasTool(block.name)) {
                    result = await Effect.runPromise(
                      builtInTools.callTool(block.name, input),
                    )
                  } else if (mcpManager !== null) {
                    result = await Effect.runPromise(
                      mcpManager.callTool(block.name, input),
                    )
                  } else {
                    result = `Tool ${block.name} not found`
                  }
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
              type: "usage" as const,
              index: 0,
              usage: {
                inputTokens: totalInputTokens,
                outputTokens: totalOutputTokens,
                cacheReadTokens: totalCacheReadTokens,
                cacheWriteTokens: totalCacheWriteTokens,
                estimatedCostUsd: estimateModelCostUsd(
                  ANTHROPIC_CAPABILITIES,
                  lastModel,
                  totalInputTokens,
                  totalOutputTokens,
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

    const countTokens = (text: string, _modelId: string) =>
      Effect.succeed(Math.ceil(text.length / 4))

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
