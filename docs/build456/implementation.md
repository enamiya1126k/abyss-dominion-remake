# Build456 implementation notes

## Authority and reproducibility

Race room rule version is 4. Older room versions retain their stored outcomes and ticket rules; new ticket kinds are rejected/refunded in old rooms. The server still advertises older capabilities alongside monsterRaceV4 for compatibility. Build456 clients require server rule version >=4.

RaceSimulation456 is a pure seeded simulation shared by server and forecast. Server snapshots contain RNG, elapsed time, runner distances/velocities/stamina, accepted boost sequences, effects and finishing times. Public snapshots omit RNG/luck/score and contain only current motion and already crossed finishers. There is no outcome before the race is simulated. The actual seed is created at countdown and is independent of public forecast seeds.

Advance runs on 200ms steps. Server advances/writes/broadcasts about twice a second, and before accepting controls. Rendering may extrapolate only 600ms and never declares a finish. Simulation is chunk-invariant; persistence failure restores the prior state. Authoritative result and all fatigue updates/receipts are committed together. Duplicate controls are idempotent by race and per-owner sequence 1–5. Owner index is derived from the authenticated session, never from client input. Input after a runner finishes is rejected.

All final positions are sorted by interpolated crossing time, with index as deterministic tie break. Worst-condition, maximum-fatigue simulation across all334 catalog entries and both surfaces completes below the40-second safety bound (see simulation-results.json).

## Forecast / settlement

1,024 independent trials with standard AI timing for all entrants build an ordered podium distribution. Add0.25 pseudocount per valid podium (336 combinations) before evaluating ticket probabilities, so unobserved events do not yield zero probability or infinite quotes. Odds = floor(0.85/p*10)/10, bounded1.1–1000; these are estimates, not guaranteed expected returns under human input. Integer-tenths payout logic is retained.

The four added ticket kinds use the same server and client validation/settlement helper. Provisional ticket highlights use the shared settlement predicate, so all seven kinds work in live view. Wallet debit/receipt logic remains unchanged. Four-client browser QA purchases place, wide, trio and trifecta and checks published net against actual wallets.

## Presentation

Live snapshots do not replace the racing DOM. Animation uses current server motion, including actual boost/debuff effects; the old decorative skill trigger is disabled for v4. Parade has eight-second automatic rotation, manual runner selection, pause/resume, per-runner editorial text and collapsible field comparison. Headlines use forecast rank; body text uses actual condition, course preference, fatigue and field style counts. Native parade assets remain unchanged.

A short finish replay uses only committed final motion history. The server holds result presentation for2.5s after completion. Reduced-motion preferences disable the replay and added decorative loops.

Generated turf artwork is loaded only in the racing arena. Seven ticket buttons wrap into two rows; selection cards use two columns on phones and four on larger screens. Three-pick tickets wrap within their cards. The boost control is sticky within the existing scrollable race viewport, and disables during cooldown, insufficient stamina, pending acknowledgement or disconnection.

## Asset provenance

Built-in image generation, text-to-image (no reference edit), generated a new square pixel-art fantasy turf arena during this task. Prompt brief: premium Japanese dark-fantasy pixel-art monster race background, vivid emerald grass in the lower two thirds, ornate black/gold grandstands and purple banners in the upper third, horizontal track bands, castle silhouettes, warm stadium lights; no creatures, writing, symbols or UI. Existing game palette and pixel aesthetic were the art direction.

The generated source was converted losslessly to `assets/race456/turf.webp` (2,309,764 bytes). The source PNG is not duplicated in the cumulative patch. Existing sand and parade art are preserved. No original monster sprite was regenerated or replaced.

## Reproduction

Run from project root:

- `node --test tests/build456-race-action.test.mjs tests/build455-race-strategy.test.mjs tests/build453-race-finish.test.mjs tests/build451-race.test.mjs`
- `node tools/build456/simulation-check.mjs`
- `RACE_QA_FONTCONFIG=/path/to/fontconfig node tools/build456/browser-check.mjs`
- `RACE_QA_FONTCONFIG=/path/to/fontconfig node tools/build456/touch-check.mjs`
- `python3 tools/build456/refresh-assets.py`
- `node tools/build430/map-source.mjs`
- `node tools/build456/cache-check.mjs`
- `python3 tools/build456/package.py`

Browser harness uses the installed Playwright runtime and Chromium binary adjacent to the project, ephemeral server data and localhost-only routing. It substitutes only the online endpoint constant in the preview response, never a production configuration. It exercises native transport authentication and wallet code. Real device Safari and unavailable unchanged base sprites are not covered.
