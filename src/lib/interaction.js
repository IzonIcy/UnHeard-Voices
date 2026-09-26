// Pointer and keyboard interaction math, kept out of the component so it can
// be tested without a canvas or a layout engine.

// .hover-tooltip is max-width 240 + 14px padding each side + 1px borders.
const TOOLTIP_WIDTH = 270;
// Title + year + a 100 character description slice, with padding.
const TOOLTIP_HEIGHT = 170;
const VIEWPORT_MARGIN = 8;
const TOOLTIP_OFFSET = 14;

/**
 * Keep the tooltip fully on screen. Clamps against the real box size in both
 * directions — the previous version only clamped the upper bound against
 * hardcoded numbers smaller than the tooltip, so hovering a node in the
 * bottom-right corner pushed it off screen, and a viewport smaller than those
 * constants produced negative offsets.
 */
export function clampTooltipPosition({ x, y, viewportWidth, viewportHeight }) {
	const maxLeft = Math.max(
		VIEWPORT_MARGIN,
		viewportWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN,
	);
	const maxTop = Math.max(
		VIEWPORT_MARGIN,
		viewportHeight - TOOLTIP_HEIGHT - VIEWPORT_MARGIN,
	);

	return {
		left: Math.min(Math.max(VIEWPORT_MARGIN, x + TOOLTIP_OFFSET), maxLeft),
		top: Math.min(Math.max(VIEWPORT_MARGIN, y + TOOLTIP_OFFSET), maxTop),
	};
}

const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown"]);
const PREVIOUS_KEYS = new Set(["ArrowLeft", "ArrowUp"]);

/**
 * Resolve which event a key press should move the highlight to.
 * `currentIndex` is -1 when nothing is hovered. Returns null for keys the
 * canvas does not handle, and null for Escape, which clears the highlight.
 */
export function resolveHoverIndex(key, currentIndex, eventCount) {
	if (eventCount <= 0) {
		return null;
	}

	const maxIndex = eventCount - 1;

	if (NEXT_KEYS.has(key)) {
		// With nothing hovered, forward movement lands on the first event rather
		// than skipping it.
		return currentIndex < 0 ? 0 : Math.min(currentIndex + 1, maxIndex);
	}

	if (PREVIOUS_KEYS.has(key)) {
		return currentIndex < 0 ? 0 : Math.max(currentIndex - 1, 0);
	}

	if (key === "Home") {
		return 0;
	}

	if (key === "End") {
		return maxIndex;
	}

	if (key === "Enter" || key === " ") {
		// Activate the first event when the user has not moved the highlight yet,
		// instead of opening one they cannot see selected.
		return currentIndex < 0 ? 0 : currentIndex;
	}

	return null;
}
