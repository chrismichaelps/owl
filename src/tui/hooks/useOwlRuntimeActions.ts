/** @Owl.TUI.Hooks.RuntimeActions - Runtime-backed TUI event handlers */
import { useCallback, useRef } from "react"
import type { Dispatch } from "react"
import { Effect, Fiber } from "effect"
import { Orchestrator } from "../../engine/orchestrator/index.js"
import { CommandRegistry } from "../../commands/registry.js"
import { parseCommand } from "../../commands/parser.js"
import { RoutingPreferences } from "../../providers/preferences/index.js"
import {
  AGENT_STATUS,
  EFFECT_TAGS,
  JS_TYPES,
  TUI_CONSTANTS,
  TUI_ROUTING_COPY,
  TUI_RUNTIME_COPY,
} from "../../core/constants/index.js"
import type { Mode } from "../../core/schema/index.js"
import type { OwlRuntime } from "../../cli/runtime.js"
import type { OwlAction } from "../state.js"
import { expandMentions } from "../mentions/index.js"

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
      return yield* routingPreferences.snapshot()
    })
    return runtime.runPromise(effect).then((snapshot) => {
      dispatch({
        type: "SET_PROVIDER_OVERRIDE",
        provider: snapshot.preferredProvider ?? null,
      })
      dispatch({
        type: "SET_PRIVACY_MODE",
        enabled: snapshot.privacyMode,
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

        dispatch({ type: "ADD_LOG", msg: "◆ Routing to provider…" })
        dispatch({ type: "SET_ROLE", role: "DNA Engineer" })
        dispatch({ type: "SET_STATUS", status: AGENT_STATUS.INFERRING })
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
            return
          }
          const msg = errorMessage(error)
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
    dispatch({ type: "ADD_LOG", msg: "⊘ Cancelled" })
    void runtime.runPromise(Fiber.interrupt(fiber))
  }, [dispatch, runtime])

  const handleCommand = useCallback(
    (raw: string) => {
      const effect = Effect.gen(function* () {
        const registry = yield* CommandRegistry
        const routingPreferences = yield* RoutingPreferences
        const parsed = yield* parseCommand(raw)
        const result = yield* registry.dispatch(parsed)
        const preferenceSnapshot = yield* routingPreferences.snapshot()
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
      })
      void runtime.runPromise(effect).catch((error: unknown) => {
        const msg = errorMessage(error)
        commandCounterRef.current += 1
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
