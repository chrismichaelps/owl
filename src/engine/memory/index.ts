/**
 * @Owl.Engine.Memory - Session Turn history with lifecycle management
 *
 * Tracks Turn history per Session. The default layer is deterministic and
 * process-local; the persistent layer stores the same bounded state to disk.
 */
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import path from "node:path"
import {
  Chunk,
  Context,
  Data,
  Effect,
  HashMap,
  Layer,
  Option,
  Ref,
} from "effect"
import { SESSION_MEMORY_CONSTANTS } from "../../core/constants/index.js"
import { SessionMemoryPersistenceError } from "../../core/errors/index.js"
import {
  boundTurns,
  decodePersistedSessionState,
  decodeSessionTurn,
  makeEmptyState,
  type PersistSessionSnapshot,
  type SessionMemoryFailure,
} from "./persistence.js"
export {
  SessionMemoryStateSchema,
  SessionTurnSchema,
  StoredSessionSchema,
  type SessionMemoryState,
  type StoredSession,
  type SessionTurn,
} from "./schema.js"
import type {
  SessionMemoryState,
  StoredSession,
  SessionTurn,
} from "./schema.js"

/** @Owl.Engine.Memory.Service - Session memory interface */
export interface SessionMemoryService {
  readonly startSession: (
    sessionId?: string,
  ) => Effect.Effect<string, SessionMemoryFailure>
  readonly resumeSession: (
    sessionId?: string,
  ) => Effect.Effect<string, SessionMemoryFailure>
  readonly getSessionId: () => Effect.Effect<string>
  readonly recordTurn: (
    turn: SessionTurn,
  ) => Effect.Effect<void, SessionMemoryFailure>
  readonly getTurns: () => Effect.Effect<Chunk.Chunk<SessionTurn>>
  readonly listSessions: () => Effect.Effect<Chunk.Chunk<string>>
  readonly summarize: () => Effect.Effect<string>
}

/** @Owl.Engine.Memory.Tag - Service tag for session memory */
export class SessionMemory extends Context.Tag("SessionMemory")<
  SessionMemory,
  SessionMemoryService
>() {}

const formatSessionId = (counter: number): string =>
  `${SESSION_MEMORY_CONSTANTS.SESSION_ID_PREFIX}-${String(counter).padStart(
    SESSION_MEMORY_CONSTANTS.SESSION_ID_COUNTER_PAD,
    "0",
  )}`

const nextGeneratedSessionId = (
  counterRef: Ref.Ref<number>,
): Effect.Effect<string> =>
  Ref.updateAndGet(counterRef, (counter) => counter + 1).pipe(
    Effect.map(formatSessionId),
  )

const noPersist: PersistSessionSnapshot = () => Effect.void

type SessionStore = HashMap.HashMap<string, Chunk.Chunk<SessionTurn>>
type SessionRuntimeState = Readonly<{
  readonly activeSessionId: string
  readonly sessions: SessionStore
}>

const getSessionTurns = (
  state: SessionRuntimeState,
  sessionId: string,
): Chunk.Chunk<SessionTurn> =>
  Option.getOrElse(HashMap.get(state.sessions, sessionId), () =>
    Chunk.empty<SessionTurn>(),
  )

