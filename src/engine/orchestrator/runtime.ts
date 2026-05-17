/** @Owl.Engine.Orchestrator.Runtime - Shared inference runtime constructors */
import { Chunk, Data, Effect, HashSet } from "effect"
import type { SessionTurn } from "../memory/index.js"
import type { ContextManagerService } from "../context/index.js"
import type { RecordInferenceMetric } from "../metrics/index.js"
import type { RoutingPreferencesService } from "../../providers/preferences/index.js"
import type { TokenBudgetService } from "../../tokens/budget/index.js"
import type {
  RoutingContext,
  StreamingCallbackResult,
} from "../../providers/types.js"
import type { TokenBudgetExceededError } from "../../core/errors/index.js"
import type {
  InferenceRequest,
  InferenceResponse,
  Message,
  Mode,
  Task,
} from "../../core/schema/index.js"
import { estimateConversationTokens } from "../../tokens/pruning/index.js"
import {
  ADAPTIVE_ESCALATION,
  ADAPTIVE_ESCALATION_KEYWORDS,
  PROVIDER_TIMEOUTS,
  THINKING_MODES,
  TOKEN_LIMITS,
  resolveModeThinkingBudget,
  resolveModeCostBudget,
  resolveModeTokenBudget,
} from "../../core/constants/index.js"

type ProviderId = InferenceResponse["provider"]
type RuntimeRequest = Omit<InferenceRequest, "model">

interface RuntimePreparationServices {
  readonly ctx: ContextManagerService
  readonly budgetService: TokenBudgetService
  readonly routingPreferences: RoutingPreferencesService
}

export interface PreparedTaskRuntime {
  readonly routingCtx: RoutingContext
  readonly request: RuntimeRequest
  readonly estimatedInputTokens: number
  readonly routingMode: Mode
}

export const resolveTaskBudget = (task: Task): number =>
  resolveModeTokenBudget(task.mode)

export const makeTaskUserMessage = (task: Task): Message =>
  Data.struct({
    role: "user" as const,
    content: task.prompt,
    timestamp: new Date().toISOString(),
  })

export const makeAssistantMessage = (content: string): Message =>
  Data.struct({
    role: "assistant" as const,
    content,
    timestamp: new Date().toISOString(),
  })

/** @Owl.Engine.Orchestrator.Runtime.Escalation - Resolve effective routing depth */
export const resolveAdaptiveRoutingMode = (
  task: Task,
  estimatedInputTokens: number,
): Mode => {
  if (task.adaptiveRouting === false) return task.mode
  if (task.mode !== "standard") return task.mode

  if (
    estimatedInputTokens >= ADAPTIVE_ESCALATION.STANDARD_TO_DEEP_TOKEN_THRESHOLD
  ) {
    return "deep"
  }

  const normalizedPrompt = task.prompt.toLocaleLowerCase()
  return Chunk.some(Chunk.fromIterable(ADAPTIVE_ESCALATION_KEYWORDS), (term) =>
    normalizedPrompt.includes(term),
  )
    ? "deep"
    : task.mode
}

export const makeRoutingContext = (
  task: Task,
  estimatedInputTokens: number,
  preferredProvider: string | undefined,
  privacyMode: boolean,
): RoutingContext => {
  const routingMode = resolveAdaptiveRoutingMode(task, estimatedInputTokens)
  const costBudgetUsd = resolveModeCostBudget(task.mode)
  return Data.struct({
    taskId: task.id,
    mode: routingMode,
    estimatedInputTokens,
    requiresReasoning: HashSet.has(THINKING_MODES, routingMode),
    requiresVision: false,
    latencyBudgetMs: PROVIDER_TIMEOUTS.DEFAULT_MS,
    ...(costBudgetUsd !== undefined ? { costBudgetUsd } : {}),
    ...(privacyMode ? { localOnly: true } : {}),
    ...(preferredProvider !== undefined ? { preferredProvider } : {}),
  })
}

