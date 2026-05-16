/**
 * @Owl.TUI.App - Root Ink app: 3-panel layout + REPL prompt, wired to Orchestrator
 *
 * Main React component for the Ink-based terminal UI.
 * Composes:
 * - LogPanel (left): Engine logs, active role badge
 * - OutputPanel (center): Conversation thread, spinner
 * - MetaPanel (right): Provider, token, latency metrics
 * - PromptInput (bottom): REPL with history navigation
 * - StatusBar (bottom-most): Mode, cost, keybinding hints
 *
 * Lifecycle:
 * 1. Mount: Initialize runtime, reset state
 * 2. Initial prompt: If provided via CLI args, auto-submit
 * 3. User input: Handle prompts and slash commands
 * 4. Inference: Orchestrate via Effect, update state
 * 5. Cleanup: Dispose runtime on unmount
 *
 * @example
 * <App runtime={runtime} initialMode="deep" initialPrompt="Analyze this code" />
 */
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react"
import { Box, useApp, useInput } from "ink"
import { Effect, Fiber } from "effect"
import { LogPanel } from "./components/LogPanel.js"
import { OutputPanel } from "./components/OutputPanel.js"
import { MetaPanel } from "./components/MetaPanel.js"
import { StatusBar } from "./components/StatusBar.js"
import { PromptInput } from "./components/PromptInput.js"
import { WelcomePanel } from "./components/WelcomePanel.js"
import { CommandPalette } from "./components/CommandPalette.js"
import { ShortcutsOverlay } from "./components/ShortcutsOverlay.js"
import { owlReducer, INITIAL_STATE } from "./state.js"
import { EFFECT_TAGS, JS_TYPES } from "../core/constants/index.js"
import type { Mode } from "../core/schema/index.js"
import type { OwlRuntime } from "../cli/runtime.js"
import { Orchestrator } from "../engine/orchestrator/index.js"
import { CommandRegistry } from "../commands/registry.js"
import { parseCommand } from "../commands/parser.js"
import { RoutingPreferences } from "../providers/preferences/index.js"
import { TUI_CONSTANTS, AGENT_STATUS } from "../core/constants/index.js"
import type { PaletteCommand } from "./commands/fuzzy.js"
import { expandMentions } from "./mentions/index.js"

/** @Owl.TUI.App.Props - Component props */
interface AppProps {
  readonly runtime: OwlRuntime
  readonly initialMode?: Mode
  readonly initialPrompt?: string | null
}

