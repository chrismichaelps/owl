/**
 * @Owl.TUI.Session.Sync - Project Session turns into TUI turns
 */
import { Chunk } from "effect"
import type { SessionTurn } from "../../engine/memory/index.js"
import type { ConversationTurn } from "../state.js"

const LOCAL_SESSION_PROVIDER = "session"
const UNKNOWN_MODEL = "unknown"

/** @Owl.TUI.Session.Sync.Project - Convert SessionMemory turns for display */
export const sessionTurnsToConversationTurns = (
  turns: Chunk.Chunk<SessionTurn>,
): readonly ConversationTurn[] =>
  Chunk.toReadonlyArray(
    Chunk.map(
      turns,
      (turn): ConversationTurn => ({
        kind: "inference",
        id: turn.taskId,
        prompt: turn.prompt,
        response: turn.response,
        provider: turn.provider ?? LOCAL_SESSION_PROVIDER,
        model: turn.model ?? UNKNOWN_MODEL,
        requestedMode: "standard",
        routingMode: "standard",
        latencyMs: turn.latencyMs ?? 0,
        inputTokens: turn.tokensUsed,
        outputTokens: 0,
        estimatedCostUsd: turn.estimatedCostUsd ?? 0,
        timestamp: turn.timestamp,
      }),
    ),
  )
