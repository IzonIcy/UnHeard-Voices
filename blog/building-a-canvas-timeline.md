---
title: "Building a canvas timeline that doesn't lie about where things are"
description: "What I got wrong about devicePixelRatio, hit targets, and stable layouts while building an interactive history timeline on canvas."
date: 2026-09-25
---

I built [Unheard Voices](https://un-heard-voices-8xof.vercel.app/), a timeline of 60 historical
moments that mainstream timelines tend to skip over. It's a Vite and React app with a
hand-written Canvas 2D renderer and a static JSON dataset. No D3, no charting library, no backend.

This is the part I got wrong, because the interesting bugs were not the ones I expected.

## The retina bug

The canvas started life with hardcoded dimensions:

```jsx
<canvas width={1200} height={600} className="event-canvas" />
```

and CSS that squeezed it to fit:

```css
.event-canvas {
  max-width: 100%;
  height: auto;
}
```

So the browser took a 1200x600 backing store and resampled it onto a ~994px box. Then it did it
again for every device pixel. The 1px gridlines were rendering at partial opacity, dot edges were
soft, and the PNG export was always exactly 1200x600 regardless of what device you were on.

For a chart, crispness isn't decoration. It's the difference between a hairline and a smudge, and
on a data visualization that _is_ the product.

The fix is the standard one, and I had somehow not applied it:

```js
const { width, height, dpr } = computeBackingStore({
  cssWidth: canvas.clientWidth,
  cssHeight: canvas.clientHeight,
  dpr: window.devicePixelRatio,
});

canvas.width = width;
canvas.height = height;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

After that, every drawing function works in CSS pixels and `setTransform` maps them onto the denser
backing store. `computeBackingStore` and `toCanvasSpace` live in `src/lib/canvasGeometry.js` with
unit tests, because the interesting cases are the degenerate ones: a `rect.width` of 0 before
layout, a `devicePixelRatio` of `undefined` in jsdom.

I also dropped the `width`/`height` attributes entirely and let CSS own the box with
`width: 100%; aspect-ratio: 2 / 1`. Leaving the attributes in place means they fight the sizing
effect on every repaint, which is exactly the bug I was trying to fix.

## The bug hiding inside the retina bug

Hit testing was the reason I nearly reverted this.

Each event stored a `hitRadius` of 14 for its pointer target, and the code converted client
coordinates into canvas space with:

```js
const scaleX = canvas.width / rect.width;
```

That math is correct _if_ the radii are in the same units as the coordinates, which they now are.
But they weren't before. The radius was effectively `14 × rect.width / 1200`, which on a 360px
phone is about **4 pixels**. You could not reliably tap a node on mobile. The bug was invisible on
my laptop and total on a phone.

Two bugs, one fix, and they were coupled: geometry in CSS pixels with a dpr-scaled backing store, or
geometry in backing-store pixels. Anything in between is a bug waiting for a device.

## A layout that moved when you filtered

The constellation view places events on a polar scatter. Each node's radius and vertical position
came from a hash of its id, which is stable. The angle came from the node's **index in the currently
visible array**:

```js
ringAngle: (index / Math.max(visibleEvents.length, 1)) * Math.PI * 2;
```

That guarantees an even spread, which is why I wrote it that way. It also means hiding a single
category renumbers everything after it and rotates the whole graph. You lose your spatial memory,
and a shared URL no longer reproduces the layout the sender was looking at.

The fix that keeps the even spread is to derive the angle from position in the **full dataset
ordering**, not the visible subset:

```js
export function computeStarLayout(orderedIds) {
  const total = Math.max(orderedIds.length, 1);
  const layout = {};
  orderedIds.forEach((id, index) => {
    layout[id] = {
      graphY: 0.12 + stableValue(id, 1) * 0.76,
      ringRadius: 0.26 + stableValue(id, 2) * 0.72,
      ringAngle: (index / total) * Math.PI * 2,
    };
  });
  return layout;
}
```

Now every event has a slot whether or not it's on screen, and hiding things can't move anything.
The test that matters is the one that asserts a node's position is identical after filtering the
set down to a subset.

## The throttle that made things worse

I throttled `mousemove` with `requestAnimationFrame` to keep hover off the render path:

```js
if (rafIdRef.current) return;
rafIdRef.current = requestAnimationFrame(() => {
  rafIdRef.current = null;
  updateHoverFromPointer(event.clientX, event.clientY);
});
```

Two problems. The `return` discards every event that arrives while a frame is queued, so the
callback runs with whichever coordinates arrived _first_ — up to a frame stale. And nothing ever
cancelled the frame.

The second one produced a ghost hover that was genuinely hard to see. A frame gets queued, the
pointer leaves before it runs, `onMouseLeave` clears the highlight, and then the queued frame fires
and re-arms it. The glow ring and tooltip hang around for a pointer that isn't there. Same thing on
unmount, calling `setState` on a dead tree.

The version that works keeps the newest coordinates in a ref and cancels the frame on leave and
unmount:

```js
pointerRef.current = { x: event.clientX, y: event.clientY };
if (rafIdRef.current) return;
rafIdRef.current = requestAnimationFrame(() => {
  rafIdRef.current = null;
  updateHoverFromPointer(pointerRef.current.x, pointerRef.current.y);
});
```

Throttle by _coalescing_ to the latest value, not by dropping frames on the floor.

## Keyboard nav that skipped the first event

This one was a single expression:

```js
const currentIndex = Math.max(
  visibleEvents.findIndex((item) => item.id === hoveredEventId),
  0,
);
```

`findIndex` returns `-1` when nothing is hovered, and `Math.max(-1, 0)` makes that "index 0",
i.e. the first event is already selected. So the first `ArrowRight` moved to the _second_ event, and
after Escape, `Enter` would open the first event with nothing visibly highlighted.

`Math.max(..., 0)` is a classic "make the type happy" line that quietly invents a selection state.
The fix is to treat "nothing hovered" as `-1` and handle it explicitly, which I pushed into a pure
function so it could be tested without a canvas:

```js
if (NEXT_KEYS.has(key)) {
  return currentIndex < 0 ? 0 : Math.min(currentIndex + 1, maxIndex);
}
```

The regression test is worth quoting because it was worth exactly nothing before the fix:

```js
it("reaches the first event with ArrowRight, not the second", async () => {
  // ...
  await press(canvas, "ArrowRight");
  await press(canvas, "Enter");
  expect(panelTitle(container)).toContain(FIRST_EVENT.title);
});
```

Against the old code it opened _Nanny of the Maroons_ instead of the New York Slave Revolt.

## What I'd tell past me

**Author geometry in one space.** CSS pixels, always. Let `setTransform` bridge to the backing
store. Every bug in this post traces back to two coordinate systems that didn't agree.

**If a number is displayed, derive it.** The header said "1700–2026" and `package.json` said the
same, for a dataset that runs 1712–2025. Two hand-maintained copies of a fact that the code already
knew. It now reads `from {minYear}-{maxYear}` and cannot drift.

**Test the degenerate inputs.** `rect.width === 0` doesn't crash — it returns `Infinity`, the
`Infinity` quietly fails every distance comparison, and hit testing just silently stops working. A
failure with no error message is the expensive kind.

**Check the phone.** Every one of the retina and hit-target problems was invisible at 1440px. The
canvas is the same size everywhere, so the bug is the coordinates, not the layout.

## Things I didn't do

I skipped the virtualized list I'd planned. At 60 events it would have been a dependency and a
regression surface in exchange for nothing. I also skipped the TypeScript rewrite I'd been putting
off, for the uncomfortable reason that it would have caught almost none of the above. Not one of
these bugs was a type error. They were all coordinate-space and lifecycle mistakes, and a compiler
has nothing to say about either.

That's not an argument against types. It's an argument for fixing the thing that's actually broken
first, and being honest that the migration is a separate piece of work from the bugs.