const compareSessionIds = (left: string, right: string): -1 | 0 | 1 => {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

const storePersistedSession = (
  store: SessionStore,
  session: StoredSession,
): SessionStore =>
  HashMap.set(store, session.sessionId, Chunk.fromIterable(session.turns))

const fromPersistedState = (state: SessionMemoryState): SessionRuntimeState => {
  const persisted = Chunk.fromIterable(state.sessions ?? [])
  const persistedStore = Chunk.reduce(
    persisted,
    HashMap.empty<string, Chunk.Chunk<SessionTurn>>(),
    storePersistedSession,
  )
  const activeFallback = Option.getOrElse(
    HashMap.get(persistedStore, state.sessionId),
    () => Chunk.empty<SessionTurn>(),
  )
  const activeTurns =
    state.turns.length > 0 ? Chunk.fromIterable(state.turns) : activeFallback

  return Data.struct({
    activeSessionId: state.sessionId,
    sessions: HashMap.set(persistedStore, state.sessionId, activeTurns),
  })
}

const toStoredSession = (
  state: SessionRuntimeState,
  sessionId: string,
): StoredSession =>
  Data.struct({
    sessionId,
    turns: Chunk.toReadonlyArray(getSessionTurns(state, sessionId)),
  })

const sortedSessionIds = (state: SessionRuntimeState): Chunk.Chunk<string> =>
  Chunk.sort(
    Chunk.fromIterable(HashMap.keys(state.sessions)),
    compareSessionIds,
  )

const toPersistedState = (state: SessionRuntimeState): SessionMemoryState => {
  const activeTurns = Chunk.toReadonlyArray(
    getSessionTurns(state, state.activeSessionId),
  )
  const sessions = Chunk.toReadonlyArray(
    Chunk.map(sortedSessionIds(state), (sessionId) =>
      toStoredSession(state, sessionId),
    ),
  )

  return Data.struct({
    version: SESSION_MEMORY_CONSTANTS.PERSISTENCE_SCHEMA_VERSION,
    sessionId: state.activeSessionId,
    turns: activeTurns,
    sessions,
  })
}

const parseGeneratedSessionCounter = (sessionId: string): number => {
  const prefix = SESSION_MEMORY_CONSTANTS.SESSION_ID_PREFIX + "-"
  if (!sessionId.startsWith(prefix)) return 0
  const suffix = sessionId.slice(prefix.length)
  return /^\d+$/.test(suffix) ? Number(suffix) : 0
}

const nextCounterFromState = (state: SessionRuntimeState): number =>
  Chunk.reduce(sortedSessionIds(state), 0, (max, sessionId) =>
    Math.max(max, parseGeneratedSessionCounter(sessionId)),
  )

const makeService = (
  stateRef: Ref.Ref<SessionRuntimeState>,
  counterRef: Ref.Ref<number>,
  persist: PersistSessionSnapshot,
): SessionMemoryService => {
  const persistCurrent = (): Effect.Effect<void, SessionMemoryFailure> =>
    Ref.get(stateRef).pipe(
      Effect.map(toPersistedState),
      Effect.flatMap(persist),
    )

  const startSession = (
    sessionId?: string,
  ): Effect.Effect<string, SessionMemoryFailure> =>
    Effect.gen(function* () {
      const id = sessionId ?? (yield* nextGeneratedSessionId(counterRef))
      yield* Ref.update(stateRef, (state) =>
        Data.struct({
          activeSessionId: id,
          sessions: HashMap.set(state.sessions, id, Chunk.empty<SessionTurn>()),
        }),
      )
      yield* persistCurrent()
      return id
    })

  const resumeSession = (
    sessionId?: string,
  ): Effect.Effect<string, SessionMemoryFailure> =>
    Effect.gen(function* () {
      if (sessionId !== undefined) {
        yield* Ref.update(stateRef, (state) => {
          const activeTurns = getSessionTurns(state, state.activeSessionId)
          const nextTurns = Option.getOrElse(
            HashMap.get(state.sessions, sessionId),
            () => activeTurns,
          )
          return Data.struct({
            activeSessionId: sessionId,
            sessions: HashMap.set(state.sessions, sessionId, nextTurns),
          })
        })
        yield* persistCurrent()
        return sessionId
      }
      const state = yield* Ref.get(stateRef)
      return state.activeSessionId
    })

  const getSessionId = (): Effect.Effect<string> =>
    Ref.get(stateRef).pipe(Effect.map((state) => state.activeSessionId))

  const recordTurn = (
    turn: SessionTurn,
  ): Effect.Effect<void, SessionMemoryFailure> =>
    Effect.gen(function* () {
      const decoded = yield* decodeSessionTurn(turn)
      yield* Ref.update(stateRef, (state) => {
        const currentTurns = getSessionTurns(state, state.activeSessionId)
        const nextTurns = Chunk.fromIterable(
          boundTurns(
            Chunk.toReadonlyArray(Chunk.append(currentTurns, decoded)),
          ),
        )
        return Data.struct({
          activeSessionId: state.activeSessionId,
          sessions: HashMap.set(
            state.sessions,
            state.activeSessionId,
            nextTurns,
          ),
        })
      })
      yield* persistCurrent()
    })

  const getTurns = (): Effect.Effect<Chunk.Chunk<SessionTurn>> =>
    Ref.get(stateRef).pipe(
      Effect.map((state) => getSessionTurns(state, state.activeSessionId)),
    )

  const listSessions = (): Effect.Effect<Chunk.Chunk<string>> =>
    Ref.get(stateRef).pipe(Effect.map(sortedSessionIds))

  const summarize = (): Effect.Effect<string> =>
    Ref.get(stateRef).pipe(
      Effect.map((state) => {
        const turns = getSessionTurns(state, state.activeSessionId)
        const totalTokens = Chunk.reduce(
          turns,
          0,
          (sum, turn) => sum + turn.tokensUsed,
        )
        return `Session ${state.activeSessionId}: ${String(Chunk.size(turns))} turns, ${String(
          totalTokens,
        )} tokens used`
      }),
    )

  return {
    startSession,
    resumeSession,
    getSessionId,
    recordTurn,
    getTurns,
    listSessions,
    summarize,
  }
}

/** @Owl.Engine.Memory.Live - Ref-backed in-memory Session storage */
export const SessionMemoryLive = Layer.effect(
  SessionMemory,
  Effect.gen(function* () {
    const initialState = fromPersistedState(makeEmptyState(formatSessionId(0)))
    const counterRef = yield* Ref.make(nextCounterFromState(initialState))
    const stateRef = yield* Ref.make<SessionRuntimeState>(initialState)
    return makeService(stateRef, counterRef, noPersist)
  }),
)

/** @Owl.Engine.Memory.Persistent - File-backed Session storage */
export const makePersistentSessionMemoryLive = (
  storagePath: string,
): Layer.Layer<SessionMemory, SessionMemoryFailure> =>
  Layer.effect(
    SessionMemory,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const exists = yield* fs.exists(storagePath).pipe(
        Effect.mapError(
          () =>
            new SessionMemoryPersistenceError({
              path: storagePath,
              reason: "Unable to inspect SessionMemory storage path",
            }),
        ),
      )

      const initialState = exists
        ? yield* fs.readFileString(storagePath).pipe(
            Effect.mapError(
              () =>
                new SessionMemoryPersistenceError({
                  path: storagePath,
                  reason: "Unable to read SessionMemory storage",
                }),
            ),
            Effect.flatMap((raw) =>
              decodePersistedSessionState(storagePath, raw),
            ),
          )
        : makeEmptyState(formatSessionId(0))

      const runtimeState = fromPersistedState(initialState)
      const counterRef = yield* Ref.make(nextCounterFromState(runtimeState))
      const stateRef = yield* Ref.make<SessionRuntimeState>(runtimeState)
      const persist: PersistSessionSnapshot = (state) =>
        fs.makeDirectory(path.dirname(storagePath), { recursive: true }).pipe(
          Effect.mapError(
            () =>
              new SessionMemoryPersistenceError({
                path: storagePath,
                reason: "Unable to create SessionMemory storage directory",
              }),
          ),
          Effect.zipRight(
            fs.writeFileString(storagePath, JSON.stringify(state, null, 2)),
          ),
          Effect.mapError(
            () =>
              new SessionMemoryPersistenceError({
                path: storagePath,
                reason: "Unable to write SessionMemory storage",
              }),
          ),
        )

      return makeService(stateRef, counterRef, persist)
    }),
  ).pipe(Layer.provide(NodeFileSystem.layer))
