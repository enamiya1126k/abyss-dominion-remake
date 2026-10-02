# Build579 verification

Base: main `ed9d93d9478127771b720192df24023c65944b48` (Build578).

## Reproduction and fix

The current 12-icon and 4-icon atlases already contain transparent alpha. The unused `assets/luck575/items.webp` is RGB and has an opaque dark green background. Older CSS refers to that atlas. Offline workers normalize cache keys by removing query strings. The document loads its stylesheets before the module containing `refreshStaleAssets` runs; clearing the cache later does not replace the stylesheet already attached to this document.

`tools/build579/browser.mjs` seeds Build575's actual service worker cache with the historical atlas reference. The unpatched screen displays the opaque atlas (`before.jpg`). It then navigates to the patched screen while retaining both the old worker and old stylesheet cache entry. The new stylesheet path and two new atlas paths cannot match those old cache entries. The computed styles point to the transparent copies, and the opaque rectangles disappear (`after.jpg`). This reproduces a possible cause of the user's symptom; it does not inspect the user's device cache.

The production stylesheet order is read from index.html. The screen fixture uses production view, rules and styles; the unrelated party lounge is stubbed. The full application and online gameplay were not exercised.

## Checks

- 16 affected items × two mobile touch viewports (390×740 and 320×568): 32 successful hand selections with correct item indices.
- All 16 computed atlas references use the new paths and correct grid sizes. The catalogue was visually inspected in `catalog.jpg`.
- No page errors, failed HTTP responses, or horizontal overflow in these cases.
- Import-map aliases, offline manifest references and changed JavaScript syntax checked.
- Both new image files are byte-for-byte copies of the existing transparent atlases; no artwork generation or rule changes.
- iPhone hardware and Safari were not tested.

Run from the repository root with Playwright and a Chromium executable available:

`ABYSS_CHROMIUM_PATH=/path/to/chromium node tools/build579/browser.mjs`

The inherited fixture expects `/tmp/NotoSansJP.ttf` for Japanese layout verification.
