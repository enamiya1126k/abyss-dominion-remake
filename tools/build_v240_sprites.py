#!/usr/bin/env python3
"""Build v2.4.0 sprite sets with transparent safe margins."""

from __future__ import annotations

from collections import deque
from pathlib import Path
import math
import random

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MONSTERS = ROOT / "assets" / "monsters"
GENERATED = ROOT.parents[1] / "generated_images"
HUMANOID_SHEET = GENERATED / "exec-22f6511d-8673-4b55-ac1b-bde2ad54038f.png"
FEATURED_SHEET = GENERATED / "exec-ace8c005-e859-46f2-b186-b2167ba480b8.png"
ABYSS_SHEET = GENERATED / "exec-796791f4-944b-4bd9-bf7c-13367d7ee654.png"
PRIDE_ELEMENT_SHEET = GENERATED / "exec-c4f5d059-631c-4697-a4cc-0602bc448928.png"
DIVINE_SHEET = GENERATED / "exec-aa4dd4e5-ca64-4932-83f2-49a2c2bebb1a.png"
FRAMES = ("idle1", "idle2", "idle3", "walk1", "walk2", "attack", "damage", "down")


def border_connected_background(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"), dtype=np.int16)
    maximum = rgb.max(axis=2)
    minimum = rgb.min(axis=2)
    candidate = (maximum - minimum <= 18) & (minimum >= 216)
    height, width = candidate.shape
    seen = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        if candidate[0, x]: queue.append((x, 0))
        if candidate[height - 1, x]: queue.append((x, height - 1))
    for y in range(height):
        if candidate[y, 0]: queue.append((0, y))
        if candidate[y, width - 1]: queue.append((width - 1, y))
    while queue:
        x, y = queue.popleft()
        if seen[y, x] or not candidate[y, x]:
            continue
        seen[y, x] = True
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))
    rgba = np.dstack((rgb.astype(np.uint8), np.where(seen, 0, 255).astype(np.uint8)))
    result = Image.fromarray(rgba, "RGBA")
    # Remove isolated pale checker remnants without eroding enclosed white costume areas.
    alpha = result.getchannel("A").filter(ImageFilter.MedianFilter(3))
    result.putalpha(alpha)
    return result


def trim(image: Image.Image) -> Image.Image:
    box = image.getchannel("A").getbbox()
    return image.crop(box) if box else Image.new("RGBA", (1, 1))


