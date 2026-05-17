/** @Owl.Providers.Google.Schema - Gemini response metadata contracts */
import { Either, Schema } from "effect"

/** @Owl.Providers.Google.UsageMetadata - Token usage metadata schema */
export const GoogleUsageMetadataSchema = Schema.Struct({
  promptTokenCount: Schema.optional(Schema.Number),
  candidatesTokenCount: Schema.optional(Schema.Number),
})

export type GoogleUsageMetadata = Schema.Schema.Type<
  typeof GoogleUsageMetadataSchema
>

export function decodeGoogleUsageMetadata(
  input: unknown,
): GoogleUsageMetadata | null {
  if (input === undefined || input === null) {
    return null
  }

  const decoded = Schema.decodeUnknownEither(GoogleUsageMetadataSchema)(input)
  return Either.isRight(decoded) ? decoded.right : null
}
