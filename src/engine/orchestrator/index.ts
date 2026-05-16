/**
 * @Owl.Engine.Orchestrator - Main agent loop: seam-engine-provider crossing point
 *
 * The Orchestrator is the heart of the Owl system — it coordinates Context Manager,
 * Session Memory, and Provider Router to execute Tasks end-to-end.
 *
 * Flow for each task:
 * 1. User prompt arrives → wrapped as Task with id, mode, createdAt
 * 2. Message added to context window
 * 3. Token budget resolved from mode budget registry
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
import { Chunk, Context, Effect, HashSet, Layer, Option } from "effect"
import { ContextManager } from "../context/index.js"
import { buildFMCFSystemPrompt } from "../context/systemPrompt.js"
import { loadProjectContext } from "../context/projectContext.js"
import {
  firstParallelResponse,
  formatParallelContent,
  maxParallelLatencyMs,
  sumParallelCostUsd,
  sumParallelOutputTokens,
} from "./parallel.js"
import { UsageMetrics } from "../metrics/index.js"
import { SessionMemory } from "../memory/index.js"
import type { SessionMemoryFailure } from "../memory/persistence.js"
import { ProviderRouter } from "../../providers/router/index.js"
import { RoutingPreferences } from "../../providers/preferences/index.js"
import type { AnyProviderError } from "../../providers/types.js"
import type {
  ProviderUnavailableError,
  TokenBudgetExceededError,
} from "../../core/errors/index.js"
import type {
  Task,
  InferenceResponse,
  Message,
} from "../../core/schema/index.js"
import {
  PROVIDER_TIMEOUTS,
  TOKEN_LIMITS,
  THINKING_MODES,
  resolveModeThinkingBudget,
  resolveModeTokenBudget,
} from "../../core/constants/index.js"
import { estimateConversationTokens } from "../../tokens/pruning/index.js"
import { TokenBudget } from "../../tokens/budget/index.js"

/** ProviderId union — mirrors the schema literal for safe casting */
type ProviderId = InferenceResponse["provider"]

const resolveModeBudget = (task: Task): number =>
  resolveModeTokenBudget(task.mode)

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
    | AnyProviderError
    | ProviderUnavailableError
    | TokenBudgetExceededError
    | SessionMemoryFailure
  >

  /** Execute a task against ranked providers in parallel. */
  readonly runParallel: (
    task: Task,
  ) => Effect.Effect<
    readonly InferenceResponse[],
    | AnyProviderError
    | ProviderUnavailableError
    | TokenBudgetExceededError
    | SessionMemoryFailure
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
   * @param onLog - Optional callback for non-text events (tool calls, etc.)
   * @returns InferenceResponse with full assembled content and estimated usage
   * @throws AnyProviderError - Provider failed during streaming
   * @throws ProviderUnavailableError - No suitable provider found
   */
  readonly runStream: (
    task: Task,
    onChunk: (text: string) => void,
    onLog?: (msg: string) => void,
  ) => Effect.Effect<
    InferenceResponse,
    | AnyProviderError
    | ProviderUnavailableError
    | TokenBudgetExceededError
    | SessionMemoryFailure
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
/**
 * @Owl.Engine.Orchestrator.Make - Factory that loads project context (CLAUDE.md + git) at startup
 *
 * @param projectRoot - Absolute path to project root. Pass "" for test environments.
 */
