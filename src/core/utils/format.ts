/**
 * @Owl.Core.Utils.Format - String and data formatting utilities
 */
import { FORMAT_CONSTANTS } from "../constants/index.js"

/**
 * Truncate a string to a maximum length, appending a marker if truncated.
 * Replaces newlines with spaces for single-line display.
 */
export function truncate(s: string, max: number, marker = "…"): string {
  const single = s.replace(/\n/g, " ").trim()
  return single.length <= max
    ? single
    : single.slice(0, max - marker.length) + marker
}

/**
 * Format a byte count as a human-readable string (e.g., 500b, 1.2kb, 3.4mb)
 */
export function formatBytes(bytes: number): string {
  if (bytes < FORMAT_CONSTANTS.BYTE_UNIT) {
    return `${String(bytes)}${FORMAT_CONSTANTS.BYTE_SUFFIX}`
  }
  if (bytes < FORMAT_CONSTANTS.BYTE_UNIT * FORMAT_CONSTANTS.BYTE_UNIT) {
    return `${(bytes / FORMAT_CONSTANTS.BYTE_UNIT).toFixed(
      FORMAT_CONSTANTS.BYTE_DECIMAL_PLACES,
    )}${FORMAT_CONSTANTS.KILOBYTE_SUFFIX}`
  }
  return `${(
    bytes /
    (FORMAT_CONSTANTS.BYTE_UNIT * FORMAT_CONSTANTS.BYTE_UNIT)
  ).toFixed(FORMAT_CONSTANTS.BYTE_DECIMAL_PLACES)}${
    FORMAT_CONSTANTS.MEGABYTE_SUFFIX
  }`
}
