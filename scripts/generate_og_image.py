"""
Generate the Open Graph image for link previews.

The composition deliberately reuses the app's palette and its constellation
motif so a link preview reads as the same product: the same category colours,
the same dark backdrop, the same polar scatter of nodes.

Run with: python3 scripts/generate_og_image.py
"""

import json
import math
import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT = os.path.join(ROOT, "public", "og-image.png")

CATEGORY_COLORS = {
    "civil_rights": "#d94841",
    "labor": "#de7c2b",
    "indigenous": "#2f7d32",
    "science": "#1565c0",
    "arts": "#8e5ea2",
    "resistance": "#90a4ae",
    "women": "#c2185b",
    "disability": "#00838f",
    "lgbtq": "#5d40b5",
}

SERIF = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SANS = "/System/Library/Fonts/Supplemental/Verdana.ttf"
SANS_BOLD = "/System/Library/Fonts/Supplemental/Verdana Bold.ttf"


def rgb(hex_color):
    """#rrggbb -> (r, g, b). PIL needs numbers, unpacking a string gives chars."""
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def load(path, size):
    return ImageFont.truetype(path, size)


def backdrop():
    """Diagonal gradient, matching the canvas backdrop stops."""
    base = Image.new("RGB", (WIDTH, HEIGHT), "#090a0d")
    pixels = base.load()
    if pixels is None:
        raise RuntimeError("could not access image pixels")
    stops = [
        (0.0, (9, 10, 13)),
        (0.52, (16, 19, 23)),
        (1.0, (6, 8, 11)),
    ]

    for y in range(HEIGHT):
        for x in range(WIDTH):
            t = (x / WIDTH * 0.45) + (y / HEIGHT * 0.55)
            for i in range(len(stops) - 1):
                lo_t, lo = stops[i]
                hi_t, hi = stops[i + 1]
                if lo_t <= t <= hi_t:
                    f = (t - lo_t) / (hi_t - lo_t)
                    pixels[x, y] = tuple(
                        int(lo[c] + (hi[c] - lo[c]) * f) for c in range(3)
                    )
                    break

    return base


def add(base, glow):
    return ImageChops.add(base, glow)


def constellation(image, events, seed=7):
    """Polar scatter of the real events, one node per entry."""
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    cx, cy = WIDTH * 0.74, HEIGHT * 0.44
    max_r = min(WIDTH, HEIGHT) * 0.34

    ordered = sorted(events, key=lambda e: e["id"])
    total = len(ordered)
    rng = random.Random(seed)

    for index, event in enumerate(ordered):
        color = rgb(CATEGORY_COLORS.get(event["category"], "#0f766e"))
        angle = (index / max(total, 1)) * math.tau
        radius = (0.26 + rng.random() * 0.72) * max_r
        x = cx + math.cos(angle) * radius
        y = cy + math.sin(angle) * radius

        r = 4
        # Soft halo so the dots read against the dark backdrop.
        for step in range(4, 0, -1):
            alpha = int(6 * step / 4)
            draw.ellipse(
                [
                    x - r - step * 5,
                    y - r - step * 5,
                    x + r + step * 5,
                    y + r + step * 5,
                ],
                fill=(*color, alpha // 2),
            )
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

    return Image.alpha_composite(image.convert("RGBA"), overlay)


def main():
    with open(
        os.path.join(ROOT, "src", "data", "events.json"), encoding="utf-8"
    ) as handle:
        events = json.load(handle)

    image = backdrop()
    image = add(
        image,
        _radial(
            image.size, WIDTH * 0.16, HEIGHT * 0.18, WIDTH * 0.42, (54, 137, 255), 0.16
        ),
    )
    image = add(
        image,
        _radial(
            image.size, WIDTH * 0.86, HEIGHT * 0.06, WIDTH * 0.36, (0, 214, 164), 0.13
        ),
    )
    image = constellation(image, events)

    draw = ImageDraw.Draw(image)

    draw.text((72, 120), "Unheard Voices", font=load(SERIF, 74), fill="#f4f7fb")
    draw.text(
        (76, 238),
        "60 moments history tends to skip over",
        font=load(SANS, 25),
        fill="#9fb0c4",
    )

    years = sorted(e["date"] for e in events)
    draw.text(
        (76, 288),
        f"{years[0]} \u2013 {years[-1]}",
        font=load(SANS_BOLD, 25),
        fill="#00d6a4",
    )

    # Category legend, ordered by how many events each one carries.
    counts = {}
    for event in events:
        counts[event["category"]] = counts.get(event["category"], 0) + 1

    labels = {
        "civil_rights": "Civil rights",
        "resistance": "Resistance",
        "lgbtq": "LGBTQ",
        "indigenous": "Indigenous",
        "women": "Women",
        "disability": "Disability",
        "labor": "Labor",
        "arts": "Arts",
        "science": "Science",
    }

    x, y = 76, HEIGHT - 118
    for category, _ in sorted(counts.items(), key=lambda item: -item[1]):
        label = labels.get(category) or category.replace("_", " ").title()
        color = CATEGORY_COLORS.get(category) or "#0f766e"
        draw.ellipse([x, y + 6, x + 12, y + 18], fill=rgb(color))
        draw.text((x + 24, y), label, font=load(SANS, 19), fill="#c3d0de")
        x += 24 + int(draw.textlength(label, font=load(SANS, 19))) + 34
        if x > WIDTH - 150:
            x, y = 76, y + 38

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    image.convert("RGB").save(OUTPUT, "PNG", optimize=True)
    print(f"wrote {OUTPUT} ({WIDTH}x{HEIGHT})")


def _radial(size, cx, cy, radius, color, strength):
    from PIL import ImageDraw

    glow = Image.new("RGB", size, (0, 0, 0))
    draw = ImageDraw.Draw(glow)
    steps = 42
    for i in range(steps, 0, -1):
        t = i / steps
        r = radius * t
        fade = (1 - t) ** 2 * strength
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r], fill=tuple(int(c * fade) for c in color)
        )
    return glow


if __name__ == "__main__":
    main()
