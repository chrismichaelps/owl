/** @Owl.Core.Logging - Structured logging service backed by Effect Logger */

import { Context, Effect, Layer } from "effect"

/** @Owl.Core.Logging.Service - Structured log emission interface */
export interface OwlLoggerService {
  readonly debug: (
    msg: string,
    ctx: Record<string, unknown>,
  ) => Effect.Effect<void>
  readonly info: (
    msg: string,
    ctx: Record<string, unknown>,
  ) => Effect.Effect<void>
  readonly warn: (
    msg: string,
    ctx: Record<string, unknown>,
  ) => Effect.Effect<void>
  readonly error: (
    msg: string,
    ctx: Record<string, unknown>,
  ) => Effect.Effect<void>
}

/** @Owl.Core.Logging.Adapter - Effect-TS service definition */
export class OwlLogger extends Context.Tag("OwlLogger")<
  OwlLogger,
  OwlLoggerService
>() {}

/** @Owl.Core.Logging.Factory - Logger implementation factory */
const makeLogger = (): OwlLoggerService => ({
  debug: (msg, ctx) =>
    Effect.logDebug(msg).pipe(
      Effect.annotateLogs(ctx as Record<string, string>),
    ),
  info: (msg, ctx) =>
    Effect.logInfo(msg).pipe(
      Effect.annotateLogs(ctx as Record<string, string>),
    ),
  warn: (msg, ctx) =>
    Effect.logWarning(msg).pipe(
      Effect.annotateLogs(ctx as Record<string, string>),
    ),
  error: (msg, ctx) =>
    Effect.logError(msg).pipe(
      Effect.annotateLogs(ctx as Record<string, string>),
    ),
})

/** @Owl.Core.Logging.Live - Production logger layer */
export const OwlLoggerLive = Layer.succeed(OwlLogger, makeLogger())

/** @Owl.Core.Logging.Context - Contextual logging middleware */
export const withContext = <A, E, R>(
  logger: OwlLoggerService,
  ctx: Record<string, unknown>,
  fn: (l: OwlLoggerService) => Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => {
  const contextLogger: OwlLoggerService = {
    debug: (msg, extra) => logger.debug(msg, { ...ctx, ...extra }),
    info: (msg, extra) => logger.info(msg, { ...ctx, ...extra }),
    warn: (msg, extra) => logger.warn(msg, { ...ctx, ...extra }),
    error: (msg, extra) => logger.error(msg, { ...ctx, ...extra }),
  }
  return fn(contextLogger)
}
