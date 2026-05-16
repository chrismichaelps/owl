/**
 * @Owl.MCP.Schema - MCP configuration schemas
 *
 * Defines the structure of the MCP configuration files.
 */
import { Schema } from "effect"

/** @Owl.MCP.Config.ServerSchema - Validated server process definition */
export const McpServerConfigSchema = Schema.Struct({
  command: Schema.String,
  args: Schema.optional(Schema.Array(Schema.String)),
  env: Schema.optional(
    Schema.Record({ key: Schema.String, value: Schema.String }),
  ),
  cwd: Schema.optional(Schema.String),
})
export type McpServerConfig = Schema.Schema.Type<typeof McpServerConfigSchema>

/** @Owl.MCP.Config.Schema - Validated MCP config document */
export const McpConfigSchema = Schema.Struct({
  mcpServers: Schema.Record({
    key: Schema.String,
    value: McpServerConfigSchema,
  }),
})
export type McpConfig = Schema.Schema.Type<typeof McpConfigSchema>
