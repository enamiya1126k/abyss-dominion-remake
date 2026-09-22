# Build518 verification

## Executed

`node --test tests/build517-tower.test.mjs tests/build518-tower.test.mjs tests/build516-questions.test.mjs`

118 passed, 0 failed. 71 existing quiz/integration checks, 29 previous tower checks updated for the new speed cap/protocol, and 18 new checks.

New checks cover sealed roofs and cavities; an open column; a living runner above a roof; a falling piece that has not yet sealed the exit; topology invalidation; last-runner/no-placement impossibility; rotation into a narrow opening; preserved head-jump opportunities; upward momentum; the stronger speed ramp; shared finale timestamps and snapshot isolation; kick/landing choreography; seal choreography; reduced motion; same-millisecond move/jump/dash/release; old-client version rejection; pointerdown plus synthetic click avoiding a double rotation; directional hold release; simultaneous actions; finale before result controls.

All changed JavaScript modules were checked using Node's explicit module syntax parser. New frontend module mappings point at v3.1.197-build518. New WebP assets and new modules/styles are registered in the Build518 offline cache list. The service worker and asset list use separate Build518 names.

A native Canvas run rendered the actual arena and block renderer with the new WebP background, using @napi-rs/canvas. Its static output was visually inspected. It did not execute browser layout or render real monster sprites.

100 deterministic AI-only matches are included in the tower suite; all ended, with 17 runner wins and 83 dropper wins. This is a regression sample, not human balance testing.

## Scope

Game rules/assets under quiz, luck, gorilla, canal, cabbage and sugoroku remain byte-identical to Build517. The existing quiz arena image was not overwritten: the catalog references a separate new thumbnail. Other catalog entries are retained. Shared party files change only tower compatibility checks/values and the two requested thumbnail paths. Save schema remains 84.

## Impossibility proof

The server flood-fills empty cells from the open top while ignoring gravity and actor size. If no live runner's body center connects to that region, adding more static blocks cannot restore the exit, so the dropper wins immediately. Decisions occur after a falling block settles, and the existing full-elimination/escape/timeout conditions remain.

If only one runner remains and none of the current hand's four slots has a legal rotation and placement, an optimistic ledge-height bound includes upward velocity, a two-block jump, arbitrary horizontal travel and any board ledge. If even that bound cannot reach the top, the result is unreachable. For multiple runners with open topology, the implementation deliberately preserves possible airborne head-jump chains. It does not claim exhaustive search of all future cooperative input sequences.

## Performance and controls

New bitmap payload totals 533,980 bytes. Canvas background, settled board and per-type block tiles are cached. DPR stays capped at 1.5. Player nodes are reused. Board topology is cached by game/revision. Movement packets still use bounded in-memory state and two-second server checkpoints; rapid consecutive runner actions now merge instead of discarding a jump/release within a 20ms window. Dropper aim throttling remains, while an explicit drop is accepted without losing a simultaneous action. Pointer cancellation, visibility loss and unmount release input and stop animation.

The 5.4-second ending is presentation over a final server outcome; control packets cannot change that outcome. Reloading after the ending period goes directly to results. The client uses the server finale timestamp to resume partway through a still-running ending.

## Not verified

No actual browser layout, Safari/WebKit run, physical iPhone, real multitouch hardware, or real WebSocket transport end-to-end validation was completed. The previously blocked local browser-preview routes were not retried or bypassed. DOM tests use event fixtures, with a native Canvas implementation.

The inherited patch tree lacks the canonical species.js, endgameCharacters.js, and MonsterVisual.js. Test-only import hooks provide these three in memory. No production substitutes are supplied. The development preview uses labeled placeholder portraits and is not a replacement for the main game's character art; its browser execution has not been verified.

## Delivery

Build518 / v3.1.197, patch from a complete working Build517 installation. Apply frontend and online-server together, restart server, reload all clients. No deployment or server restart was performed.
