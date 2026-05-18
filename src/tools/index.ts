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
import { ToolExecutionError } from "../core/errors/index.js"
import { classifyToolRisk, formatToolRisk } from "./risk.js"
import type { BuiltInTool, BuiltInToolsService } from "./types.js"
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

/**
 * @Owl.Tools.Live - Layer wiring the built-in tool registry
 *
 * @param cwd - Project working directory; passed to every tool execute()
 */
export const makeBuiltInToolsLive = (cwd: string): Layer.Layer<BuiltInTools> =>
  Layer.succeed(BuiltInTools, {
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

    callTool: (name, input) => {
      const toolOpt = HashMap.get(TOOL_MAP, name)
      if (Option.isNone(toolOpt)) {
        return Effect.fail(
          new ToolExecutionError({
            tool: name,
            reason: "Built-in tool not found",
          }),
        )
      }
      return toolOpt.value.execute(input, cwd)
    },

    hasTool: (name) => HashMap.has(TOOL_MAP, name),
  } satisfies BuiltInToolsService)

export type { BuiltInToolsService } from "./types.js"
export { classifyToolRisk, formatToolRisk }
export type { ToolRiskAssessment, ToolRiskLevel } from "./risk.js"
