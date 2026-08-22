import { describe, expect, it } from 'vitest'
import events from '../src/data/events.json'

// Guards the dataset against malformed contributions. The visualization and
// URL deep-linking both assume these invariants hold.

const MIN_YEAR = 1700
const MAX_YEAR = 2026

describe('events.json dataset', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBeGreaterThan(0)
  })

  it('has unique integer ids', () => {
    const ids = events.map((event) => event.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    expect(duplicates, `duplicate ids: ${duplicates.join(', ')}`).toEqual([])
    for (const event of events) {
      expect(typeof event.id, `event id must be a number: ${JSON.stringify(event.id)}`).toBe(
        'number'
      )
    }
  })

  it('has non-empty titles and descriptions', () => {
    for (const event of events) {
      expect(
        typeof event.title === 'string' && event.title.trim().length > 0,
        `bad title on event ${event.id}`
      ).toBe(true)
      expect(
        typeof event.description === 'string' && event.description.trim().length > 0,
        `bad description on event ${event.id} (${event.title})`
      ).toBe(true)
    }
  })

  it('has dates within 1700-2026 matching the display year', () => {
    for (const event of events) {
      expect(
        Number.isInteger(event.date),
        `date must be an integer year on event ${event.id}`
      ).toBe(true)
      expect(
        event.date >= MIN_YEAR && event.date <= MAX_YEAR,
        `date ${event.date} out of range on event ${event.id} (${event.title})`
      ).toBe(true)
      // Display year may carry an approximation prefix like "c. 1730".
      const yearDigits = String(event.year).replace(/^c\.\s*/, '')
      expect(
        event.year,
        `year field must be a string on event ${event.id}`
      ).toBeTypeOf('string')
      expect(
        yearDigits,
        `year "${event.year}" disagrees with date ${event.date} on event ${event.id}`
      ).toBe(String(event.date))
    }
  })

  it('uses consistent snake_case categories from a stable set', () => {
    const validCategories = new Set([
      'arts',
      'civil_rights',
      'disability',
      'indigenous',
      'labor',
      'lgbtq',
      'resistance',
      'science',
      'women'
    ])
    for (const event of events) {
      expect(
        validCategories.has(event.category),
        `unknown category "${event.category}" on event ${event.id} (${event.title}); ` +
          'add it to this test and the UI legend together'
      ).toBe(true)
    }
  })

  it('stores Wikipedia article titles (not URLs) in wikiLink', () => {
    // wikiLink holds the article TITLE; the detail view builds
    // https://en.wikipedia.org/wiki/<title> from it.
    for (const event of events) {
      expect(
        typeof event.wikiLink === 'string' && event.wikiLink.trim().length > 0,
        `wikiLink must be a non-empty article title on event ${event.id}`
      ).toBe(true)
      expect(
        event.wikiLink.startsWith('http'),
        `wikiLink should be a title, not a URL, on event ${event.id}: ${event.wikiLink}`
      ).toBe(false)
    }
  })
})
