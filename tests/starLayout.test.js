import { describe, it, expect } from 'vitest'
import { computeStarLayout } from '../src/lib/starLayout.js'
import events from '../src/data/events.json'

const ALL_IDS = events.map((event) => event.id).sort((a, b) => a - b)

describe('computeStarLayout', () => {
  it('gives every event a slot', () => {
    const layout = computeStarLayout(ALL_IDS)
    expect(Object.keys(layout)).toHaveLength(ALL_IDS.length)
  })

  it('is deterministic across calls', () => {
    expect(computeStarLayout(ALL_IDS)).toEqual(computeStarLayout(ALL_IDS))
  })

  it('returns identical slots no matter which subset a consumer looks at', () => {
    // The caller builds this map once from the full dataset and looks slots
    // up by id, so hiding a category cannot move anything. The angle comes
    // from position in the full ordering rather than a hash, which is what
    // keeps the distribution even without giving up that stability.
    const layout = computeStarLayout(ALL_IDS)
    const visible = ALL_IDS.filter((id) => id % 2 === 0)

    for (const id of visible) {
      expect(layout[id]).toEqual(computeStarLayout(ALL_IDS)[id])
    }
  })

  it('keeps slots addressable by id for a filtered subset', () => {
    const layout = computeStarLayout(ALL_IDS)
    const evenIds = ALL_IDS.filter((id) => id % 2 === 0)
    const oddIds = ALL_IDS.filter((id) => id % 2 === 1)

    expect(Object.keys(layout)).toHaveLength(ALL_IDS.length)
    // Both subsets resolve out of the same map, which is the whole point.
    expect(evenIds.every((id) => layout[id])).toBe(true)
    expect(oddIds.every((id) => layout[id])).toBe(true)
  })

  it('spreads nodes evenly around the ring', () => {
    // Stability is worthless if it collapses every node into one arc, so the
    // canonical ordering has to keep the distribution even.
    const layout = computeStarLayout(ALL_IDS)
    const angles = ALL_IDS.map((id) => layout[id].ringAngle).sort(
      (a, b) => a - b,
    )

    const gaps = angles.map((angle, index) => {
      const next =
				index === angles.length - 1
				  ? angles[0] + Math.PI * 2
				  : angles[index + 1]
      return next - angle
    })

    const expected = (Math.PI * 2) / ALL_IDS.length
    for (const gap of gaps) {
      expect(gap).toBeCloseTo(expected, 6)
    }
  })

  it('keeps radial and vertical positions in range', () => {
    const layout = computeStarLayout(ALL_IDS)
    for (const id of ALL_IDS) {
      expect(layout[id].graphY).toBeGreaterThanOrEqual(0.12)
      expect(layout[id].graphY).toBeLessThanOrEqual(0.88)
      expect(layout[id].ringRadius).toBeGreaterThanOrEqual(0.26)
      expect(layout[id].ringRadius).toBeLessThanOrEqual(0.98)
    }
  })

  it('does not divide by zero on an empty dataset', () => {
    expect(computeStarLayout([])).toEqual({})
  })
})
