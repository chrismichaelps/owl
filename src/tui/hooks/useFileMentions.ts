/** @Owl.TUI.Hooks.FileMentions - Project file mention autocomplete state */
import { useCallback, useEffect, useRef, useState } from "react"
import { TUI_TRIGGERS } from "../../core/constants/index.js"
import {
  completeAtMention,
  extractAtQuery,
  filterFiles,
  listProjectFiles,
  type ProjectFile,
} from "../mentions/files.js"

export interface FileMentionState {
  readonly atQuery: string | null
  readonly showMentionPalette: boolean
  readonly mentionFiles: readonly ProjectFile[]
  readonly mentionIndex: number
  readonly selectedFile: () => ProjectFile | undefined
  readonly setMentionIndex: (index: number) => void
  readonly moveMentionIndex: (delta: number) => void
  readonly completeMention: (input: string, filePath: string) => string
  readonly isMentionInput: (input: string) => boolean
}

export function useFileMentions(
  value: string,
  projectRoot: string | undefined,
): FileMentionState {
  const allFilesRef = useRef<readonly ProjectFile[]>([])
  const [mentionFiles, setMentionFiles] = useState<readonly ProjectFile[]>([])
  const [mentionIndex, setMentionIndexState] = useState(0)
  const mentionIndexRef = useRef(0)
  const mentionFilesRef = useRef<readonly ProjectFile[]>([])
  const atQuery = extractAtQuery(value)
  const showMentionPalette =
    atQuery !== null && !value.startsWith(TUI_TRIGGERS.PALETTE)

  useEffect(() => {
    void listProjectFiles(projectRoot ?? process.cwd()).then((files) => {
      allFilesRef.current = files
    })
  }, [projectRoot])

  useEffect(() => {
    if (atQuery === null) {
      setMentionFiles([])
      mentionFilesRef.current = []
      setMentionIndexState(0)
      mentionIndexRef.current = 0
      return
    }
    const filtered = filterFiles(allFilesRef.current, atQuery)
    setMentionFiles(filtered)
    mentionFilesRef.current = filtered
    setMentionIndexState(0)
    mentionIndexRef.current = 0
  }, [atQuery])

  const setMentionIndex = useCallback((index: number) => {
    mentionIndexRef.current = index
    setMentionIndexState(index)
  }, [])

  const selectedFile = useCallback(
    (): ProjectFile | undefined =>
      mentionFilesRef.current[mentionIndexRef.current],
    [],
  )

  const moveMentionIndex = useCallback((delta: number) => {
    const maxIndex = Math.max(0, mentionFilesRef.current.length - 1)
    const next = Math.max(
      0,
      Math.min(maxIndex, mentionIndexRef.current + delta),
    )
    mentionIndexRef.current = next
    setMentionIndexState(next)
  }, [])

  const isMentionInput = useCallback(
    (input: string): boolean =>
      extractAtQuery(input) !== null && !input.startsWith(TUI_TRIGGERS.PALETTE),
    [],
  )

  return {
    atQuery,
    showMentionPalette,
    mentionFiles,
    mentionIndex,
    selectedFile,
    setMentionIndex,
    moveMentionIndex,
    completeMention: completeAtMention,
    isMentionInput,
  }
}
