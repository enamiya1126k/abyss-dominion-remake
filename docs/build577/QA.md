# Build577 verification

browser.json: 8 touch selection cases at390×740 and320×568; hand note hidden, charge element removed, run burst element removed, no text clipping or horizontal overflow, chest animations and reduced motion retained. Screenshots hand.webp/run.webp/opening.webp visually inspected. Native iPhone/Safari untested.

assets/luck577/items.webp: RGBA1254×1254; 961790 of1572516 pixels fully transparent. Sprite atlas has four isolated objects; inspected in production card renderer. Built-in imagegen background-extraction then packing refinement used. Existing art designs retained with slight generated differences.

Prompt: Remove dark green backdrop to actual transparent alpha, retain emerald banner/ruby trophy/blue star map/solar crown, equal2×2 cells and transparent gutters. Refinement: keep each object entirely inside its own quadrant and preserve design; no clipping/background panels/text. Generated source exec-57b3950d-90b0-4199-8703-6e264c9cf273.png; converted to WebP preserving alpha.
