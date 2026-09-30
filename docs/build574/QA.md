# Build574 verification

25 Node tests passed: 20 existing scenery regressions plus 5 opening/cache checks. Opening state uses game id, round and prior phase. Four cards must be present in the actual server hand; no contents are inferred or generated client-side. Confirmed chest selection triggers once. Late join, different round/room, repeat state and cleanup covered.

Chromium with touch: all four boxes at 390×740 and 320×568. Selection submitted the intended index, no overlay before hand data, four overlay sprites matched the exact hand, pointer-events none, real hand selection worked during animation, animation completion removed overlay, rerender did not replay. Reduced motion bypasses opening. Leaving/rebuilding the screen cancels animations. Zero page errors or failed resources, no horizontal overflow. Native iPhone/Safari untested.

No additional timer, server phase or network protocol. Web Animations API with opacity/transforms, eight short animations plus shell/glow/overlay; existing image atlases. UI fixture uses production View511, Rules511 and CSS through tools/build571/preview.mjs, with unrelated party lounge stubbed. Capture freezes animations at 380ms.

```
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node --test --test-reporter=tap tests/build512-scenery.test.mjs tests/build574-chest.test.mjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tools/build574/browser.mjs
```
