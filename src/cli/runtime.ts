/**
 * @Owl.CLI.Runtime - ManagedRuntime factory wiring all live Effect layers
 *
 * Composes all services into a ManagedRuntime for the CLI.
 * Layer composition follows dependency order:
 *
 * 1. Leaf layers (no dependencies):
 *    - OWLConfigLive
 *    - ContextManagerLive
 *    - SessionMemoryLive
 *    - ProviderRouterLive
 *    - Provider adapter layers
 *    - RoleContextLive
 *    - RollbackSystemLive
 *    - GovernanceEngineLive
 *    - DiffGeneratorLive
 *    - TLIExecutorLive
 *    - TokenBudgetLive
 *
 * 2. Derived layers:
 *    - ProviderBootstrapLive (requires: config, router, adapters)
 *    - OrchestratorLive (requires: context, memory, router)
 *    - EditingPipelineLive (requires: governance, diff, tli, rollback)
 *
 * 3. Aggregate layers:
 *    - CommandRegistryLive (requires: all services + all commands)
 *
 * The ManagedRuntime lifetime: create on app start, dispose on app exit.
 *
 * @example
 * const runtime = makeOwlRuntime(process.cwd())
 * runtime.runPromise(effect) // Execute Effect in managed context
 * await runtime.dispose() // Clean up on exit
 */
import { Effect, Layer, ManagedRuntime } from "effect"
import { OWLConfigLive } from "../core/config/index.js"
import { Orchestrator, OrchestratorLive } from "../engine/orchestrator/index.js"
import { ContextManagerLive } from "../engine/context/index.js"
import { SessionMemoryLive } from "../engine/memory/index.js"
import { ProviderRouterLive } from "../providers/router/index.js"
import { AnthropicAdapterLive } from "../providers/anthropic/index.js"
import { GoogleAdapterLive } from "../providers/google/index.js"
import { OllamaAdapterLive } from "../providers/ollama/index.js"
import { OpenAIAdapterLive } from "../providers/openai/index.js"
import {
  ProviderBootstrap,
  ProviderBootstrapLive,
} from "../providers/bootstrap.js"
import { XAIAdapterLive } from "../providers/xai/index.js"
import { RoleContextLive } from "../fmcf/roles/architect.js"
import { EditingPipelineLive } from "../editor/pipeline/index.js"
import { RollbackSystemLive } from "../editor/rollback/index.js"
import { DiffGeneratorLive } from "../editor/diff/index.js"
import { TLIExecutorLive } from "../editor/tli/index.js"
import { GovernanceEngineLive } from "../fmcf/governance/index.js"
import { makeCommandRegistryLive } from "../commands/registry.js"
import { TokenBudgetLive } from "../tokens/budget/index.js"
import type { CommandRegistry } from "../commands/registry.js"
import type { ConfigError } from "effect/ConfigError"

/**
 * @Owl.CLI.Runtime.Type - Typed ManagedRuntime exposing Orchestrator + CommandRegistry
 *
 * The CLI only needs these two services:
 * - Orchestrator: For task execution
 * - CommandRegistry: For slash command handling
 */
export type OwlRuntime = ManagedRuntime.ManagedRuntime<
  Orchestrator | CommandRegistry,
  ConfigError
>

/**
 * @Owl.CLI.Runtime.Make - Factory; call once per CLI session with the project root
 *
 * @param projectRoot - Absolute path to project root (typically process.cwd())
 * @returns ManagedRuntime with all services wired
 */
export const makeOwlRuntime = (projectRoot: string): OwlRuntime => {
  const providerAdapterLayer = Layer.mergeAll(
    AnthropicAdapterLive,
    OpenAIAdapterLive,
    GoogleAdapterLive,
    XAIAdapterLive,
    OllamaAdapterLive,
  ).pipe(Layer.provide(OWLConfigLive))

  // Self-sufficient leaf layers plus Provider adapters.
  const leafLayer = Layer.mergeAll(
    OWLConfigLive,
    ContextManagerLive,
    SessionMemoryLive,
    ProviderRouterLive,
    providerAdapterLayer,
    RoleContextLive,
    RollbackSystemLive,
    GovernanceEngineLive,
    DiffGeneratorLive,
    TLIExecutorLive,
    TokenBudgetLive,
  )

  const providerBootstrapLayer = ProviderBootstrapLive.pipe(
    Layer.provide(leafLayer),
  )

  const orchestratorBaseLayer = OrchestratorLive.pipe(Layer.provide(leafLayer))
  const orchestratorLayer = Layer.effect(
    Orchestrator,
    Effect.gen(function* () {
      yield* ProviderBootstrap
      return yield* Orchestrator
    }),
  ).pipe(
    Layer.provide(
      Layer.mergeAll(orchestratorBaseLayer, providerBootstrapLayer),
    ),
  )
  const editingPipelineLayer = EditingPipelineLive.pipe(
    Layer.provide(leafLayer),
  )

  // CommandRegistry depends on orchestratorLayer + editingPipelineLayer + remaining leaf services;
  // provide all of them as a single merged environment so leafLayer is shared via reference
  const commandRegistryLayer = makeCommandRegistryLive(projectRoot).pipe(
    Layer.provide(
      Layer.mergeAll(orchestratorLayer, editingPipelineLayer, leafLayer),
    ),
  )

  // Expose only the services the CLI actually uses
  return ManagedRuntime.make(
    Layer.mergeAll(orchestratorLayer, commandRegistryLayer),
  )
}
