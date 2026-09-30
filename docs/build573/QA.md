# Build573 validation

23 automated tests passed. Existing scenery regression covers exact BigInt boundaries, a forward run through all 15 worlds within the unchanged 4.8 seconds, reverse travel, no anticipation, local viewer distance, reduced motion, failure/retry and cleanup. New checks cover the final 10^40 boundary, values up to 10^1000, all five WebP decodes and current importmap/offline cache versions.

Chromium touch fixture: 390×740 and 320×568, five new worlds each. Zero page errors or failed responses. No horizontal overflow. Single cover background preserves aspect, removes image repeat edges and avoids parallax splits. Planetary background stays fixed while normal runners/markers/effects move. Native iPhone/Safari and human progression balance untested. Server rules unchanged.

Commands from repository root:

```
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node --test --test-reporter=tap tests/build512-scenery.test.mjs tests/build573-scenery.test.mjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tools/build573/browser.mjs
```

The browser fixture reuses tools/build571/preview.mjs with real production rules/view/CSS/assets and a stub for the unrelated party lounge. PNG screenshots converted to WebP for delivery. Image briefs and built-in generation mode documented in art-prompts.md. Old build-specific cache tests remain historical; build573-scenery is the current version gate.
