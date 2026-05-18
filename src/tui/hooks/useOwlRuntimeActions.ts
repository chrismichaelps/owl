/** @Owl.TUI.Hooks.RuntimeActions - Runtime-backed TUI event handlers */
import { useCallback, useRef } from "react"
import type { Dispatch } from "react"
import { Chunk, Data, Effect, Fiber } from "effect"
import { Orchestrator } from "../../engine/orchestrator/index.js"
import { SessionMemory } from "../../engine/memory/index.js"
import { CommandRegistry } from "../../commands/registry.js"
import { parseCommand } from "../../commands/parser.js"
import { RoutingPreferences } from "../../providers/preferences/index.js"
import { ToolPermissionState } from "../../tools/index.js"
import { PendingMutationStore } from "../../editor/pending/index.js"
import {
  AGENT_STATUS,
  EFFECT_TAGS,
  JS_TYPES,
  TUI_CONSTANTS,
  TUI_EXECUTION_STAGES,
  TUI_ROUTING_COPY,
  TUI_RUNTIME_COPY,
} from "../../core/constants/index.js"
import type { Mode } from "../../core/schema/index.js"
import type { OwlRuntime } from "../../cli/runtime.js"
import type { OwlAction } from "../state.js"
import { expandMentions } from "../mentions/index.js"
import { sessionTurnsToConversationTurns } from "../session/sync.js"

export interface RuntimeActions {
  readonly handleSubmit: (prompt: string, submittedMode: Mode) => void
  readonly handleCommand: (raw: string) => void
  readonly handleCancel: () => void
  readonly syncRoutingPreferences: () => Promise<void>
}

const isInterrupted = (error: unknown): boolean =>
  error !== null &&
  typeof error === JS_TYPES.OBJECT &&
  "_tag" in (error as object) &&
  (error as { readonly _tag: string })._tag === EFFECT_TAGS.INTERRUPTED

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const readPendingMutationSummaries = Effect.gen(function* () {
  const pending = yield* PendingMutationStore
  const mutations = yield* pending.list()
  return Chunk.map(mutations, (mutation) =>
    Data.struct({
      mutationId: mutation.mutationId,
      files: Chunk.map(mutation.targets, (target) => target.file),
      previewCount: Chunk.size(mutation.previews),
      createdAt: mutation.createdAt,
    }),
  )
})

const shouldSyncVisibleSession = (commandName: string): boolean =>
  commandName === "new" || commandName === "resume"

