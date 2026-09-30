# Build572 verification

- 23 automated checks passed: existing scenery suite updated for ten worlds, new boundaries at 1e11/1e16/1e24, arbitrary-precision distances up to 10^1000, forward and reverse routes, timing, no state mutation, local-view selection, reduced motion, cleanup, failed loads/retry, native image decode and cache integration.
- Updated the historical DOM fixture with getBoundingClientRect to match current View511 layout; loaded its original asset manifest from git's sparse checkout.
- Production View511 / styles / art rendered in isolated Chromium touch fixture at 390×740 and 320×568. Six cases, zero browser errors or failed responses. Natural 3:2 image scaling, horizontal overflow, unsplit face layer and reduced motion checked.
- Existing historical Build571 cache test targets its original version and is not the Build572 gate; the new cache test checks current import-map aliases, CSS, images and worker.
- No native iPhone/Safari verification, human balance test of rare-world thresholds, server deployment or restart.

Run from repository root:

```
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node --test --test-reporter=tap tests/build512-scenery.test.mjs tests/build572-scenery.test.mjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tools/build572/browser.mjs
```

Built-in image generation supplied all three images. Full reference photographs are not shipped. Only the generated face-world artwork is included. Assets reside in assets/luck572/{blackhole,beyond,chaos}.webp. Browser fixture uses existing build571 tooling. Browser screenshot PNGs are converted to WebP for delivery.
