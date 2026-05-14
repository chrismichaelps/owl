/**
 * @Owl.Core.Errors - All tagged error types for the Owl system
 *
 * Errors use Effect's Data.TaggedError for exhaustive typing.
 * Every error is typed so catchers can handle them precisely.
 *
 * Error categories:
 * - Providers: Upstream LLM failures (auth, rate limit, timeout, etc.)
 * - Tokens: Budget/counting failures
 * - Governance: FMCF invariant violations
 * - Mutations: File editing failures
 * - Infrastructure: Command/config errors
 */
import { Data } from "effect"

/**
 * @Owl.Core.Errors.Providers - Upstream LLM service failure modes
 *
 * ProviderError: Generic failure with status code
 * ProviderTimeoutError: Request exceeded timeout
 * ProviderAuthError: Invalid or missing API key
 * ProviderRateLimitError: Too many requests
 * ProviderUnavailableError: No providers match requirements
 * ProviderStreamError: Streaming chunk failed
 */

/** Generic provider error with optional HTTP status code */
export class ProviderError extends Data.TaggedError("ProviderError")<{
  readonly provider: string
  readonly message: string
  readonly statusCode?: number
}> {}

/** Request exceeded timeout threshold */
export class ProviderTimeoutError extends Data.TaggedError(
  "ProviderTimeoutError",
)<{
  readonly provider: string
  readonly timeoutMs: number
}> {}

/** Authentication failed (invalid API key, etc.) */
export class ProviderAuthError extends Data.TaggedError("ProviderAuthError")<{
  readonly provider: string
  readonly reason: string
}> {}

/** Rate limit exceeded with optional retry delay */
export class ProviderRateLimitError extends Data.TaggedError(
  "ProviderRateLimitError",
)<{
  readonly provider: string
  readonly retryAfterMs?: number
}> {}

/** No provider available for requirements */
export class ProviderUnavailableError extends Data.TaggedError(
  "ProviderUnavailableError",
)<{
  readonly provider: string
  readonly reason: string
}> {}

/** Streaming response encountered an error */
export class ProviderStreamError extends Data.TaggedError(
  "ProviderStreamError",
)<{
  readonly provider: string
  readonly cause: unknown
}> {}

/**
 * @Owl.Core.Errors.Tokens - Budgeting and counting failures
 *
 * TokenBudgetExceededError: Consumed > budget
 * TokenCountError: Counting failed (encoding error, etc.)
 */

/** Runtime budget exceeded */
export class TokenBudgetExceededError extends Data.TaggedError(
  "TokenBudgetExceededError",
)<{
  readonly budget: number
  readonly actual: number
  readonly mode: string
}> {}

/** Token counting failed */
export class TokenCountError extends Data.TaggedError("TokenCountError")<{
  readonly message: string
}> {}

/**
 * @Owl.Core.Errors.Governance - FMCF architectural and forensic violations
 *
 * GovernanceViolationError: Invariant, role transition, or shard split violation
 * HashRegistryError: Failed to read /hashes/ registry
 * GrammarDriftError: Vocabulary drift detected
 * SeamTestGateError: Test coverage below threshold
 */

/** Constitutional invariant violated */
export class GovernanceViolationError extends Data.TaggedError(
  "GovernanceViolationError",
)<{
  readonly rule: string
  readonly module: string
  readonly detail: string
}> {}

/** Registry read/write failed */
export class HashRegistryError extends Data.TaggedError("HashRegistryError")<{
  readonly path: string
  readonly reason: string
}> {}

/** Grammar usage doesn't match registered vocabulary */
export class GrammarDriftError extends Data.TaggedError("GrammarDriftError")<{
  readonly file: string
  readonly usages: readonly string[]
}> {}

/** Seam test coverage below threshold */
export class SeamTestGateError extends Data.TaggedError("SeamTestGateError")<{
  readonly seamId: string
  readonly missingRequirements: readonly string[]
}> {}

/**
 * @Owl.Core.Errors.Mutations - File manipulation and rollback failures
 *
 * MutationError: File not found, permission denied, size exceeded
 * RollbackError: Failed to restore files
 * TLIError: String not found or ambiguous
 * DiffGenerationError: Patch computation failed
 */

/** File I/O failure during mutation */
export class MutationError extends Data.TaggedError("MutationError")<{
  readonly stage: string
  readonly file: string
  readonly reason: string
}> {}

/** Rollback operation failed */
export class RollbackError extends Data.TaggedError("RollbackError")<{
  readonly files: readonly string[]
  readonly reason: string
}> {}

/** TLI string matching failed */
export class TLIError extends Data.TaggedError("TLIError")<{
  readonly file: string
  readonly line: number
  readonly reason: string
}> {}

/** Diff generation failed */
export class DiffGenerationError extends Data.TaggedError(
  "DiffGenerationError",
)<{
  readonly file: string
  readonly reason: string
}> {}

/**
 * @Owl.Core.Errors.Infrastructure - System-level command and config failures
 *
 * CommandParseError: Invalid slash command syntax
 * CommandNotFoundError: Unknown command name
 * RegistryError: Registry operation failed
 * ConfigError: Environment variable invalid
 * OrchestratorError: Agent loop failure
 * ContextOverflowError: Context exceeded limits
 */

/** Slash command parsing failed */
export class CommandParseError extends Data.TaggedError("CommandParseError")<{
  readonly input: string
  readonly reason: string
}> {}

/** Command name not found in registry */
export class CommandNotFoundError extends Data.TaggedError(
  "CommandNotFoundError",
)<{
  readonly command: string
}> {}

/** Registry operation failed */
export class RegistryError extends Data.TaggedError("RegistryError")<{
  readonly path: string
  readonly reason: string
}> {}

/** Environment variable invalid */
export class ConfigError extends Data.TaggedError("ConfigError")<{
  readonly key: string
  readonly reason: string
}> {}

/** Orchestrator execution failed */
export class OrchestratorError extends Data.TaggedError("OrchestratorError")<{
  readonly phase: string
  readonly reason: string
}> {}

/**
 * @Owl.Core.Errors.Orchestration - High-level engine and context failures
 */

/** Context window exceeded provider limits */
export class ContextOverflowError extends Data.TaggedError(
  "ContextOverflowError",
)<{
  readonly tokens: number
  readonly limit: number
}> {}
