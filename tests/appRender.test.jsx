import { describe, it, expect } from "vitest"
import App from "../src/App"

describe("App", () => {
  it("exports without error", () => {
    // Just verify the component exports
    expect(App).toBeDefined()
  })
})
