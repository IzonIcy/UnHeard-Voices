// The visualization is drawn in CSS pixels and the canvas backing store is
// scaled by devicePixelRatio, so a 1px line is a real 1px hairline on retina
// instead of a half-transparent smear. Hit targets are therefore specified in
// CSS px too, which is what makes them the same physical size on every device.

const FALLBACK_CSS_WIDTH = 1200;
const FALLBACK_CSS_HEIGHT = 600;

const positiveOr = (value, fallback) => {
	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric <= 0) {
		return fallback;
	}
	return numeric;
};

/**
 * Resolve the canvas backing-store size from the laid-out CSS size and the
 * device pixel ratio.
 */
export function computeBackingStore({ cssWidth, cssHeight, dpr }) {
	const width = positiveOr(cssWidth, FALLBACK_CSS_WIDTH);
	const height = positiveOr(cssHeight, FALLBACK_CSS_HEIGHT);
	const ratio = positiveOr(dpr, 1);

	return {
		width: Math.round(width * ratio),
		height: Math.round(height * ratio),
		dpr: ratio,
	};
}

/**
 * Map a client (viewport) coordinate into the canvas' CSS pixel space.
 * Returns null when the element has no layout box yet — dividing by a zero
 * rect would otherwise yield Infinity/NaN and silently kill hit testing.
 */
export function toCanvasSpace(rect, clientX, clientY) {
	if (!rect || !(rect.width > 0) || !(rect.height > 0)) {
		return null;
	}

	return {
		x: clientX - rect.left,
		y: clientY - rect.top,
	};
}

/** Pointer target radius around a plotted event, in CSS pixels. */
export const HIT_RADIUS_PX = 14;
