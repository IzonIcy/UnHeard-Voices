import { describe, it, expect } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "../src/App";

// jsdom lacks matchMedia, which the visualization reads for reduced-motion.
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    });
  }
  // jsdom's canvas getContext is not implemented; the constellation view
  // draws on mount. A proxy returns a no-op for every method and 0/"" for
  // every property, so render tests focus on DOM structure instead of
  // enumerating the whole 2D-context API.
  const noop2d = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "measureText") return () => ({ width: 0 });
        if (prop === "createLinearGradient" || prop === "createRadialGradient") {
          return () => ({ addColorStop: () => {} });
        }
        if (typeof prop === "string" && /^(set|put|draw|stroke|fill|clear)/.test(prop)) {
          return () => {};
        }
        return typeof prop === "string" && prop.startsWith("get") ? () => ({}) : () => {};
      },
      set: () => true,
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(noop2d);
});

describe("App", () => {
  it("renders the header and both view toggles", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    await act(async () => {
      createRoot(container).render(<App />);
    });

    expect(container.querySelector("h1")?.textContent).toContain("Unheard Voices");

    const buttons = [...container.querySelectorAll("button")].map((b) =>
      b.textContent.trim(),
    );
    expect(buttons).toContain("Timeline");
    expect(buttons).toContain("Constellation");

    container.remove();
  });
});
