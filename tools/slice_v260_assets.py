#!/usr/bin/env python3
"""Deterministically split the approved v2.6.0 sheets into game-ready PNGs.

The source sheets are JPEG previews with white/checkerboard backgrounds.  This
script only performs mechanical extraction: background removal, common-scale
placement, 512 px canvases and edge/baseline auditing.  It does not redraw the
approved artwork.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, PngImagePlugin


ROOT = Path(__file__).resolve().parents[1]
UPLOAD = ROOT.parents[1] / "upload"
FRAME_NAMES = ("idle1", "idle2", "idle3", "walk1", "walk2", "attack", "damage", "down")


def grid_boxes(size: tuple[int, int], cols: int, rows: int):
    width, height = size
    xs = [round(width * index / cols) for index in range(cols + 1)]
    ys = [round(height * index / rows) for index in range(rows + 1)]
    return [(xs[x], ys[y], xs[x + 1], ys[y + 1]) for y in range(rows) for x in range(cols)]


def remove_connected_light_background(source: Image.Image) -> Image.Image:
    """Remove only neutral bright pixels connected to a crop edge.

    Both white and checkerboard preview backgrounds qualify.  Bright pixels
    enclosed by the artwork remain intact, which preserves eyes, highlights,
    silver armour and white clothing.
    """
    image = source.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def candidate(x: int, y: int) -> bool:
        r, g, b, _ = pixels[x, y]
        return min(r, g, b) >= 178 and max(r, g, b) - min(r, g, b) <= 30

    def add(x: int, y: int):
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

    alpha = image.getchannel("A")
    alpha_pixels = alpha.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if visited[row + x]:
                alpha_pixels[x, y] = 0
    image.putalpha(alpha)
    return image


def trimmed(image: Image.Image) -> Image.Image:
    box = image.getchannel("A").getbbox()
    if not box:
        raise RuntimeError("No foreground detected in source cell")
    return image.crop(box)


def place_on_canvas(image: Image.Image, scale: float, *, baseline: int = 488) -> Image.Image:
    width = max(1, round(image.width * scale))
    height = max(1, round(image.height * scale))
    resized = image.resize((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    x = (512 - width) // 2
    y = baseline - height
    if y < 16:
        y = 16
    canvas.alpha_composite(resized, (x, y))
    return canvas


def save_png(image: Image.Image, path: Path):
    """Write via a sibling temp file so interrupted runs never leave half a PNG."""
    temporary = path.with_suffix(".tmp.png")
    image.save(temporary, format="PNG", optimize=False, compress_level=6)
    temporary.replace(path)


def split_character(sheet_name: str, folder: str, cols: int = 4, rows: int = 2):
    source = Image.open(UPLOAD / sheet_name).convert("RGB")
    cells = [trimmed(remove_connected_light_background(source.crop(box))) for box in grid_boxes(source.size, cols, rows)]
    if len(cells) != 8:
        raise RuntimeError(f"{sheet_name}: expected 8 cells")
    scale = min(464 / max(cell.width for cell in cells), 464 / max(cell.height for cell in cells))
    destination = ROOT / "assets" / "monsters" / folder
    destination.mkdir(parents=True, exist_ok=True)
    for name, cell in zip(FRAME_NAMES, cells):
        save_png(place_on_canvas(cell, scale), destination / f"{name}.png")


def split_equipment(sheet_name: str, owner: str, slugs: tuple[str, ...]):
    source = Image.open(UPLOAD / sheet_name).convert("RGB")
    destination = ROOT / "assets" / "ui" / "equipment" / "mythic"
    destination.mkdir(parents=True, exist_ok=True)
    for slug, box in zip(slugs, grid_boxes(source.size, 3, 2)):
        cell = trimmed(remove_connected_light_background(source.crop(box)))
        scale = min(452 / cell.width, 452 / cell.height)
        save_png(place_on_canvas(cell, scale, baseline=482), destination / f"{owner}-{slug}.png")


def split_circles():
    destination = ROOT / "assets" / "magic-circles"
    destination.mkdir(parents=True, exist_ok=True)
    assignments = [
        ("9C0D8C5C-4194-4182-B64B-74F2B9456974.jpeg", (4, 1), ("plain", "slot_fate", "last_life", "reincarnation")),
        # The lower row deliberately leaves the fourth column empty.  Keep the
        # same four-column geometry as the upper row and consume only 3 cells.
        ("9C0D8C5C-4194-4182-B64B-74F2B9456974.jpeg", (4, 1), ("mana_reversal", "deep_silence", "aegis")),
        ("EFEDD43F-58F0-400B-AB85-7BD71E62D8AE.jpeg", (3, 2), ("opening_rite", "judgment20", "blood_acceleration", "weak_critical", "sacrifice_lottery", "inheritance")),
        ("6E7031EC-12F6-4EA6-A5CC-4922C9387CBD.jpeg", (3, 2), ("gold_power", "random_arsenal", "sole_survivor", "death_drain", "crimson_threshold", "death_mirror")),
    ]
    for sheet_name, (cols, rows), ids in assignments:
        source = Image.open(UPLOAD / sheet_name).convert("RGB")
        if sheet_name.startswith("9C0"):
            half = source.height // 2
            is_upper = ids[0] == "plain"
            source = source.crop((0, 0, source.width, half)) if is_upper else source.crop((0, half, source.width, source.height))
        boxes = grid_boxes(source.size, cols, rows)
        for circle_id, box in zip(ids, boxes):
            cell = trimmed(remove_connected_light_background(source.crop(box)))
            scale = min(464 / cell.width, 464 / cell.height)
            save_png(place_on_canvas(cell, scale, baseline=488), destination / f"{circle_id}.png")


def audit_and_contact_sheet():
    files = sorted((ROOT / "assets" / "monsters").glob("myth_*/*.png"))
    files += sorted((ROOT / "assets" / "magic-circles").glob("*.png"))
    files += sorted((ROOT / "assets" / "ui" / "equipment" / "mythic").glob("*.png"))
    failures = []
    for path in files:
        image = Image.open(path).convert("RGBA")
        if image.size != (512, 512):
            failures.append(f"{path}: {image.size}")
            continue
        alpha = image.getchannel("A")
        border = Image.new("L", image.size, 0)
        draw = ImageDraw.Draw(border)
        draw.rectangle((0, 0, 511, 511), outline=255, width=12)
        if ImageChops.multiply(alpha, border).getbbox():
            failures.append(f"{path}: foreground inside 12 px safety border")
    if failures:
        raise RuntimeError("\n".join(failures))

    preview = ROOT / "artifacts" / "v260-assets-contact-sheet.png"
    preview.parent.mkdir(parents=True, exist_ok=True)
    thumb = 128
    columns = 8
    rows = (len(files) + columns - 1) // columns
    canvas = Image.new("RGBA", (columns * thumb, rows * (thumb + 18)), (22, 18, 28, 255))
    draw = ImageDraw.Draw(canvas)
    for index, path in enumerate(files):
        image = Image.open(path).convert("RGBA").resize((thumb, thumb), Image.Resampling.LANCZOS)
        x = index % columns * thumb
        y = index // columns * (thumb + 18)
        canvas.alpha_composite(image, (x, y))
        draw.text((x + 2, y + thumb), path.stem[:18], fill=(235, 220, 245, 255))
    canvas.convert("RGB").save(preview, quality=92)
    print(f"audited {len(files)} assets; preview={preview}")


def main():
    split_character("E5F0C404-840A-405F-A662-A46D165E46B1.jpeg", "myth_enami")
    split_character("D914C829-B0A3-4306-8EF4-784B18BF13ED.jpeg", "myth_rion")
    split_character("72A5B6EC-DDBC-47D9-9E22-36B3A441728F.jpeg", "myth_yori")
    split_character("9E6AA65B-1980-460D-9CA4-2861E0E2E165.jpeg", "myth_hide")
    split_equipment("BEB7CF2E-72D9-47AF-98F6-CFEF3FADB20C.jpeg", "enami", ("weapon-1", "weapon-2", "armor-1", "armor-2", "accessory-1", "accessory-2"))
    split_equipment("14EA762B-6C49-4D41-BAA6-EE8AE1BA5D5A.jpeg", "rion", ("weapon-1", "weapon-2", "armor-1", "armor-2", "accessory-1", "accessory-2"))
    split_equipment("28E4C38F-5C07-463D-8223-9012DEDF8553.jpeg", "yori", ("weapon-1", "weapon-2", "armor-1", "armor-2", "accessory-1", "accessory-2"))
    split_equipment("16DA7181-5910-40AE-A217-9B40F18A163F.jpeg", "hide", ("weapon-1", "weapon-2", "armor-1", "armor-2", "accessory-1", "accessory-2"))
    split_circles()
    audit_and_contact_sheet()


if __name__ == "__main__":
    main()
