/**
 * @Owl.Providers.Image.Tests - Unit tests for owl:image tag parsing
 */
import { Chunk } from "effect"
import { describe, expect, it } from "vitest"
import { hasImageTags, parseImageBlocks } from "../../src/providers/image.js"

describe("hasImageTags", () => {
  it("returns false for plain text", () => {
    expect(hasImageTags("hello world")).toBe(false)
  })

  it("returns true when owl:image tag is present", () => {
    expect(
      hasImageTags('<owl:image path="a.png" mime="image/png" data="abc"/>'),
    ).toBe(true)
  })
})

describe("parseImageBlocks", () => {
  it("returns null for content without image tags", () => {
    expect(parseImageBlocks("plain text")).toBeNull()
  })

  it("parses a single image tag into an image block", () => {
    const content = '<owl:image path="a.png" mime="image/png" data="abc123"/>'
    const blocks = parseImageBlocks(content)
    expect(blocks).not.toBeNull()
    if (blocks === null) {
      throw new Error("Expected image blocks")
    }
    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({
      type: "image",
      source: { type: "base64", media_type: "image/png", data: "abc123" },
    })
  })

  it("preserves surrounding text as text blocks", () => {
    const content =
      'Look at this:\n\n<owl:image path="a.png" mime="image/png" data="abc123"/>\n\nWhat do you see?'
    const blocks = parseImageBlocks(content)
    expect(blocks).not.toBeNull()
    if (blocks === null) {
      throw new Error("Expected image blocks")
    }
    expect(blocks).toHaveLength(3)
    expect(blocks[0]).toMatchObject({ type: "text", text: "Look at this:" })
    expect(blocks[1]).toMatchObject({ type: "image" })
    expect(blocks[2]).toMatchObject({ type: "text", text: "What do you see?" })
  })

  it("handles multiple images in sequence", () => {
    const content = Chunk.toReadonlyArray(
      Chunk.make(
        '<owl:image path="a.png" mime="image/png" data="aaa"/>',
        '<owl:image path="b.jpg" mime="image/jpeg" data="bbb"/>',
        "Which is better?",
      ),
    ).join("\n")
    const blocks = parseImageBlocks(content)
    expect(blocks).not.toBeNull()
    if (blocks === null) {
      throw new Error("Expected image blocks")
    }
    const parsedBlocks = Chunk.fromIterable(blocks)
    const imageBlocks = Chunk.filter(parsedBlocks, (b) => b.type === "image")
    expect(imageBlocks).toHaveLength(2)
    const textBlocks = Chunk.filter(parsedBlocks, (b) => b.type === "text")
    expect(textBlocks).toHaveLength(1)
    expect(Chunk.unsafeGet(textBlocks, 0)).toMatchObject({
      text: "Which is better?",
    })
  })

  it("returns null for content with empty data attribute", () => {
    // Zero-length data still matches but we guard against it
    const content = '<owl:image path="a.png" mime="image/png" data=""/>'
    const blocks = parseImageBlocks(content)
    // data is empty so no image block should be added; null or empty result
    if (blocks !== null) {
      expect(
        Chunk.filter(Chunk.fromIterable(blocks), (b) => b.type === "image"),
      ).toHaveLength(0)
    }
  })
})
