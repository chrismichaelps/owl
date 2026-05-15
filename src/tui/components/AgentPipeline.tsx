/** @Owl.TUI.Components.AgentPipeline - Animated FMCF role pipeline */
import React, { memo } from "react"
import { Box, Text } from "ink"
import { TUI_ANIMATION } from "../../core/constants/index.js"
import {
  getFrame,
  useTerminalAnimation,
} from "../hooks/useTerminalAnimation.js"
import type { ActiveRole } from "../state.js"

type PipelineRole = (typeof TUI_ANIMATION.FMCF_ROLE_FLOW)[number]
type PipelineState = "complete" | "active" | "pending"

const ROLE_LABEL: Record<PipelineRole, string> = {
  Architect: "ARC",
  "DNA Engineer": "DNA",
  Shadow: "SHD",
  "Forensic Guardian": "FG",
}

const ROLE_COLOR: Record<PipelineRole, string> = {
  Architect: "blue",
  "DNA Engineer": "yellow",
  Shadow: "magenta",
  "Forensic Guardian": "green",
}

/** @Owl.TUI.Components.AgentPipeline.State - Derive role visual state */
export const getPipelineState = (
  role: PipelineRole,
  activeRole: ActiveRole,
): PipelineState => {
  if (activeRole === null) return "pending"

  const activeIndex = TUI_ANIMATION.FMCF_ROLE_FLOW.indexOf(activeRole)
  const roleIndex = TUI_ANIMATION.FMCF_ROLE_FLOW.indexOf(role)

  if (roleIndex < activeIndex) return "complete"
  return roleIndex === activeIndex ? "active" : "pending"
}

const getGlyph = (state: PipelineState, frame: number): string => {
  if (state === "complete") return TUI_ANIMATION.PIPELINE_COMPLETE_GLYPH
  if (state === "pending") return TUI_ANIMATION.PIPELINE_PENDING_GLYPH
  return getFrame(
    TUI_ANIMATION.PIPELINE_ACTIVE_FRAMES,
    frame,
    TUI_ANIMATION.PIPELINE_ACTIVE_FRAMES[0],
  )
}

const Step = memo(function Step({
  role,
  state,
  frame,
}: {
  readonly role: PipelineRole
  readonly state: PipelineState
  readonly frame: number
}): React.ReactElement {
  const color = state === "pending" ? "gray" : ROLE_COLOR[role]
  return (
    <Box gap={1}>
      <Text color={color} bold={state === "active"}>
        {getGlyph(state, frame)}
      </Text>
      <Text color={color} dimColor={state === "pending"}>
        {ROLE_LABEL[role]}
      </Text>
    </Box>
  )
})

/** @Owl.TUI.Components.AgentPipeline.Component - Shows governed execution flow */
export const AgentPipeline: React.FC<{
  readonly activeRole: ActiveRole
}> = memo(({ activeRole }) => {
  const frame = useTerminalAnimation(activeRole !== null)

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color="gray" dimColor>
        FMCF Pipeline
      </Text>
      <Box gap={1} flexWrap="wrap">
        {TUI_ANIMATION.FMCF_ROLE_FLOW.map((role) => (
          <Step
            key={role}
            role={role}
            state={getPipelineState(role, activeRole)}
            frame={frame}
          />
        ))}
      </Box>
    </Box>
  )
})
