# Build511 verification

- Version: v3.1.190-build511; incremental base: Build510.
- 254 automated tests passed; 0 failures, skips, cancellations. Full TAP report included.
- 26 new tests: 40-item catalogue, 28 persistent items, no new sabotage; all final hands contain a finisher; all 36 double-dice and 216 triple-dice outcomes; per-turn growth; savings and sun consumption; echo actual net movement; final crown; stacked exact arithmetic; all 1,600 item pairs; 500 complete seeded races with exact JSON restart; protocol guards and authenticated seats; private future entropy; shared timed reveal; reduced motion; finite RAF, hidden/unmount cleanup, zero repeat idle writes; PNG decode/alpha/occupied cells.
- Existing Build507/508/509/510 tests and gorilla/canal/cabbage/color/zoom regression suites passed. Legacy integration fixtures explicitly restore their saved room format; Build511 production factory is covered separately.
- World rendering reuses Presentation510, keeping the self ±1,000m window, exact BigInt relative gaps, background parallax, 500m lines, distant avatar locators and pass trails.
- Old raster assets and old luck rules/view/camera sources are unchanged; protected-file hashes verified (257 files).
- Dice results are sealed on the server, enhanced by public equipped focus buffs, and played in a shared order. Each roll is 2.4 seconds; at most four rolls per round. Non-dice rounds have no added cutaway. Removed power panel remains absent.
- JavaScript parsed with Acorn; changed import aliases, entrypoint cache version, offline manifest and service worker references verified. Archive CRC and extracted SHA-256 checked.
- Cloud browser attempt to localhost failed with net::ERR_BLOCKED_BY_CLIENT. No bypass attempted. Real browser layout, iPhone Safari, visual animation quality and device FPS are NOT verified. DOM tests use lightweight instrumented nodes, not a browser renderer.
- Missing original species/endgame/MonsterVisual dependencies use test-only in-memory fixtures. No substitute production files are shipped.
- Nothing deployed.
