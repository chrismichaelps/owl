/**
 * @Owl.MCP.Manager - Effect service for managing MCP server connections
 *
 * Starts one StdioClientTransport per configured server, connects them,
 * aggregates tool lists, and routes callTool() to the right server.
 *
 * Tool names are namespaced as "<serverName>__<toolName>" so the Anthropic
 * adapter can route tool calls back to the correct server.
 *
 * Lifecycle:
 * - connect(): called once at startup; failed servers are logged and skipped
 * - getTools(): returns all tools from all connected servers
 * - callTool(): routes to the server that owns the tool
 * - disconnect(): closes all connections on shutdown
 *
 * @example
 * const tools = yield* McpManager.pipe(Effect.flatMap(m => m.getTools()))
 * // [{ name: "filesystem__read_file", description: "...", input_schema: {...} }]
 */
import { Context, Effect, Layer } from "effect"
import { JS_TYPES } from "../core/constants/index.js"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import type { McpConfig } from "./config.js"

const TOOL_SEP = "__"

/** Anthropic-compatible tool definition */
export interface McpTool {
  readonly name: string
  readonly description: string
  readonly input_schema: {
    readonly type: "object"
    readonly properties: Readonly<Record<string, unknown>>
    readonly required?: readonly string[]
  }
}

export interface McpServerStatus {
  readonly name: string
  readonly connected: boolean
  readonly toolCount: number
  readonly error?: string
}

export interface McpManagerService {
  /** Return all tools from all connected servers */
  readonly getTools: () => Effect.Effect<readonly McpTool[]>
  /** Execute a namespaced tool call — e.g. "filesystem__read_file" */
  readonly callTool: (
    name: string,
    input: Record<string, unknown>,
  ) => Effect.Effect<string>
  /** Status of each configured server */
  readonly getServers: () => Effect.Effect<readonly McpServerStatus[]>
}

export class McpManager extends Context.Tag("McpManager")<
  McpManager,
  McpManagerService
>() {}

interface ConnectedServer {
  name: string
  client: Client
  tools: readonly McpTool[]
}

/** Build an Anthropic-compatible tool definition from an MCP tool */
function toMcpTool(
  serverName: string,
  raw: {
    name: string
    description?: string
    inputSchema: {
      type?: string
      properties?: Record<string, unknown>
      required?: string[]
    }
  },
): McpTool {
  return {
    name: `${serverName}${TOOL_SEP}${raw.name}`,
    description: raw.description ?? raw.name,
    input_schema: {
      type: "object",
      properties: raw.inputSchema.properties ?? {},
      ...(raw.inputSchema.required !== undefined &&
      raw.inputSchema.required.length > 0
        ? { required: raw.inputSchema.required }
        : {}),
    },
  }
}

/**
 * @Owl.MCP.Manager.makeLayer - Create the McpManager layer for a given config
 *
 * Connects to all configured servers on layer init. Servers that fail to
 * connect are skipped (logged, not fatal).
 */
export const makeMcpManagerLayer = (
  config: McpConfig,
): Layer.Layer<McpManager> =>
  Layer.effect(
    McpManager,
    Effect.gen(function* () {
      const servers: ConnectedServer[] = []
      const statuses: McpServerStatus[] = []

      for (const [name, cfg] of Object.entries(config.mcpServers)) {
        const client = new Client(
          { name: "owl", version: "0.1.0" },
          {
            capabilities: {},
          },
        )
        const transport = new StdioClientTransport({
          command: cfg.command,
          args: cfg.args ? [...cfg.args] : [],
          ...(cfg.env !== undefined ? { env: { ...cfg.env } } : {}),
          ...(cfg.cwd !== undefined ? { cwd: cfg.cwd } : {}),
          stderr: "pipe",
        })

        const result = yield* Effect.promise(async () => {
          try {
            await client.connect(transport)
            const listed = await client.listTools()
            const tools = listed.tools.map((t) =>
              toMcpTool(name, t as Parameters<typeof toMcpTool>[1]),
            )
            return { ok: true as const, tools }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            return { ok: false as const, error: msg }
          }
        })

        if (result.ok) {
          servers.push({ name, client, tools: result.tools })
          statuses.push({
            name,
            connected: true,
            toolCount: result.tools.length,
          })
        } else {
          statuses.push({
            name,
            connected: false,
            toolCount: 0,
            error: result.error,
          })
        }
      }

      const getTools = (): Effect.Effect<readonly McpTool[]> =>
        Effect.succeed(servers.flatMap((s) => s.tools))

      const callTool = (
        qualifiedName: string,
        input: Record<string, unknown>,
      ): Effect.Effect<string> => {
        const sepIdx = qualifiedName.indexOf(TOOL_SEP)
        const serverName = sepIdx >= 0 ? qualifiedName.slice(0, sepIdx) : ""
        const toolName =
          sepIdx >= 0
            ? qualifiedName.slice(sepIdx + TOOL_SEP.length)
            : qualifiedName

        const server = servers.find((s) => s.name === serverName)
        if (server === undefined) {
          return Effect.succeed(
            `[tool error: server "${serverName}" not connected]`,
          )
        }

        return Effect.promise(async () => {
          try {
            const result = await server.client.callTool({
              name: toolName,
              arguments: input,
            })
            const content = result.content
            if (Array.isArray(content)) {
              return content
                .map((c) => {
                  if (
                    typeof c === JS_TYPES.OBJECT &&
                    c !== null &&
                    "text" in c
                  ) {
                    return String((c as { text: unknown }).text)
                  }
                  return JSON.stringify(c)
                })
                .join("\n")
            }
            return JSON.stringify(result)
          } catch (e) {
            return `[tool error: ${e instanceof Error ? e.message : String(e)}]`
          }
        })
      }

      const getServers = (): Effect.Effect<readonly McpServerStatus[]> =>
        Effect.succeed([...statuses])

      return { getTools, callTool, getServers }
    }),
  )
