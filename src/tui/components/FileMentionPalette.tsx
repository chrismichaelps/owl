/** @Owl.TUI.Components.FileMentionPalette - Autocomplete popup for @file mentions */
import React, { memo } from "react"
import { Box, Text } from "ink"
import type { ProjectFile } from "../mentions/files.js"

interface FileMentionPaletteProps {
  readonly files: readonly ProjectFile[]
  readonly selectedIndex: number
  readonly query: string
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
              <Text color={isSelected ? "white" : "gray"} bold={isSelected}>
                {file.path}
              </Text>
            </Box>
          )
        })}
        <Text color="gray" dimColor>
          {"  "}Tab to complete · Esc to dismiss
        </Text>
      </Box>
    )
  },
)
