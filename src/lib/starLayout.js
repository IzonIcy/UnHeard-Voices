// Layout for the constellation view. Positions are derived from event
// identity, never from the current filter, so hiding a category does not
// reshuffle the graph the user is looking at.

/** Deterministic pseudo-random value in [0, 1) for an id/salt pair. */
export function stableValue(id, salt) {
  const raw = Math.sin((id + 1) * (salt + 17) * 12.9898) * 43758.5453
  return raw - Math.floor(raw)
}

/**
 * Build a layout slot for every id in the canonical ordering.
 *
 * The angle comes from the event's position in that full ordering rather than
 * a hash, which keeps nodes evenly spread around the ring; because the
 * ordering covers the whole dataset and not just the visible subset, the
 * angle is identical whether or not a filter is applied.
 */
export function computeStarLayout(orderedIds) {
  const total = Math.max(orderedIds.length, 1)
  const layout = {}

  orderedIds.forEach((id, index) => {
    layout[id] = {
      graphY: 0.12 + stableValue(id, 1) * 0.76,
      ringRadius: 0.26 + stableValue(id, 2) * 0.72,
      ringAngle: (index / total) * Math.PI * 2
    }
  })

  return layout
}
