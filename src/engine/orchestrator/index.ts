/**
 * @Owl.Engine.Orchestrator - Main agent loop: seam-engine-provider crossing point
 *
 * The Orchestrator is the heart of the Owl system — it coordinates Context Manager,
 * Session Memory, and Provider Router to execute Tasks end-to-end.
 *
 * Flow for each task:
 * 1. User prompt arrives → wrapped as Task with id, mode, createdAt
 * 2. Message added to context window
 * 3. Token budget calculated from MODE_TOKEN_BUDGETS based on mode
 * 4. Context windowed to budget (prunes if necessary via ContextManager)
 * 5. RoutingContext built (requiresReasoning, requiresVision, latencyBudgetMs)
 * 6. ProviderRouter selects best provider/model for the task
 * 7. Inference executed via selected provider
 * 8. Response added to context and memory
 * 9. Session summary updated
 *
 * The orchestrator bridges three critical seams:
 * - seam-engine-context: What context to include in the request?
 * - seam-engine-memory: What history to record?
 * - seam-engine-provider: Which provider handles this task?
 *
 * @example
 * const response = yield* Effect.flatMap(Orchestrator, (o) =>
 *   o.run({ id: "task-1", prompt: "Create a button", mode: "standard", createdAt: now })
 * )
 */
import { Context, Effect, Layer } from "effect"
import { ContextManager } from "../context/index.js"
import { SessionMemory } from "../memory/index.js"
import { ProviderRouter } from "../../providers/router/index.js"
import type { AnyProviderError } from "../../providers/types.js"
import type { ProviderUnavailableError } from "../../core/errors/index.js"
import type {
  Task,
  InferenceResponse,
  Message,
} from "../../core/schema/index.js"
import { MODE_TOKEN_BUDGETS, TOKEN_LIMITS } from "../../core/constants/index.js"
import { estimateConversationTokens } from "../../tokens/pruning/index.js"

/** ProviderId union — mirrors the schema literal for safe casting */
type ProviderId = InferenceResponse["provider"]

/**
 * @Owl.Engine.Orchestrator.Service - Main agent loop interface
 */
export interface OrchestratorService {
  /**
   * Execute a task: route to provider, record to memory, return response
   *
   * @param task - Task with id, prompt, mode, createdAt
   * @returns InferenceResponse with content, usage, model, provider, latencyMs
   * @throws AnyProviderError - Provider failed
   * @throws ProviderUnavailableError - No suitable provider found
   */
  readonly run: (
    task: Task,
  ) => Effect.Effect<
    InferenceResponse,
    AnyProviderError | ProviderUnavailableError
  >
  /**
   * Execute a task with real-time Streaming — delivers chunks via callback
   *
   * Builds context and routing exactly like run(), but calls
   * router.completeWithCallback so the TUI can display tokens as they arrive.
   * Estimates token counts from content length (streaming APIs don't expose usage).
   *
   * @param task - Task with id, prompt, mode, createdAt
   * @param onChunk - Callback invoked for each text chunk during Streaming
   * @returns InferenceResponse with full assembled content and estimated usage
   * @throws AnyProviderError - Provider failed during streaming
   * @throws ProviderUnavailableError - No suitable provider found
   */
  readonly runStream: (
    task: Task,
    onChunk: (text: string) => void,
  ) => Effect.Effect<
    InferenceResponse,
    AnyProviderError | ProviderUnavailableError
  >

  /**
   * Get session summary for debugging/display
   * @returns Human-readable summary: sessionId, turns, total tokens
   */
  readonly getSessionSummary: () => Effect.Effect<string>
}

/** @Owl.Engine.Orchestrator.Tag - Service tag for orchestration */
export class Orchestrator extends Context.Tag("Orchestrator")<
  Orchestrator,
  OrchestratorService
>() {}

/**
 * @Owl.Engine.Orchestrator.Live - Production layer composing context, memory, router
 *
 * Wires together the three core engine services. Session starts on layer creation.
 * Each run() call is a self-contained task execution.
 */
