/**
 * @Owl.TUI.Components.MarkdownText - Lightweight Ink markdown renderer
 *
 * Renders the most impactful markdown patterns for a coding assistant TUI:
 * - Fenced code blocks (``` or ~~~) with language label
 * - Inline code (`code`)
 * - Headers (##, ###)
 * - Bold (**text**)
 * - Bullet lists (-, *)
 * - Numbered lists (1., 2.)
 * - Horizontal rules (---)
 * - Plain paragraphs
 *
 * Design: pure render, no external deps beyond Ink/React. Fast enough for
 * re-renders on streaming chunks.
 *
 * @example
 * <MarkdownText content="## Hello\n\n```ts\nconst x = 1\n```" />
 */
import React, { memo } from "react"
import { Box, Text } from "ink"

interface MarkdownTextProps {
  readonly content: string
  readonly dimColor?: boolean
}

interface Block {
  type: "code" | "heading" | "rule" | "bullet" | "numbered" | "blank" | "text"
  content: string
  lang?: string
  level?: number
  index?: number
}

/** @Owl.TUI.Components.MarkdownText.CodeColor - Stable code block line coloring */
export function resolveCodeLineColor(
  lang: string | undefined,
  line: string,
): "green" | "red" | "cyan" | "gray" | "white" {
  if (lang !== "diff") {
    return "green"
  }

  if (line.startsWith("@@")) {
    return "cyan"
  }
  if (line.startsWith("+++") || line.startsWith("---")) {
    return "gray"
  }
  if (line.startsWith("+")) {
    return "green"
  }
  if (line.startsWith("-")) {
    return "red"
  }
  return "white"
}

/** Split raw markdown into block-level segments */
function parseBlocks(raw: string): Block[] {
  const lines = raw.split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ""

    // Fenced code block
    if (/^```|^~~~/.test(line)) {
      const fence = line.slice(0, 3)
      const lang = line.slice(fence.length).trim() || undefined
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i]?.startsWith(fence)) {
        codeLines.push(lines[i] ?? "")
        i++
      }
      i++ // skip closing fence
      blocks.push({
        type: "code",
        content: codeLines.join("\n"),
        ...(lang !== undefined ? { lang } : {}),
      })
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      blocks.push({ type: "rule", content: "" })
      i++
      continue
    }

    // Heading
    const headingMatch = /^(#{1,3})\s+(.+)/.exec(line)
    if (headingMatch != null) {
      blocks.push({
        type: "heading",
        content: headingMatch[2] ?? "",
        level: (headingMatch[1] ?? "").length,
      })
      i++
      continue
    }

    // Bullet list item
    const bulletMatch = /^(\s*)[-*+]\s+(.+)/.exec(line)
    if (bulletMatch != null) {
      blocks.push({ type: "bullet", content: bulletMatch[2] ?? "" })
      i++
      continue
    }

    // Numbered list item
    const numberedMatch = /^(\s*)\d+\.\s+(.+)/.exec(line)
    if (numberedMatch != null) {
      blocks.push({ type: "numbered", content: numberedMatch[2] ?? "" })
      i++
      continue
    }

    // Blank line
    if (line.trim().length === 0) {
      blocks.push({ type: "blank", content: "" })
      i++
      continue
    }

    // Text — collect contiguous non-special lines into one paragraph
    const textLines: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i]?.trim().length !== 0 &&
      !/^```|^~~~|^#{1,3}\s|^[-*+]\s|^\d+\.\s|^[-*_]{3,}\s*$/.test(
        lines[i] ?? "",
      )
    ) {
      textLines.push(lines[i] ?? "")
      i++
    }
    blocks.push({ type: "text", content: textLines.join(" ") })
  }

  return blocks
}

