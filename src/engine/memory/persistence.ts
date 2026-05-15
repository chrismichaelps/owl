/**
 * @Owl.Engine.Memory.Persistence - SessionMemory validation and persistence helpers
 */
import { Effect, Schema } from "effect"
import { SESSION_MEMORY_CONSTANTS } from "../../core/constants/index.js"
import {
  SessionMemoryPersistenceError,
  SessionMemoryValidationError,
} from "../../core/errors/index.js"
import {
  SessionMemoryStateSchema,
  SessionTurnSchema,
  type SessionMemoryState,
  type SessionTurn,
} from "./schema.js"

export type SessionMemoryFailure =
  | SessionMemoryValidationError
  | SessionMemoryPersistenceError

export type PersistSessionSnapshot = (
  state: SessionMemoryState,
) => Effect.Effect<void, SessionMemoryFailure>

export const makeEmptyState = (sessionId: string): SessionMemoryState => ({
  version: SESSION_MEMORY_CONSTANTS.PERSISTENCE_SCHEMA_VERSION,
  sessionId,
  turns: [],
})

export const boundTurns = (
  turns: readonly SessionTurn[],
): readonly SessionTurn[] => turns.slice(-SESSION_MEMORY_CONSTANTS.MAX_TURNS)

export const decodeSessionTurn = (
  turn: SessionTurn,
): Effect.Effect<SessionTurn, SessionMemoryValidationError> =>
  Effect.try({
    try: () => Schema.decodeUnknownSync(SessionTurnSchema)(turn),
    catch: (error) =>
      new SessionMemoryValidationError({
        taskId: turn.taskId,
        reason: String(error),
      }),
  }).pipe(
    Effect.flatMap((decoded) =>
      decoded.tokensUsed < 0
        ? Effect.fail(
            new SessionMemoryValidationError({
              taskId: decoded.taskId,
              reason: "tokensUsed must be greater than or equal to 0",
            }),
          )
        : Effect.succeed(decoded),
    ),
    Effect.flatMap((decoded) =>
      decoded.estimatedCostUsd !== undefined && decoded.estimatedCostUsd < 0
        ? Effect.fail(
            new SessionMemoryValidationError({
              taskId: decoded.taskId,
              reason: "estimatedCostUsd must be greater than or equal to 0",
            }),
          )
        : Effect.succeed(decoded),
    ),
    Effect.flatMap((decoded) =>
      decoded.latencyMs !== undefined && decoded.latencyMs < 0
        ? Effect.fail(
            new SessionMemoryValidationError({
              taskId: decoded.taskId,
              reason: "latencyMs must be greater than or equal to 0",
            }),
          )
        : Effect.succeed(decoded),
    ),
  )

export const decodePersistedSessionState = (
  storagePath: string,
  raw: string,
): Effect.Effect<SessionMemoryState, SessionMemoryPersistenceError> =>
  Effect.try({
    try: () =>
      Schema.decodeUnknownSync(SessionMemoryStateSchema)(JSON.parse(raw)),
    catch: (error) =>
      new SessionMemoryPersistenceError({
        path: storagePath,
        reason: String(error),
      }),
  }).pipe(
    Effect.flatMap((state) =>
      state.version === SESSION_MEMORY_CONSTANTS.PERSISTENCE_SCHEMA_VERSION
        ? Effect.succeed({
            ...state,
            turns: boundTurns(state.turns),
          })
        : Effect.fail(
            new SessionMemoryPersistenceError({
              path: storagePath,
              reason:
                "Unsupported SessionMemory schema version " +
                String(state.version),
            }),
          ),
    ),
  )
