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
import { Chunk, Effect } from "effect"
import { LogPanel } from "./components/LogPanel.js"
import { OutputPanel } from "./components/OutputPanel.js"
import { MetaPanel } from "./components/MetaPanel.js"
import { StatusBar } from "./components/StatusBar.js"
import { PromptInput } from "./components/PromptInput.js"
import { WelcomePanel } from "./components/WelcomePanel.js"
import { CommandPalette } from "./components/CommandPalette.js"
import { ShortcutsOverlay } from "./components/ShortcutsOverlay.js"
import { useOwlRuntimeActions } from "./hooks/useOwlRuntimeActions.js"
import { owlReducer, INITIAL_STATE } from "./state.js"
import { moveFocusPanel } from "./focus/index.js"
import type { Mode, ProviderId } from "../core/schema/index.js"
import type { OwlRuntime } from "../cli/runtime.js"
import { CommandRegistry } from "../commands/registry.js"
import { ToolPermissionState } from "../tools/index.js"
import {
  AGENT_STATUS,
  TOOL_PERMISSION_MODES,
  TUI_FOCUS,
} from "../core/constants/index.js"
import type { PaletteCommand } from "./commands/fuzzy.js"
import type { ToolPermissionMode } from "../tools/index.js"

/** @Owl.TUI.App.Props - Component props */
interface AppProps {
  readonly runtime: OwlRuntime
  readonly projectRoot?: string
  readonly initialMode?: Mode
  readonly initialPermissionMode?: ToolPermissionMode
  readonly initialProviderOverride?: ProviderId | null
  readonly initialPrompt?: string | null
}

/** @Owl.TUI.App.Root - Main app component */
export const App: React.FC<AppProps> = ({
  runtime,
  projectRoot = process.cwd(),
  initialMode = "standard",
  initialPermissionMode = TOOL_PERMISSION_MODES.DEFAULT,
  initialProviderOverride = null,
  initialPrompt,
}) => {
  useApp() // access to exit()
  const [state, dispatch] = useReducer(owlReducer, INITIAL_STATE)
  const didSubmitInitialPromptRef = useRef(false)
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

  const { handleSubmit, handleCommand, handleCancel, syncRoutingPreferences } =
    useOwlRuntimeActions(runtime, dispatch, projectRoot)

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

  useInput(
    (_input, key) => {
      if (key.leftArrow) {
        dispatch({
          type: "SET_FOCUSED_PANEL",
          panel: moveFocusPanel(state.focusedPanel, -1),
        })
        return
      }

      if (key.rightArrow) {
        dispatch({
          type: "SET_FOCUSED_PANEL",
          panel: moveFocusPanel(state.focusedPanel, 1),
        })
      }
    },
    { isActive: !shortcutsOpen && !paletteState.open },
  )

  /** Update mode (affects PromptInput border color and token budget) */
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    dispatch({ type: "ADD_LOG", msg: `Mode → ${newMode}` })
  }, [])

  /** Apply startup Permission mode before optional initial prompt */
  useEffect(() => {
    if (didSubmitInitialPromptRef.current) return
    didSubmitInitialPromptRef.current = true

    const effect = Effect.gen(function* () {
      const permissionState = yield* ToolPermissionState
      yield* permissionState.setMode(initialPermissionMode)
      if (initialProviderOverride === null) return null

      const registry = yield* CommandRegistry
      return yield* registry
        .dispatch({
          name: "model",
          args: [initialProviderOverride],
          raw: "/model " + initialProviderOverride,
        })
        .pipe(
          Effect.match({
            onFailure: (error) => "Provider override ignored: " + String(error),
            onSuccess: (result) => result.output,
          }),
        )
    })

    void runtime.runPromise(effect).then((startupProviderLog) => {
      dispatch({
        type: "SET_PERMISSION_MODE",
        mode: initialPermissionMode,
      })
      if (startupProviderLog !== null) {
        dispatch({ type: "ADD_LOG", msg: startupProviderLog })
        void syncRoutingPreferences().catch(() => undefined)
      }
      if (initialPrompt != null && initialPrompt.trim().length > 0) {
        handleSubmit(initialPrompt.trim(), initialMode)
      }
    })
  }, [
    handleSubmit,
    initialMode,
    initialPermissionMode,
    initialPrompt,
    initialProviderOverride,
    runtime,
    syncRoutingPreferences,
  ])

  useEffect(() => {
    const effect = Effect.gen(function* () {
      const registry = yield* CommandRegistry
      return yield* registry.list()
    })
    void runtime
      .runPromise(effect)
      .then((listedCommands) => {
        setCommands(Chunk.toReadonlyArray(listedCommands))
      })
      .catch(() => {
        setCommands([])
      })
  }, [runtime])

  useEffect(() => {
    void syncRoutingPreferences().catch(() => undefined)
  }, [syncRoutingPreferences])

  return (
    <Box flexDirection="column" height="100%">
      {showWelcome ? (
        <Box flexGrow={1} justifyContent="center">
          <WelcomePanel
            mode={mode}
            status={state.status}
            activeRole={state.activeRole}
            projectRoot={projectRoot}
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
            focused={state.focusedPanel === TUI_FOCUS.LOGS}
          />
          <OutputPanel
            status={state.status}
            turns={state.turns}
            error={state.error}
            streamingContent={state.streamingContent}
            focused={state.focusedPanel === TUI_FOCUS.RESPONSE}
          />
          <MetaPanel
            state={state}
            focused={state.focusedPanel === TUI_FOCUS.METRICS}
          />
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
        projectRoot={projectRoot}
        onSubmit={handleSubmit}
        onCommand={handleCommand}
        onModeChange={handleModeChange}
        onShortcuts={() => {
          setShortcutsOpen(true)
          setPaletteState({ open: false, query: "", selectedIndex: 0 })
        }}
        onPaletteChange={setPaletteState}
        commands={commands}
        pendingMutationIds={Chunk.map(
          state.pendingMutations,
          (mutation) => mutation.mutationId,
        )}
        focusedPanel={state.focusedPanel}
      />

      {/* Status bar */}
      <StatusBar
        status={state.status}
        totalInputTokens={state.totalInputTokens}
        totalOutputTokens={state.totalOutputTokens}
        totalEstimatedCostUsd={state.totalEstimatedCostUsd}
        mode={mode}
        providerOverride={state.providerOverride}
        privacyMode={state.privacyMode}
        permissionMode={state.permissionMode}
        model={state.model}
        routingMode={state.routingMode}
        pendingMutationCount={Chunk.size(state.pendingMutations)}
      />
    </Box>
  )
}
