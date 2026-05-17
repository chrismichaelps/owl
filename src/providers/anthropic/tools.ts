/** @Owl.Providers.Anthropic.Tools - Anthropic tool adapter helpers */
import type Anthropic from "@anthropic-ai/sdk"
import { Chunk, Effect } from "effect"
import { ProviderError } from "../../core/errors/index.js"
import { parseImageBlocks } from "../image.js"
import { applyAnthropicToolResultBudget } from "./toolResult.js"
import type { Message } from "../../core/schema/index.js"
import type { McpManagerService } from "../../mcp/index.js"
import type { BuiltInToolsService } from "../../tools/index.js"

export const toAnthropicMessages = (
  messages: readonly Message[],
): Chunk.Chunk<Anthropic.MessageParam> =>
  Chunk.map(Chunk.fromIterable(messages), (message): Anthropic.MessageParam => {
    const imageBlocks = parseImageBlocks(message.content)
    return {
      role: message.role as "user" | "assistant",
      content: imageBlocks ?? message.content,
    }
  })

const toAnthropicTool = (tool: {
  readonly name: string
  readonly description: string
  readonly input_schema: unknown
}): Anthropic.Tool => ({
  name: tool.name,
  description: tool.description,
  input_schema: tool.input_schema as Anthropic.Tool["input_schema"],
})

export const loadAnthropicTools = (
  builtInTools: BuiltInToolsService | null,
  mcpManager: McpManagerService | null,
): Effect.Effect<Chunk.Chunk<Anthropic.Tool>> =>
  Effect.gen(function* () {
    const builtInToolDescriptors =
      builtInTools !== null ? builtInTools.getTools() : []
    const mcpTools = mcpManager !== null ? yield* mcpManager.getTools() : []
    return Chunk.map(
      Chunk.appendAll(
        Chunk.fromIterable(builtInToolDescriptors),
        Chunk.fromIterable(mcpTools),
      ),
      toAnthropicTool,
    )
  })

export const executeAnthropicTool = (
  toolName: string,
  input: Record<string, unknown>,
  builtInTools: BuiltInToolsService | null,
  mcpManager: McpManagerService | null,
): Effect.Effect<string, ProviderError> => {
  if (builtInTools?.hasTool(toolName)) {
    return builtInTools.callTool(toolName, input).pipe(
      Effect.map(applyAnthropicToolResultBudget),
      Effect.mapError(
        (error) =>
          new ProviderError({
            provider: "anthropic",
            message: `Tool ${toolName} failed: ${error.reason}`,
          }),
      ),
    )
  }

  if (mcpManager !== null) {
    return mcpManager
      .callTool(toolName, input)
      .pipe(Effect.map(applyAnthropicToolResultBudget))
  }

  return Effect.succeed(`Tool ${toolName} not found`)
}
