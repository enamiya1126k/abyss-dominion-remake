#!/usr/bin/env python3
"""Build the v2.6.1 rotation-safe circles and stable Rion sprite loop.

The authored sheets come from the approved image-generation pass.  This script
only performs deterministic production work: grid slicing, connected preview
background removal, common-pivot placement, three animation phases, and edge
auditing.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path
import shutil
import tempfile

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHEETS = ROOT / "artifacts" / "v261-source-sheets"
FRAME_NAMES = ("idle1", "idle2", "idle3", "walk1", "walk2", "attack", "damage", "down")

RION_SHEET = SOURCE_SHEETS / "rion-8frame-sheet.png"
CIRCLE_SHEETS = (
    (
        SOURCE_SHEETS / "circles-opening-sheet.png",
        3,
        2,
        ("opening_rite", "judgment20", "blood_acceleration", "weak_critical", "sacrifice_lottery", "inheritance"),
    ),
    (
        SOURCE_SHEETS / "circles-core-sheet.png",
        4,
        2,
        ("plain", "slot_fate", "last_life", "reincarnation", "mana_reversal", "deep_silence", "aegis"),
    ),
    (
        SOURCE_SHEETS / "circles-endgame-sheet.png",
        3,
        2,
        ("gold_power", "random_arsenal", "sole_survivor", "death_drain", "crimson_threshold", "death_mirror"),
    ),
)


def grid_boxes(size: tuple[int, int], cols: int, rows: int) -> list[tuple[int, int, int, int]]:
    width, height = size
    xs = [round(width * index / cols) for index in range(cols + 1)]
    ys = [round(height * index / rows) for index in range(rows + 1)]
    return [(xs[x], ys[y], xs[x + 1], ys[y + 1]) for y in range(rows) for x in range(cols)]


def remove_connected_light_background(source: Image.Image, *, clear_pure_white: bool = False) -> Image.Image:
    """Remove neutral preview background while preserving enclosed highlights."""
    image = source.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def candidate(x: int, y: int) -> bool:
        red, green, blue, _alpha = pixels[x, y]
        return min(red, green, blue) >= 178 and max(red, green, blue) - min(red, green, blue) <= 32

    def add(x: int, y: int) -> None:
        index = y * width + x
        if not visited[index] and candidate(x, y):
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)
    while queue:
        x, y = queue.popleft()
        for nx in range(max(0, x - 1), min(width, x + 2)):
            for ny in range(max(0, y - 1), min(height, y + 2)):
                add(nx, ny)

    rgba = np.asarray(image).copy()
    alpha = rgba[:, :, 3]
    alpha[np.asarray(visited, dtype=np.uint8).reshape(height, width).astype(bool)] = 0
    if clear_pure_white:
        rgb = rgba[:, :, :3]
        pure = (rgb.min(axis=2) >= 248) & ((rgb.max(axis=2) - rgb.min(axis=2)) <= 7)
        alpha[pure] = 0
    rgba[:, :, 3] = alpha
    return Image.fromarray(rgba, "RGBA")


def trimmed(image: Image.Image) -> Image.Image:
    box = image.getchannel("A").getbbox()
    if not box:
        raise RuntimeError("No foreground detected in generated cell")
    return image.crop(box)


def place_centered(image: Image.Image, maximum: int = 452) -> Image.Image:
    scale = min(maximum / max(1, image.width), maximum / max(1, image.height))
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((512 - size[0]) // 2, (512 - size[1]) // 2))
    return canvas


def place_baseline(image: Image.Image, scale: float, baseline: int = 484) -> Image.Image:
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    x = (512 - size[0]) // 2
    y = max(14, baseline - size[1])
    canvas.alpha_composite(resized, (x, y))
    return canvas


def boost_phase(image: Image.Image, angle: float, brightness: float, glow: bool = False) -> Image.Image:
    rotated = image.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False)
    alpha = rotated.getchannel("A")
    boosted = ImageEnhance.Color(rotated).enhance(1.08)
    boosted = ImageEnhance.Brightness(boosted).enhance(brightness)
    boosted.putalpha(alpha)
    if not glow:
        return boosted
    aura = Image.new("RGBA", image.size, (166, 92, 255, 0))
    aura.putalpha(alpha.filter(ImageFilter.GaussianBlur(5)).point(lambda value: round(value * .28)))
    return Image.alpha_composite(aura, boosted)


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    handle = tempfile.NamedTemporaryFile(prefix="abyss-v261-", suffix=".png", delete=False)
    handle.close()
    temporary = Path(handle.name)
    try:
        image.save(temporary, "PNG", optimize=True, compress_level=7)
        shutil.copyfile(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def build_rion() -> None:
    source = Image.open(RION_SHEET).convert("RGB")
    cells = [
        trimmed(remove_connected_light_background(source.crop(box)))
        for box in grid_boxes(source.size, 4, 2)
    ]
    if len(cells) != 8:
        raise RuntimeError(f"Rion: expected 8 cells, found {len(cells)}")
    scale = min(448 / max(cell.width for cell in cells), 452 / max(cell.height for cell in cells))
    destination = ROOT / "assets" / "monsters" / "myth_rion"
    for name, cell in zip(FRAME_NAMES, cells):
        save_png(place_baseline(cell, scale, baseline=484), destination / f"{name}.png")


def build_circles() -> None:
    destination = ROOT / "assets" / "magic-circles"
    authored = 0
    for sheet_path, columns, rows, ids in CIRCLE_SHEETS:
        source = Image.open(sheet_path).convert("RGB")
        boxes = grid_boxes(source.size, columns, rows)
        for circle_id, box in zip(ids, boxes):
            base = place_centered(trimmed(remove_connected_light_background(source.crop(box), clear_pure_white=True)), 446)
            save_png(base, destination / f"{circle_id}.png")
            if circle_id == "plain":
                continue
            save_png(boost_phase(base, 4.0, 1.10), destination / f"{circle_id}-2.png")
            save_png(boost_phase(base, -4.0, 1.20, glow=True), destination / f"{circle_id}-3.png")
            authored += 3
    if authored != 54:
        raise RuntimeError(f"Expected 54 animated circle files, built {authored}")


def border_touched(image: Image.Image, width: int = 12) -> bool:
    alpha = image.getchannel("A")
    border = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(border)
    draw.rectangle((0, 0, image.width - 1, image.height - 1), outline=255, width=width)
    return ImageChops.multiply(alpha, border).getbbox() is not None


def audit() -> None:
    circles = ROOT / "assets" / "magic-circles"
    circle_ids = [circle_id for _sheet, _columns, _rows, ids in CIRCLE_SHEETS for circle_id in ids if circle_id != "plain"]
    animated = [circles / f"{circle_id}{suffix}.png" for circle_id in circle_ids for suffix in ("", "-2", "-3")]
    expected = 18 * 3
    if len(animated) != expected:
        raise RuntimeError(f"Expected {expected} animated circle PNGs, found {len(animated)}")
    targets = animated + [circles / "plain.png"] + sorted((ROOT / "assets" / "monsters" / "myth_rion").glob("*.png"))
    failures: list[str] = []
    temporaries = sorted(circles.glob("*.tmp.png"))
    if temporaries:
        failures.append(f"temporary circle files remain: {[path.name for path in temporaries]}")
    for path in targets:
        image = Image.open(path).convert("RGBA")
        if image.size != (512, 512):
            failures.append(f"{path.relative_to(ROOT)}: size={image.size}")
        if image.getchannel("A").getextrema()[0] == 255:
            failures.append(f"{path.relative_to(ROOT)}: no transparent pixels")
        if border_touched(image):
            failures.append(f"{path.relative_to(ROOT)}: foreground inside 12px safety border")
    rion_boxes = {
        path.stem: Image.open(path).convert("RGBA").getchannel("A").getbbox()
        for path in sorted((ROOT / "assets" / "monsters" / "myth_rion").glob("*.png"))
    }
    upright = [rion_boxes[name] for name in FRAME_NAMES[:-1]]
    centres = [(box[0] + box[2]) / 2 for box in upright if box]
    bottoms = [box[3] for box in upright if box]
    if max(centres) - min(centres) > 14:
        failures.append(f"Rion upright centre spread too large: {max(centres)-min(centres):.1f}px")
    if max(bottoms) - min(bottoms) > 14:
        failures.append(f"Rion upright baseline spread too large: {max(bottoms)-min(bottoms):.1f}px")
    if failures:
        raise RuntimeError("\n".join(failures))
    print(f"asset audit PASS: {len(animated)} circle animation PNGs + 8 Rion frames")
    print("Rion boxes:", rion_boxes)


def contact_sheet() -> None:
    circle_paths = []
    for sheet_path, _columns, _rows, ids in CIRCLE_SHEETS:
        del sheet_path
        for circle_id in ids:
            if circle_id != "plain":
                circle_paths.extend(
                    ROOT / "assets" / "magic-circles" / (f"{circle_id}{suffix}.png")
                    for suffix in ("", "-2", "-3")
                )
    rion_paths = [ROOT / "assets" / "monsters" / "myth_rion" / f"{name}.png" for name in FRAME_NAMES]
    paths = circle_paths + rion_paths
    thumb, label_height, columns = 112, 15, 9
    rows = (len(paths) + columns - 1) // columns
    canvas = Image.new("RGBA", (columns * thumb, rows * (thumb + label_height)), (18, 13, 25, 255))
    draw = ImageDraw.Draw(canvas)
    for index, path in enumerate(paths):
        preview = Image.open(path).convert("RGBA").resize((thumb, thumb), Image.Resampling.LANCZOS)
        x, y = index % columns * thumb, index // columns * (thumb + label_height)
        canvas.alpha_composite(preview, (x, y))
        draw.text((x + 2, y + thumb), path.stem[:17], fill=(239, 224, 246, 255))
    output = ROOT / "artifacts" / "v261-corrections-contact-sheet.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output, quality=92)
    print(f"contact sheet: {output}")


def main() -> None:
    for path in (RION_SHEET, *(entry[0] for entry in CIRCLE_SHEETS)):
        if not path.exists():
            raise FileNotFoundError(path)
    for temporary in (ROOT / "assets" / "magic-circles").glob("*.tmp.png"):
        temporary.unlink()
    build_rion()
    build_circles()
    audit()
    contact_sheet()
    for temporary in (ROOT / "assets" / "magic-circles").glob("*.tmp.png"):
        temporary.unlink()


if __name__ == "__main__":
    main()
