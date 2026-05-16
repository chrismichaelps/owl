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
import { Effect, Option } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import { McpManager } from "../../mcp/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Management.Mcp.Factory - Create the /mcp command handler
 */
export function makeMcpCommand(): CommandHandler {
  return {
    name: "mcp",
    description: "Show MCP server connection status and available tools: /mcp",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const managerOpt = yield* Effect.serviceOption(McpManager)

        if (Option.isNone(managerOpt)) {
          return {
            output:
              "MCP not configured.\n" +
              "Create ~/.owl/mcp_servers.json or <project>/.owl/mcp_servers.json\n" +
              "then restart Owl.\n\n" +
              'Example:\n{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]\n    }\n  }\n}',
          }
        }

        const manager = managerOpt.value
        const [statuses, tools] = yield* Effect.all([
          manager.getServers(),
          manager.getTools(),
        ])

        if (statuses.length === 0) {
          return { output: "MCP configured but no servers defined." }
        }

        const lines: string[] = ["MCP Servers", ""]

        for (const srv of statuses) {
          if (srv.connected) {
            lines.push(
              `✓ ${srv.name}  — ${String(srv.toolCount)} tool${srv.toolCount === 1 ? "" : "s"}`,
            )
            const srvTools = tools.filter((t) =>
              t.name.startsWith(srv.name + "__"),
            )
            for (const tool of srvTools) {
              lines.push(`  • ${tool.name}`)
            }
          } else {
            lines.push(
              `✗ ${srv.name}  — connection failed: ${srv.error ?? "unknown error"}`,
            )
          }
          lines.push("")
        }

        return { output: lines.join("\n").trimEnd() }
      }),
  }
}
