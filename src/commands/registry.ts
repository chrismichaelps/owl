/**
 * @Owl.Commands.Registry - Ref-backed command lookup and dispatch service
 *
 * Central command management service. All slash commands are registered here
 * at startup by makeCommandRegistryLive().
 *
 * Commands are organized by category:
 * - Core: task, deep, quick, plan
 * - Power: raw, compare, god, economy
 * - Analysis: analyze, brain, depth, friction, grill, seams
 * - Editing: edit, inject, create, diff, apply, undo, refactor
 * - Management: role, registry, audit, status, clear, memory, model
 *
 * @example
 * yield* Effect.flatMap(CommandRegistry, (r) => r.register(handler))
 * const handler = yield* Effect.flatMap(CommandRegistry, (r) => r.lookup("edit"))
 * const result = yield* Effect.flatMap(CommandRegistry, (r) => r.dispatch(parsed))
 */
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import {
  Chunk,
  Context,
  Data,
  Effect,
  HashMap,
  Layer,
  Option,
  Order,
  Ref,
} from "effect"
import { ContextManager } from "../engine/context/index.js"
import { UsageMetrics } from "../engine/metrics/index.js"
import { Orchestrator } from "../engine/orchestrator/index.js"
import { SessionMemory } from "../engine/memory/index.js"
import { RoleContext } from "../fmcf/roles/architect.js"
import { HashRegistry } from "../fmcf/registry/index.js"
import { HashRegistryLive } from "../fmcf/registry/index.js"
import { McpManager } from "../mcp/index.js"
import { RoutingPreferences } from "../providers/preferences/index.js"
import { ProviderRouter } from "../providers/router/index.js"
import { BuiltInTools } from "../tools/index.js"
import { EditingPipeline } from "../editor/pipeline/index.js"
import { PendingMutationStore } from "../editor/pending/index.js"
import { RollbackSystem } from "../editor/rollback/index.js"
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
import { makeRejectCommand } from "./editing/reject.js"
import { makeRefactorCommand } from "./editing/refactor.js"
import { makeUndoCommand } from "./editing/undo.js"
import { makeAuditCommand } from "./management/audit.js"
import { makeClearCommand } from "./management/clear.js"
import { makeExportCommand } from "./management/export.js"
import { makeCompactCommand } from "./management/compact.js"
import { makeHelpCommand } from "./management/help.js"
import { makeHistoryCommand } from "./management/history.js"
import { makeInitCommand } from "./management/init.js"
import { makeMcpCommand } from "./management/mcp.js"
import { makeMemoryCommand } from "./management/memory.js"
import { makeModelCommand } from "./management/model.js"
import { makePrivacyCommand } from "./management/privacy.js"
import { makeProvidersCommand } from "./management/providers.js"
import { makeRegistryCommand } from "./management/registry.js"
import { makeRoleCommand } from "./management/role.js"
import { makeStatusCommand } from "./management/status.js"
import { makeToolsCommand } from "./management/tools.js"
import { makeCompareCommand } from "./power/compare.js"
import { makeEconomyCommand } from "./power/economy.js"
import { makeGodCommand } from "./power/god.js"
import { makeRawCommand } from "./power/raw.js"
import type { CommandParseError } from "../core/errors/index.js"
import { CommandNotFoundError } from "../core/errors/index.js"
import type { CommandHandler, CommandResult, ParsedCommand } from "./types.js"

/**
 * @Owl.Commands.Registry.Service - Register, lookup, list, and dispatch commands
 */
export interface CommandRegistryService {
  /**
   * Register a command handler
   *
   * @param handler - CommandHandler to add
   */
  readonly register: (handler: CommandHandler) => Effect.Effect<void>
  /**
   * Look up a command by name
   *
   * @param name - Command name (without /)
   * @returns CommandHandler
   * @throws CommandNotFoundError - If command doesn't exist
   */
  readonly lookup: (
    name: string,
  ) => Effect.Effect<CommandHandler, CommandNotFoundError>
  /**
   * List all registered commands
   *
   * @returns Array of { name, description }
   */
  readonly list: () => Effect.Effect<
    readonly { readonly name: string; readonly description: string }[]
  >
  /**
   * Dispatch a parsed command to its handler
   *
   * @param parsed - ParsedCommand from parseCommand()
   * @returns CommandResult with output
   * @throws CommandNotFoundError - If command doesn't exist
   */
  readonly dispatch: (
    parsed: ParsedCommand,
  ) => Effect.Effect<CommandResult, CommandNotFoundError | CommandParseError>
}

export class CommandRegistry extends Context.Tag("CommandRegistry")<
  CommandRegistry,
  CommandRegistryService
>() {}

/**
 * @Owl.Commands.Registry.buildService - Shared factory used by bare Live and full-wired variants
 *
 * Builds the core registry service from a Ref<HashMap>.
 * Used by both CommandRegistryLive (bare, for tests) and makeCommandRegistryLive (full).
 */
