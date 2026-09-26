import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "../src/App";

const CSS_WIDTH = 800;
const CSS_HEIGHT = 400;

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

	const noop2d = new Proxy(
		{},
		{
			get: (_target, prop) => {
				if (prop === "measureText") return () => ({ width: 0 });
				if (
					prop === "createLinearGradient" ||
					prop === "createRadialGradient"
				) {
					return () => ({ addColorStop: () => {} });
				}
				return () => {};
			},
			set: () => true,
		},
	);
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(noop2d);

	// jsdom performs no layout, so the canvas reports a zero-sized box. Give it
	// a realistic one and record the DPR the component reads.
	vi.spyOn(HTMLCanvasElement.prototype, "clientWidth", "get").mockReturnValue(
		CSS_WIDTH,
	);
	vi.spyOn(HTMLCanvasElement.prototype, "clientHeight", "get").mockReturnValue(
		CSS_HEIGHT,
	);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const renderApp = async () => {
	const container = document.createElement("div");
	document.body.appendChild(container);
	await act(async () => {
		createRoot(container).render(<App />);
	});
	return { container, canvas: container.querySelector("canvas") };
};

describe("canvas backing store", () => {
	it("matches the CSS box on a 1x display", async () => {
		vi.stubGlobal("devicePixelRatio", 1);
		const { container, canvas } = await renderApp();

		expect(canvas.width).toBe(CSS_WIDTH);
		expect(canvas.height).toBe(CSS_HEIGHT);
		container.remove();
	});

	it("doubles on a 2x display instead of upscaling a fixed 1200px buffer", async () => {
		vi.stubGlobal("devicePixelRatio", 2);
		const { container, canvas } = await renderApp();

		// The old markup hardcoded width={1200} height={600} and never read DPR,
		// so a retina display got a blurry upscale. This is the regression guard.
		expect(canvas.width).toBe(CSS_WIDTH * 2);
		expect(canvas.height).toBe(CSS_HEIGHT * 2);
		container.remove();
	});

	it("follows a fractional device pixel ratio", async () => {
		vi.stubGlobal("devicePixelRatio", 1.5);
		const { container, canvas } = await renderApp();

		expect(canvas.width).toBe(CSS_WIDTH * 1.5);
		expect(canvas.height).toBe(CSS_HEIGHT * 1.5);
		container.remove();
	});
});
