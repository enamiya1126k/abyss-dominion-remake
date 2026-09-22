# Build520 verification

## Executed gates

`node --test tests/build517-tower.test.mjs tests/build518-tower.test.mjs tests/build519-ai.test.mjs tests/build520-tower.test.mjs tests/build516-questions.test.mjs`

150 passed, 0 failed, 59.08 seconds. Full output is `tests.txt` in this directory. Eighteen new tests are in build520-tower.test.mjs. Existing tests were updated only where the specification deliberately changed: dash became superJump, wire capability became 3, and directional touch buttons replaced the stick. The AI cooperative-head fixture deliberately puts boost on cooldown so it still verifies head cooperation. A removed-dash evasion case now uses a physically escapable fall speed and checks safety both before and after the block lands; it does not expect the removed speed boost.

The 100-seed normal AI regression ended in 15 runner wins and 85 dropper wins. Every match terminated, actors remained finite/in bounds, and settled blocks were unique. Build519's recorded result on this 100-seed suite was 7/93. The game rules changed, so this is a before/after system regression, not a controlled claim about AI intelligence or human win rates. The existing normal-jump staircase comparison completed in 3833ms versus its test-only legacy runner's 8733ms, using current physics.

The quiz regression retains planned correctness of 79.07%, 71.20%, and 63.50%, blind O choices 50.10%; its product files were not changed.

## Functional cases

- Five-cell boost peak and unchanged two-cell normal jump; sideways speed is unchanged.
- Immediate availability, consumption only on actual launch, exact 15,000ms reuse boundary.
- No air reset or cooldown consumption on an expired airborne request; 160ms pre-landing buffer.
- Head support, ordinary push-down of an airborne support actor, and both head/boost events.
- Overhead collisions prevent tunneling. Retired dash flags do not grant speed.
- One sealed runner dies while two open teammates keep playing. A moving roof is not yet a permanent seal. A settled roof can eliminate all three in the same step with one death event per actor.
- A one-column exit is preserved. No-placement/sole-runner proof allows the future five-cell boost even while it is cooling down.
- Old active snapshots migrate once; new boost cooldown survives JSON save/restore.
- Protocol 3 handles rapid movement/jump/boost/release without dropping action edges; protocol 2 and duplicate sequences are rejected.
- AI reaches a five-cell platform with the same boost; search does not mutate live state.
- Portrait stage widths 320/375/390/430/640 with heights 270/460/620 use width minus 24 pixels and keep the runner visible. Overview contains every row.
- Two simultaneous direction pointers, release ordering, sliding to the opposite button, pointer cancellation/lost capture, and cleanup.
- Native Canvas background/settled buffers persist through camera motion; rebuild occurs on resize. DPR stays at most 1.5.
- Inherited online party membership, readiness, role checks, AI handover, packet isolation, result/replay, scroll restoration, question-bank and movement tests passed.

## Visual and load checks

New asset: assets/tower520/shaft.webp, 768×1344, 148,888 bytes, generated then resized/compressed for the game. The original generation prompt and output are documented separately.

Product Renderer517 was executed using @napi-rs/canvas and its output inspected at 390×500. At this size the default board uses 36.6px cells and 12px side margins, versus the previous 26.75px cells; overview uses 26.02px cells with every row visible. This inspects the actual Canvas graphics, not a browser DOM/CSS screenshot. Native rendering output is an intermediate diagnostic, not a replacement character asset.

The scrolling world is bounded to 18.6 cells plus padding. Background and settled cells are cached independently of camera position. Moving camera uses offset drawing; no image decoding/resizing happens per frame. Decorative boost and seal effects are bounded by the existing 32-event ring. Existing reduced-motion and visibility suspension paths remain. Runner AI simulates 96 frames only for bounded boost candidates, 66 for ordinary choices; no search runs in the phone rendering loop. Default minimap has at most 160 simple cell fills and a few markers.

Changed JS modules passed explicit-module syntax checks. Changed browser imports use v3.1.199-build520. New modules, CSS and the WebP are registered in the offline list. No question data is added to client assets. All patch members and the baseline SHA-256 values are listed in BUILD520_MANIFEST.json; ZIP CRC and manifest hashes were checked before delivery.

## Limits / deployment

No real browser, Safari/iPhone, physical multitouch or network WebSocket E2E testing was performed. The previous local-browser preview rejection was not retried or bypassed. Input/view tests use fixture nodes and native Canvas. The supplied partial source still lacks the canonical species.js, endgameCharacters.js and MonsterVisual.js, for which tests use in-memory fixtures only.

This is a patch from complete Build519, not a standalone project. Update frontend, online-server/src and the server-side shared root src, then restart the online server and reload all clients. Tower protocol is 3. No public deployment or server restart was performed.
