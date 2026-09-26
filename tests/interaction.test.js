import { describe, it, expect } from "vitest";
import {
	clampTooltipPosition,
	resolveHoverIndex,
} from "../src/lib/interaction.js";

describe("clampTooltipPosition", () => {
	const viewport = { viewportWidth: 1280, viewportHeight: 720 };

	it("offsets the tooltip from the pointer when there is room", () => {
		expect(clampTooltipPosition({ x: 300, y: 200, ...viewport })).toEqual({
			left: 314,
			top: 214,
		});
	});

	it("keeps the tooltip on screen at the bottom-right corner", () => {
		// 270px wide + 8px margin: the old 260 constant let it hang off the edge.
		const { left, top } = clampTooltipPosition({
			x: 1270,
			y: 710,
			...viewport,
		});
		expect(left).toBeLessThanOrEqual(1280 - 270);
		expect(top).toBeLessThanOrEqual(720 - 170);
		expect(left).toBeGreaterThanOrEqual(0);
		expect(top).toBeGreaterThanOrEqual(0);
	});

	it("never returns negative offsets on a tiny viewport", () => {
		const tiny = { viewportWidth: 200, viewportHeight: 150 };
		const { left, top } = clampTooltipPosition({ x: 0, y: 0, ...tiny });
		expect(left).toBeGreaterThanOrEqual(0);
		expect(top).toBeGreaterThanOrEqual(0);
	});

	it("applies the pointer offset when there is room", () => {
		const { left, top } = clampTooltipPosition({ x: 0, y: 0, ...viewport });
		expect(left).toBe(14);
		expect(top).toBe(14);
	});

	it("floors the offset at the viewport margin for out-of-bounds pointers", () => {
		const { left, top } = clampTooltipPosition({ x: -40, y: -40, ...viewport });
		expect(left).toBe(8);
		expect(top).toBe(8);
	});
});

describe("resolveHoverIndex", () => {
	it("starts on the first event instead of skipping it", () => {
		// Regression: Math.max(-1, 0) made index 0 "current", so ArrowRight with
		// nothing hovered jumped straight to the second event.
		expect(resolveHoverIndex("ArrowRight", -1, 5)).toBe(0);
		expect(resolveHoverIndex("ArrowDown", -1, 5)).toBe(0);
	});

	it("activates the first event on Enter with nothing hovered", () => {
		expect(resolveHoverIndex("Enter", -1, 5)).toBe(0);
		expect(resolveHoverIndex(" ", -1, 5)).toBe(0);
	});

	it("advances and retreats from a hovered event", () => {
		expect(resolveHoverIndex("ArrowRight", 2, 5)).toBe(3);
		expect(resolveHoverIndex("ArrowLeft", 2, 5)).toBe(1);
		expect(resolveHoverIndex("ArrowUp", 2, 5)).toBe(1);
	});

	it("clamps at both ends", () => {
		expect(resolveHoverIndex("ArrowRight", 4, 5)).toBe(4);
		expect(resolveHoverIndex("ArrowLeft", 0, 5)).toBe(0);
	});

	it("supports Home and End", () => {
		expect(resolveHoverIndex("Home", 3, 5)).toBe(0);
		expect(resolveHoverIndex("End", 3, 5)).toBe(4);
	});

	it("activates the hovered event on Enter", () => {
		expect(resolveHoverIndex("Enter", 3, 5)).toBe(3);
	});

	it("returns null for keys it does not handle", () => {
		expect(resolveHoverIndex("a", 1, 5)).toBeNull();
		expect(resolveHoverIndex("Tab", 1, 5)).toBeNull();
	});

	it("returns null when there is nothing to navigate", () => {
		expect(resolveHoverIndex("ArrowRight", -1, 0)).toBeNull();
		expect(resolveHoverIndex("Home", -1, 0)).toBeNull();
	});
});
