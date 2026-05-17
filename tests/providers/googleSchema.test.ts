/** @Owl.Tests.Providers.Google.Schema - Gemini metadata schema tests */
import { describe, expect, it } from "vitest"
import { decodeGoogleUsageMetadata } from "../../src/providers/google/schema.js"

describe("decodeGoogleUsageMetadata", () => {
  it("accepts valid Gemini token metadata", () => {
    const decoded = decodeGoogleUsageMetadata({
      promptTokenCount: 10,
      candidatesTokenCount: 3,
    })

    expect(decoded?.promptTokenCount).toBe(10)
    expect(decoded?.candidatesTokenCount).toBe(3)
  })

  it("returns null for absent or malformed metadata", () => {
    expect(decodeGoogleUsageMetadata(undefined)).toBeNull()
    expect(
      decodeGoogleUsageMetadata({
        promptTokenCount: "10",
        candidatesTokenCount: 3,
      }),
    ).toBeNull()
  })
})
