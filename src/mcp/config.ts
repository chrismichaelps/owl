/**
 * @Owl.MCP.Config - Load MCP server definitions from disk
 *
 * Reads from two locations (merged, project overrides global):
 *   ~/.owl/mcp_servers.json     — global server definitions
 *   <projectRoot>/.owl/mcp_servers.json — project-local overrides
 *
 * Format mirrors Claude Desktop's config:
 * {
 *   "mcpServers": {
 *     "filesystem": {
 *       "command": "npx",
 *       "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
 *       "env": {}
 *     }
 *   }
 * }
 */
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { homedir } from "node:os"

export interface McpServerConfig {
  readonly command: string
  readonly args?: readonly string[]
  readonly env?: Readonly<Record<string, string>>
  readonly cwd?: string
}

export interface McpConfig {
  readonly mcpServers: Readonly<Record<string, McpServerConfig>>
}

async function tryReadJson(path: string): Promise<McpConfig | null> {
  try {
    const raw = await readFile(path, "utf-8")
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "mcpServers" in parsed &&
      typeof (parsed as Record<string, unknown>).mcpServers === "object"
    ) {
      return parsed as McpConfig
    }
  } catch {
    // file missing or invalid JSON — silently skip
  }
  return null
}

/**
 * @Owl.MCP.Config.load - Load and merge MCP server configs
 *
 * Returns an empty config when no files are found.
 */
export async function loadMcpConfig(projectRoot: string): Promise<McpConfig> {
  const globalPath = join(homedir(), ".owl", "mcp_servers.json")
  const projectPath = join(projectRoot, ".owl", "mcp_servers.json")

  const [global_, project] = await Promise.all([
    tryReadJson(globalPath),
    tryReadJson(projectPath),
  ])

  const merged: Record<string, McpServerConfig> = {
    ...(global_?.mcpServers ?? {}),
    ...(project?.mcpServers ?? {}), // project overrides global
  }

  return { mcpServers: merged }
}
