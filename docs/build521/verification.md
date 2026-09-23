# Build521 verification

## Executed

1. `node --test tests/build517-tower.test.mjs tests/build518-tower.test.mjs tests/build519-ai.test.mjs tests/build520-tower.test.mjs tests/build516-questions.test.mjs`
   - 150 passed, 0 failed, 122.35 seconds. Run before the two new view cases were appended. Full output: baseline-tests.txt.
2. `node --test --test-name-pattern='Build521' tests/build517-tower.test.mjs tests/build521-tower.test.mjs`
   - 8 passed, 0 failed, 0.62 seconds. Full output: build521-tests.txt.

Total distinct passing cases: 158. Existing geometry fixtures were moved relative to the new height, boost assertions were changed from five to four cells, and capability fixtures from 3 to 4. Ordinary two-cell movement, falling speed, crush rules, party controls, quiz rules and other minigame tests retain their assertions.

New checks cover actual view markup and renderer mount for locked dropper overview, unchanged runner full-width view/toggle, exact exit thresholds (15+boost fails,16+boost wins,18+ordinary wins), topology in the four added upper rows, new placement ceiling, preserved cooldown during Build520 migration, simultaneous boosts by three initially stacked runners, and rejection of the actual previous protocol 3.

The existing 100-seed AI simulation completed all games: runner 6 / dropper 94. Coordinates stayed finite/in bounds, settled cells unique. This setting is harder for runners than Build520's recorded 15/85 and is not presented as balanced human win-rate data. Cooperative human timing has not been measured. The initial three-runner stack test covers one simultaneous-launch scenario, not a proof against all cooperative strategies.

## Visual / scope

Product canvas rendered at 390×440: fixed overview cell=18.6px, goal line y=54px, floor y=426px, all 20 rows visible. Native output inspected visually. Runner cell size still depends on width minus 24px; increasing the field height does not shrink its characters or blocks. Overview reserves room above the exit for the operator. The existing generated shaft art is reused; no new raster/audio assets.

Background/settled caches, bounded DPR, input handling, reduced motion and visibility suspension remain. The topology graph grows from 160 to 200 cells. Height is shared via Geometry521 to prevent mismatches between rendering, AI and authoritative physics. All changed JS passed explicit-module syntax checks; changed browser imports use v3.1.200-build521 and Geometry521 is in the offline list.

No actual browser/Safari/iPhone, physical touch or network WebSocket E2E verification. No previously blocked browser route was retried or bypassed. Inherited three missing modules are test-only in-memory fixtures, never product replacements.

Complete Build520 required. Frontend plus online-server/src plus server-side shared root src must be updated; Node server restart and all-client reload required. No deployment/restart performed.
