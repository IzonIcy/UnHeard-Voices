import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from '../src/App'

describe("App", () => {
  it("renders core app UI without error", () => {
    const html = renderToString(<App />)

    expect(html).toContain('Unheard Voices')
    expect(html).toContain('Timeline')
    expect(html).toContain('Constellation')
  })
})
