# Build570 QA

`scenario.mjs` constructs an unobstructed route around the intermediate islands. Every hop is within the current jump limit and uses the production begin/release/advance/landing pipeline. Starting at the already-reached first checkpoint, the old rules finish at x750/y300 while checkpoint remains1, progress37%, finishedAt null. New rules finish at exactly the same coordinates with checkpoint5, progress100%, finishedAt set. See reproduction.json.

This reproduces the inconsistent state visible in the report, not the unrecorded instant of the reported teleport. Invalid future/finish respawn targets are independently covered by tests.

44 Node tests pass. Actual party protocol gates and four WebSocket clients are exercised. Twenty seeded AI courses still finish. Existing hockey, cabbage, and multi-bomb relay behavior is included in the selected regressions.

The browser fixture uses the production renderer, view, snapshot and result components with a synthetic legal course and simplified avatars. Two mobile viewport sizes show GOAL and 4/4 checkpoints; result marks the player as a finisher. The three fixture opponents have earlier finish times, so fourth place in that fixture is expected. No browser errors or HTTP failures. Native iPhone/Safari not tested. No deployment or production restart performed.
