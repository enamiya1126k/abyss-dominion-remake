import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { renderOnlineHome } from "../src/online/OnlineViews.js?build247-hall-anchor";

test("build247 keeps every hall facility anchored during press and player rerender", async () => {
  const room = position => ({
    roomId: "MOVE47",
    members: [{ playerId: "self", connected: true, position, profile: { displayName: "移動テスト", speciesId: "slime" } }],
  });
  const anchors = html => [...html.matchAll(/style="--hall-x:([\d.]+)%;--hall-y:([\d.]+)%" data-online-hall-destination="([^"]+)"/g)]
    .map(([, x, y, route]) => ({ route, x: Number(x), y: Number(y) }));

  const before = anchors(renderOnlineHome(room({ x: 50, y: 76 }), "self"));
  const after = anchors(renderOnlineHome(room({ x: 42, y: 68 }), "self"));
  assert.deepEqual(before, [
    { route: "games", x: 50, y: 25 },
    { route: "raid", x: 18, y: 25 },
    { route: "explore", x: 82, y: 25 },
    { route: "social", x: 50, y: 49 },
    { route: "team", x: 24, y: 78 },
    { route: "chat", x: 76, y: 78 },
  ]);
  assert.deepEqual(after, before, "moving the player must not move a facility anchor");

  const theme = await readFile(new URL("../src/Styles/theme.css", import.meta.url), "utf8");
  assert.match(theme, /button:active\s*\{\s*transform:scale\(\.985\)/, "global pressed feedback replaces transform without a scoped override");

  const css = await readFile(new URL("../src/Styles/build247.css", import.meta.url), "utf8");
  assert.match(css, /\.online-hall-zone:active\s*\{[^}]*transform:translate\(-50%,-50%\) scale\(\.985\)!important;/s);
});
