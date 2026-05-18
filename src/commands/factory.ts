/** @Owl.Commands.Factory - Builds the full slash command set */
import { Chunk } from "effect"
import { makeAnalyzeCommand } from "./analysis/analyze.js"
import { makeBrainCommand } from "./analysis/brain.js"
import { makeDepthCommand } from "./analysis/depth.js"
import { makeFrictionCommand } from "./analysis/friction.js"
import { makeGrillCommand } from "./analysis/grill.js"
import { makeSeamsCommand } from "./analysis/seams.js"
import { makeDeepCommand } from "./core/deep.js"
import { makePlanCommand } from "./core/plan.js"
import { makeQuickCommand } from "./core/quick.js"
import { makeTaskCommand } from "./core/task.js"
import { makeAddCommand } from "./editing/add.js"
import { makeApplyCommand } from "./editing/apply.js"
import { makeCreateCommand } from "./editing/create.js"
import { makeDiffCommand } from "./editing/diff.js"
import { makeEditCommand } from "./editing/edit.js"
import { makeInjectCommand } from "./editing/inject.js"
import { makePendingCommand } from "./editing/pending.js"
import { makeRejectCommand } from "./editing/reject.js"
import { makeRefactorCommand } from "./editing/refactor.js"
import { makeUndoCommand } from "./editing/undo.js"
import { makeAuditCommand } from "./management/audit.js"
import { makeCacheCommand } from "./management/cache.js"
import { makeClearCommand } from "./management/clear.js"
import { makeCompactCommand } from "./management/compact.js"
import { makeDoctorCommand } from "./management/doctor.js"
import { makeExportCommand } from "./management/export.js"
import { makeHelpCommand } from "./management/help.js"
import { makeHistoryCommand } from "./management/history.js"
import { makeInitCommand } from "./management/init.js"
import { makeMcpCommand } from "./management/mcp.js"
import { makeMemoryCommand } from "./management/memory.js"
import { makeModelCommand } from "./management/model.js"
import { makeNewCommand } from "./management/new.js"
import { makePermissionsCommand } from "./management/permissions.js"
import { makePrivacyCommand } from "./management/privacy.js"
import { makeProvidersCommand } from "./management/providers.js"
import { makeRegistryCommand } from "./management/registry.js"
import { makeResumeCommand } from "./management/resume.js"
import { makeRoleCommand } from "./management/role.js"
import { makeSessionsCommand } from "./management/sessions.js"
import { makeStatusCommand } from "./management/status.js"
import { makeToolsCommand } from "./management/tools.js"
import { makeCompareCommand } from "./power/compare.js"
import { makeEconomyCommand } from "./power/economy.js"
import { makeGodCommand } from "./power/god.js"
import { makeRawCommand } from "./power/raw.js"
import type { FileSystem } from "@effect/platform"
import type { ContextManagerService } from "../engine/context/index.js"
import type { UsageMetricsService } from "../engine/metrics/index.js"
import type { SessionMemoryService } from "../engine/memory/index.js"
import type { OrchestratorService } from "../engine/orchestrator/index.js"
import type { ContextCacheService } from "../tokens/cache/index.js"
import type { EditingPipelineService } from "../editor/pipeline/index.js"
import type { PendingMutationStoreService } from "../editor/pending/index.js"
import type { RollbackSystemService } from "../editor/rollback/index.js"
import type { HashRegistryService } from "../fmcf/registry/index.js"
import type { RoleContextService } from "../fmcf/roles/architect.js"
import type { McpManagerService } from "../mcp/index.js"
import type { RoutingPreferencesService } from "../providers/preferences/index.js"
import type { ProviderRouterService } from "../providers/router/index.js"
import type { BuiltInToolsService } from "../tools/index.js"
import type { ToolPermissionStateService } from "../tools/index.js"
import type { CommandRegistryService } from "./registry.js"
import type { CommandHandler } from "./types.js"

