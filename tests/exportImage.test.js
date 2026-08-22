import { describe, expect, it } from 'vitest'
import { exportFileName } from '../src/lib/exportImage.js'

describe('exportFileName', () => {
  it('uses the generic name when nothing is selected', () => {
    expect(exportFileName(null)).toBe('unheard-voices-timeline.png')
    expect(exportFileName(undefined)).toBe('unheard-voices-timeline.png')
  })

  it('embeds a sanitized event id', () => {
    expect(exportFileName(42)).toBe('unheard-voices-event-42.png')
    expect(exportFileName('weird/id here')).toBe('unheard-voices-event-weird-id-here.png')
  })
})
