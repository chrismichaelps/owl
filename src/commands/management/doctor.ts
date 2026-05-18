/** @Owl.Commands.Management.Doctor - RuntimeDiagnostic readiness report */
import { Chunk, Effect } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import type { UsageMetricsService } from "../../engine/metrics/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { McpManagerService, McpServerStatus } from "../../mcp/index.js"
import type {
  ProviderHealthStatus,
  ProviderReliabilityStatus,
  ProviderRouterService,
} from "../../providers/router/index.js"
import type { ProviderCapability } from "../../providers/types.js"
import type { ContextCacheService } from "../../tokens/cache/index.js"
import type { BuiltInToolsService } from "../../tools/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

export interface DoctorCommandDependencies {
  readonly providerRouter: ProviderRouterService
  readonly mcpManager: McpManagerService
  readonly builtInTools: BuiltInToolsService
  readonly sessionMemory: SessionMemoryService
  readonly usageMetrics: UsageMetricsService
  readonly contextCache: ContextCacheService
}

/** @Owl.Commands.Management.Doctor.Section - Format diagnostic section */
export const formatDoctorSection = (
  title: string,
  lines: Chunk.Chunk<string>,
): string =>
  title +
  "\n" +
  (Chunk.isEmpty(lines) ? "- none" : Chunk.toReadonlyArray(lines).join("\n"))

const formatCapability = (capability: ProviderCapability): string =>
  "- " +
  capability.providerId +
  "/" +
  capability.modelId +
  " · " +
  capability.reasoningDepth +
  " · ctx " +
  String(capability.contextWindow)

const formatHealth = (health: ProviderHealthStatus): string =>
  "- " +
  health.provider +
  ": " +
  (health.healthy ? "healthy" : "unhealthy") +
  (health.message === null ? "" : " — " + health.message)

const formatReliability = (status: ProviderReliabilityStatus): string =>
  "- " +
  status.provider +
  ": score " +
  status.score.toFixed(COMMAND_CONSTANTS.DOCTOR_SCORE_DECIMALS) +
  " · " +
  String(status.successes) +
  " ok / " +
  String(status.failures) +
  " fail"

const formatMcpServer = (server: McpServerStatus): string =>
  "- " +
  server.name +
  ": " +
  (server.connected ? "connected" : "disconnected") +
  " · " +
  String(server.toolCount) +
  " tools" +
  (server.error === undefined ? "" : " — " + server.error)

const warningLines = (
  capabilities: Chunk.Chunk<ProviderCapability>,
  health: Chunk.Chunk<ProviderHealthStatus>,
  servers: Chunk.Chunk<McpServerStatus>,
): Chunk.Chunk<string> => {
  const providerWarning = Chunk.isEmpty(capabilities)
    ? Chunk.make("- No Providers are registered.")
    : Chunk.empty<string>()
  const unhealthyProviders = Chunk.map(
    Chunk.filter(health, (provider) => !provider.healthy),
    (provider) => "- Provider unhealthy: " + provider.provider,
  )
  const disconnectedServers = Chunk.map(
    Chunk.filter(servers, (server) => !server.connected),
    (server) => "- MCP disconnected: " + server.name,
  )

  return Chunk.appendAll(
    Chunk.appendAll(providerWarning, unhealthyProviders),
    disconnectedServers,
  )
}

/** @Owl.Commands.Management.Doctor.Factory - Create the /doctor handler */
export function makeDoctorCommand(
  deps: DoctorCommandDependencies,
): CommandHandler {
  return {
    name: "doctor",
    description: "Run a read-only runtime diagnostic report: /doctor",
    execute: (): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const capabilities = yield* deps.providerRouter.listCapabilities()
        const health = yield* deps.providerRouter.checkHealth()
        const reliability = yield* deps.providerRouter.listReliability()
        const servers = Chunk.fromIterable(yield* deps.mcpManager.getServers())
        const tools = deps.builtInTools.listAllTools()
        const visibleTools = Chunk.filter(tools, (tool) => tool.modelVisible)
        const turns = yield* deps.sessionMemory.getTurns()
        const metrics = yield* deps.usageMetrics.snapshot()
        const savedTokens = yield* deps.contextCache.totalSavedTokens()

        const sections = Chunk.make(
          formatDoctorSection(
            "Providers",
            Chunk.appendAll(
              Chunk.map(capabilities, formatCapability),
              Chunk.appendAll(
                Chunk.map(health, formatHealth),
                Chunk.map(reliability, formatReliability),
              ),
            ),
          ),
          formatDoctorSection(
            "MCP servers",
            Chunk.map(servers, formatMcpServer),
          ),
          formatDoctorSection(
            "Tools",
            Chunk.make(
              "- model-visible: " + String(Chunk.size(visibleTools)),
              "- internal-only: " +
                String(Chunk.size(tools) - Chunk.size(visibleTools)),
            ),
          ),
          formatDoctorSection(
            "Session",
            Chunk.make(
              "- turns: " + String(Chunk.size(turns)),
              "- inference calls: " + String(metrics.totalCalls),
              "- inference tokens: " + String(metrics.totalTokens),
              "- average latency: " + String(metrics.averageLatencyMs) + "ms",
            ),
          ),
          formatDoctorSection(
            "Context cache",
            Chunk.make("- saved tokens: " + String(savedTokens)),
          ),
          formatDoctorSection(
            "Warnings",
            warningLines(capabilities, health, servers),
          ),
        )

        return { output: Chunk.toReadonlyArray(sections).join("\n\n") }
      }).pipe(
        Effect.mapError(
          (error) =>
            new CommandParseError({
              input: "/doctor",
              reason: String(error),
            }),
        ),
      ),
  }
}
