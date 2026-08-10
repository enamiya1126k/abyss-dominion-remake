#!/usr/bin/env python3
"""Audit every packaged monster sprite folder and transparent image edge."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MONSTERS = ROOT / "assets" / "monsters"
FRAMES = ("idle1", "idle2", "idle3", "walk1", "walk2", "attack", "damage", "down")


def main() -> None:
    folders = sorted(path for path in MONSTERS.iterdir() if path.is_dir())
    failures: list[str] = []
    checked = 0
    for folder in folders:
        for frame in FRAMES:
            path = folder / f"{frame}.png"
            if not path.exists():
                failures.append(f"missing {path.relative_to(ROOT)}")
                continue
            with Image.open(path) as source:
                image = source.convert("RGBA")
            checked += 1
            width, height = image.size
            if width != height:
                failures.append(f"non-square {path.relative_to(ROOT)}={image.size}")
            box = image.getchannel("A").getbbox()
            if not box:
                failures.append(f"empty {path.relative_to(ROOT)}")
            elif box[0] <= 0 or box[1] <= 0 or box[2] >= width or box[3] >= height:
                failures.append(f"edge-touch {path.relative_to(ROOT)}={box}")
    if failures:
        raise SystemExit("\n".join(failures))
    print(f"sprite catalog audit PASS: {len(folders)} folders / {checked} files / edge touches 0")


if __name__ == "__main__":
    main()
