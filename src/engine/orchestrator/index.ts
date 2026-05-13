/** @Owl.Engine.Orchestrator - Main agent loop: seam-engine-provider crossing point */
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

export interface OrchestratorService {
  readonly run: (
    task: Task,
  ) => Effect.Effect<
    InferenceResponse,
    AnyProviderError | ProviderUnavailableError
  >
  readonly getSessionSummary: () => Effect.Effect<string>
}

export class Orchestrator extends Context.Tag("Orchestrator")<
  Orchestrator,
  OrchestratorService
>() {}

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

    const getSessionSummary = (): Effect.Effect<string> => mem.summarize()

    return { run, getSessionSummary } satisfies OrchestratorService
  }),
)
