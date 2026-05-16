/** @Owl.TUI.Components.AgentPipeline - Animated FMCF role pipeline */
import React, { memo } from "react"
import { Box, Text } from "ink"
import {
  TUI_ANIMATION,
  PIPELINE_STATE_CONSTANTS,
} from "../../core/constants/index.js"
import {
  getFrame,
  useTerminalAnimation,
} from "../hooks/useTerminalAnimation.js"
import type { ActiveRole } from "../state.js"

type PipelineRole = (typeof TUI_ANIMATION.FMCF_ROLE_FLOW)[number]
type PipelineState =
  (typeof PIPELINE_STATE_CONSTANTS)[keyof typeof PIPELINE_STATE_CONSTANTS]

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
  if (activeRole === null) return PIPELINE_STATE_CONSTANTS.PENDING

  const activeIndex = TUI_ANIMATION.FMCF_ROLE_FLOW.indexOf(activeRole)
  const roleIndex = TUI_ANIMATION.FMCF_ROLE_FLOW.indexOf(role)

  if (roleIndex < activeIndex) return PIPELINE_STATE_CONSTANTS.COMPLETE
  return roleIndex === activeIndex
    ? PIPELINE_STATE_CONSTANTS.ACTIVE
    : PIPELINE_STATE_CONSTANTS.PENDING
}

const getGlyph = (state: PipelineState, frame: number): string => {
  if (state === PIPELINE_STATE_CONSTANTS.COMPLETE)
    return TUI_ANIMATION.PIPELINE_COMPLETE_GLYPH
  if (state === PIPELINE_STATE_CONSTANTS.PENDING)
    return TUI_ANIMATION.PIPELINE_PENDING_GLYPH
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
  const color =
    state === PIPELINE_STATE_CONSTANTS.PENDING ? "gray" : ROLE_COLOR[role]
  return (
    <Box gap={1}>
      <Text color={color} bold={state === PIPELINE_STATE_CONSTANTS.ACTIVE}>
        {getGlyph(state, frame)}
      </Text>
      <Text color={color} dimColor={state === PIPELINE_STATE_CONSTANTS.PENDING}>
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
