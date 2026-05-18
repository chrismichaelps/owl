/** @Owl.Commands.Management.Tools - Inspect built-in agent tool surface */
import { Chunk, Effect } from "effect"
import { formatToolPermission, formatToolRisk } from "../../tools/index.js"
import type { BuiltInToolsService } from "../../tools/index.js"
import type { ToolRiskLevel } from "../../tools/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/** @Owl.Commands.Management.Tools.Factory - Create the /tools handler */
export function makeToolsCommand(tools: BuiltInToolsService): CommandHandler {
  return {
    name: "tools",
    description: "Show built-in agent tools and model visibility: /tools",
    execute: (): Effect.Effect<CommandResult> =>
      Effect.sync(() => {
        const allTools = tools.listAllTools()
        const modelVisible = Chunk.filter(allTools, (tool) => tool.modelVisible)
        const internalOnly = Chunk.filter(
          allTools,
          (tool) => !tool.modelVisible,
        )

        const format =
          (prefix: string) =>
          (tool: {
            readonly name: string
            readonly description: string
            readonly riskLevel: ToolRiskLevel
          }) =>
            `${prefix} ${tool.name} [${formatToolRisk(
              tools.assessToolRisk(tool.name),
            )}; permission: ${formatToolPermission(
              tools.assessToolPermission(tool.name),
            )}] — ${tool.description.split("\n")[0] ?? ""}`

        const modelLines = Chunk.map(modelVisible, format("✓"))
        const internalLines = Chunk.map(internalOnly, format("•"))
        const lines = Chunk.appendAll(
          Chunk.appendAll(
            Chunk.make("Built-in Tools", "", "Model-visible"),
            modelLines,
          ),
          Chunk.appendAll(Chunk.make("", "Internal-only"), internalLines),
        )

        return {
          output: Chunk.toReadonlyArray(lines).join("\n").trimEnd(),
        }
      }),
  }
}