/** Render inline markdown (bold, inline code) inside a Text span */
function InlineText({
  text,
  dimColor,
}: {
  text: string
  dimColor?: boolean
}): React.ReactElement {
  // Split on **bold** and `code` patterns
  const parts: { t: string; bold?: boolean; code?: boolean }[] = []
  const remaining = text
  const pattern = /(\*\*(.+?)\*\*|`([^`]+)`)/g
  let lastIndex = 0

  for (const match of remaining.matchAll(pattern)) {
    if (match.index > lastIndex) {
      parts.push({ t: remaining.slice(lastIndex, match.index) })
    }
    if (match[0].startsWith("**")) {
      parts.push({ t: match[2] ?? "", bold: true })
    } else {
      parts.push({ t: match[3] ?? "", code: true })
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < remaining.length) {
    parts.push({ t: remaining.slice(lastIndex) })
  }

  return (
    <>
      {parts.map((p, idx) =>
        p.code === true ? (
          <Text key={idx} color="green" dimColor={dimColor ?? false}>
            {p.t}
          </Text>
        ) : p.bold === true ? (
          <Text key={idx} bold dimColor={dimColor ?? false}>
            {p.t}
          </Text>
        ) : (
          <Text key={idx} dimColor={dimColor ?? false}>
            {p.t}
          </Text>
        ),
      )}
    </>
  )
}

/** Render a single parsed block */
function BlockRenderer({
  block,
  dimColor,
}: {
  block: Block
  dimColor?: boolean
}): React.ReactElement | null {
  switch (block.type) {
    case "code":
      return (
        <Box
          flexDirection="column"
          marginY={0}
          paddingLeft={1}
          borderStyle="single"
          borderColor="gray"
        >
          {block.lang != null && (
            <Text color="gray" dimColor>
              {block.lang}
            </Text>
          )}
          {block.content.split("\n").map((line, index) => (
            <Text
              key={index}
              color={resolveCodeLineColor(block.lang, line)}
              dimColor={dimColor ?? false}
              wrap="wrap"
            >
              {line}
            </Text>
          ))}
        </Box>
      )

    case "heading":
      return (
        <Box marginBottom={0}>
          <Text
            bold
            color={
              block.level === 1 ? "cyan" : block.level === 2 ? "white" : "gray"
            }
            dimColor={dimColor ?? false}
          >
            {block.content}
          </Text>
        </Box>
      )

    case "rule":
      return (
        <Text color="gray" dimColor>
          {"─".repeat(40)}
        </Text>
      )

    case "bullet":
      return (
        <Box gap={1}>
          <Text color="cyan" dimColor={dimColor ?? false}>
            •
          </Text>
          <Text wrap="wrap" dimColor={dimColor ?? false}>
            <InlineText text={block.content} dimColor={dimColor ?? false} />
          </Text>
        </Box>
      )

    case "numbered":
      return (
        <Box gap={1}>
          <Text color="cyan" dimColor={dimColor ?? false}>
            {String((block.index ?? 0) + 1)}.
          </Text>
          <Text wrap="wrap" dimColor={dimColor ?? false}>
            <InlineText text={block.content} dimColor={dimColor ?? false} />
          </Text>
        </Box>
      )

    case "blank":
      return null

    case "text":
    default:
      return (
        <Text wrap="wrap" dimColor={dimColor ?? false}>
          <InlineText text={block.content} dimColor={dimColor ?? false} />
        </Text>
      )
  }
}

/** @Owl.TUI.Components.MarkdownText.Component - Root markdown renderer */
export const MarkdownText: React.FC<MarkdownTextProps> = memo(
  ({ content, dimColor }) => {
    const blocks = parseBlocks(content)
    let numberedIndex = 0

    return (
      <Box flexDirection="column" gap={0}>
        {blocks.map((block, idx) => {
          if (block.type === "numbered") {
            const b = { ...block, index: numberedIndex++ }
            return (
              <BlockRenderer key={idx} block={b} dimColor={dimColor ?? false} />
            )
          }
          numberedIndex = 0
          const rendered = (
            <BlockRenderer
              key={idx}
              block={block}
              dimColor={dimColor ?? false}
            />
          )
          return rendered
        })}
      </Box>
    )
  },
)
