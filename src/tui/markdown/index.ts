/** @Owl.TUI.Markdown - Pure markdown parsing and color resolution */
import { Chunk, Data } from "effect"
import {
  EDITOR_CONSTANTS,
  MARKDOWN_BLOCK_TYPES,
  MARKDOWN_CONSTANTS,
} from "../../core/constants/index.js"

export type CodeLineColor =
  | "green"
  | "red"
  | "cyan"
  | "gray"
  | "white"
  | "yellow"

export type SideBySideDiffSegments = Readonly<{
  readonly left: string
  readonly leftColor: CodeLineColor
  readonly separator: string
  readonly right: string
  readonly rightColor: CodeLineColor
}>

export interface MarkdownBlock {
  readonly type:
    | (typeof MARKDOWN_BLOCK_TYPES)[keyof typeof MARKDOWN_BLOCK_TYPES]
    | "heading"
    | "rule"
    | "blank"
  readonly content: string
  readonly lang?: string
  readonly level?: number
  readonly index?: number
}

export function resolveCodeLineColor(
  lang: string | undefined,
  line: string,
): CodeLineColor {
  if (lang === "text") {
    if (line.startsWith("Side-by-side diff:")) return "cyan"
    if (line.startsWith("@@")) return "cyan"
    if (line.includes(EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_SEPARATOR)) {
      return "white"
    }
    if (/^-{3,}/.test(line)) return "gray"
  }

  if (lang !== "diff") return "green"
  if (line.startsWith("@@")) return "cyan"
  if (line.startsWith("+++") || line.startsWith("---")) return "gray"
  if (line.startsWith("+")) return "green"
  if (line.startsWith("-")) return "red"
  return "white"
}

const resolveSideColor = (segment: string): CodeLineColor => {
  if (segment.startsWith("- ")) return "red"
  if (segment.startsWith("+ ")) return "green"
  return "white"
}

export function resolveSideBySideDiffSegments(
  line: string,
): SideBySideDiffSegments | null {
  const separatorIndex = line.indexOf(
    EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_SEPARATOR,
  )
  if (separatorIndex < 0) return null

  const left = line.slice(0, separatorIndex)
  const right = line.slice(
    separatorIndex + EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_SEPARATOR.length,
  )
  return Data.struct({
    left,
    leftColor: resolveSideColor(left),
    separator: EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_SEPARATOR,
    right,
    rightColor: resolveSideColor(right),
  })
}

const appendBlock = (
  blocks: Chunk.Chunk<MarkdownBlock>,
  block: MarkdownBlock,
): Chunk.Chunk<MarkdownBlock> => Chunk.append(blocks, Data.struct(block))

export function parseMarkdownBlocks(raw: string): Chunk.Chunk<MarkdownBlock> {
  const lines = raw.split("\n")
  let blocks = Chunk.empty<MarkdownBlock>()
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ""

    if (/^```|^~~~/.test(line)) {
      const fence = line.slice(0, MARKDOWN_CONSTANTS.CODE_FENCE_LENGTH)
      const lang = line.slice(fence.length).trim() || undefined
      let codeLines = Chunk.empty<string>()
      i++
      while (i < lines.length && !lines[i]?.startsWith(fence)) {
        codeLines = Chunk.append(codeLines, lines[i] ?? "")
        i++
      }
      i++
      blocks = appendBlock(blocks, {
        type: MARKDOWN_BLOCK_TYPES.CODE,
        content: Chunk.toReadonlyArray(codeLines).join("\n"),
        ...(lang !== undefined ? { lang } : {}),
      })
      continue
    }

    if (/^[-*_]{3,}\s*$/.test(line)) {
      blocks = appendBlock(blocks, { type: "rule", content: "" })
      i++
      continue
    }

    const headingMatch = /^(#{1,3})\s+(.+)/.exec(line)
    if (headingMatch != null) {
      blocks = appendBlock(blocks, {
        type: "heading",
        content: headingMatch[2] ?? "",
        level: (headingMatch[1] ?? "").length,
      })
      i++
      continue
    }

    const bulletMatch = /^(\s*)[-*+]\s+(.+)/.exec(line)
    if (bulletMatch != null) {
      blocks = appendBlock(blocks, {
        type: MARKDOWN_BLOCK_TYPES.BULLET,
        content: bulletMatch[2] ?? "",
      })
      i++
      continue
    }

    const numberedMatch = /^(\s*)\d+\.\s+(.+)/.exec(line)
    if (numberedMatch != null) {
      blocks = appendBlock(blocks, {
        type: MARKDOWN_BLOCK_TYPES.NUMBERED,
        content: numberedMatch[2] ?? "",
      })
      i++
      continue
    }

    const quoteMatch = /^>\s?(.*)/.exec(line)
    if (quoteMatch != null) {
      let quoteLines = Chunk.make(quoteMatch[1] ?? "")
      i++
      while (i < lines.length) {
        const nextQuoteMatch = /^>\s?(.*)/.exec(lines[i] ?? "")
        if (nextQuoteMatch == null) break
        quoteLines = Chunk.append(quoteLines, nextQuoteMatch[1] ?? "")
        i++
      }
      blocks = appendBlock(blocks, {
        type: MARKDOWN_BLOCK_TYPES.QUOTE,
        content: Chunk.toReadonlyArray(quoteLines).join("\n"),
      })
      continue
    }

    if (line.trim().length === 0) {
      blocks = appendBlock(blocks, { type: "blank", content: "" })
      i++
      continue
    }

    let textLines = Chunk.make(line)
    i++
    while (
      i < lines.length &&
      lines[i]?.trim().length !== 0 &&
      !/^```|^~~~|^#{1,3}\s|^[-*+]\s|^\d+\.\s|^>\s?|^[-*_]{3,}\s*$/.test(
        lines[i] ?? "",
      )
    ) {
      textLines = Chunk.append(textLines, lines[i] ?? "")
      i++
    }
    blocks = appendBlock(blocks, {
      type: MARKDOWN_BLOCK_TYPES.TEXT,
      content: Chunk.toReadonlyArray(textLines).join(" "),
    })
  }

  return blocks
}
