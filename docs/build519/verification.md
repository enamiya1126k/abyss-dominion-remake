# Build519 verification

## Executed

`node --test tests/build517-tower.test.mjs tests/build518-tower.test.mjs tests/build519-ai.test.mjs tests/build516-questions.test.mjs`

132 tests passed, 0 failed. The prior 118 tests remain, with 14 new AI/scroll tests.
The suite completed in approximately 102 seconds in this environment.

New tests cover: identical staircase completion time; early dash escape from a wide, fast block beside a wall; cooperative head jumps past a three-block ledge; no live-state mutation from AI search; ordinary lethal collision for AI; targeting a narrow escape pocket; legal choices across rotated hands and high stacks; independent two-to-four-question blind intervals; answer-independent guessing including hesitation; O/X balance and lower accuracy; private and persisted quiz plans; preserving page/app/ancestor/roster scroll; stopping restoration after game/phase changes; refreshing and disposing scroll callbacks.

All changed JavaScript modules passed Node explicit-module syntax checks. Changed browser modules are mapped to v3.1.198-build519; the three new modules are present in the Build519 offline asset list. No question-bank file is added to client assets.

## Controlled comparisons

`node tools/benchmark519-ai.mjs 12`

The original Build518 AI is preserved in a test-only fixture. The comparison uses the same four human-style seats, seeds 1–12, actual current physics, and a fixed per-release replacement sequence. No product import loads this baseline fixture. Per-match CPU totals and outcomes are stored in `ai-comparison.jsonl`.

| Runner AI | Dropper AI | Runner wins / 12 | Mean highest height | Mean duration |
|---|---|---:|---:|---:|
| Build518 | Build518 | 2 | 8.81 | 42.36s |
| Build518 | Build519 | 1 | 11.78 | 47.20s |
| Build519 | Build518 | 6 | 12.10 | 52.68s |
| Build519 | Build519 | 1 | 10.14 | 41.50s |

The separate existing 100-seed AI-only regression, using normal in-game draws, ended in 7 runner wins and 93 dropper wins. All games terminated, coordinates remained finite and within the box, and settled cells stayed unique. These deterministic samples demonstrate particular improvements and current asymmetry; they do not establish human balance or universal superiority on every board.

In a controlled staircase, the old runner escaped in 8733ms and the new runner in 3967ms. On the cooperative wall fixture, the old pair did not escape within 12 seconds; the new pair escaped with a recorded head-bounce event. The new runner escaped a fast wall-side crush that eliminated the old runner. An impact with too little time to escape still eliminated the new runner.

Quiz sampling: 3000 deterministic decks × 20 questions × 3 AIs = 180,000 planned final answers. Correctness was 79.07%, 71.20%, and 63.50% by difficulty. Blind choices selected O 50.10% of the time. Inverting every answer left all blind choices and their hesitation steps unchanged.

## Implementation and load

Runner decisions compare a bounded set of policies using 66 fixed physics steps, about 1.1 seconds. Replanning happens at 200ms with a falling piece, 300ms otherwise, or when the board/piece changes. Visible actor motion is extrapolated; no future human controls are consulted. Dropper search considers legal hand/rotation/position combinations and a short visible aim period. Live match state is not used as a simulation scratch buffer.

AI memories and board caches live in WeakMaps outside public/persisted snapshots. Search runs in the server's game simulation, not in the phone render loop. Physics, rendering, frame rate, packet frequency and persistent checkpoint frequency remain unchanged. No image or audio payload was added. The controlled sample used approximately 20.5 CPU seconds to simulate 632 match-seconds with new runners against old droppers, and 16.4 CPU seconds for 498 match-seconds with both new AIs; this is single-process local simulation timing, not a server capacity/load test.

Quiz AI plans are generated only at game creation. Already persisted plans continue unchanged. Blind metadata is omitted by the existing public allowlist. Question data, movement, wall/floor effects and existing result logic remain intact.

Scroll restoration is scoped to the same mounted tower lobby. It restores synchronously and once on the next animation frame, cancels older pending callbacks, and checks game ID, phase, root and lobby identity before applying. It does not run a repeated scrolling interval.

## Scope and limitations

Product changes are tower AI, quiz AI, tower lobby scroll hooks, and version/cache registration. No combat, owned-character data, save schema, other minigame rules, artwork, CSS, question-bank, or server transport files were changed.

The inherited partial tree lacks canonical species.js, endgameCharacters.js and MonsterVisual.js. Existing tests substitute only these three imports in memory. No fake production modules are included.

No browser/Safari/iPhone, real multitouch, or real WebSocket end-to-end verification was performed. Scroll tests use fixture nodes and animation-frame scheduling. Previously rejected local browser-preview paths were not retried or bypassed.

## Delivery

Build519 / v3.1.198 is a patch from a complete working Build518. The online server imports the shared root src/tower and src/quiz files, so update that server-side source tree and restart it as well as updating/reloading the frontend. No deployment or restart was performed.
