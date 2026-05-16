/** @Owl.TUI.Components.FileMentionPalette - Autocomplete popup for @file mentions */
import React, { memo } from "react"
import { HashSet } from "effect"
import { extname } from "node:path"
import { Box, Text } from "ink"
import { IMAGE_EXTENSIONS } from "../mentions/index.js"
import { FILE_EXTENSIONS } from "../../core/constants/index.js"
import type { ProjectFile } from "../mentions/files.js"

interface FileMentionPaletteProps {
  readonly files: readonly ProjectFile[]
  readonly selectedIndex: number
  readonly query: string
}

function fileIcon(path: string): string {
  const ext = extname(path).toLowerCase()
  if (HashSet.has(IMAGE_EXTENSIONS, ext)) return "[img]"
  if (ext === FILE_EXTENSIONS.MD) return "[md] "
  if (ext === FILE_EXTENSIONS.JSON) return "{  } "
  return "     "
}

/** Shown just above the prompt when the user types @ */
export const FileMentionPalette: React.FC<FileMentionPaletteProps> = memo(
  ({ files, selectedIndex, query }) => {
    if (files.length === 0) {
      return query.length > 0 ? (
        <Box paddingLeft={2}>
          <Text color="gray" dimColor>
            No files matching @{query}
          </Text>
        </Box>
      ) : null
    }

    return (
      <Box flexDirection="column" paddingLeft={2}>
        {files.map((file, idx) => {
          const isSelected = idx === selectedIndex
          return (
            <Box key={file.path} gap={1}>
              <Text color={isSelected ? "cyan" : "gray"}>
                {isSelected ? "›" : " "}
              </Text>
              <Text color="gray" dimColor>
                {fileIcon(file.path)}
              </Text>
              <Text color={isSelected ? "white" : "gray"} bold={isSelected}>
                {file.path}
              </Text>
            </Box>
          )
        })}
        <Text color="gray" dimColor>
          {"  "}Tab · Esc · [img]=vision
        </Text>
      </Box>
    )
  },
)
