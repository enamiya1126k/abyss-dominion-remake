#!/usr/bin/env python3
"""Repack equipment atlas icons so no neighbouring-cell pixels can leak."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import label


CELL = 128


def repack(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    if width % CELL or height % CELL:
        raise RuntimeError(f"Unexpected atlas dimensions: {source}: {image.size}")
    columns, rows = width // CELL, height // CELL
    rgba = np.asarray(image)
    regions, count = label(rgba[:, :, 3] > 0, structure=np.ones((3, 3), dtype=np.uint8))
    assigned: dict[tuple[int, int], list[int]] = {(x, y): [] for y in range(rows) for x in range(columns)}
    for region_id in range(1, count + 1):
        ys, xs = np.nonzero(regions == region_id)
        if len(xs) < 3:
            continue
        column = max(0, min(columns - 1, int(float(xs.mean()) // CELL)))
        row = max(0, min(rows - 1, int(float(ys.mean()) // CELL)))
        assigned[column, row].append(region_id)

    output = Image.new("RGBA", image.size, (0, 0, 0, 0))
    for row in range(rows):
        for column in range(columns):
            ids = assigned[column, row]
            if not ids:
                raise RuntimeError(f"No icon assigned to {source.name} cell {column},{row}")
            # The source atlases contain detached pixels from the neighbouring
            # icon above/below.  Every real equipment icon has one dominant
            # connected silhouette, so retaining that silhouette is the most
            # reliable way to prevent another cell's tip from leaking into the
            # rendered card.
            icon_id = max(ids, key=lambda region_id: int(np.count_nonzero(regions == region_id)))
            mask = regions == icon_id
            ys, xs = np.nonzero(mask)
            left, top, right, bottom = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
            isolated = np.zeros_like(rgba)
            isolated[mask] = rgba[mask]
            icon = Image.fromarray(isolated, "RGBA").crop((left, top, right, bottom))
            scale = min(1.0, 108 / max(1, icon.width), 108 / max(1, icon.height))
            if scale < 1:
                icon = icon.resize((max(1, round(icon.width * scale)), max(1, round(icon.height * scale))), Image.Resampling.NEAREST)
            x = column * CELL + (CELL - icon.width) // 2
            y = row * CELL + (CELL - icon.height) // 2
            output.alpha_composite(icon, (x, y))
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    sources = sorted(args.source.glob("*-atlas.png"))
    if len(sources) != 5:
        raise RuntimeError(f"Expected 5 equipment atlases, got {len(sources)}")
    for source in sources:
        repack(source, args.destination / source.name)
        print(source.name)


if __name__ == "__main__":
    main()