/** @Owl.Commands.Factory.Dependencies - Services needed to build command handlers */
export interface CommandFactoryDependencies {
  readonly orchestrator: OrchestratorService
  readonly hashRegistry: HashRegistryService
  readonly rollback: RollbackSystemService
  readonly pipeline: EditingPipelineService
  readonly pendingMutations: PendingMutationStoreService
  readonly mcpManager: McpManagerService
  readonly sessionMemory: SessionMemoryService
  readonly usageMetrics: UsageMetricsService
  readonly contextManager: ContextManagerService
  readonly contextCache: ContextCacheService
  readonly fs: FileSystem.FileSystem
  readonly roleCtx: RoleContextService
  readonly routingPreferences: RoutingPreferencesService
  readonly providerRouter: ProviderRouterService
  readonly builtInTools: BuiltInToolsService
  readonly toolPermissionState: ToolPermissionStateService
}

/** @Owl.Commands.Factory.Core - Create all non-help slash commands */
export const makeCommandHandlers = (
  deps: CommandFactoryDependencies,
  projectRoot: string,
): Chunk.Chunk<CommandHandler> =>
  Chunk.make(
    makeTaskCommand(deps.orchestrator),
    makeDeepCommand(deps.orchestrator),
    makeQuickCommand(deps.orchestrator),
    makePlanCommand(deps.orchestrator),
    makeRawCommand(deps.orchestrator),
    makeCompareCommand(deps.orchestrator),
    makeGodCommand(deps.orchestrator),
    makeEconomyCommand(deps.orchestrator),
    makeAnalyzeCommand(deps.orchestrator),
    makeBrainCommand(deps.hashRegistry),
    makeSeamsCommand(deps.hashRegistry),
    makeDepthCommand(deps.orchestrator),
    makeFrictionCommand(deps.orchestrator),
    makeGrillCommand(deps.orchestrator),
    makeAddCommand(deps.contextManager, projectRoot),
    makeEditCommand(deps.pipeline, deps.pendingMutations, projectRoot),
    makeInjectCommand(deps.pipeline, projectRoot),
    makeCreateCommand(deps.fs, projectRoot),
    makeRefactorCommand(deps.orchestrator),
    makeDiffCommand(deps.rollback, deps.pendingMutations),
    makePendingCommand(deps.pendingMutations),
    makeApplyCommand(deps.pipeline, deps.pendingMutations, projectRoot),
    makeRejectCommand(deps.pendingMutations),
    makeUndoCommand(deps.rollback, projectRoot),
    makeRoleCommand(deps.roleCtx),
    makeRegistryCommand(deps.hashRegistry),
    makeResumeCommand(deps.sessionMemory),
    makeSessionsCommand(deps.sessionMemory),
    makeAuditCommand(deps.orchestrator),
    makeStatusCommand(deps.sessionMemory, deps.usageMetrics),
    makeClearCommand(deps.contextManager),
    makeCompactCommand(
      deps.orchestrator,
      deps.contextManager,
      deps.contextCache,
    ),
    makeDoctorCommand({
      providerRouter: deps.providerRouter,
      mcpManager: deps.mcpManager,
      builtInTools: deps.builtInTools,
      sessionMemory: deps.sessionMemory,
      usageMetrics: deps.usageMetrics,
      contextCache: deps.contextCache,
    }),
    makeCacheCommand(deps.contextCache),
    makeHistoryCommand(deps.sessionMemory, projectRoot),
    makeInitCommand(deps.fs, projectRoot),
    makeExportCommand(deps.sessionMemory, projectRoot),
    makeMcpCommand(deps.mcpManager),
    makeNewCommand(deps.sessionMemory),
    makeToolsCommand(deps.builtInTools, deps.toolPermissionState),
    makeMemoryCommand(deps.sessionMemory),
    makeModelCommand(deps.routingPreferences, deps.providerRouter),
    makePermissionsCommand(deps.toolPermissionState),
    makePrivacyCommand(deps.routingPreferences),
    makeProvidersCommand(
      deps.providerRouter,
      deps.routingPreferences,
      "models",
    ),
    makeProvidersCommand(deps.providerRouter, deps.routingPreferences),
  )

/** @Owl.Commands.Factory.Help - Attach help after base handlers are registered */
export const makeHelpHandler = (
  registry: CommandRegistryService,
): CommandHandler => makeHelpCommand(registry)
