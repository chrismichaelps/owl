/**
 * @Owl.Tools - Built-in agentic tool registry
 *
 * Provides the BuiltInTools Effect service which the Anthropic adapter
 * consults alongside the MCP manager. Tools are registered in a HashMap
 * keyed by name so lookup is O(1) and the set is easy to extend.
 *
 * Included tools (mirrors the core tool surface of major AI coding CLIs):
 *   Bash  — execute shell commands
 *   Read  — read files with line numbers
 *   Write — create or overwrite files
 *   Edit  — exact-string replacement in files
 *   Glob  — find files by glob pattern
 *   Grep  — search in files (ripgrep or grep fallback)
 */
import { Chunk, Context, Data, Effect, HashMap, Layer, Option } from "effect"
import { BashTool } from "./bash.js"
import { ReadTool } from "./read.js"
import { WriteTool } from "./write.js"
import { EditTool } from "./edit.js"
import { GlobTool } from "./glob.js"
import { GrepTool } from "./grep.js"
import { TOOL_PERMISSION_BEHAVIORS } from "../core/constants/index.js"
import { ToolExecutionError } from "../core/errors/index.js"
import { resolveToolPermission, formatToolPermission } from "./permission.js"
import {
  makeToolPermissionStateService,
  ToolPermissionState,
} from "./permissionState.js"
import { classifyToolRisk, formatToolRisk } from "./risk.js"
import type { BuiltInTool, BuiltInToolsService } from "./types.js"
import type { ToolPermissionStateService } from "./permissionState.js"
import type { McpTool } from "../mcp/manager.js"

/** All registered built-in tools in canonical order */
const ALL_TOOLS: Chunk.Chunk<BuiltInTool> = Chunk.make(
  BashTool,
  ReadTool,
  WriteTool,
  EditTool,
  GlobTool,
  GrepTool,
)

/** HashMap<name, BuiltInTool> for O(1) dispatch */
const TOOL_MAP: HashMap.HashMap<string, BuiltInTool> = HashMap.fromIterable(
  Chunk.map(ALL_TOOLS, (tool) => [tool.name, tool] as [string, BuiltInTool]),
)

/** Precomputed McpTool descriptors (sent to the LLM) */
const TOOL_DESCRIPTORS: Chunk.Chunk<McpTool> = Chunk.map(
  Chunk.filter(ALL_TOOLS, (tool) => tool.modelVisible),
  (tool): McpTool =>
    Data.struct({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    }),
)

/** @Owl.Tools.Tag - Effect service tag */
export class BuiltInTools extends Context.Tag("BuiltInTools")<
  BuiltInTools,
  BuiltInToolsService
>() {}

/** @Owl.Tools.Service - Built-in tool service constructor */
export const makeBuiltInToolsService = (
  cwd: string,
  permissionState: ToolPermissionStateService,
): BuiltInToolsService =>
  Data.struct({
    listAllTools: () =>
      Chunk.map(ALL_TOOLS, (tool) =>
        Data.struct({
          name: tool.name,
          description: tool.description,
          modelVisible: tool.modelVisible,
          riskLevel: classifyToolRisk(tool.name).level,
        }),
      ),

    getTools: () => TOOL_DESCRIPTORS,

    assessToolRisk: classifyToolRisk,

    assessToolPermission: (name, input, mode) =>
      resolveToolPermission(classifyToolRisk(name, input), mode),

    callTool: (name, input) =>
      Effect.gen(function* () {
        const toolOpt = HashMap.get(TOOL_MAP, name)
        if (Option.isNone(toolOpt)) {
          return yield* Effect.fail(
            new ToolExecutionError({
              tool: name,
              reason: "Built-in tool not found",
            }),
          )
        }
        const risk = classifyToolRisk(name, input)
        const mode = yield* permissionState.getMode()
        const permission = resolveToolPermission(risk, mode)
        if (permission.behavior !== TOOL_PERMISSION_BEHAVIORS.ALLOW) {
          const prefix =
            permission.behavior === TOOL_PERMISSION_BEHAVIORS.ASK
              ? "Permission required: "
              : "Permission denied: "
          return yield* Effect.fail(
            new ToolExecutionError({
              tool: name,
              reason: prefix + permission.reason,
            }),
          )
        }
        return yield* toolOpt.value.execute(input, cwd)
      }),

    hasTool: (name) => HashMap.has(TOOL_MAP, name),
  })

/**
 * @Owl.Tools.Live - Layer wiring the built-in tool registry
 *
 * @param cwd - Project working directory; passed to every tool execute()
 */
export const makeBuiltInToolsLive = (
  cwd: string,
): Layer.Layer<BuiltInTools, never, ToolPermissionState> =>
  Layer.effect(
    BuiltInTools,
    Effect.gen(function* () {
      const permissionState = yield* ToolPermissionState
      return makeBuiltInToolsService(cwd, permissionState)
    }),
  )

/** @Owl.Tools.Runtime - Shared Permission state and built-in tools */
export const makeBuiltInToolsRuntimeLive = (
  cwd: string,
): Layer.Layer<BuiltInTools | ToolPermissionState> =>
  Layer.effectContext(
    Effect.gen(function* () {
      const permissionState = yield* makeToolPermissionStateService()
      const tools = makeBuiltInToolsService(cwd, permissionState)
      return Context.make(ToolPermissionState, permissionState).pipe(
        Context.add(BuiltInTools, tools),
      )
    }),
  )

export type { BuiltInToolsService } from "./types.js"
export { classifyToolRisk, formatToolRisk }
export { resolveToolPermission, formatToolPermission }
export {
  ToolPermissionState,
  ToolPermissionStateLive,
  parseToolPermissionMode,
} from "./permissionState.js"
export type {
  ToolPermissionSnapshot,
  ToolPermissionStateService,
} from "./permissionState.js"
export type {
  ToolPermissionBehavior,
  ToolPermissionDecision,
  ToolPermissionMode,
} from "./permission.js"
export type { ToolRiskAssessment, ToolRiskLevel } from "./risk.js"
