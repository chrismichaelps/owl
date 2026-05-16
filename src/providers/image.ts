/**
 * @Owl.Providers.Image - Parse owl:image tags from prompt content into vision blocks
 *
 * When @file mentions include image files (png/jpg/gif/webp), expandMentions
 * produces owl:image tags with base64 data. This module parses those tags
 * from message content and returns an Anthropic-compatible multi-modal content array.
 *
 * @example
 * parseImageBlocks('<owl:image path="a.png" mime="image/png" data="abc..."/>\n\nDescribe it')
 * // → [{ type: "image", source: { type: "base64", media_type: "image/png", data: "abc..." } },
 * //    { type: "text", text: "Describe it" }]
 */
import type Anthropic from "@anthropic-ai/sdk"
import { Chunk } from "effect"

/** Regex that matches a single owl:image tag */
const OWL_IMAGE_TAG =
  /<owl:image\s+path="[^"]*"\s+mime="([^"]*)"\s+data="([^"]*)"\s*\/>/g

export type AnthropicContentBlock =
  | Anthropic.TextBlockParam
  | Anthropic.ImageBlockParam

/**
 * @Owl.Providers.Image.hasImageTags - Quick check before parsing
 */
export function hasImageTags(content: string): boolean {
  return content.includes("<owl:image ")
}

/**
 * @Owl.Providers.Image.parseImageBlocks - Convert content string to multi-modal blocks
 *
 * Returns `null` when there are no image tags (caller uses plain string content).
 * Returns an array of text + image blocks when images are present.
 */
export function parseImageBlocks(
  content: string,
): AnthropicContentBlock[] | null {
  if (!hasImageTags(content)) return null

  let blocks = Chunk.empty<AnthropicContentBlock>()
  let lastIndex = 0
  let match: RegExpExecArray | null

  OWL_IMAGE_TAG.lastIndex = 0

  while ((match = OWL_IMAGE_TAG.exec(content)) !== null) {
    const [fullTag, mime, data] = match
    const start = match.index

    // Text before this image tag
    if (start > lastIndex) {
      const text = content.slice(lastIndex, start).trim()
      if (text.length > 0) {
        blocks = Chunk.append(blocks, { type: "text", text })
      }
    }

    // Image block
    if (mime !== undefined && data !== undefined && data.length > 0) {
      blocks = Chunk.append(blocks, {
        type: "image",
        source: {
          type: "base64",
          media_type: mime as Anthropic.Base64ImageSource["media_type"],
          data,
        },
      })
    }

    lastIndex = start + fullTag.length
  }

  // Remaining text after the last image
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim()
    if (text.length > 0) {
      blocks = Chunk.append(blocks, { type: "text", text })
    }
  }

  return !Chunk.isEmpty(blocks) ? Chunk.toArray(blocks) : null
}
