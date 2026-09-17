# Build463 implementation notes

## Isolation

Engine463 is a JSON-serializable, deterministic mutable state machine, used authoritatively by SugorokuCoordinator463. The server persists its state using RaceCoordinator451.transaction. Parties and invitation codes continue to be owned by PartyCoordinator462. Race rooms remain in `rooms`; board rooms use `boardRooms463` and cannot overwrite a race room while a match is active.

Client rendering is selected using the `sugoroku` field in the existing raceState451 envelope. The existing game route and RaceClient are reused; main.js does not change. The new stylesheet is scoped to sg-* classes. Pan/zoom, filters and dialogs are presentation state only. Every card decision carries gameId, revision, choiceId where applicable and an idempotency requestId; the server revalidates and never trusts a client move, score, dice result or hand.

## State machine

`lobby -> playing(draw -> pre -> post -> next player) -> result`.
The effect queue may pause for a choice: target, fork, special comparison, discards, recovery, concealed theft, defense or Shiva ward. Only the chooser receives its options; concealment never includes the hidden UID mapping. Persisted choices can resume after restart. User interaction timeouts delegate one action to AI and refresh the deadline. All-offline parties pause until reconnection, with 24-hour expiry.

Multi-effect groups allow defense to block remaining effects for one recipient. A reflection creates one new group marked reflected, so it cannot chain. All-player effects are expanded only to unfinished players. Arrival freezes the score immediately; the third arrival finalizes the remaining seat. A held goal curse intercepts arrival before scoring. Thief is resolved before the first arrival freezes.

## Catalog and assets

Board463 defines 80 main nodes plus 12 detour nodes, their connections, mandatory gates and effects. The image is decorative; paths, labels and player positions are actual SVG/HTML. Catalog463 holds 116 definitions with 335 physical copies and 16 special definitions. All UI text is read from the same catalog used on the server. Dark-set art uses quadrants of a generated atlas illustration.

Generated art lives in `assets/sugoroku463/`: cover.png, atlas.png, board.png. Original output pixels were copied into the package. Asset prompts are preserved in asset-prompts.json. No reference-person photographs are shipped as new card art.

## Verification limits

Tests use the actual coordinator with authenticated session fixtures and disk persistence. Browser checks use the actual RaceClient and coordinator over WebSocket, with a loopback-only fixture login and save. Full current baseline retrieval failed; unchanged dependencies came from available earlier archives in the QA tree only. Production RoomStore/server boot and physical iPhone Safari remain unverified. Test-only adapters are under tools/build463 and are never referenced from runtime code.
