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
import {
  Chunk,
  Context,
  Data,
  Effect,
  HashMap,
  Layer,
  Option,
  Order,
} from "effect"
import { MCP_CONSTANTS } from "../core/constants/index.js"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import type { McpConfig } from "./config.js"

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
  readonly getTools: () => Effect.Effect<Chunk.Chunk<McpTool>>
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
  readonly name: string
  readonly client: Client
  readonly tools: Chunk.Chunk<McpTool>
}

interface McpServerEntry {
  readonly name: string
  readonly config: McpConfig["mcpServers"][string]
}

export interface QualifiedToolName {
  readonly serverName: string
  readonly toolName: string
}

const hasTextProperty = (value: unknown): value is { readonly text: unknown } =>
  typeof value === "object" && value !== null && "text" in value

/** @Owl.MCP.Manager.FormatContent - Normalize MCP tool content */
export function formatMcpToolContent(
  content: unknown,
  fallback: unknown = content,
): string {
  if (!Array.isArray(content)) {
    return JSON.stringify(fallback)
  }

  return Chunk.toReadonlyArray(
    Chunk.map(Chunk.fromIterable(content), (item) =>
      hasTextProperty(item) ? String(item.text) : JSON.stringify(item),
    ),
  ).join("\n")
}

/** Build an Anthropic-compatible tool definition from an MCP tool */
export function toMcpTool(
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
    name: `${serverName}${MCP_CONSTANTS.TOOL_SEPARATOR}${raw.name}`,
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

/** @Owl.MCP.Manager.SplitTool - Parse namespaced MCP tool names */
export function splitQualifiedToolName(
  qualifiedName: string,
): QualifiedToolName {
  const sepIdx = qualifiedName.indexOf(MCP_CONSTANTS.TOOL_SEPARATOR)
  return Data.struct({
    serverName: sepIdx >= 0 ? qualifiedName.slice(0, sepIdx) : "",
    toolName:
      sepIdx >= 0
        ? qualifiedName.slice(sepIdx + MCP_CONSTANTS.TOOL_SEPARATOR.length)
        : qualifiedName,
  })
}

const mcpServerEntries = (config: McpConfig): Chunk.Chunk<McpServerEntry> =>
  Chunk.sortWith(
    Chunk.map(
      Chunk.fromIterable(Object.entries(config.mcpServers)),
      ([name, cfg]) => Data.struct({ name, config: cfg }),
    ),
    (entry) => entry.name,
    Order.string,
  )

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
      let servers = HashMap.empty<string, ConnectedServer>()
      let statuses = Chunk.empty<McpServerStatus>()

      for (const { name, config: cfg } of mcpServerEntries(config)) {
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
            const tools = Chunk.map(Chunk.fromIterable(listed.tools), (tool) =>
              toMcpTool(name, tool as Parameters<typeof toMcpTool>[1]),
            )
            return { ok: true as const, tools }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            return { ok: false as const, error: msg }
          }
        })

        if (result.ok) {
          servers = HashMap.set(
            servers,
            name,
            Data.struct({ name, client, tools: result.tools }),
          )
          statuses = Chunk.append(
            statuses,
            Data.struct({
              name,
              connected: true,
              toolCount: Chunk.size(result.tools),
            }),
          )
        } else {
          statuses = Chunk.append(
            statuses,
            Data.struct({
              name,
              connected: false,
              toolCount: 0,
              error: result.error,
            }),
          )
        }
      }

      const getTools = (): Effect.Effect<Chunk.Chunk<McpTool>> =>
        Effect.succeed(
          Chunk.flatMap(
            Chunk.fromIterable(HashMap.values(servers)),
            (server) => server.tools,
          ),
        )

      const callTool = (
        qualifiedName: string,
        input: Record<string, unknown>,
      ): Effect.Effect<string> => {
        const { serverName, toolName } = splitQualifiedToolName(qualifiedName)
        const server = Option.getOrUndefined(HashMap.get(servers, serverName))
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
            return formatMcpToolContent(content, result)
          } catch (e) {
            return `[tool error: ${e instanceof Error ? e.message : String(e)}]`
          }
        })
      }

      const getServers = (): Effect.Effect<readonly McpServerStatus[]> =>
        Effect.succeed(Chunk.toReadonlyArray(statuses))

      return { getTools, callTool, getServers }
    }),
  )
