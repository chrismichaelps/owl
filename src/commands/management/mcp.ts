/**
 * @Owl.Commands.Management.Mcp - Show MCP server connection status: /mcp
 *
 * Lists all configured MCP servers and their connection status, plus the
 * tools each server exposes. Helps diagnose connectivity issues.
 *
 * @example
 * /mcp
 * // MCP Servers
 * //
 * // ✓ filesystem  — 5 tools
 * //   • filesystem__read_file
 * //   • filesystem__write_file
 * //
 * // ✗ github  — connection failed: spawn npx ENOENT
 */
import { Chunk, Effect } from "effect"
import { MCP_CONSTANTS } from "../../core/constants/index.js"
import type { CommandParseError } from "../../core/errors/index.js"
import type {
  McpManagerService,
  McpServerStatus,
  McpTool,
} from "../../mcp/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatConnectedServer = (
  server: McpServerStatus,
  tools: Chunk.Chunk<McpTool>,
): Chunk.Chunk<string> => {
  const serverPrefix = server.name + MCP_CONSTANTS.TOOL_SEPARATOR
  const serverTools = Chunk.filter(tools, (tool) =>
    tool.name.startsWith(serverPrefix),
  )
  return Chunk.appendAll(
    Chunk.make(
      `✓ ${server.name}  — ${String(server.toolCount)} tool${
        server.toolCount === 1 ? "" : "s"
      }`,
    ),
    Chunk.map(serverTools, (tool) => `  • ${tool.name}`),
  )
}

const formatDisconnectedServer = (server: McpServerStatus): string =>
  `✗ ${server.name}  — connection failed: ${server.error ?? "unknown error"}`

/**
 * @Owl.Commands.Management.Mcp.Factory - Create the /mcp command handler
 */
export function makeMcpCommand(manager: McpManagerService): CommandHandler {
  return {
    name: "mcp",
    description: "Show MCP server connection status and available tools: /mcp",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const [statuses, tools] = yield* Effect.all([
          manager.getServers(),
          manager.getTools(),
        ])

        if (statuses.length === 0) {
          return {
            output:
              "MCP configured but no servers defined.\n" +
              "Create ~/.owl/mcp_servers.json or <project>/.owl/mcp_servers.json.",
          }
        }

        let lines = Chunk.make("MCP Servers", "")
        for (const srv of statuses) {
          lines = Chunk.appendAll(
            lines,
            srv.connected
              ? formatConnectedServer(srv, tools)
              : Chunk.make(formatDisconnectedServer(srv)),
          )
          lines = Chunk.append(lines, "")
        }

        return { output: Chunk.toReadonlyArray(lines).join("\n").trimEnd() }
      }),
  }
}
