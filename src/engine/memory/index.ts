/**
 * @Owl.Engine.Memory - In-memory session turn history with session lifecycle management
 *
 * Tracks conversation history per session. Each "turn" is a complete user→assistant
 * exchange with token accounting. Memory is used for:
 * - /memory command: Display session history
 * - /status command: Show turn count and token totals
 * - Session summaries: Token budgeting and cost tracking
 *
 * Memory is scoped to a single CLI session. On app restart, history is cleared.
 * For persistent history, integrate with a database layer.
 *
 * @example
 * yield* Effect.flatMap(SessionMemory, (m) => m.startSession())
 * yield* Effect.flatMap(SessionMemory, (m) => m.recordTurn({ taskId, prompt, response, tokensUsed, timestamp }))
 * const turns = yield* Effect.flatMap(SessionMemory, (m) => m.getTurns())
 */
import { Context, Effect, Layer, Ref } from "effect"

/**
 * @Owl.Engine.Memory.Turn - Immutable session turn record
 *
 * A turn represents one complete inference cycle: user prompt → assistant response.
 * Token count includes both directions for accurate accounting.
 *
 * @example
 * const turn: SessionTurn = {
 *   taskId: "task-1",
 *   prompt: "Create a function",
 *   response: "Here is your function...",
 *   tokensUsed: 1250,
 *   timestamp: "2024-01-15T10:30:00Z",
 * }
 */
export interface SessionTurn {
  readonly taskId: string
  readonly prompt: string
  readonly response: string
  readonly tokensUsed: number
  readonly timestamp: string
}

/** @Owl.Engine.Memory.State - Internal mutable session state */
interface MemoryState {
  readonly sessionId: string
  readonly turns: readonly SessionTurn[]
}

/**
 * @Owl.Engine.Memory.Service - Session memory interface
 */
export interface SessionMemoryService {
  /**
   * Start a new session, optionally with a specific ID
   * @param sessionId - Optional custom session ID
   * @returns The session ID (generated or provided)
   */
  readonly startSession: (sessionId?: string) => Effect.Effect<string>
  /**
   * Get current session ID
   * @returns Session identifier
   */
  readonly getSessionId: () => Effect.Effect<string>
  /**
   * Record a completed turn
   * @param turn - SessionTurn to append
   */
  readonly recordTurn: (turn: SessionTurn) => Effect.Effect<void>
  /**
   * Get all turns in current session
   * @returns Array of SessionTurn, newest last
   */
  readonly getTurns: () => Effect.Effect<readonly SessionTurn[]>
  /**
   * Get human-readable session summary
   * @returns String: "Session <id>: <n> turns, <t> tokens used"
   */
  readonly summarize: () => Effect.Effect<string>
}

/** @Owl.Engine.Memory.Tag - Service tag for session memory */
export class SessionMemory extends Context.Tag("SessionMemory")<
  SessionMemory,
  SessionMemoryService
>() {}

/** @Owl.Engine.Memory.IdGenerator - Session ID factory */
const generateSessionId = (): string =>
  `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/**
 * @Owl.Engine.Memory.Live - Ref-backed in-memory session storage
 *
 * Uses Effect Ref for referential transparency. Session persists across
 * multiple tasks until explicitly cleared or app restarts.
 */
export const SessionMemoryLive = Layer.effect(
  SessionMemory,
  Effect.gen(function* () {
    const stateRef = yield* Ref.make<MemoryState>({
      sessionId: generateSessionId(),
      turns: [],
    })

    const startSession = (sessionId?: string): Effect.Effect<string> => {
      const id = sessionId ?? generateSessionId()
      return Ref.set(stateRef, { sessionId: id, turns: [] }).pipe(Effect.as(id))
    }

    const getSessionId = (): Effect.Effect<string> =>
      Ref.get(stateRef).pipe(Effect.map((s) => s.sessionId))

    const recordTurn = (turn: SessionTurn): Effect.Effect<void> =>
      Ref.update(stateRef, (s) => ({
        ...s,
        turns: [...s.turns, turn],
      }))

    const getTurns = (): Effect.Effect<readonly SessionTurn[]> =>
      Ref.get(stateRef).pipe(Effect.map((s) => s.turns))

    const summarize = (): Effect.Effect<string> =>
      Ref.get(stateRef).pipe(
        Effect.map((s) => {
          const totalTokens = s.turns.reduce((sum, t) => sum + t.tokensUsed, 0)
          return `Session ${s.sessionId}: ${String(s.turns.length)} turns, ${String(
            totalTokens,
          )} tokens used`
        }),
      )

    return {
      startSession,
      getSessionId,
      recordTurn,
      getTurns,
      summarize,
    } satisfies SessionMemoryService
  }),
)
