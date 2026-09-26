import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/styles/timeline.css'),
  'utf8',
)

/** Return the body of an at-rule block, e.g. "@media (max-width: 820px)". */
function atRuleBody(condition) {
  const start = css.indexOf(condition)
  expect(start, `no ${condition} block in timeline.css`).toBeGreaterThan(-1)

  const open = css.indexOf('{', start)
  let depth = 0
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    else if (css[i] === '}') {
      depth -= 1
      if (depth === 0) return css.slice(open + 1, i)
    }
  }
  throw new Error(`unterminated ${condition}`)
}

/**
 * Flat rule scanner: returns every `{ prelude, body }` pair at the top level
 * of a block, skipping nested at-rules. Good enough for this stylesheet, which
 * nests nothing inside its media queries, and it keeps the project free of a
 * CSS parser dependency.
 */
function rules(block) {
  const found = []
  let depth = 0
  let preludeStart = 0
  let prelude = ''
  let bodyStart = 0

  for (let i = 0; i < block.length; i += 1) {
    const ch = block[i]
    if (ch === '{') {
      if (depth === 0) {
        prelude = block.slice(preludeStart, i).trim()
        bodyStart = i + 1
      }
      depth += 1
    } else if (ch === '}') {
      depth -= 1
      if (depth === 0) {
        if (!prelude.startsWith('@')) {
          found.push({ prelude, body: block.slice(bodyStart, i) })
        }
        preludeStart = i + 1
      }
    } else if (ch === ';' && depth === 0) {
      preludeStart = i + 1
    }
  }

  return found
}

const MOBILE = atRuleBody('@media (max-width: 820px)')
const mobileRules = rules(MOBILE)

const bodiesFor = (selector, list = mobileRules) =>
  list.filter((rule) =>
    rule.prelude.split(',').some((part) => part.trim() === selector),
  )

/** True when a rule body declares `property: value`, ignoring indentation. */
const declares = (body, property, value) =>
  new RegExp(`(^|;)\\s*${property}\\s*:\\s*${value}\\s*;`, 'm').test(body)

describe('mobile layout guards', () => {
  // The regression: these were absolutely positioned over the canvas, which
  // hid the constellation and swallowed taps meant for the nodes.
  const mustNotOverlay = [
    '.insights-panel',
    '.legend',
    '.year-badge',
    '.export-png-button',
  ]

  for (const selector of mustNotOverlay) {
    it(`${selector} is never absolutely positioned on mobile`, () => {
      const matching = bodiesFor(selector)
      expect(matching.length, `${selector} has no mobile rule`).toBeGreaterThan(
        0,
      )

      for (const rule of matching) {
        expect(declares(rule.body, 'position', 'absolute')).toBe(false)
      }
    })
  }

  it('lays the stage out in normal flow with named areas', () => {
    const stage = bodiesFor('.timeline-stage')
    expect(stage.length).toBeGreaterThan(0)

    const areas = stage.map((rule) => rule.body).join('\n')
    expect(areas).toMatch(/grid-template-areas\s*:/)
    // The canvas gets its own row rather than sharing space with an overlay.
    expect(areas).toMatch(/canvas/)
  })

  it('keeps the constellation square on a phone', () => {
    // A 2:1 box leaves the outer ring ~68px across for 60 nodes.
    const canvas = bodiesFor('.event-canvas')
    expect(canvas.length).toBeGreaterThan(0)
    expect(canvas.map((rule) => rule.body).join('\n')).toMatch(
      /aspect-ratio\s*:\s*1\s*\/\s*1/,
    )
  })

  it('puts the visualization before the filter rail on mobile', () => {
    // The rail used to come first, pushing the canvas ~1100px down the page.
    const shell = bodiesFor('.timeline-shell')[0]
    expect(shell).toBeDefined()
    expect(shell.body).toMatch(/flex-direction\s*:\s*column/)

    const stage = bodiesFor('.timeline-stage')[0]
    const rail = bodiesFor('.category-rail')[0]
    expect(stage.body).toMatch(/order\s*:\s*1/)
    expect(rail.body).toMatch(/order\s*:\s*2/)
  })

  it('leaves the desktop overlay layout alone', () => {
    // Guards against a well-meaning "fix" that flattens desktop too.
    const topLevel = rules(css)
    for (const selector of ['.insights-panel', '.legend']) {
      const matching = bodiesFor(selector, topLevel)
      expect(matching.length).toBeGreaterThan(0)
      expect(
        matching.some((rule) =>
          declares(rule.body, 'position', 'absolute'),
        ),
        `${selector} should still be an overlay on desktop`,
      ).toBe(true)
    }
  })

  it('finds the selectors it thinks it does', () => {
    // If the stylesheet is restructured, fail loudly rather than pass silently.
    for (const selector of [
      ...mustNotOverlay,
      '.timeline-stage',
      '.category-rail',
      '.event-canvas',
    ]) {
      expect(
        bodiesFor(selector).length,
        `${selector} not found in mobile block`,
      ).toBeGreaterThan(0)
    }
  })
})
