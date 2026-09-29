# Build564 validation

Base: GitHub main `72c63563787f2ab5b2e519e86551065da7830ff4`.

## Automated rules and wire checks

```sh
node --test --test-reporter=tap tests/build564-hockey.test.mjs tests/build564-cache.test.mjs tests/build563-wire.test.mjs tests/build563-rules.test.mjs
```

The WebSocket suite needs `ws` (or Playwright's WebSocket implementation) available to Node. The server already lists `ws` as a dependency. The historical wire fixture is updated to the active hockey protocol version 8; the historical pinball simulation remains available to preserve the Build563 physics regression checks.

`tests.tap` records 38 passing tests. Coverage includes:

- Exactly two players per team with 1–4 humans; selected monsters and individual colors.
- Unmodified Build563 launch function, momentum, reload and input cancellation.
- Full-puck line crossing, both goals, own goals, assists, post/wall/body/rotor collisions.
- Two-point finish, team winners, draw, match completion and no late inputs.
- Authenticated lobby team changes, capacity, readiness reset, rematch retention.
- Four-view score agreement, persistence, legacy-room migration and reconnect takeover.
- 32 finite 90-second AI matches: 209 goals total, split 106/103 by team.
- Production party ready/start/version gates and four independent WebSocket clients.
- Shared coordinator regressions for bomb relay, hide-and-seek and tetrapod crossing.
- Import-map aliases, offline asset manifest, service-worker and app-version consistency.

## Browser checks

```sh
node tools/build564/browser.mjs
```

Requires Playwright plus an installed Chromium. `QA_CHROMIUM` can select an installed compatible executable; `QA_FONT` can point to a local Japanese font. Dependencies and the browser are environment-only and are not added to game runtime dependencies.

The successful run used Chromium 153.0.8010.0 via a portable local executable and Noto Sans JP. `chromium-browser.json` records all six viewport/team combinations and zero page/load errors. A native CDP touch sequence exercised drag/release, repeated input during reload and cancellation. Keyboard launch, lobby team selection, victory/defeat/draw and old-server guidance were also checked.

The preview uses production modules and assets. Only the outer party-seat UI and catalogue/controller are isolated. The server simulation and four real sockets are tested in the separate wire suite. This is not a real iPhone/Safari or public-server test.

`chromium-mobile.png` is a representative staged game fixture rendered by the actual game view. `chromium-result.png` and `chromium-lobby.png` capture the actual result and lobby views. The staged scoreboard is for layout inspection, not evidence of a played live match.

## Deployment

Client and online-server updates must be applied together. Restart the server and reload all players. The code uses protocol 8, app v3.1.243, and a new offline cache namespace. No public deployment or server restart was performed during this change.
