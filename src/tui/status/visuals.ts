/** @Owl.TUI.Status.Visuals - Terminal glyph and color resolvers */
import { HashMap, Option } from "effect"
import {
  TUI_ROLE_COLORS,
  TUI_STATUS_COLORS,
  TUI_STATUS_ICONS,
  TUI_VISUAL_FALLBACKS,
} from "../../core/constants/index.js"
import type { ActiveRole, AgentStatus } from "../state.js"

const resolve = (
  lookup: HashMap.HashMap<string, string>,
  key: string,
  fallback: string,
): string => Option.getOrElse(HashMap.get(lookup, key), () => fallback)

/** @Owl.TUI.Status.Visuals.Icon - Resolve status glyph */
export const resolveStatusIcon = (status: AgentStatus): string =>
  resolve(TUI_STATUS_ICONS, status, TUI_VISUAL_FALLBACKS.STATUS_ICON)

/** @Owl.TUI.Status.Visuals.StatusColor - Resolve status color */
export const resolveStatusColor = (status: AgentStatus): string =>
  resolve(TUI_STATUS_COLORS, status, TUI_VISUAL_FALLBACKS.COLOR)

/** @Owl.TUI.Status.Visuals.RoleColor - Resolve role color */
export const resolveRoleColor = (role: NonNullable<ActiveRole>): string =>
  resolve(TUI_ROLE_COLORS, role, TUI_VISUAL_FALLBACKS.COLOR)
