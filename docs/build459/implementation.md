# Build459 implementation notes

Version 3.1.138. Save schema remains 84. Source baseline commit is 53b7e195e0138f72f8b131ec3b185d2c736d438d; every Build458 cumulative ZIP entry is retained, with frozen runtime430 and runtime443 bytes protected by the packaging comparison.

## Compatibility and simulation

New rooms negotiate race rulesVersion 7; old rooms keep their existing versions, including across `again`. The server continues advertising older capabilities and rejects clients too old for a new room. UI operations require the updated server. Distance is one of four validated presets; only the host can change it in the lobby. The complete preset is copied to each racer at the parade so pricing and the subsequent simulation use an immutable course snapshot.

RaceCourse459 defines distance, stadium geometry, course bonuses, temperament tiers and bounded/idempotent history operations. RaceSimulation456 retains the old calculations for room versions below 7. V7 changes distance, characteristic duration, endurance use, course bonus, corner speed, elapsed-time scaling of skill/AI timing, drafting distance and front-runner pace pressure. The same public state is used in independent Monte Carlo forecasts. A new random seed is drawn only when the actual countdown begins; forecasts and clients never receive the actual luck or temperament rolls.

Temperament affects only the first accepted boost, with probabilities 0.15, 0.05 and 0 for the published bond tiers. Acceptance reserves its one stamina/use cost immediately; one pending activation is stored for 600ms later. The pending queue, roll and consumed flag are serialized with the simulation. Cumulative boost intents still deduplicate reordered/repeated requests. Other commands can be accepted during that delay. Goal completion cancels any further movement; the UI does not promise acceleration after the finish.

CoursePoint459 defines two straight segments and two semicircles, using arc length. The renderer and corner classification share this geometry. Visual lane offsets do not alter simulated distance or finishing order. Full and focus views leave race state unchanged. Photo replay interpolates recorded distance and projects it onto the same course.

## Form and persistence

At V7 result settlement, the existing server transaction records course, distance, condition, fatigue, finish time and place for every entrant. Player keys use owned monster IDs; system/AI keys use species IDs. Duplicate race/monster pairs are ignored; max 20 per identity and 200 records per account/system journal. Old records are not fabricated or backfilled.

Player result deliveries include the exact new record. RaceWallet451 writes it in the same local atomic commit as GOLD, training, and applied-receipt state. No separate replay award is added. Lobby and parade display actual stored samples, explicitly labelled as retained recent runs. A system preview intentionally masks the already-drawn condition until the parade; it is still a provisional entry subject to duplicate replacement.

Monster bond comes from the existing local save and is clamped to the game's 0–1000 range before race selection. This follows the existing game architecture in which the client provides its owned roster; it does not add a new authority model for verifying all offline saves. At the parade it becomes immutable for that race. AI/system entrants consistently use bond 0.

## UI

RaceExperience459 supplies article overlays, course buttons, compact history rows, condition tables, visible temperament notes, forecast commentary and course projection. The existing Build458 scroll restoration and fixed actions remain. The rival overlay traps Tab within its controls, closes via Escape or backdrop, restores focus without scrolling, and is cleared on room/phase transitions. Left/right buttons sit on the stage; their pointer-down events do not start a swipe. Vertical gestures remain pan-y. Opening a parade history pauses auto presentation.

Course art uses the existing grandstand/background assets and code-native SVG rails, grass/sand texture patterns and markers. Monster assets are reused. Runner numbers use their own element to avoid conflict with the existing boost-aura pseudo-element.

## Validation and limits

- 76 current race/practice tests pass, including six new V7 integration/behavior tests. The historical Build452 assertion that the server must be byte-identical to Build451 is excluded because several later releases intentionally updated it; all other matching tests run.
- The 334-species sweep covers 672 races over four distances, two surfaces and no-input/AI-input control, with moods and fatigue varied. All runners finished before the 90000ms simulation cap. This is a sampled full-catalog sweep, not an exhaustive Cartesian product of all lineups and seeds.
- Four native authenticated WebSocket clients validate touch interaction, MAX GOLD, course controls, circuit/focus display, five boosts, real server restart, disconnected settlement, once-only history, next-race display and online/offline departure. Detailed outcomes are in browser-results.json.
- Chromium mobile/touch widths are 320, 393, 709 and 1280. QA supplies Noto Sans JP and original sprite bytes from the pinned source; these test-only font/asset caches are excluded from the ZIP. Physical iPhone Safari has not been tested.
- Cache aliases and frozen raid code are checked separately. Package creation retains all previous entries, rejects unrelated modified files/data/dependencies, verifies ZIP CRCs and records per-file SHA-256 hashes.

Reproduction helpers expect local Playwright, a Chromium executable and the baseline source/ZIP at the documented local paths; adjust them for another machine. The browser preview is loopback-only and uses isolated temporary accounts/server state. No production server, GitHub write or website deployment is performed.
