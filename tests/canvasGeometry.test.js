import { describe, it, expect } from 'vitest'
import {
  computeBackingStore,
  toCanvasSpace,
  HIT_RADIUS_PX,
} from '../src/lib/canvasGeometry.js'

describe('computeBackingStore', () => {
  it('scales the backing store by device pixel ratio', () => {
    expect(
      computeBackingStore({ cssWidth: 800, cssHeight: 400, dpr: 2 }),
    ).toEqual({
      cssWidth: 800,
      cssHeight: 400,
      width: 1600,
      height: 800,
      dpr: 2,
    })
  })

  it('returns the CSS size it was given, not a re-derived one', () => {
    // Callers lay out against cssWidth. Dividing the rounded backing store
    // back down by dpr loses the remainder on a fractional ratio.
    const result = computeBackingStore({
      cssWidth: 1001,
      cssHeight: 401,
      dpr: 1.5,
    })
    expect(result.cssWidth).toBe(1001)
    expect(result.width).toBe(1502)
  })

  it('leaves a 1x display untouched', () => {
    expect(
      computeBackingStore({ cssWidth: 800, cssHeight: 400, dpr: 1 }),
    ).toEqual({
      cssWidth: 800,
      cssHeight: 400,
      width: 800,
      height: 400,
      dpr: 1,
    })
  })

  it('rounds fractional device pixels', () => {
    expect(
      computeBackingStore({ cssWidth: 801, cssHeight: 401, dpr: 1.5 }),
    ).toEqual({
      cssWidth: 801,
      cssHeight: 401,
      width: 1202,
      height: 602,
      dpr: 1.5,
    })
  })

  it('falls back to a sane size when layout has not happened yet', () => {
    // jsdom, first paint, or a display:none ancestor all report 0.
    for (const cssWidth of [0, -10, Number.NaN, undefined, null]) {
      expect(computeBackingStore({ cssWidth, cssHeight: 0, dpr: 2 })).toEqual({
        cssWidth: 1200,
        cssHeight: 600,
        width: 2400,
        height: 1200,
        dpr: 2,
      })
    }
  })

  it('never produces a zero-area backing store', () => {
    const { width, height } = computeBackingStore({
      cssWidth: 10,
      cssHeight: 0,
      dpr: 2,
    })
    expect(width).toBeGreaterThan(0)
    expect(height).toBeGreaterThan(0)
  })

  it('guards against a zero or non-finite device pixel ratio', () => {
    for (const dpr of [0, -1, Number.NaN, undefined]) {
      expect(
        computeBackingStore({ cssWidth: 800, cssHeight: 400, dpr }).dpr,
      ).toBe(1)
    }
  })
})

describe('toCanvasSpace', () => {
  const rect = { left: 100, top: 50, width: 800, height: 400 }

  it('maps client coordinates into CSS pixel space', () => {
    expect(toCanvasSpace(rect, 150, 100)).toEqual({ x: 50, y: 50 })
  })

  it('is independent of device pixel ratio', () => {
    // Points are stored in CSS px, so the same client coord maps identically
    // regardless of how dense the backing store is.
    expect(toCanvasSpace(rect, 900, 450)).toEqual({ x: 800, y: 400 })
  })

  it('returns null for a degenerate rect instead of Infinity or NaN', () => {
    expect(
      toCanvasSpace({ left: 0, top: 0, width: 0, height: 400 }, 10, 10),
    ).toBeNull()
    expect(
      toCanvasSpace({ left: 0, top: 0, width: 800, height: 0 }, 10, 10),
    ).toBeNull()
  })

  it('keeps hit testing within the visible box on a phone-sized canvas', () => {
    // The regression: hitRadius used to live in backing-store pixels, so a
    // 1200px-wide canvas squeezed into a 360px viewport shrank the effective
    // touch target to ~4px. Points are CSS px now, so HIT_RADIUS_PX is honest.
    const phone = { left: 0, top: 0, width: 360, height: 180 }
    const point = toCanvasSpace(phone, 180 + HIT_RADIUS_PX - 1, 90)
    expect(point).not.toBeNull()
    expect(Math.hypot(point.x - 180, point.y - 90)).toBeLessThanOrEqual(
      HIT_RADIUS_PX,
    )
  })
})
