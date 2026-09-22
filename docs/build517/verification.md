# Build517 verification

## Executed

`node --test tests/build517-tower.test.mjs tests/build516-questions.test.mjs`

100 tests passed, 0 failed. Existing suite: 71. New suite: 29.
The current environment provides Node 24 and @napi-rs/canvas for the renderer tests.

Covered: four seats and AI fill; role choice and readiness; seven shapes and rotation; retained four-slot hand; automatic drop and speed ramp; two-block ledge and jump limit; coyote time; head jump and downward kick; dash cooldown; crush versus side contact; swept high-speed collision; escape/team victory; elimination/timeout; restart stalls; public snapshot isolation; stable play DOM signature; 100 seeded AI matches; shared party adapter; role/id/sequence rejection; bounded persistence; disconnect takeover; result replay; unchanged seven-game catalog; actual view and Canvas renderer with DOM event fixtures; pointer cancellation; preview rotation; stale frames; box-height cap; room-local snapshot delivery.

The production server advances only the new game on a 50ms clock, using fixed 60Hz physics steps. Active-room state is checkpointed every 2 seconds and at phase changes. Input uses a bounded in-memory control state and does not rewrite the account store. Frames are sent only to the participating party, at most 10 per second per room. Input numbers and roles are validated on the server. Movement stops after 350ms without input. Late frames from another game or older server time are rejected on the client.

The client maintains one animation callback per mounted game, caps render DPR at 1.5, caches background and settled blocks, and reuses player nodes and hand controls. Hidden-tab and unmount paths stop animation, clear controls, and remove listeners. Heavy bitmap assets were not added; the new cover is a small SVG, the arena is Canvas, and audio is synthesized.

AI-only sample (seeds 1–100): escape side 27 wins, drop side 73 wins; all games ended. This is a deterministic automated sample, not measured human balance.

## Preserved content

Existing quiz, luck, gorilla, cabbage, canal, sugoroku and race game rules and assets remain byte-identical to the provided Build516 working tree. Shared-party adapter files necessarily acquire a new branch for `tower`. Existing save schema remains 84. No production save files or deployment destinations were accessed or changed.

## Limitations

No actual browser, Safari/WebKit, physical iPhone, real touch hardware, or WebSocket transport end-to-end run was completed. Cloud Browser refused the local HTTP preview and then explicitly disallowed file URLs; no workaround was attempted after that policy rejection. The production coordinator was exercised directly with four authenticated session fixtures, and the actual new view/renderer was executed using DOM-event fixtures and a native Canvas implementation. These do not establish browser-level layout or network behavior.

The inherited patch-only working tree is missing three original modules: species.js, endgameCharacters.js, MonsterVisual.js. The inspected Build468 integrated ZIP is also missing these canonical modules. Test fixtures supply only those imports in memory; the actual new logic and production coordinator are used. No substitute versions of these modules are delivered. Apply this patch to the user's complete, working Build516 installation.

`tools/tower517-preview*.html/js` are isolated development previews using the new rules/view and clearly labeled temporary character portraits. They are not linked from the product and are not production replacements. No preview was claimed as a real-device test.

## Delivery

Build517 / v3.1.196 patch from Build516. Apply frontend and online-server changes together, restart server, reload all clients. Created ZIP is not a deployment.
