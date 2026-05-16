/** @Owl.Providers.Anthropic.Errors - Anthropic SDK error translation */
import Anthropic from "@anthropic-ai/sdk"
import { HTTP_STATUS, PROVIDER_TIMEOUTS } from "../../core/constants/index.js"
import {
  ProviderAuthError,
  ProviderError,
  ProviderRateLimitError,
  ProviderTimeoutError,
} from "../../core/errors/index.js"

/** @Owl.Providers.Anthropic.ErrorMapping - Resilient error translation */
export const mapAnthropicError = (
  e: unknown,
):
  | ProviderError
  | ProviderAuthError
  | ProviderRateLimitError
  | ProviderTimeoutError => {
  if (e instanceof Anthropic.AuthenticationError) {
    return new ProviderAuthError({ provider: "anthropic", reason: e.message })
  }
  if (e instanceof Anthropic.RateLimitError) {
    return new ProviderRateLimitError({ provider: "anthropic" })
  }
  if (e instanceof Anthropic.APIConnectionTimeoutError) {
    return new ProviderTimeoutError({
      provider: "anthropic",
      timeoutMs: PROVIDER_TIMEOUTS.DEFAULT_MS,
    })
  }
  if (
    e instanceof Anthropic.APIError &&
    (e.status === HTTP_STATUS.ANTHROPIC_OVERLOADED ||
      e.message.includes('"type":"overloaded_error"'))
  ) {
    return new ProviderError({
      provider: "anthropic",
      message: "Service overloaded — retry after backoff",
      statusCode: HTTP_STATUS.ANTHROPIC_OVERLOADED,
    })
  }
  const statusCode =
    e instanceof Anthropic.APIError ? (e.status as number) : undefined
  return new ProviderError({
    provider: "anthropic",
    message: e instanceof Error ? e.message : String(e),
    ...(statusCode !== undefined ? { statusCode } : {}),
  })
}
