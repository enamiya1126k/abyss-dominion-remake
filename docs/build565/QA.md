# Build565 validation

Base main: `72c63563787f2ab5b2e519e86551065da7830ff4`.
Previous reviewed branch tree: `7c00fb89a8772fef7be43f7fdd1a231abe8c5f8c` (Build564).

## Rules and wire

```sh
node --test --test-reporter=tap tests/build565-hockey.test.mjs tests/build564-hockey.test.mjs tests/build564-cache.test.mjs tests/build563-wire.test.mjs tests/build563-rules.test.mjs
```

`tests.tap` records 51 passing tests and zero failures. The historical Build564 tests now exercise the active hockey behavior; Build563 launch and other-game physics remain unchanged. `ws` or Playwright's WebSocket implementation must be available to Node for the wire suite.

- The scoring line is y=0 or y=height. The whole puck must pass it inside the opening. The renderer derives the mouth from the same coordinates and clips all goal artwork into the outside rail.
- Player half-court constraints are reapplied after body and rotor contacts, including high-speed scenarios in all four modes.
- The puck's flight multiplier is `modeSpeed * (1 + passCount * 0.05)`, with no charge ceiling. Repeated impacts do not compound this multiplier accidentally. Existing launch impulse, carry and 1250ms reload stay intact.
- A pass requires a different same-team toucher, at least 180ms and 2 world units of travel. This avoids repeated overlap contacts. Charge survives an opponent return, wall and rotor collisions; a new puck starts at zero. No pass count is awarded merely by brushing a continuously touching ally.
- Conservative collision substeps use distance to nearby obstacles. Explicit cases exercise 200 charge increments, charge 1000, fast defender contacts, both mouths and missed-corner shots. These are targeted stress cases, not a proof about every possible numerical state.
- Goal pause is exactly 2000 server milliseconds. Inputs are rejected during it; players stop; the conceding team receives the next puck. The match clock continues during the pause.
- Options accept only boolean propeller and numeric speed 1 or 2, require the host, reset readiness, lock during play, survive rematch and appear identically in all snapshots.
- Four independent WebSocket clients exercise production room queues and outgoing frames. Save/reconnect tests cover charge, options and respawn timestamp. Other shared-game coordinator tests remain passing.

AI scenarios completed 80 ninety-second matches: 32 inherited cases and 12 seeds in each of four option combinations. Per-mode goals/passes are recorded in the TAP output. The option suite produced 272 goals and 459 counted passes; this is a regression check, not human balance testing.

## Browser and animation

```sh
node tools/build565/browser.mjs
node tools/build565/capture.mjs
```

Requires Playwright and Chromium. `QA_CHROMIUM` selects a local executable; `QA_FONT` optionally supplies a local Japanese font. These are QA-only dependencies. Capture additionally requires ffmpeg.

The successful run used Chromium 153.0.8010.0. `chromium-browser.json` contains six viewport/team checks and zero JavaScript errors or failed resources. A native CDP touch sequence verifies pull/release, cooldown and cancellation. Keyboard, lobby options, guest-disabled controls, win/loss/draw, legacy-version guidance, goal points, 2000ms respawn, uncapped displayed charge, own-goal copy and reduced-motion behavior are checked.

At 390×740, the stage is 390×600, from y=89 to y=689. The previous stage was 390×475.5. At 320×568 it is 320×428; at 740×390 it is 740×285. No horizontal overflow occurs. Browser toolbar and native safe-area configurations vary on real devices.

The preview consumes the actual game view, art, physics, input and rendering. Only the surrounding party listing/catalogue/controller is isolated. `chromium-mobile.png` and `chromium-goal.png` show staged game states. `goal-demo.gif` captures the actual animation and automatic re-serve from a staged goal. This is not a live production match or an iPhone hardware test.

Generated court art totals approximately 215KB across four WebP files. Its prompts and source roles are in `ART.md`. Static court rendering is cached; trails have a fixed history size; collision sound voices disconnect after ending. Reduced-motion skips shake, flash and moving particle bursts. The audio arrangement is implemented; subjective loudspeaker/headphone quality has not been assessed on an iPhone.

## Deployment

Client and server must update together, with server restart and client reload. The release uses app v3.1.244, protocol9 and a new offline cache. No public deployment or server restart was performed.