def fit(image: Image.Image, size: int, margin: int, *, bottom_bias: int = 0) -> Image.Image:
    subject = trim(image.convert("RGBA"))
    available = size - margin * 2
    scale = min(available / max(1, subject.width), available / max(1, subject.height))
    subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size))
    x = (size - subject.width) // 2
    y = min(size - margin - subject.height, (size - subject.height) // 2 + bottom_bias)
    y = max(margin, y)
    canvas.alpha_composite(subject, (x, y))
    return canvas


def shift(image: Image.Image, dx: int, dy: int) -> Image.Image:
    canvas = Image.new("RGBA", image.size)
    canvas.alpha_composite(image, (dx, dy))
    return canvas


def tint_subject(image: Image.Image, color: tuple[int, int, int], strength: float) -> Image.Image:
    overlay = Image.new("RGBA", image.size, (*color, 255))
    tinted = Image.blend(image.convert("RGBA"), overlay, strength)
    tinted.putalpha(image.getchannel("A"))
    return tinted


def attack_arc(size: int, color: tuple[int, int, int, int]) -> Image.Image:
    layer = Image.new("RGBA", (size, size))
    draw = ImageDraw.Draw(layer)
    width = max(3, size // 42)
    box = (size * .12, size * .12, size * .88, size * .88)
    draw.arc(box, 300, 86, fill=color, width=width)
    draw.arc((box[0] + width * 2, box[1] + width * 2, box[2] - width * 2, box[3] - width * 2), 302, 82, fill=(*color[:3], color[3] // 2), width=max(2, width // 2))
    return layer.filter(ImageFilter.GaussianBlur(max(1, size // 160)))


def generic_pose(base: Image.Image, frame: str, accent: tuple[int, int, int]) -> Image.Image:
    size = base.width
    if frame == "idle1": return base.copy()
    if frame == "idle2": return shift(base, max(1, size // 128), -max(1, size // 170))
    if frame == "idle3": return shift(ImageEnhance.Brightness(base).enhance(1.035), -max(1, size // 128), 0)
    if frame == "walk1":
        rotated = base.rotate(-2.2, Image.Resampling.BICUBIC, expand=False, center=(size // 2, int(size * .72)))
        return shift(rotated, -max(2, size // 64), 0)
    if frame == "walk2":
        rotated = base.rotate(2.2, Image.Resampling.BICUBIC, expand=False, center=(size // 2, int(size * .72)))
        return shift(rotated, max(2, size // 64), 0)
    if frame == "attack":
        rotated = base.rotate(-7, Image.Resampling.BICUBIC, expand=False, center=(size // 2, int(size * .7)))
        rotated.alpha_composite(attack_arc(size, (*accent, 220)))
        return rotated
    if frame == "damage":
        rotated = tint_subject(base, (190, 38, 67), .2).rotate(7, Image.Resampling.BICUBIC, expand=False, center=(size // 2, int(size * .72)))
        return shift(rotated, max(2, size // 56), max(1, size // 128))
    if frame == "down":
        subject = trim(base).rotate(82, Image.Resampling.BICUBIC, expand=True)
        available_w, available_h = size - size // 12, int(size * .55)
        scale = min(available_w / subject.width, available_h / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (size, size))
        canvas.alpha_composite(subject, ((size - subject.width) // 2, size - subject.height - size // 16))
        return canvas
    raise ValueError(frame)


def save_set(folder: str, base: Image.Image, size: int, accent: tuple[int, int, int]) -> None:
    destination = MONSTERS / folder
    destination.mkdir(parents=True, exist_ok=True)
    safe = fit(base, size, 12 if size == 128 else 38)
    for frame in FRAMES:
        image = generic_pose(safe, frame, accent)
        image.save(destination / f"{frame}.png", optimize=True)


def save_custom_set(folder: str, crops: dict[str, tuple[int, int, int, int]], row_sheet: Image.Image, accent: tuple[int, int, int]) -> None:
    destination = MONSTERS / folder
    destination.mkdir(parents=True, exist_ok=True)
    processed: dict[str, Image.Image] = {}
    for frame, box in crops.items():
        processed[frame] = fit(border_connected_background(row_sheet.crop(box)), 512, 38)
    base = processed.get("idle1") or next(iter(processed.values()))
    for frame in FRAMES:
        image = processed.get(frame) or generic_pose(base, frame, accent)
        if frame == "damage": image = tint_subject(image, (190, 38, 67), .16)
        image = fit(image, 512, 34)
        image.save(destination / f"{frame}.png", optimize=True)


def draw_stationery(kind: str, accent: tuple[int, int, int], seed: int) -> Image.Image:
    random.seed(seed)
    scale, size = 4, 128
    image = Image.new("RGBA", (size * scale, size * scale))
    draw = ImageDraw.Draw(image)
    def ellipse(box, fill, outline=(23, 19, 31, 255), width=4): draw.ellipse(tuple(v * scale for v in box), fill=fill, outline=outline, width=width * scale)
    def rect(box, fill, outline=(23, 19, 31, 255), width=4, radius=5): draw.rounded_rectangle(tuple(v * scale for v in box), radius=radius * scale, fill=fill, outline=outline, width=width * scale)
    def poly(points, fill, outline=(23, 19, 31, 255), width=4):
        pts=[(x*scale,y*scale) for x,y in points];draw.polygon(pts,fill=fill);draw.line(pts+[pts[0]],fill=outline,width=width*scale,joint="curve")
    ink=(24, 20, 31, 255); white=(245, 239, 224, 255); glow=(*accent, 255)
    if kind == "eraser":
        ellipse((25, 45, 103, 108), (*accent, 210));rect((33, 35, 95, 91), white);rect((58, 35, 95, 91), glow);ellipse((45, 60, 54, 70), ink, ink, 1);ellipse((74, 60, 83, 70), ink, ink, 1);draw.arc((48*scale,61*scale,80*scale,83*scale),0,180,fill=ink,width=3*scale)
    elif kind == "pushpin":
        ellipse((28, 36, 100, 108), glow);ellipse((46, 54, 56, 64), white, ink, 2);ellipse((72, 54, 82, 64), white, ink, 2)
        for angle in range(0,360,45):
            x=64+math.cos(math.radians(angle))*39;y=69+math.sin(math.radians(angle))*35
            poly([(x-4,y-3),(x+4,y-3),(x,y-16)],white)
    elif kind == "pencil_mouse":
        ellipse((24, 49, 96, 102), (164, 130, 92, 255));ellipse((31, 37, 54, 62), (213, 168, 150, 255));ellipse((66, 37, 89, 62), (213, 168, 150, 255));ellipse((43, 61, 51, 69), ink, ink, 1);ellipse((68, 61, 76, 69), ink, ink, 1);poly([(91,73),(116,60),(111,78)],(236,190,70,255));ellipse((22,69,31,78),(235,145,160,255))
    elif kind == "stapler_crab":
        rect((32,38,96,84),glow,radius=9);rect((37,49,92,63),(80,70,90,255),radius=3);ellipse((43,49,51,57),white,ink,2);ellipse((76,49,84,57),white,ink,2);poly([(32,65),(10,52),(17,76)],glow);poly([(96,65),(118,52),(111,76)],glow)
        for x in (38,52,76,90): draw.line((x*scale,82*scale,(x-8 if x<64 else x+8)*scale,105*scale),fill=ink,width=4*scale)
    elif kind == "compass_beetle":
        ellipse((32,31,96,104),glow);draw.line((64*scale,32*scale,64*scale,104*scale),fill=ink,width=3*scale);ellipse((48,44,56,52),white,ink,2);ellipse((72,44,80,52),white,ink,2);poly([(51,29),(58,9),(64,31)],(205,205,215,255));poly([(77,29),(70,9),(64,31)],(205,205,215,255))
        for y in (55,75,92): draw.line((34*scale,y*scale,17*scale,(y+(-8 if y<75 else 8))*scale),fill=ink,width=4*scale);draw.line((94*scale,y*scale,111*scale,(y+(-8 if y<75 else 8))*scale),fill=ink,width=4*scale)
    elif kind == "gluepot":
        rect((30,30,98,105),glow,radius=12);rect((38,18,90,38),white,radius=5);poly([(35,70),(45,61),(55,72),(65,61),(76,72),(91,61),(91,91),(35,91)],ink);ellipse((45,47,54,57),white,ink,2);ellipse((73,47,82,57),white,ink,2)
    elif kind == "pen_mage":
        poly([(64,14),(43,46),(85,46)],glow);poly([(64,23),(59,39),(69,39)],white);poly([(42,45),(24,111),(104,111),(85,45)],(51,38,76,255));ellipse((49,51,58,60),white,ink,2);ellipse((70,51,79,60),white,ink,2);draw.line((91*scale,40*scale,111*scale,108*scale),fill=glow,width=6*scale);poly([(87,37),(96,22),(100,41)],white)
    elif kind == "correction_ghost":
        poly([(64,18),(30,43),(24,105),(42,94),(55,108),(68,94),(83,108),(103,94),(96,43)],white);rect((45,22,83,50),glow,radius=4);ellipse((46,57,57,69),ink,ink,1);ellipse((70,57,81,69),ink,ink,1);ellipse((57,72,71,84),ink,ink,1)
    elif kind == "scissor_mantis":
        ellipse((45,30,83,104),glow);ellipse((51,20,61,36),ink);ellipse((68,20,78,36),ink);poly([(45,53),(16,28),(29,69)],(205,210,220,255));poly([(83,53),(112,28),(99,69)],(205,210,220,255));draw.line((49*scale,91*scale,31*scale,113*scale),fill=ink,width=4*scale);draw.line((79*scale,91*scale,97*scale,113*scale),fill=ink,width=4*scale)
    elif kind == "pencilcase":
        rect((17,38,111,103),glow,radius=14);draw.line((23*scale,55*scale,105*scale,55*scale),fill=white,width=4*scale);ellipse((36,67,47,79),white,ink,2);ellipse((80,67,91,79),white,ink,2)
        for x,color in ((31,(238,190,61,255)),(51,(90,160,228,255)),(72,(222,89,105,255)),(94,(91,188,111,255))): rect((x-5,17,x+5,51),color,radius=2)
    elif kind == "chalk_dragon":
        ellipse((31,35,91,102),(45,104,75,255));poly([(38,48),(13,31),(25,67)],glow);poly([(86,48),(111,31),(101,68)],glow);poly([(50,37),(55,13),(64,35)],white);poly([(70,36),(78,13),(80,43)],white);ellipse((46,50,56,60),white,ink,2);ellipse((70,50,80,60),white,ink,2);poly([(83,78),(118,91),(91,99)],(45,104,75,255))
    elif kind == "paper_cutter":
        rect((25,29,103,108),(112,83,57,255),radius=6);rect((33,37,95,94),white,radius=3);poly([(63,10),(77,18),(50,91),(39,85)],(208,215,222,255));ellipse((44,51,53,61),ink,ink,1);ellipse((73,51,82,61),ink,ink,1);poly([(41,30),(64,13),(88,30)],glow)
    else:  # developer familiar Chappy
        ellipse((28,35,100,106),glow);ellipse((42,49,55,63),white,ink,2);ellipse((72,49,85,63),white,ink,2);rect((48,75,80,87),ink,ink,1,3);poly([(33,43),(20,22),(47,37)],white);poly([(95,43),(108,22),(81,37)],white);draw.line((92*scale,82*scale,115*scale,105*scale),fill=(195,205,216,255),width=7*scale);ellipse((103,94,120,111),(195,205,216,255),ink,2)
    image = image.resize((size, size), Image.Resampling.LANCZOS)
    return fit(image, 128, 8)


def build_new_species() -> None:
    simple = [
        ("211_eraser_slime", "eraser", (102, 211, 222)), ("212_pushpin_roller", "pushpin", (221, 91, 102)),
        ("213_pencil_mouse", "pencil_mouse", (226, 176, 64)), ("214_stapler_crab", "stapler_crab", (193, 78, 93)),
        ("215_compass_beetle", "compass_beetle", (73, 132, 203)), ("216_gluepot_mimic", "gluepot", (188, 103, 213)),
        ("217_fountain_pen_mage", "pen_mage", (72, 115, 210)), ("218_correction_ghost", "correction_ghost", (119, 206, 232)),
        ("219_scissor_mantis", "scissor_mantis", (98, 194, 121)), ("220_pencilcase_parade", "pencilcase", (212, 93, 142)),
        ("221_chalkboard_dragon", "chalk_dragon", (103, 221, 154)), ("222_forbidden_paper_cutter", "paper_cutter", (221, 75, 68)),
        ("secret_dev_familiar_chappy", "chappy", (202, 119, 242)),
    ]
    for index, (folder, kind, accent) in enumerate(simple):
        save_set(folder, draw_stationery(kind, accent, index + 130), 128, accent)

    sheet = Image.open(HUMANOID_SHEET).convert("RGB")
    humanoids = [
        ("225_kiara", 0, 0, (133, 214, 255)), ("226_roxy", 1, 0, (63, 151, 238)),
        ("228_ai", 2, 0, (155, 219, 255)), ("224_bechi", 0, 1, (108, 185, 245)),
        ("229_eris", 1, 1, (221, 74, 83)), ("223_ochuki", 2, 1, (187, 147, 91)),
    ]
    for folder, col, row, accent in humanoids:
        cell = sheet.crop((col * 512, row * 512, (col + 1) * 512, (row + 1) * 512))
        save_set(folder, border_connected_background(cell), 512, accent)

    featured = Image.open(FEATURED_SHEET).convert("RGB")
    # Use one isolated, complete authored figure per character as the animation
    # source. The generated action-sheet cells overlap, so reusing those crops
    # would introduce exactly the detached edge fragments this release forbids.
    milim_base = border_connected_background(featured.crop((0, 0, 220, 512)))
    golden_base = border_connected_background(featured.crop((0, 512, 230, 1024)))
    save_set("227_milim", milim_base, 512, (246, 71, 174))
    save_set("230_golden_darkness", golden_base, 512, (238, 190, 72))


def build_endgame_characters() -> None:
    """Build all seven Abyss and ten Ten-God sets from new 512-grade originals."""
    abyss = (130, 48, 189)
    divine = (225, 186, 77)
    sheets = [
        (ABYSS_SHEET, [
            "abyss_gluttony", "abyss_extinction", "abyss_wrath",
            "abyss_envy", "abyss_sloth", "abyss_greed",
        ]),
        (PRIDE_ELEMENT_SHEET, [
            "abyss_pride", "ten_fire", "ten_water",
            "ten_thunder", "ten_wind", "ten_earth",
        ]),
        (DIVINE_SHEET, [
            "ten_light", "ten_dark", "ten_ice", "ten_time", "ten_space",
        ]),
    ]
    for sheet_path, folders in sheets:
        sheet = Image.open(sheet_path).convert("RGB")
        cell_width, cell_height = sheet.width // 3, sheet.height // 2
        for index, folder in enumerate(folders):
            column, row = index % 3, index // 3
            inset = 4
            box = (
                column * cell_width + inset,
                row * cell_height + inset,
                (column + 1) * cell_width - inset,
                (row + 1) * cell_height - inset,
            )
            base = border_connected_background(sheet.crop(box))
            accent = divine if folder.startswith("ten_") else abyss
            save_set(folder, base, 512, accent)


def verify() -> None:
    targets = [
        "211_eraser_slime", "212_pushpin_roller", "213_pencil_mouse", "214_stapler_crab", "215_compass_beetle", "216_gluepot_mimic",
        "217_fountain_pen_mage", "218_correction_ghost", "219_scissor_mantis", "220_pencilcase_parade", "221_chalkboard_dragon", "222_forbidden_paper_cutter",
        "223_ochuki", "224_bechi", "225_kiara", "226_roxy", "227_milim", "228_ai", "229_eris", "230_golden_darkness", "secret_dev_familiar_chappy",
        "abyss_gluttony", "abyss_extinction", "abyss_wrath", "abyss_envy", "abyss_sloth", "abyss_greed", "abyss_pride",
        "ten_fire", "ten_water", "ten_thunder", "ten_wind", "ten_earth", "ten_light", "ten_dark", "ten_ice", "ten_time", "ten_space",
    ]
    failures = []
    for folder in targets:
        number = int(folder.split("_", 1)[0]) if folder[:3].isdigit() else None
        expected = 128 if (number is not None and number <= 222) or folder.startswith("secret_") else 512
        if folder.startswith(("abyss_", "ten_")): expected = 512
        for frame in FRAMES:
            path = MONSTERS / folder / f"{frame}.png"
            if not path.exists(): failures.append(f"missing {path.relative_to(ROOT)}");continue
            image = Image.open(path).convert("RGBA")
            if image.size != (expected, expected): failures.append(f"size {path.relative_to(ROOT)}={image.size}")
            box = image.getchannel("A").getbbox()
            if not box: failures.append(f"empty {path.relative_to(ROOT)}")
            elif box[0] < 2 or box[1] < 2 or box[2] > expected - 2 or box[3] > expected - 2: failures.append(f"edge {path.relative_to(ROOT)}={box}")
    if failures:
        raise SystemExit("\n".join(failures))
    print(f"sprite verification PASS: {len(targets)} folders x {len(FRAMES)} frames")


if __name__ == "__main__":
    import sys

    verify_only = "verify" in sys.argv[1:] or "--verify" in sys.argv[1:]
    if not verify_only:
        missing_sources = [source for source in (HUMANOID_SHEET, FEATURED_SHEET, ABYSS_SHEET, PRIDE_ELEMENT_SHEET, DIVINE_SHEET) if not source.exists()]
        if missing_sources:
            raise SystemExit("sprite source sheet missing: " + ", ".join(map(str, missing_sources)))
        build_new_species()
        build_endgame_characters()
    verify()
