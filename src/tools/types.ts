/**
 * @Owl.Tools.Types - Shared interfaces for built-in agentic tools
 *
 * BuiltInTool is the internal descriptor for each tool.
 * BuiltInToolsService is the Effect service interface consumed by provider adapters.
 */
import type { Chunk, Effect } from "effect"
import type { McpTool } from "../mcp/manager.js"
import type { ToolExecutionError } from "../core/errors/index.js"
import type { ToolRiskAssessment, ToolRiskLevel } from "./risk.js"

/** Internal descriptor for a built-in tool */
export interface BuiltInTool {
  readonly name: string
  readonly description: string
  readonly input_schema: McpTool["input_schema"]
  readonly modelVisible: boolean
  readonly execute: (
    input: Record<string, unknown>,
    cwd: string,
  ) => Effect.Effect<string, ToolExecutionError>
}

/** Effect service interface — mirrors McpManagerService so adapters can treat both uniformly */
export interface BuiltInToolsService {
  readonly listAllTools: () => Chunk.Chunk<{
    readonly name: string
    readonly description: string
    readonly modelVisible: boolean
    readonly riskLevel: ToolRiskLevel
  }>
  readonly getTools: () => Chunk.Chunk<McpTool>
  readonly assessToolRisk: (
    name: string,
    input?: Record<string, unknown>,
  ) => ToolRiskAssessment
  readonly callTool: (
    name: string,
    input: Record<string, unknown>,
  ) => Effect.Effect<string, ToolExecutionError>
  readonly hasTool: (name: string) => boolean
}
