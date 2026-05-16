/** @Owl.Tests.Core.Format - Display formatting regression tests */
import { describe, expect, it } from "vitest"
import { formatBytes, truncate } from "../../src/core/utils/format.js"

describe("formatBytes", () => {
  it("formats bytes below one kilobyte", () => {
    expect(formatBytes(512)).toBe("512b")
  })

  it("formats kilobytes with one decimal place", () => {
    expect(formatBytes(1_536)).toBe("1.5kb")
  })

  it("formats megabytes with one decimal place", () => {
    expect(formatBytes(1_572_864)).toBe("1.5mb")
  })
})

describe("truncate", () => {
  it("normalizes newlines before truncating", () => {
    expect(truncate("hello\nworld", 20)).toBe("hello world")
  })

  it("appends the marker when text exceeds the maximum", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcd…")
  })
})
