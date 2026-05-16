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
import { Context, Effect, Layer, Option, Schedule } from "effect"
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
  HTTP_STATUS,
  PROVIDER_TIMEOUTS,
  RETRY_CONFIG,
} from "../../core/constants/index.js"
import { estimateModelCostUsd } from "../cost.js"
import { McpManager } from "../../mcp/index.js"
import type { McpManagerService } from "../../mcp/index.js"
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

/**
 * @Owl.Providers.Anthropic.Capabilities - High-fidelity model specifications
 */
const ANTHROPIC_CAPABILITIES: readonly ProviderCapability[] = [
  {
    providerId: "anthropic",
    modelId: "claude-opus-4-7",
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
    modelId: "claude-sonnet-4-6",
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
    modelId: "claude-haiku-4-5-20251001",
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

    const client = new Anthropic({ apiKey: config.anthropicApiKey })

    // Optional MCP manager — present only when McpManager layer is provided
    const mcpManagerOpt = yield* Effect.serviceOption(McpManager)
    const mcpManager: McpManagerService | null = Option.isSome(mcpManagerOpt)
      ? mcpManagerOpt.value
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
        try: () =>
          client.messages.create({
            model: request.model,
            max_tokens: request.maxTokens,
            messages,
            ...(tools.length > 0 ? { tools } : {}),
            ...(request.systemPrompt
              ? {
                  system: [
                    {
                      type: "text" as const,
                      text: request.systemPrompt,
                      cache_control: { type: "ephemeral" as const },
                    },
                  ],
                }
              : {}),
          }),
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

        // Load MCP tools if manager is connected
        const mcpTools = mcpManager !== null ? yield* mcpManager.getTools() : []
        const tools: Anthropic.Tool[] = mcpTools.map((t) => ({
          name: t.name,
          description: t.description,
          input_schema: t.input_schema as Anthropic.Tool["input_schema"],
        }))

        const messages: Anthropic.MessageParam[] = request.messages.map(
          (m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }),
        )

        let response = yield* callApi(messages, request, tools)
        let textContent = ""
        let iterations = 0

        // Tool-use loop: keep calling until end_turn or safety cap
        while (
          response.stop_reason === "tool_use" &&
          mcpManager !== null &&
          iterations < MAX_TOOL_ITERATIONS
        ) {
          // Collect any text the model generated alongside the tool call
          for (const block of response.content) {
            if (block.type === "text") {
              textContent += block.text
            }
          }

          // Append assistant's turn (with tool_use blocks) to history
          messages.push({ role: "assistant", content: response.content })

          // Execute each tool call and collect results
          const toolResults: Anthropic.ToolResultBlockParam[] = []
          for (const block of response.content) {
            if (block.type === "tool_use") {
              const result = yield* mcpManager.callTool(
                block.name,
                block.input as Record<string, unknown>,
              )
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: result,
              })
            }
          }

          // Append tool results as a user turn
          messages.push({ role: "user", content: toolResults })
          response = yield* callApi(messages, request, tools)
          iterations++
        }

        // Collect final text content
        for (const block of response.content) {
          if (block.type === "text") {
            textContent += block.text
          }
        }

        return {
          taskId: request.taskId,
          content: textContent,
          stopReason: (response.stop_reason ??
            "end_turn") as InferenceResponse["stopReason"],
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
            const messages: Anthropic.MessageParam[] = request.messages.map(
              (m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              }),
            )

            // Load MCP tools if manager is connected
            const mcpTools =
              mcpManager !== null
                ? await Effect.runPromise(mcpManager.getTools())
                : []
            const tools: Anthropic.Tool[] = mcpTools.map((t) => ({
              name: t.name,
              description: t.description,
              input_schema: t.input_schema as Anthropic.Tool["input_schema"],
            }))

            const systemBlock = request.systemPrompt
              ? [
                  {
                    type: "text" as const,
                    text: request.systemPrompt,
                    cache_control: { type: "ephemeral" as const },
                  },
                ]
              : undefined

            let index = 0
            let iterations = 0
            // Accumulate usage across all iterations for accurate totals
            let totalInputTokens = 0
            let totalOutputTokens = 0
            let totalCacheReadTokens = 0
            let totalCacheWriteTokens = 0
            let lastModel = request.model

            while (iterations < MAX_TOOL_ITERATIONS) {
              const s = client.messages.stream({
                model: request.model,
                max_tokens: request.maxTokens,
                messages,
                ...(tools.length > 0 ? { tools } : {}),
                ...(systemBlock !== undefined ? { system: systemBlock } : {}),
              })

              for await (const event of s) {
                if (
                  event.type === "content_block_delta" &&
                  event.delta.type === "text_delta"
                ) {
                  await emit.single({
                    type: "text",
                    content: event.delta.text,
                    index: index++,
                  })
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

              if (finalMsg.stop_reason !== "tool_use" || mcpManager === null) {
                break
              }

              // Append assistant turn with tool_use blocks
              messages.push({ role: "assistant", content: finalMsg.content })

              // Emit indicator and execute each tool call
              const toolResults: Anthropic.ToolResultBlockParam[] = []
              for (const block of finalMsg.content) {
                if (block.type === "tool_use") {
                  await emit.single({
                    type: "tool_use",
                    content: block.name,
                    index: index++,
                  })
                  const result = await Effect.runPromise(
                    mcpManager.callTool(
                      block.name,
                      block.input as Record<string, unknown>,
                    ),
                  )
                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: result,
                  })
                }
              }

              messages.push({ role: "user", content: toolResults })
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
              model: "claude-haiku-4-5-20251001",
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
