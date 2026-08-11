#!/usr/bin/env python3
"""Normalize accepted 211-230 / Abyss / Ten Gods sprite loops.

The artwork and canvas are preserved.  Only two mechanical repairs are made:
1. tiny enclosed transparency holes in the dense body region are restored;
2. idle-loop core mass is normalized around the already-correct centre/baseline.
"""

from __future__ import annotations

import argparse
import csv
import shutil
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, label


FRAME_NAMES = ("idle1", "idle2", "idle3", "walk1", "walk2", "attack", "damage", "down")


def is_target(name: str) -> bool:
    return name.startswith(("abyss_", "ten_")) or (name[:3].isdigit() and 211 <= int(name[:3]) <= 230)


def repair_enclosed_holes(image: Image.Image) -> tuple[Image.Image, int]:
    rgba = np.asarray(image.convert("RGBA")).copy()
    alpha = rgba[:, :, 3]
    height, width = alpha.shape
    regions, count = label(alpha == 0, structure=np.ones((3, 3), dtype=np.uint8))
    border = set(np.unique(np.concatenate((regions[0], regions[-1], regions[:, 0], regions[:, -1]))))
    maximum = max(4, round(220 * (width / 512) ** 2))
    repaired = 0

    for region_id in range(1, count + 1):
        if region_id in border:
            continue
        ys, xs = np.nonzero(regions == region_id)
        size = len(xs)
        if not size or size > maximum:
            continue
        # Only repair the central body.  Large halo centres, weapon cut-outs,
        # hair gaps and trailing VFX remain transparent by design.
        cx, cy = float(xs.mean()), float(ys.mean())
        if not (.18 * width <= cx <= .82 * width and .16 * height <= cy <= .90 * height):
            continue
        if (int(xs.max()) - int(xs.min())) > width * .07 or (int(ys.max()) - int(ys.min())) > height * .07:
            continue
        hole = regions == region_id
        _distance, nearest = distance_transform_edt(hole, return_indices=True)
        rgba[hole] = rgba[nearest[0][hole], nearest[1][hole]]
        repaired += size

    return Image.fromarray(rgba, "RGBA"), repaired


def core_mass(image: Image.Image) -> float:
    alpha = np.asarray(image.getchannel("A"), dtype=np.float32) / 255.0
    height, width = alpha.shape
    distance = distance_transform_edt(alpha > .20)
    roi = np.zeros_like(alpha, dtype=bool)
    roi[round(.18 * height):round(.88 * height), round(.20 * width):round(.80 * width)] = True
    return float(np.sum(np.minimum(distance, width / 32.0) ** 2 * alpha * roi))


def safe_scale(image: Image.Image, desired: float, pivot: tuple[float, float]) -> float:
    box = image.getchannel("A").getbbox()
    if not box or desired <= 1:
        return desired
    left, top, right, bottom = box
    px, py = pivot
    limits = [1.08]
    if left < px:
        limits.append(px / max(1e-6, px - left))
    if right > px:
        limits.append((image.width - px) / max(1e-6, right - px))
    if top < py:
        limits.append(py / max(1e-6, py - top))
    if bottom > py:
        limits.append((image.height - py) / max(1e-6, bottom - py))
    return min(desired, *limits)


def scale_about(image: Image.Image, factor: float, pivot: tuple[float, float]) -> Image.Image:
    if abs(factor - 1.0) < .002:
        return image.copy()
    width, height = image.size
    scaled = image.resize((max(1, round(width * factor)), max(1, round(height * factor))), Image.Resampling.NEAREST)
    px, py = pivot
    offset = (round(px - px * factor), round(py - py * factor))
    output = Image.new("RGBA", image.size, (0, 0, 0, 0))
    output.alpha_composite(scaled, offset)
    return output


def process_folder(source: Path, destination: Path, log: list[dict[str, object]]) -> None:
    frames: dict[str, Image.Image] = {}
    repairs: dict[str, int] = {}
    for frame_name in FRAME_NAMES:
        repaired, count = repair_enclosed_holes(Image.open(source / f"{frame_name}.png").convert("RGBA"))
        frames[frame_name], repairs[frame_name] = repaired, count

    idle_masses = [core_mass(frames[name]) for name in ("idle1", "idle2", "idle3")]
    median = float(np.median(idle_masses))
    destination.mkdir(parents=True, exist_ok=True)
    for frame_name in FRAME_NAMES:
        image = frames[frame_name]
        factor = 1.0
        if frame_name.startswith("idle"):
            index = int(frame_name[-1]) - 1
            raw = (median / max(1.0, idle_masses[index])) ** .5
            factor = max(.92, min(1.08, raw))
            factor = safe_scale(image, factor, (image.width / 2, image.height * .875))
            image = scale_about(image, factor, (image.width / 2, image.height * .875))
        image.save(destination / f"{frame_name}.png", optimize=True)
        log.append({"folder": source.name, "frame": frame_name, "scale": f"{factor:.4f}", "repaired_pixels": repairs[frame_name]})


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--replace", action="store_true")
    args = parser.parse_args()
    targets = sorted(folder for folder in args.source.iterdir() if folder.is_dir() and is_target(folder.name))
    if len(targets) != 37:
        raise RuntimeError(f"Expected 37 target folders, found {len(targets)}")
    if args.destination.exists():
        if not args.replace:
            raise FileExistsError(args.destination)
        shutil.rmtree(args.destination)
    args.destination.mkdir(parents=True)
    log: list[dict[str, object]] = []
    for folder in targets:
        process_folder(folder, args.destination / folder.name, log)
    with (args.destination / "normalization.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=("folder", "frame", "scale", "repaired_pixels"))
        writer.writeheader(); writer.writerows(log)
    print(f"normalized {len(targets)} folders / {len(log)} frames")


if __name__ == "__main__":
    main()