/** @Owl.TUI.App.Root - Main app component */
export const App: React.FC<AppProps> = ({
  runtime,
  initialMode = "standard",
  initialPrompt,
}) => {
  useApp() // access to exit()
  const [state, dispatch] = useReducer(owlReducer, INITIAL_STATE)
  const taskCounterRef = useRef(0)
  const commandCounterRef = useRef(0)
  const didSubmitInitialPromptRef = useRef(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeFiberRef = useRef<Fiber.RuntimeFiber<any, any> | null>(null)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [paletteState, setPaletteState] = useState({
    open: false,
    query: "",
    selectedIndex: 0,
  })
  const [commands, setCommands] = useState<readonly PaletteCommand[]>([])
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const isProcessing =
    state.status === AGENT_STATUS.ROUTING ||
    state.status === AGENT_STATUS.INFERRING
  const showWelcome =
    state.turns.length === 0 && !isProcessing && state.error === null

  /** Submit a prompt for inference (expands @file mentions first) */
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
      dispatch({ type: "SET_STATUS", status: "routing" })

      const effect = Effect.gen(function* () {
        const orch = yield* Orchestrator

        // Expand @file mentions before sending to the model
        const { expanded, files, errors } = yield* Effect.promise(() =>
          expandMentions(prompt, process.cwd()),
        )
        if (files.length > 0) {
          dispatch({
            type: "ADD_LOG",
            msg: `📎 Injected: ${files.join(", ")}`,
          })
        }
        if (errors.length > 0) {
          dispatch({
            type: "ADD_LOG",
            msg: `⚠ Mention errors: ${errors.join("; ")}`,
          })
        }
        const effectivePrompt = expanded

        dispatch({ type: "ADD_LOG", msg: "◆ Routing to provider…" })
        dispatch({ type: "SET_ROLE", role: "DNA Engineer" })
        dispatch({ type: "SET_STATUS", status: "inferring" })
        dispatch({ type: "ADD_LOG", msg: "◈ Streaming…" })
        dispatch({ type: "CLEAR_STREAM" })

        const response = yield* orch.runStream(
          {
            id: taskId,
            prompt: effectivePrompt,
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
        dispatch({ type: "ADD_LOG", msg: "✓ Registry sync complete" })
        dispatch({ type: "SET_RESPONSE", response })
        dispatch({
          type: "ADD_TURN",
          turn: {
            id: taskId,
            kind: "inference",
            prompt, // show original prompt (without file blobs) in UI
            response: response.content,
            provider: response.provider,
            model: response.model,
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
        .catch((err: unknown) => {
          if (
            err !== null &&
            typeof err === JS_TYPES.OBJECT &&
            "_tag" in (err as object) &&
            (err as { _tag: string })._tag === EFFECT_TAGS.INTERRUPTED
          ) {
            dispatch({ type: "SET_STATUS", status: "idle" })
            return
          }
          const msg =
            err instanceof Error ? err.message : "Unknown inference error"
          dispatch({ type: "SET_ERROR", error: msg })
          dispatch({ type: "ADD_LOG", msg: `✗ Error: ${msg.slice(0, 60)}` })
        })
        .finally(() => {
          activeFiberRef.current = null
        })
    },
    [runtime],
  )

  /** Cancel active inference by interrupting the Effect fiber */
  const handleCancel = useCallback(() => {
    const fiber = activeFiberRef.current
    if (fiber === null) return
    activeFiberRef.current = null
    dispatch({ type: "SET_STATUS", status: "idle" })
    dispatch({ type: "ADD_LOG", msg: "⊘ Cancelled" })
    void runtime.runPromise(Fiber.interrupt(fiber))
  }, [runtime])

  // Global Escape key: cancel inference when processing
  useInput(
    (_input, key) => {
      if (key.escape) handleCancel()
    },
    { isActive: isProcessing },
  )

  // Overlay Escape key: close shortcuts before input resumes
  useInput(
    (_input, key) => {
      if (key.escape) setShortcutsOpen(false)
    },
    { isActive: shortcutsOpen },
  )

  /** Update mode (affects PromptInput border color and token budget) */
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    dispatch({ type: "ADD_LOG", msg: `Mode → ${newMode}` })
  }, [])

  /** Dispatch a slash command */
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
      void runtime.runPromise(effect).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
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
    [runtime],
  )

  /** Auto-submit initial prompt on mount */
  useEffect(() => {
    if (didSubmitInitialPromptRef.current) return
    didSubmitInitialPromptRef.current = true

    if (initialPrompt != null && initialPrompt.trim().length > 0) {
      handleSubmit(initialPrompt.trim(), initialMode)
    }
  }, [handleSubmit, initialMode, initialPrompt])

  useEffect(() => {
    const effect = Effect.gen(function* () {
      const registry = yield* CommandRegistry
      return yield* registry.list()
    })
    void runtime
      .runPromise(effect)
      .then(setCommands)
      .catch(() => {
        setCommands([])
      })
  }, [runtime])

  useEffect(() => {
    const effect = Effect.gen(function* () {
      const routingPreferences = yield* RoutingPreferences
      return yield* routingPreferences.snapshot()
    })
    void runtime
      .runPromise(effect)
      .then((snapshot) => {
        dispatch({
          type: "SET_PROVIDER_OVERRIDE",
          provider: snapshot.preferredProvider ?? null,
        })
      })
      .catch(() => undefined)
  }, [runtime])

  return (
    <Box flexDirection="column" height="100%">
      {showWelcome ? (
        <Box flexGrow={1} justifyContent="center">
          <WelcomePanel
            mode={mode}
            status={state.status}
            activeRole={state.activeRole}
            projectRoot={process.cwd()}
            totalInputTokens={state.totalInputTokens}
            totalOutputTokens={state.totalOutputTokens}
            totalEstimatedCostUsd={state.totalEstimatedCostUsd}
          />
        </Box>
      ) : (
        <Box flexGrow={1} gap={0}>
          <LogPanel
            logs={state.logs}
            status={state.status}
            activeRole={state.activeRole}
          />
          <OutputPanel
            status={state.status}
            turns={state.turns}
            error={state.error}
            streamingContent={state.streamingContent}
          />
          <MetaPanel state={state} />
        </Box>
      )}

      {/* Input row */}
      <CommandPalette
        open={paletteState.open && !shortcutsOpen}
        query={paletteState.query}
        selectedIndex={paletteState.selectedIndex}
        commands={commands}
      />
      {shortcutsOpen ? <ShortcutsOverlay /> : null}
      <PromptInput
        mode={mode}
        disabled={isProcessing || shortcutsOpen}
        projectRoot={process.cwd()}
        onSubmit={handleSubmit}
        onCommand={handleCommand}
        onModeChange={handleModeChange}
        onShortcuts={() => {
          setShortcutsOpen(true)
          setPaletteState({ open: false, query: "", selectedIndex: 0 })
        }}
        onPaletteChange={setPaletteState}
        commands={commands}
      />

      {/* Status bar */}
      <StatusBar
        status={state.status}
        totalInputTokens={state.totalInputTokens}
        totalOutputTokens={state.totalOutputTokens}
        totalEstimatedCostUsd={state.totalEstimatedCostUsd}
        mode={mode}
        providerOverride={state.providerOverride}
        model={state.model}
      />
    </Box>
  )
}
