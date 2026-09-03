import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const cssSource = await readFile(new URL("../src/Styles/build306-ui.css", import.meta.url), "utf8");

test("Build306 ranking exposes every requested Japanese presence band", () => {
  for (const label of ["ログイン中", "分前", "時間前", "日前", "30日以上前"]) {
    assert.match(mainSource, new RegExp(label));
  }
  assert.match(mainSource, /entry\?\.online===true&&elapsed<=freshFor/);
  assert.match(mainSource, /presenceOnlineMs=90000/);
});

test("Build306 renders presence in both ranking rows and public profiles", () => {
  assert.match(mainSource, /power-ranking-identity[^`]*\$\{rankingPresenceMarkup\(entry,/s);
  assert.match(mainSource, /power-ranking-profile-head[^`]*\$\{rankingPresenceMarkup\(profile,/s);
  assert.match(cssSource, /\.power-ranking-presence\.online/);
  assert.match(cssSource, /\.power-ranking-presence>i/);
  assert.match(mainSource, /function schedulePowerRankingPresenceRefresh\(/);
  assert.match(mainSource, /freshFor-elapsed\+100/);
  assert.match(mainSource, /clearTimeout\(modal\._powerRankingPresenceTimer\)/);
});