export const OrchestratorLive = Layer.effect(
  Orchestrator,
  Effect.gen(function* () {
    const ctx = yield* ContextManager
    const mem = yield* SessionMemory
    const router = yield* ProviderRouter

    yield* mem.startSession()

    const run = (
      task: Task,
    ): Effect.Effect<
      InferenceResponse,
      AnyProviderError | ProviderUnavailableError
    > =>
      Effect.gen(function* () {
        const userMsg: Message = {
          role: "user",
          content: task.prompt,
          timestamp: new Date().toISOString(),
        }
        yield* ctx.addMessage(userMsg)

        const budget =
          MODE_TOKEN_BUDGETS[task.mode] ?? MODE_TOKEN_BUDGETS.standard ?? 32_000
        const windowedMsgs = yield* ctx.getWindowedMessages(budget)
        const estimatedTokens = estimateConversationTokens(windowedMsgs)
        const systemPrompt = yield* ctx.getSystemPrompt()

        const routingCtx = {
          taskId: task.id,
          mode: task.mode,
          estimatedInputTokens: estimatedTokens,
          requiresReasoning: task.mode === "deep" || task.mode === "god",
          requiresVision: false,
          latencyBudgetMs: 30_000,
        }

        const request = {
          taskId: task.id,
          messages: windowedMsgs,
          maxTokens: TOKEN_LIMITS.MAX_OUTPUT_TOKENS,
          systemPrompt,
          stream: false,
        }

        const response = yield* router.complete(routingCtx, request)

        const assistantMsg: Message = {
          role: "assistant",
          content: response.content,
          timestamp: new Date().toISOString(),
        }
        yield* ctx.addMessage(assistantMsg)

        yield* mem.recordTurn({
          taskId: task.id,
          prompt: task.prompt,
          response: response.content,
          tokensUsed: response.usage.inputTokens + response.usage.outputTokens,
          timestamp: new Date().toISOString(),
        })

        return response
      })

    const runStream = (
      task: Task,
      onChunk: (text: string) => void,
    ): Effect.Effect<
      InferenceResponse,
      AnyProviderError | ProviderUnavailableError
    > =>
      Effect.gen(function* () {
        const userMsg: Message = {
          role: "user",
          content: task.prompt,
          timestamp: new Date().toISOString(),
        }
        yield* ctx.addMessage(userMsg)

        const budget =
          MODE_TOKEN_BUDGETS[task.mode] ?? MODE_TOKEN_BUDGETS.standard ?? 32_000
        const windowedMsgs = yield* ctx.getWindowedMessages(budget)
        const estimatedInputTokens = estimateConversationTokens(windowedMsgs)
        const systemPrompt = yield* ctx.getSystemPrompt()

        const routingCtx = {
          taskId: task.id,
          mode: task.mode,
          estimatedInputTokens,
          requiresReasoning: task.mode === "deep" || task.mode === "god",
          requiresVision: false,
          latencyBudgetMs: 30_000,
        }

        const request = {
          taskId: task.id,
          messages: windowedMsgs,
          maxTokens: TOKEN_LIMITS.MAX_OUTPUT_TOKENS,
          systemPrompt,
          stream: true,
        }

        const result = yield* router.completeWithCallback(
          routingCtx,
          request,
          onChunk,
        )

        const outputTokens = estimateConversationTokens([
          {
            role: "assistant" as const,
            content: result.content,
            timestamp: new Date().toISOString(),
          },
        ])

        const response: InferenceResponse = {
          taskId: task.id,
          content: result.content,
          stopReason: "end_turn",
          usage: {
            inputTokens: estimatedInputTokens,
            outputTokens,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
          },
          model: result.model,
          provider: result.provider as ProviderId,
          latencyMs: result.latencyMs,
        }

        const assistantMsg: Message = {
          role: "assistant",
          content: result.content,
          timestamp: new Date().toISOString(),
        }
        yield* ctx.addMessage(assistantMsg)

        yield* mem.recordTurn({
          taskId: task.id,
          prompt: task.prompt,
          response: result.content,
          tokensUsed: estimatedInputTokens + outputTokens,
          timestamp: new Date().toISOString(),
        })

        return response
      })

    const getSessionSummary = (): Effect.Effect<string> => mem.summarize()

    return { run, runStream, getSessionSummary } satisfies OrchestratorService
  }),
)
