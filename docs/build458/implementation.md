# Build458 implementation and verification

Base: Build457 cumulative archive, SHA-256 d1fbe26e0b01b0baf605c4b7ddf47180b2a977f116d3ededcddd2b0c44ac2aff. Base source commit: 53b7e195e0138f72f8b131ec3b185d2c736d438d. Version 3.1.137; save schema 84 remains unchanged.

## UI and input

RaceExperience458 supplies lobby, parade navigation, ticket editor, purchased ticket, broadcast enhancements and results. RaceView452 dispatches to these views and retains the existing animation, native sprite, sound and race update infrastructure. Build458 CSS is appended after the preceding styles.

RaceUX458 contains scroll snapshots keyed by room, phase and prediction tab; swipe direction qualification; ordered pick correction; and room-version-aware bet limits. Rendering snapshots the old panel before replacing its DOM, restores expanded details and input focus without scrolling, updates the clock and restores the destination panel's position. New phases start at the top. Presentation replay intentionally returns to the podium.

Pointer gestures require at least 38px horizontal movement, a horizontal-to-vertical ratio above 1.4 and completion within 1,000ms. The stage uses pan-y so vertical gestures remain native scrolling; cancelled gestures and post-swipe clicks do not select a monster twice. Button and swipe navigation pin the observed monster.

The bottom action controls reserve matching document space. Result styles explicitly override the previous result view's 30px bottom padding to keep replay and expandable details above the dock. Native sprite paths and existing arena assets are reused; no original sprite replacement is included.

Start, pass, again and leave show pending feedback immediately and suppress repeated requests briefly. An offline leave is saved under the authenticated account/server bank and sent only for the same room after reconnect. The most recently authenticated bank key remains available when the transport clears its socket during disconnection, and is replaced when the authenticated identity changes.

## Money and compatibility

New rooms use rulesVersion 6. The race simulation still uses the existing version-5 path, so boost timing, stamina, skills, odds, fatigue, prizes and training rates are unchanged. Existing rooms retain their rule version across an additional race; create a new room to use MAX.

The new amount ceiling is floor((Number.MAX_SAFE_INTEGER - 8000) / 1000), or 9,007,199,254,732G. UI and client validation also cap to the integer owned balance. Legacy rooms retain 1,000,000G. The server advertises V6, gates incompatible clients, rejects/refunds invalid legacy or late requests with the existing durable receipt mechanism, and preserves fixed purchased odds. MAX and half only fill the input; reserve/debit occurs on purchase.

Payout multiplies integer tenths of odds using BigInt and floors before conversion back to a safe Number. Wallet reservation, durable acceptance, refunds, delivery acknowledgement after local save, and once-only application remain in place. Zero-GOLD players can pass and earn existing owner/training rewards. No diamond currency spending is added.

## Verification

- `node --test --test-skip-pattern='byte-identical to Build451' tests/build45*.test.mjs`: 70 passes. The excluded historical Build452 assertion requires the current server to be byte-identical to Build451; later server implementations intentionally supersede that assertion. This is not a claim to have run the entire game's tests.
- `node tools/build458/browser-check.mjs`: four authenticated clients, real local WebSocket server, mobile touch, draft and scroll persistence, real touch swipes, MAX purchase for 55,838,554G, five boost taps, camera/ticket controls, mid-race server restart, disconnected player settlement, reward idempotence, result details/replay, next race and online/offline leave. No captured browser errors. Results and geometry are in browser-results.json.
- `node tools/build458/cache-check.mjs`: nine changed runtime modules, 615 cache paths, import alias/version/syntax checks and preserved frozen runtime aliases. The package generator compares all frozen runtime430/runtime443 files byte-for-byte with Build457.
- The package retains every entry from the Build457 cumulative archive, excludes user/server data and dependencies, verifies every ZIP entry/CRC and emits a SHA-256 manifest. Source restoration used the Build424 source only to supply files absent from the cumulative patch; those untouched files are not newly shipped.

Browser tools need local Playwright and Chromium plus a temporary server and preview port; adjust the local executable paths in browser-check.mjs for another environment. The harness uses isolated temporary accounts/data and removes them. It does not contact the production server.

Limitations: Chromium touch emulation is not a physical iPhone Safari test. The baseline monster sprite files and Japanese fonts are unavailable in the local renderer, so geometry and interaction were checked without claiming a full final-art/typeface audit. Internal screenshots are omitted from the deliverable for that reason. No public deployment or GitHub change was performed.
