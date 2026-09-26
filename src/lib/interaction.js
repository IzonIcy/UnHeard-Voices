// Pointer and keyboard interaction math, kept out of the component so it can
// be tested without a canvas or a layout engine.

// .hover-tooltip is max-width 240 + 14px padding each side + 1px borders.
export const TOOLTIP_WIDTH = 270
// Title + year + a 100 character description slice, with padding.
export const TOOLTIP_HEIGHT = 170
const VIEWPORT_MARGIN = 8
const TOOLTIP_OFFSET = 14

/**
 * Keep the tooltip on screen, clamping both bounds. The previous version only
 * clamped the upper bound against numbers smaller than the tooltip, so
 * hovering the bottom-right corner pushed it off screen, and a viewport
 * smaller than those constants yielded negative offsets.
 *
 * The box size is an estimate: .hover-tooltip has a max-width but no
 * max-height, so the real height tracks the title length. TOOLTIP_HEIGHT is
 * sized for a typical entry and undershoots an unusually long one.
 */
export function clampTooltipPosition({ x, y, viewportWidth, viewportHeight }) {
  const maxLeft = Math.max(
    VIEWPORT_MARGIN,
    viewportWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN,
  )
  const maxTop = Math.max(
    VIEWPORT_MARGIN,
    viewportHeight - TOOLTIP_HEIGHT - VIEWPORT_MARGIN,
  )

  return {
    left: Math.min(Math.max(VIEWPORT_MARGIN, x + TOOLTIP_OFFSET), maxLeft),
    top: Math.min(Math.max(VIEWPORT_MARGIN, y + TOOLTIP_OFFSET), maxTop),
  }
}

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown'])
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp'])

/**
 * Resolve which event a key press should move the highlight to.
 * `currentIndex` is -1 when nothing is hovered. Returns null for keys the
 * canvas does not handle, and null for Escape, which clears the highlight.
 */
export function resolveHoverIndex(key, currentIndex, eventCount) {
  if (eventCount <= 0) {
    return null
  }

  const maxIndex = eventCount - 1

  if (NEXT_KEYS.has(key)) {
    // With nothing hovered, forward movement lands on the first event rather
    // than skipping it.
    return currentIndex < 0 ? 0 : Math.min(currentIndex + 1, maxIndex)
  }

  if (PREVIOUS_KEYS.has(key)) {
    return currentIndex < 0 ? 0 : Math.max(currentIndex - 1, 0)
  }

  if (key === 'Home') {
    return 0
  }

  if (key === 'End') {
    return maxIndex
  }

  if (key === 'Enter' || key === ' ') {
    // Activate the first event when the user has not moved the highlight yet,
    // instead of opening one they cannot see selected.
    return currentIndex < 0 ? 0 : currentIndex
  }

  return null
}

/**
 * A tap makes the browser synthesise mouseover/mousemove/mousedown/mouseup/
 * click at the release point, which would otherwise re-arm the hover the
 * touch handler just cleared. Anything within the window is treated as
 * emulated rather than as a real mouse.
 */
export function isEmulatedFromTouch(lastTouchAt, now, window = 500) {
  // null means no touch has been seen, which is distinct from a touch at
  // timestamp 0: without the sentinel, a page that has never been touched
  // would treat its first real mouse move as emulated for half a second.
  if (lastTouchAt === null) {
    return false
  }
  return now - lastTouchAt < window
}
