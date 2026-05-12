/** @Owl.Core.Errors - All tagged error types for the Owl system */
import { Data } from "effect"

export class ProviderError extends Data.TaggedError("ProviderError")<{
  readonly provider: string
  readonly message: string
  readonly statusCode?: number
}> {}

export class ProviderTimeoutError extends Data.TaggedError(
  "ProviderTimeoutError",
)<{
  readonly provider: string
  readonly timeoutMs: number
}> {}

export class ProviderAuthError extends Data.TaggedError("ProviderAuthError")<{
  readonly provider: string
  readonly reason: string
}> {}

export class ProviderRateLimitError extends Data.TaggedError(
  "ProviderRateLimitError",
)<{
  readonly provider: string
  readonly retryAfterMs?: number
}> {}

export class ProviderUnavailableError extends Data.TaggedError(
  "ProviderUnavailableError",
)<{
  readonly provider: string
  readonly reason: string
}> {}

export class ProviderStreamError extends Data.TaggedError(
  "ProviderStreamError",
)<{
  readonly provider: string
  readonly cause: unknown
}> {}

export class TokenBudgetExceededError extends Data.TaggedError(
  "TokenBudgetExceededError",
)<{
  readonly budget: number
  readonly actual: number
  readonly mode: string
}> {}

export class TokenCountError extends Data.TaggedError("TokenCountError")<{
  readonly message: string
}> {}

export class GovernanceViolationError extends Data.TaggedError(
  "GovernanceViolationError",
)<{
  readonly rule: string
  readonly module: string
  readonly detail: string
}> {}

export class HashRegistryError extends Data.TaggedError("HashRegistryError")<{
  readonly path: string
  readonly reason: string
}> {}

export class GrammarDriftError extends Data.TaggedError("GrammarDriftError")<{
  readonly file: string
  readonly usages: readonly string[]
}> {}

export class SeamTestGateError extends Data.TaggedError("SeamTestGateError")<{
  readonly seamId: string
  readonly missingRequirements: readonly string[]
}> {}

export class MutationError extends Data.TaggedError("MutationError")<{
  readonly stage: string
  readonly file: string
  readonly reason: string
}> {}

export class RollbackError extends Data.TaggedError("RollbackError")<{
  readonly files: readonly string[]
  readonly reason: string
}> {}

export class TLIError extends Data.TaggedError("TLIError")<{
  readonly file: string
  readonly line: number
  readonly reason: string
}> {}

export class DiffGenerationError extends Data.TaggedError(
  "DiffGenerationError",
)<{
  readonly file: string
  readonly reason: string
}> {}

export class CommandParseError extends Data.TaggedError("CommandParseError")<{
  readonly input: string
  readonly reason: string
}> {}

export class CommandNotFoundError extends Data.TaggedError(
  "CommandNotFoundError",
)<{
  readonly command: string
}> {}

export class RegistryError extends Data.TaggedError("RegistryError")<{
  readonly path: string
  readonly reason: string
}> {}

export class ConfigError extends Data.TaggedError("ConfigError")<{
  readonly key: string
  readonly reason: string
}> {}

export class OrchestratorError extends Data.TaggedError("OrchestratorError")<{
  readonly phase: string
  readonly reason: string
}> {}

export class ContextOverflowError extends Data.TaggedError(
  "ContextOverflowError",
)<{
  readonly tokens: number
  readonly limit: number
}> {}
