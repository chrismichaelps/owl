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
import { Chunk, Data, Either, HashMap, Order, Schema } from "effect"
import { MCP_CONSTANTS } from "../core/constants/index.js"
import { McpConfigSchema } from "./schema.js"
export type { McpConfig, McpServerConfig } from "./schema.js"
import type { McpConfig, McpServerConfig } from "./schema.js"

type McpServerEntry = readonly [string, McpServerConfig]

const entriesFromConfig = (
  config: McpConfig | null,
): Chunk.Chunk<McpServerEntry> =>
  config === null
    ? Chunk.empty<McpServerEntry>()
    : Chunk.fromIterable(Object.entries(config.mcpServers))

const toSortedRecord = (
  servers: HashMap.HashMap<string, McpServerConfig>,
): Record<string, McpServerConfig> =>
  Object.fromEntries(
    Chunk.toReadonlyArray(
      Chunk.sortWith(
        Chunk.fromIterable(HashMap.toEntries(servers)),
        ([name]) => name,
        Order.string,
      ),
    ),
  )

/** @Owl.MCP.Config.Parse - Schema-first config boundary parser */
export function parseMcpConfig(input: unknown): McpConfig | null {
  const decoded = Schema.decodeUnknownEither(McpConfigSchema)(input)
  return Either.isRight(decoded) ? decoded.right : null
}

/** @Owl.MCP.Config.Merge - Project config overrides global config */
export function mergeMcpConfigs(
  globalConfig: McpConfig | null,
  projectConfig: McpConfig | null,
): McpConfig {
  const merged = Chunk.reduce(
    Chunk.appendAll(
      entriesFromConfig(globalConfig),
      entriesFromConfig(projectConfig),
    ),
    HashMap.empty<string, McpServerConfig>(),
    (acc, [name, config]) => HashMap.set(acc, name, config),
  )

  return Data.struct({
    mcpServers: toSortedRecord(merged),
  })
}

async function tryReadJson(path: string): Promise<McpConfig | null> {
  try {
    const raw = await readFile(path, "utf-8")
    return parseMcpConfig(JSON.parse(raw) as unknown)
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
  const globalPath = join(
    homedir(),
    MCP_CONSTANTS.CONFIG_DIR,
    MCP_CONSTANTS.CONFIG_FILE,
  )
  const projectPath = join(
    projectRoot,
    MCP_CONSTANTS.CONFIG_DIR,
    MCP_CONSTANTS.CONFIG_FILE,
  )

  const [global_, project] = await Promise.all([
    tryReadJson(globalPath),
    tryReadJson(projectPath),
  ])

  return mergeMcpConfigs(global_, project)
}