export const buildRegistryService = (
  mapRef: Ref.Ref<HashMap.HashMap<string, CommandHandler>>,
): CommandRegistryService => {
  const register = (handler: CommandHandler): Effect.Effect<void> =>
    Ref.update(mapRef, (map) => HashMap.set(map, handler.name, handler))

  const lookup = (
    name: string,
  ): Effect.Effect<CommandHandler, CommandNotFoundError> =>
    Ref.get(mapRef).pipe(
      Effect.flatMap((map) => {
        const handler = HashMap.get(map, name)
        return Option.match(handler, {
          onNone: () =>
            Effect.fail(new CommandNotFoundError({ command: name })),
          onSome: Effect.succeed,
        })
      }),
    )

  const list = (): Effect.Effect<
    readonly { readonly name: string; readonly description: string }[]
  > =>
    Ref.get(mapRef).pipe(
      Effect.map((map) =>
        Chunk.toReadonlyArray(
          Chunk.sortWith(
            Chunk.map(Chunk.fromIterable(HashMap.values(map)), (handler) =>
              Data.struct({
                name: handler.name,
                description: handler.description,
              }),
            ),
            (command) => command.name,
            Order.string,
          ),
        ),
      ),
    )

  const dispatch = (
    parsed: ParsedCommand,
  ): Effect.Effect<CommandResult, CommandNotFoundError | CommandParseError> =>
    Effect.gen(function* () {
      const handler = yield* lookup(parsed.name)
      return yield* handler.execute(parsed.args)
    })

  return { register, lookup, list, dispatch }
}

/**
 * @Owl.Commands.Registry.Live - Bare Ref-backed registry — no commands pre-registered. Used in tests.
 */
export const CommandRegistryLive = Layer.effect(
  CommandRegistry,
  Effect.gen(function* () {
    const mapRef = yield* Ref.make<HashMap.HashMap<string, CommandHandler>>(
      HashMap.empty(),
    )
    return buildRegistryService(mapRef)
  }),
)

/**
 * @Owl.Commands.Registry.makeCommandRegistryLive - Full composition root: yields all services, registers all handlers
 *
 * Wires together all services needed by commands:
 * - Orchestrator (for inference commands)
 * - HashRegistry (for registry commands)
 * - EditingPipeline (for editing commands)
 * - RollbackSystem (for undo/diff commands)
 * - ContextManager (for clear command)
 * - SessionMemory (for memory/status commands)
 * - RoleContext (for role command)
 * - RoutingPreferences (for model command)
 * - ProviderRouter (for provider inspection commands)
 *
 * Registers all commands on startup.
 */
export const makeCommandRegistryLive = (
  projectRoot: string,
): Layer.Layer<
  CommandRegistry,
  never,
  | Orchestrator
  | ContextManager
  | UsageMetrics
  | SessionMemory
  | RoleContext
  | RollbackSystem
  | EditingPipeline
  | PendingMutationStore
  | McpManager
  | RoutingPreferences
  | ProviderRouter
  | BuiltInTools
> =>
  Layer.effect(
    CommandRegistry,
    Effect.gen(function* () {
      const orchestrator = yield* Orchestrator
      const hashRegistry = yield* HashRegistry
      const rollback = yield* RollbackSystem
      const pipeline = yield* EditingPipeline
      const pendingMutations = yield* PendingMutationStore
      const mcpManager = yield* McpManager
      const sessionMemory = yield* SessionMemory
      const usageMetrics = yield* UsageMetrics
      const contextManager = yield* ContextManager
      const fs = yield* FileSystem.FileSystem
      const roleCtx = yield* RoleContext
      const routingPreferences = yield* RoutingPreferences
      const providerRouter = yield* ProviderRouter
      const builtInTools = yield* BuiltInTools

      const mapRef = yield* Ref.make<HashMap.HashMap<string, CommandHandler>>(
        HashMap.empty(),
      )
      const svc = buildRegistryService(mapRef)

      const handlers = Chunk.make(
        // Core
        makeTaskCommand(orchestrator),
        makeDeepCommand(orchestrator),
        makeQuickCommand(orchestrator),
        makePlanCommand(orchestrator),
        // Power
        makeRawCommand(orchestrator),
        makeCompareCommand(orchestrator),
        makeGodCommand(orchestrator),
        makeEconomyCommand(orchestrator),
        // Analysis
        makeAnalyzeCommand(orchestrator),
        makeBrainCommand(hashRegistry),
        makeSeamsCommand(hashRegistry),
        makeDepthCommand(orchestrator),
        makeFrictionCommand(orchestrator),
        makeGrillCommand(orchestrator),
        // Editing
        makeAddCommand(contextManager, projectRoot),
        makeEditCommand(pipeline, pendingMutations, projectRoot),
        makeInjectCommand(pipeline, projectRoot),
        makeCreateCommand(fs, projectRoot),
        makeRefactorCommand(orchestrator),
        makeDiffCommand(rollback, pendingMutations),
        makeApplyCommand(pipeline, pendingMutations, projectRoot),
        makeRejectCommand(pendingMutations),
        makeUndoCommand(rollback, projectRoot),
        // Management
        makeRoleCommand(roleCtx),
        makeRegistryCommand(hashRegistry),
        makeAuditCommand(orchestrator),
        makeStatusCommand(sessionMemory, usageMetrics),
        makeClearCommand(contextManager),
        makeCompactCommand(orchestrator, contextManager),
        makeHistoryCommand(sessionMemory, projectRoot),
        makeInitCommand(projectRoot),
        makeExportCommand(sessionMemory, projectRoot),
        makeMcpCommand(mcpManager),
        makeToolsCommand(builtInTools),
        makeMemoryCommand(sessionMemory),
        makeModelCommand(routingPreferences, providerRouter),
        makePrivacyCommand(routingPreferences),
        makeProvidersCommand(providerRouter, routingPreferences, "models"),
        makeProvidersCommand(providerRouter, routingPreferences),
      )

      yield* Effect.forEach(handlers, svc.register, { discard: true })
      yield* svc.register(makeHelpCommand(svc))

      return svc
    }),
  ).pipe(
    Layer.provide(NodeFileSystem.layer),
    Layer.provide(HashRegistryLive(projectRoot)),
  )
