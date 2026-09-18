import { describe, expect, it } from 'vitest'
import App from '../src/App'

describe("App", () => {
  it("exports without error", () => {
    expect(App).toBeDefined()
  })
})
