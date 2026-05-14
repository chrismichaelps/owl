/**
 * @Owl.Tokens.Pruning - Second-Order Markov context pruning engine
 *
 * Implements Law 1 of FMCF v3.5: Second-Order Markov Determinism.
 * State depends only on the last two states, so pruning aggressively
 * removes older context while preserving recent context.
 *
 * Pruning algorithm:
 * 1. Calculate total tokens from all messages
 * 2. If under budget, return unchanged
 * 3. Extract Markov window (last 4 messages: last 2 pairs)
 * 4. If still over budget, truncate oldest messages first
 *
 * Token estimation: ~4 characters per token (GPT/Claude approximation)
 */
import { Effect } from "effect"
import { TOKEN_LIMITS } from "../../core/constants/index.js"
import type { Message } from "../../core/schema/index.js"

/**
 * @Owl.Tokens.Pruning.Options - Pruning configuration
 *
 * @param budget - Token budget for windowed context
 * @param preserveSystemPrompt - Keep system prompt in context (if extracted separately)
 * @param windowSize - Number of message pairs to preserve (default: MARKOV_WINDOW_SIZE = 2)
 */
export interface PruneOptions {
  readonly budget: number
  readonly preserveSystemPrompt: boolean
  readonly windowSize?: number
}

/**
 * @Owl.Tokens.Pruning.Result - Output contract for pruning operations
 */
export interface PruneResult {
  readonly messages: readonly Message[]
  readonly pruned: boolean
  readonly savedTokens: number
  readonly originalTokens: number
}

/**
 * @Owl.Tokens.Pruning.Estimation - Char-length heuristic: ~4 chars per token (GPT/Claude)
 *
 * @param text - Text to estimate
 * @returns Approximate token count
 */

/** Estimate tokens for plain text */
export function estimateTokens(text: string): number {
  return Math.round(text.length / 4)
}

/** Estimate tokens for a message (includes role overhead) */
export function estimateMessageTokens(msg: Message): number {
  return 4 + estimateTokens(msg.content)
}

/** Estimate tokens for entire conversation */
export function estimateConversationTokens(
  messages: readonly Message[],
): number {
  return messages.reduce((sum, m) => sum + estimateMessageTokens(m), 0)
}

/**
 * @Owl.Tokens.Pruning.Window - Markov invariant: V_{n+1} = f(V_n, V_{n-1})
 *
 * Extract last N pairs of messages. If 10 messages exist, keeping windowSize=2
 * means preserving the last 4 messages (2 pairs).
 */
export function extractMarkovWindow(
  messages: readonly Message[],
  windowSize: number,
): readonly Message[] {
  const pairsToKeep = windowSize * 2
  if (messages.length <= pairsToKeep) return messages
  return messages.slice(messages.length - pairsToKeep)
}

/** Check if pruning is needed */
export function shouldPrune(currentTokens: number, budget: number): boolean {
  return currentTokens > budget
}

/**
 * @Owl.Tokens.Pruning.Engine - Stateless transformation: prune then truncate to fit
 *
 * Implements the pruning pipeline:
 * 1. Check if pruning needed
 * 2. Extract Markov window
 * 3. Truncate to budget if still over
 */
export function pruneMessages(
  messages: readonly Message[],
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

/**
 * Truncate messages from oldest until under budget.
 * Always preserves at least the last message.
 */
function truncateToFit(
  messages: readonly Message[],
  budget: number,
): readonly Message[] {
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
