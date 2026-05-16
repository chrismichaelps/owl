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
import { Chunk } from "effect"
import { MARKDOWN_BLOCK_TYPES } from "../../core/constants/index.js"
import {
  parseMarkdownBlocks,
  resolveCodeLineColor,
  resolveSideBySideDiffSegments,
  type MarkdownBlock,
} from "../markdown/index.js"

export { resolveCodeLineColor, resolveSideBySideDiffSegments }

interface MarkdownTextProps {
  readonly content: string
  readonly dimColor?: boolean
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

function CodeLineText({
  lang,
  line,
  dimColor,
}: {
  lang: string | undefined
  line: string
  dimColor?: boolean
}): React.ReactElement {
  const sideBySide =
    lang === "text" ? resolveSideBySideDiffSegments(line) : null

  if (sideBySide !== null) {
    return (
      <Text wrap="wrap" dimColor={dimColor ?? false}>
        <Text color={sideBySide.leftColor}>{sideBySide.left}</Text>
        <Text color="gray">{sideBySide.separator}</Text>
        <Text color={sideBySide.rightColor}>{sideBySide.right}</Text>
      </Text>
    )
  }

  return (
    <Text
      color={resolveCodeLineColor(lang, line)}
      dimColor={dimColor ?? false}
      wrap="wrap"
    >
      {line}
    </Text>
  )
}

/** Render a single parsed block */
function BlockRenderer({
  block,
  dimColor,
}: {
  block: MarkdownBlock
  dimColor?: boolean
}): React.ReactElement | null {
  switch (block.type) {
    case MARKDOWN_BLOCK_TYPES.CODE:
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
          {Chunk.toReadonlyArray(
            Chunk.map(
              Chunk.fromIterable(block.content.split("\n")),
              (line, index) => (
                <CodeLineText
                  key={index}
                  lang={block.lang}
                  line={line}
                  dimColor={dimColor ?? false}
                />
              ),
            ),
          )}
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

    case MARKDOWN_BLOCK_TYPES.BULLET:
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

    case MARKDOWN_BLOCK_TYPES.NUMBERED:
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

    case MARKDOWN_BLOCK_TYPES.TEXT:
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
    const blocks = parseMarkdownBlocks(content)
    let numberedIndex = 0

    return (
      <Box flexDirection="column" gap={0}>
        {Chunk.toReadonlyArray(
          Chunk.map(blocks, (block, idx) => {
            if (block.type === MARKDOWN_BLOCK_TYPES.NUMBERED) {
              const b = { ...block, index: numberedIndex++ }
              return (
                <BlockRenderer
                  key={idx}
                  block={b}
                  dimColor={dimColor ?? false}
                />
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
          }),
        )}
      </Box>
    )
  },
)
