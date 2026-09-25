# Build559 verification

- 18 rule tests passed: five reachable seals, both reachable gates, 8/6-second channel boundaries, three-second room alarm, interruption/decay, any-three unlock, no fourth completion, either-gate team victory, alive timeout loss, hidden information, alarm investigation, camp alternatives, one rescue and deterministic serialization.
- 4 actual coordinator tests passed: authenticated inputs and sequence rejection; four private views; protocol/migration; AI takeover/reconnect. Fixture explicitly discards pre-start runtime when selecting a deterministic test seed; production has no second seeded start.
- 7 existing cart/pinball party/main coordinator regression tests passed (Build557 main-wire and party suites).
- Local Chromium through four WebSocket sessions: real objective-button navigation, two-worker channel, room alarm without hunter progress/identity exposure, both exit buttons, team results, timeout, reconnect. No page errors or failed resource requests in the passing run.
- Viewports 320×690, 390×664, 430×932 and 844×390: no horizontal overflow; field heights 337, 311, 531 and 276px. Reduced-motion preference tested. Landscape uses a separate control column.
- `browser.json` records the controlled boundary fixtures. `capture.json` records a normal one-human/three-AI match, using the seal button during preparation and real simulation, with no forced positions, progress or victory. Time is advanced by the local test server.
- `ABYSS_Build559_hide.png` is the actual game field and controls at 3.4 seconds into play, cropped at capture to focus on the changed UI. It is not a generated mockup. The test harness omits unrelated monster catalog portraits.
- `simulation.json`: 26 deterministic all-AI games; hunter 11, hiders 15. Median 36.7s and maximum 87.65s after the hiding preparation. This is a calibration sample, not evidence of human win rates.
- All changed JavaScript syntax checked; import-map historical aliases retained, updated offline cache entries and shared protocol6 advertisement checked. Cart/pinball modules and existing raster assets compare byte-for-byte with Build558.
- iPhone Safari hardware, real remote latency and deployed-server testing remain unverified. No public deployment performed.

Run from the game root:

```
node --test tests/build559-hide.test.mjs tests/build559-wire.test.mjs tests/build557-main-wire.test.mjs tests/build557-party.test.mjs
node tools/build559/simulation.mjs
node tools/build559/browser.mjs
node tools/build559/capture.mjs
python tools/build559/static-check.py --baseline ../baseline558
```

Browser scripts expect the local Playwright/Chromium runtime paths shown in their source. They launch the QA server in the same process environment. QA endpoints are confined to `tools/build559/qa-server.mjs`; they are never imported into production.