export const makeOrchestratorLive = (projectRoot: string) =>
  Layer.effect(
    Orchestrator,
    Effect.gen(function* () {
      const ctx = yield* ContextManager
      const mem = yield* SessionMemory
      const router = yield* ProviderRouter
      const budgetService = yield* TokenBudget
      const routingPreferences = yield* RoutingPreferences
      const usageMetrics = yield* UsageMetrics

      yield* mem.resumeSession()

      // Load project context (CLAUDE.md + git status) — non-blocking, never throws
      const projectCtx =
        projectRoot.length > 0
          ? yield* loadProjectContext(projectRoot)
          : undefined
      yield* ctx.setSystemPrompt(buildFMCFSystemPrompt(projectCtx))

      const run = (
        task: Task,
      ): Effect.Effect<
        InferenceResponse,
        | AnyProviderError
        | ProviderUnavailableError
        | TokenBudgetExceededError
        | SessionMemoryFailure
      > =>
        Effect.gen(function* () {
          const userMsg: Message = {
            role: "user",
            content: task.prompt,
            timestamp: new Date().toISOString(),
          }
          yield* ctx.addMessage(userMsg)

          const budget = resolveModeBudget(task)
          const windowedMsgs = yield* ctx.getWindowedMessages(budget)
          const estimatedTokens = estimateConversationTokens(windowedMsgs)
          yield* budgetService.initSession(task.mode, budget)
          yield* budgetService.consume(task.id, estimatedTokens)
          const systemPrompt = yield* ctx.getSystemPrompt()

          const preferredProvider =
            yield* routingPreferences.getPreferredProvider()
          const privacyMode = yield* routingPreferences.getPrivacyMode()
          const routingCtx = {
            taskId: task.id,
            mode: task.mode,
            estimatedInputTokens: estimatedTokens,
            requiresReasoning: HashSet.has(THINKING_MODES, task.mode),
            requiresVision: false,
            latencyBudgetMs: PROVIDER_TIMEOUTS.DEFAULT_MS,
            ...(privacyMode ? { localOnly: true } : {}),
            ...(preferredProvider !== undefined ? { preferredProvider } : {}),
          }

          const thinkingBudget = resolveModeThinkingBudget(task.mode)
          const request = {
            taskId: task.id,
            messages: windowedMsgs,
            maxTokens: TOKEN_LIMITS.MAX_OUTPUT_TOKENS,
            systemPrompt,
            stream: false,
            ...(thinkingBudget !== undefined ? { thinkingBudget } : {}),
          }

          const response = yield* router.complete(routingCtx, request)
          yield* budgetService.consume(task.id, response.usage.outputTokens)
          yield* usageMetrics.recordInference({
            taskId: task.id,
            mode: task.mode,
            provider: response.provider,
            model: response.model,
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
            cacheReadTokens: response.usage.cacheReadTokens,
            cacheWriteTokens: response.usage.cacheWriteTokens,
            estimatedCostUsd: response.usage.estimatedCostUsd,
            latencyMs: response.latencyMs,
            timestamp: new Date().toISOString(),
          })

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
            tokensUsed:
              response.usage.inputTokens + response.usage.outputTokens,
            provider: response.provider,
            model: response.model,
            estimatedCostUsd: response.usage.estimatedCostUsd,
            latencyMs: response.latencyMs,
            timestamp: new Date().toISOString(),
          })

          return response
        })

      const runParallel = (
        task: Task,
      ): Effect.Effect<
        readonly InferenceResponse[],
        | AnyProviderError
        | ProviderUnavailableError
        | TokenBudgetExceededError
        | SessionMemoryFailure
      > =>
        Effect.gen(function* () {
          const userMsg: Message = {
            role: "user",
            content: task.prompt,
            timestamp: new Date().toISOString(),
          }
          yield* ctx.addMessage(userMsg)

          const budget = resolveModeBudget(task)
          const windowedMsgs = yield* ctx.getWindowedMessages(budget)
          const estimatedTokens = estimateConversationTokens(windowedMsgs)
          yield* budgetService.initSession(task.mode, budget)
          yield* budgetService.consume(task.id, estimatedTokens)
          const systemPrompt = yield* ctx.getSystemPrompt()

          const preferredProvider =
            yield* routingPreferences.getPreferredProvider()
          const privacyMode = yield* routingPreferences.getPrivacyMode()
          const routingCtx = {
            taskId: task.id,
            mode: task.mode,
            estimatedInputTokens: estimatedTokens,
            requiresReasoning: HashSet.has(THINKING_MODES, task.mode),
            requiresVision: false,
            latencyBudgetMs: PROVIDER_TIMEOUTS.DEFAULT_MS,
            ...(privacyMode ? { localOnly: true } : {}),
            ...(preferredProvider !== undefined ? { preferredProvider } : {}),
          }

          const thinkingBudget = resolveModeThinkingBudget(task.mode)
          const request = {
            taskId: task.id,
            messages: windowedMsgs,
            maxTokens: TOKEN_LIMITS.MAX_OUTPUT_TOKENS,
            systemPrompt,
            stream: false,
            ...(thinkingBudget !== undefined ? { thinkingBudget } : {}),
          }

          const responses = yield* router.completeParallel(routingCtx, request)
          const responseChunk = Chunk.fromIterable(responses)
          const outputTokens = sumParallelOutputTokens(responses)
          yield* budgetService.consume(task.id, outputTokens)

          yield* Effect.forEach(
            responseChunk,
            (response) =>
              usageMetrics.recordInference({
                taskId: task.id,
                mode: task.mode,
                provider: response.provider,
                model: response.model,
                inputTokens: response.usage.inputTokens,
                outputTokens: response.usage.outputTokens,
                cacheReadTokens: response.usage.cacheReadTokens,
                cacheWriteTokens: response.usage.cacheWriteTokens,
                estimatedCostUsd: response.usage.estimatedCostUsd,
                latencyMs: response.latencyMs,
                timestamp: new Date().toISOString(),
              }),
            { discard: true },
          )

          const combinedContent = formatParallelContent(responses)

          const assistantMsg: Message = {
            role: "assistant",
            content: combinedContent,
            timestamp: new Date().toISOString(),
          }
          yield* ctx.addMessage(assistantMsg)

          const first = Option.getOrThrow(firstParallelResponse(responses))
          yield* mem.recordTurn({
            taskId: task.id,
            prompt: task.prompt,
            response: combinedContent,
            tokensUsed: estimatedTokens + outputTokens,
            provider: first.provider,
            model: "parallel",
            estimatedCostUsd: sumParallelCostUsd(responses),
            latencyMs: maxParallelLatencyMs(responses),
            timestamp: new Date().toISOString(),
          })

          return responses
        })

      const runStream = (
        task: Task,
        onChunk: (text: string) => void,
        onLog?: (msg: string) => void,
      ): Effect.Effect<
        InferenceResponse,
        | AnyProviderError
        | ProviderUnavailableError
        | TokenBudgetExceededError
        | SessionMemoryFailure
      > =>
        Effect.gen(function* () {
          const userMsg: Message = {
            role: "user",
            content: task.prompt,
            timestamp: new Date().toISOString(),
          }
          yield* ctx.addMessage(userMsg)

          const budget = resolveModeBudget(task)
          const windowedMsgs = yield* ctx.getWindowedMessages(budget)
          const estimatedInputTokens = estimateConversationTokens(windowedMsgs)
          yield* budgetService.initSession(task.mode, budget)
          yield* budgetService.consume(task.id, estimatedInputTokens)
          const systemPrompt = yield* ctx.getSystemPrompt()

          const preferredProvider =
            yield* routingPreferences.getPreferredProvider()
          const privacyMode = yield* routingPreferences.getPrivacyMode()
          const routingCtx = {
            taskId: task.id,
            mode: task.mode,
            estimatedInputTokens,
            requiresReasoning: HashSet.has(THINKING_MODES, task.mode),
            requiresVision: false,
            latencyBudgetMs: PROVIDER_TIMEOUTS.DEFAULT_MS,
            ...(privacyMode ? { localOnly: true } : {}),
            ...(preferredProvider !== undefined ? { preferredProvider } : {}),
          }

          const thinkingBudget = resolveModeThinkingBudget(task.mode)
          const request = {
            taskId: task.id,
            messages: windowedMsgs,
            maxTokens: TOKEN_LIMITS.MAX_OUTPUT_TOKENS,
            systemPrompt,
            stream: true,
            ...(thinkingBudget !== undefined ? { thinkingBudget } : {}),
          }

          const result = yield* router.completeWithCallback(
            routingCtx,
            request,
            onChunk,
            onLog,
          )

          const estimatedOutputTokens = estimateConversationTokens([
            {
              role: "assistant" as const,
              content: result.content,
              timestamp: new Date().toISOString(),
            },
          ])
          const inputTokens =
            result.inputTokens > 0 ? result.inputTokens : estimatedInputTokens
          const outputTokens =
            result.outputTokens > 0
              ? result.outputTokens
              : estimatedOutputTokens
          yield* budgetService.consume(task.id, outputTokens)

          const response: InferenceResponse = {
            taskId: task.id,
            content: result.content,
            stopReason: "end_turn",
            usage: {
              inputTokens,
              outputTokens,
              cacheReadTokens: result.cacheReadTokens,
              cacheWriteTokens: result.cacheWriteTokens,
              estimatedCostUsd: result.estimatedCostUsd,
            },
            model: result.model,
            provider: result.provider as ProviderId,
            latencyMs: result.latencyMs,
          }
          yield* usageMetrics.recordInference({
            taskId: task.id,
            mode: task.mode,
            provider: response.provider,
            model: response.model,
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
            cacheReadTokens: response.usage.cacheReadTokens,
            cacheWriteTokens: response.usage.cacheWriteTokens,
            estimatedCostUsd: response.usage.estimatedCostUsd,
            latencyMs: response.latencyMs,
            timestamp: new Date().toISOString(),
          })

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
            tokensUsed: inputTokens + outputTokens,
            provider: response.provider,
            model: response.model,
            estimatedCostUsd: response.usage.estimatedCostUsd,
            latencyMs: response.latencyMs,
            timestamp: new Date().toISOString(),
          })

          return response
        })

      const getSessionSummary = (): Effect.Effect<string> => mem.summarize()

      return {
        run,
        runParallel,
        runStream,
        getSessionSummary,
      } satisfies OrchestratorService
    }),
  )

/**
 * @Owl.Engine.Orchestrator.Live - No-project-context alias used by tests
 *
 * Tests don't need CLAUDE.md or git status. This alias provides the same
 * layer signature as before without any project I/O.
 */
export const OrchestratorLive = makeOrchestratorLive("")
