/** @Owl.CLI.Runtime - ManagedRuntime factory wiring all live Effect layers */
import { Layer, ManagedRuntime } from "effect"
import { OrchestratorLive } from "../engine/orchestrator/index.js"
import { ContextManagerLive } from "../engine/context/index.js"
import { SessionMemoryLive } from "../engine/memory/index.js"
import { ProviderRouterLive } from "../providers/router/index.js"
import { RoleContextLive } from "../fmcf/roles/architect.js"
import { EditingPipelineLive } from "../editor/pipeline/index.js"
import { RollbackSystemLive } from "../editor/rollback/index.js"
import { DiffGeneratorLive } from "../editor/diff/index.js"
import { TLIExecutorLive } from "../editor/tli/index.js"
import { GovernanceEngineLive } from "../fmcf/governance/index.js"
import { makeCommandRegistryLive } from "../commands/registry.js"
import type { Orchestrator } from "../engine/orchestrator/index.js"
import type { CommandRegistry } from "../commands/registry.js"

/** @Owl.CLI.Runtime.Type - Typed ManagedRuntime exposing Orchestrator + CommandRegistry */
export type OwlRuntime = ManagedRuntime.ManagedRuntime<
  Orchestrator | CommandRegistry,
  never
>

/** @Owl.CLI.Runtime.Make - Factory; call once per CLI session with the project root */
export const makeOwlRuntime = (projectRoot: string): OwlRuntime => {
  // Self-sufficient leaf layers (provide their own infrastructure)
  const leafLayer = Layer.mergeAll(
    ContextManagerLive,
    SessionMemoryLive,
    ProviderRouterLive,
    RoleContextLive,
    RollbackSystemLive,
    GovernanceEngineLive,
    DiffGeneratorLive,
    TLIExecutorLive,
  )

  // Orchestrator depends on ContextManager + SessionMemory + ProviderRouter (all in leafLayer)
  const orchestratorLayer = OrchestratorLive.pipe(Layer.provide(leafLayer))

  // EditingPipeline depends on GovernanceEngine + DiffGenerator + TLIExecutor + RollbackSystem (all in leafLayer)
  const editingPipelineLayer = EditingPipelineLive.pipe(
    Layer.provide(leafLayer),
  )

  // CommandRegistry depends on: Orchestrator, ContextManager, SessionMemory, RoleContext, RollbackSystem, EditingPipeline
  const commandRegistryLayer = makeCommandRegistryLive(projectRoot).pipe(
    Layer.provide(
      Layer.mergeAll(
        orchestratorLayer,
        editingPipelineLayer,
        leafLayer, // provides ContextManager, SessionMemory, RoleContext, RollbackSystem
      ),
    ),
  )

  return ManagedRuntime.make(
    Layer.mergeAll(orchestratorLayer, commandRegistryLayer),
  )
}