export const makeInferenceRequest = (
  task: Task,
  messages: readonly Message[],
  systemPrompt: string | undefined,
  stream: boolean,
  routingMode: Mode = task.mode,
): RuntimeRequest => {
  const thinkingBudget = resolveModeThinkingBudget(routingMode)
  return Data.struct({
    taskId: task.id,
    messages,
    maxTokens: TOKEN_LIMITS.MAX_OUTPUT_TOKENS,
    stream,
    ...(systemPrompt !== undefined ? { systemPrompt } : {}),
    ...(thinkingBudget !== undefined ? { thinkingBudget } : {}),
  })
}

/** @Owl.Engine.Orchestrator.Runtime.Prepare - Shared task entry path */
export const prepareTaskRuntime = (
  services: RuntimePreparationServices,
  task: Task,
  stream: boolean,
): Effect.Effect<PreparedTaskRuntime, TokenBudgetExceededError> =>
  Effect.gen(function* () {
    yield* services.ctx.addMessage(makeTaskUserMessage(task))

    const budget = resolveTaskBudget(task)
    const windowedMsgs = yield* services.ctx.getWindowedMessages(budget)
    const estimatedInputTokens = estimateConversationTokens(windowedMsgs)
    yield* services.budgetService.initSession(task.mode, budget)
    yield* services.budgetService.consume(task.id, estimatedInputTokens)
    const systemPrompt = yield* services.ctx.getSystemPrompt()

    const preferredProvider =
      yield* services.routingPreferences.getPreferredProvider()
    const privacyMode = yield* services.routingPreferences.getPrivacyMode()
    const routingMode = resolveAdaptiveRoutingMode(task, estimatedInputTokens)
    const routingCtx = makeRoutingContext(
      task,
      estimatedInputTokens,
      preferredProvider,
      privacyMode,
    )
    const request = makeInferenceRequest(
      task,
      windowedMsgs,
      systemPrompt,
      stream,
      routingMode,
    )

    return Data.struct({
      routingCtx,
      request,
      estimatedInputTokens,
      routingMode,
    })
  })

/** @Owl.Engine.Orchestrator.Runtime.ResponseRoute - Annotates routing metadata */
export const annotateResponseRouting = (
  task: Task,
  response: InferenceResponse,
  routingMode: Mode,
): InferenceResponse =>
  Data.struct({
    ...response,
    requestedMode: task.mode,
    routingMode,
  })

export const makeResponseMetric = (
  task: Task,
  response: InferenceResponse,
): RecordInferenceMetric =>
  Data.struct({
    taskId: task.id,
    mode: response.requestedMode ?? task.mode,
    routingMode: response.routingMode ?? response.requestedMode ?? task.mode,
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

export const makeResponseSessionTurn = (
  task: Task,
  response: InferenceResponse,
): SessionTurn =>
  Data.struct({
    taskId: task.id,
    prompt: task.prompt,
    response: response.content,
    tokensUsed: response.usage.inputTokens + response.usage.outputTokens,
    provider: response.provider,
    model: response.model,
    estimatedCostUsd: response.usage.estimatedCostUsd,
    latencyMs: response.latencyMs,
    timestamp: new Date().toISOString(),
  })

export const makeParallelSessionTurn = (
  task: Task,
  content: string,
  estimatedInputTokens: number,
  outputTokens: number,
  provider: ProviderId,
  estimatedCostUsd: number,
  latencyMs: number,
): SessionTurn =>
  Data.struct({
    taskId: task.id,
    prompt: task.prompt,
    response: content,
    tokensUsed: estimatedInputTokens + outputTokens,
    provider,
    model: "parallel",
    estimatedCostUsd,
    latencyMs,
    timestamp: new Date().toISOString(),
  })

export const makeStreamingResponse = (
  task: Task,
  result: StreamingCallbackResult,
  inputTokens: number,
  outputTokens: number,
  routingMode: Mode = task.mode,
): InferenceResponse =>
  Data.struct({
    taskId: task.id,
    content: result.content,
    stopReason: "end_turn" as const,
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
    requestedMode: task.mode,
    routingMode,
  })
