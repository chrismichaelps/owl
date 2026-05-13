/** @Owl.Tokens.Pruning - Second-Order Markov context pruning engine */
import { Effect } from "effect"
import { TOKEN_LIMITS } from "../../core/constants/index.js"
import type { Message } from "../../core/schema/index.js"

/** @Owl.Tokens.Pruning.Options - Pruning configuration */
export interface PruneOptions {
  readonly budget: number
  readonly preserveSystemPrompt: boolean
  readonly windowSize?: number
}

/** @Owl.Tokens.Pruning.Result - Output contract for pruning operations */
export interface PruneResult {
  readonly messages: ReadonlyArray<Message>
  readonly pruned: boolean
  readonly savedTokens: number
  readonly originalTokens: number
}

/** @Owl.Tokens.Pruning.Estimation - Char-length heuristic: ~4 chars per token (GPT/Claude) */
export function estimateTokens(text: string): number {
  return Math.round(text.length / 4)
}

export function estimateMessageTokens(msg: Message): number {
  return 4 + estimateTokens(msg.content)
}

export function estimateConversationTokens(
  messages: ReadonlyArray<Message>,
): number {
  return messages.reduce((sum, m) => sum + estimateMessageTokens(m), 0)
}

/** @Owl.Tokens.Pruning.Window - Markov invariant: V_{n+1} = f(V_n, V_{n-1}) */
export function extractMarkovWindow(
  messages: ReadonlyArray<Message>,
  windowSize: number,
): ReadonlyArray<Message> {
  const pairsToKeep = windowSize * 2
  if (messages.length <= pairsToKeep) return messages
  return messages.slice(messages.length - pairsToKeep)
}

export function shouldPrune(currentTokens: number, budget: number): boolean {
  return currentTokens > budget
}

/** @Owl.Tokens.Pruning.Engine - Stateless transformation: prune then truncate to fit */
export function pruneMessages(
  messages: ReadonlyArray<Message>,
  options: PruneOptions,
): Effect.Effect<PruneResult> {
  return Effect.sync(() => {
    const originalTokens = estimateConversationTokens(messages)

    if (!shouldPrune(originalTokens, options.budget)) {
      return {
        messages,
        pruned: false,
        savedTokens: 0,
        originalTokens,
      }
    }

    const windowSize = options.windowSize ?? TOKEN_LIMITS.MARKOV_WINDOW_SIZE
    const windowed = extractMarkovWindow(messages, windowSize)
    const windowedTokens = estimateConversationTokens(windowed)

    let result = windowed
    if (windowedTokens > options.budget) {
      result = truncateToFit(windowed, options.budget)
    }

    const finalTokens = estimateConversationTokens(result)

    return {
      messages: result,
      pruned: true,
      savedTokens: originalTokens - finalTokens,
      originalTokens,
    }
  })
}

function truncateToFit(
  messages: ReadonlyArray<Message>,
  budget: number,
): ReadonlyArray<Message> {
  let remaining = budget
  const result: Message[] = []

  const lastMsg = messages[messages.length - 1]
  if (lastMsg) {
    result.unshift(lastMsg)
    remaining -= estimateMessageTokens(lastMsg)
  }

  for (let i = messages.length - 2; i >= 0; i--) {
    const msg = messages[i]
    if (!msg) continue
    const cost = estimateMessageTokens(msg)
    if (remaining - cost < 0) break
    result.unshift(msg)
    remaining -= cost
  }

  return result
}