export function useOwlRuntimeActions(
  runtime: OwlRuntime,
  dispatch: Dispatch<OwlAction>,
  projectRoot: string,
): RuntimeActions {
  const taskCounterRef = useRef(0)
  const commandCounterRef = useRef(0)
  const activeFiberRef = useRef<Fiber.RuntimeFiber<unknown, unknown> | null>(
    null,
  )

  const syncRoutingPreferences = useCallback(() => {
    const effect = Effect.gen(function* () {
      const routingPreferences = yield* RoutingPreferences
      const toolPermissionState = yield* ToolPermissionState
      const routingSnapshot = yield* routingPreferences.snapshot()
      const permissionSnapshot = yield* toolPermissionState.snapshot()
      return Data.struct({ routingSnapshot, permissionSnapshot })
    })
    return runtime.runPromise(effect).then((snapshot) => {
      dispatch({
        type: "SET_PROVIDER_OVERRIDE",
        provider: snapshot.routingSnapshot.preferredProvider ?? null,
      })
      dispatch({
        type: "SET_PRIVACY_MODE",
        enabled: snapshot.routingSnapshot.privacyMode,
      })
      dispatch({
        type: "SET_PERMISSION_MODE",
        mode: snapshot.permissionSnapshot.mode,
      })
    })
  }, [dispatch, runtime])

  const handleSubmit = useCallback(
    (prompt: string, submittedMode: Mode) => {
      taskCounterRef.current += 1
      const taskId =
        TUI_CONSTANTS.TASK_ID_PREFIX + "-" + String(taskCounterRef.current)

      dispatch({ type: "RESET" })
      dispatch({
        type: "SET_EXECUTION_STAGE",
        stage: TUI_EXECUTION_STAGES.ANALYSIS,
      })
      dispatch({
        type: "ADD_LOG",
        msg: "▶ Task: " + prompt.slice(0, TUI_CONSTANTS.TASK_LOG_PREVIEW_CHARS),
      })
      dispatch({ type: "SET_ROLE", role: "Architect" })
      dispatch({ type: "SET_STATUS", status: AGENT_STATUS.ROUTING })

      const effect = Effect.gen(function* () {
        const orch = yield* Orchestrator
        const { expanded, files, errors } = yield* Effect.promise(() =>
          expandMentions(prompt, projectRoot),
        )

        if (files.length > 0) {
          dispatch({ type: "ADD_LOG", msg: `📎 Injected: ${files.join(", ")}` })
        }
        if (errors.length > 0) {
          dispatch({
            type: "ADD_LOG",
            msg: `⚠ Mention errors: ${errors.join("; ")}`,
          })
        }

        dispatch({
          type: "SET_EXECUTION_STAGE",
          stage: TUI_EXECUTION_STAGES.ROUTING,
        })
        dispatch({ type: "ADD_LOG", msg: "◆ Routing to provider…" })
        dispatch({ type: "SET_ROLE", role: "DNA Engineer" })
        dispatch({ type: "SET_STATUS", status: AGENT_STATUS.INFERRING })
        dispatch({
          type: "SET_EXECUTION_STAGE",
          stage: TUI_EXECUTION_STAGES.STREAMING,
        })
        dispatch({ type: "ADD_LOG", msg: "◈ Streaming…" })
        dispatch({ type: "CLEAR_STREAM" })

        const response = yield* orch.runStream(
          {
            id: taskId,
            prompt: expanded,
            mode: submittedMode,
            createdAt: new Date().toISOString(),
          },
          (chunk) => {
            dispatch({ type: "APPEND_STREAM", text: chunk })
          },
          (msg) => {
            dispatch({ type: "ADD_LOG", msg })
          },
        )

        dispatch({ type: "SET_ROLE", role: "Forensic Guardian" })
        dispatch({
          type: "SET_EXECUTION_STAGE",
          stage: TUI_EXECUTION_STAGES.VERIFICATION,
        })
        if (
          response.requestedMode !== undefined &&
          response.routingMode !== undefined &&
          response.requestedMode !== response.routingMode
        ) {
          dispatch({
            type: "ADD_LOG",
            msg:
              TUI_RUNTIME_COPY.ADAPTIVE_ROUTE_PREFIX +
              ": " +
              response.requestedMode +
              TUI_ROUTING_COPY.MODE_SEPARATOR +
              response.routingMode,
          })
        }
        dispatch({ type: "ADD_LOG", msg: TUI_RUNTIME_COPY.RESPONSE_RECORDED })
        dispatch({ type: "SET_RESPONSE", response })
        dispatch({
          type: "ADD_TURN",
          turn: {
            id: taskId,
            kind: "inference",
            prompt,
            response: response.content,
            provider: response.provider,
            model: response.model,
            requestedMode: response.requestedMode ?? submittedMode,
            routingMode: response.routingMode ?? submittedMode,
            latencyMs: response.latencyMs,
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
            estimatedCostUsd: response.usage.estimatedCostUsd,
            timestamp: new Date().toISOString(),
          },
        })
      })

      const fiber = runtime.runFork(effect)
      activeFiberRef.current = fiber
      void runtime
        .runPromise(Fiber.join(fiber))
        .catch((error: unknown) => {
          if (isInterrupted(error)) {
            dispatch({ type: "SET_STATUS", status: AGENT_STATUS.IDLE })
            dispatch({
              type: "SET_EXECUTION_STAGE",
              stage: TUI_EXECUTION_STAGES.IDLE,
            })
            return
          }
          const msg = errorMessage(error)
          dispatch({
            type: "SET_EXECUTION_STAGE",
            stage: TUI_EXECUTION_STAGES.ERROR,
          })
          dispatch({ type: "SET_ERROR", error: msg })
          dispatch({
            type: "ADD_LOG",
            msg:
              "✗ Error: " + msg.slice(0, TUI_CONSTANTS.ERROR_LOG_PREVIEW_CHARS),
          })
        })
        .finally(() => {
          activeFiberRef.current = null
        })
    },
    [dispatch, projectRoot, runtime],
  )

  const handleCancel = useCallback(() => {
    const fiber = activeFiberRef.current
    if (fiber === null) return
    activeFiberRef.current = null
    dispatch({ type: "SET_STATUS", status: AGENT_STATUS.IDLE })
    dispatch({
      type: "SET_EXECUTION_STAGE",
      stage: TUI_EXECUTION_STAGES.IDLE,
    })
    dispatch({ type: "ADD_LOG", msg: "⊘ Cancelled" })
    void runtime.runPromise(Fiber.interrupt(fiber))
  }, [dispatch, runtime])

  const handleCommand = useCallback(
    (raw: string) => {
      dispatch({
        type: "SET_EXECUTION_STAGE",
        stage: TUI_EXECUTION_STAGES.COMMAND,
      })
      const effect = Effect.gen(function* () {
        const registry = yield* CommandRegistry
        const sessionMemory = yield* SessionMemory
        const routingPreferences = yield* RoutingPreferences
        const toolPermissionState = yield* ToolPermissionState
        const parsed = yield* parseCommand(raw)
        const result = yield* registry.dispatch(parsed)
        const preferenceSnapshot = yield* routingPreferences.snapshot()
        const permissionSnapshot = yield* toolPermissionState.snapshot()
        const pendingMutations = yield* readPendingMutationSummaries
        const visibleSessionTurns = shouldSyncVisibleSession(parsed.name)
          ? yield* sessionMemory
              .getTurns()
              .pipe(Effect.map(sessionTurnsToConversationTurns))
          : null
        commandCounterRef.current += 1
        dispatch({
          type: "SET_PROVIDER_OVERRIDE",
          provider: preferenceSnapshot.preferredProvider ?? null,
        })
        dispatch({
          type: "SET_PRIVACY_MODE",
          enabled: preferenceSnapshot.privacyMode,
        })
        dispatch({
          type: "SET_PERMISSION_MODE",
          mode: permissionSnapshot.mode,
        })
        dispatch({
          type: "SET_PENDING_MUTATIONS",
          pendingMutations,
        })
        if (visibleSessionTurns !== null) {
          dispatch({ type: "SET_TURNS", turns: visibleSessionTurns })
        }
        dispatch({
          type: "ADD_LOG",
          msg:
            "[cmd] " + result.output.slice(0, TUI_CONSTANTS.LOG_PREVIEW_CHARS),
        })
        dispatch({
          type: "ADD_TURN",
          turn: {
            id:
              TUI_CONSTANTS.COMMAND_TURN_ID_PREFIX +
              "-" +
              String(commandCounterRef.current),
            kind: "command",
            command: raw,
            output: result.output,
            timestamp: new Date().toISOString(),
          },
        })
        dispatch({
          type: "SET_EXECUTION_STAGE",
          stage: TUI_EXECUTION_STAGES.IDLE,
        })
      })
      void runtime.runPromise(effect).catch((error: unknown) => {
        const msg = errorMessage(error)
        commandCounterRef.current += 1
        dispatch({
          type: "SET_EXECUTION_STAGE",
          stage: TUI_EXECUTION_STAGES.ERROR,
        })
        dispatch({
          type: "ADD_LOG",
          msg:
            "✗ Cmd error: " +
            msg.slice(0, TUI_CONSTANTS.ERROR_LOG_PREVIEW_CHARS),
        })
        dispatch({
          type: "ADD_TURN",
          turn: {
            id:
              TUI_CONSTANTS.COMMAND_TURN_ID_PREFIX +
              "-" +
              String(commandCounterRef.current),
            kind: "command",
            command: raw,
            output: "Error: " + msg,
            timestamp: new Date().toISOString(),
          },
        })
      })
    },
    [dispatch, runtime],
  )

  return {
    handleSubmit,
    handleCommand,
    handleCancel,
    syncRoutingPreferences,
  }
}
