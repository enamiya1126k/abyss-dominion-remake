import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
};
globalThis.location = { search: "" };

const [{
  ONLINE_STORAGE_KEYS,
  buildOnlinePartyProfile,
  moveOnlineBattleRosterPriority,
  onlineBattleRosterPriority,
  renderOnlineBattleRosterPicker,
  OnlinePartyScreen,
}, { createMonster }] = await Promise.all([
  import("../src/ui/screens/OnlinePartyScreen.js?build257-roster-priority-test"),
  import("../src/models/Monster.js?build257-roster-priority-test"),
]);

function fixture() {
  const monsters = ["slime", "goblin", "cave_rat", "mushroom"].map((speciesId, index) => createMonster(speciesId, {
    level: 20 + index,
    nickname: `出撃${index + 1}`,
  }));
  return {
    monsters,
    state: {
      player: { currentFloor: 40, maxFloor: 40, gold: 100, crystals: 3 },
      inventory: { captureCrystals: 2, abyssKeys: 1 },
      settings: {}, equipment: [], magicCircles: { unlocked: {}, instances: [] },
      party: monsters.map(monster => monster.id), monsters,
    },
  };
}

test("build257 persists SLOT 1-4 priority and makes SLOT 1 the compatible primary", () => {
  storage.clear();
  const { state, monsters } = fixture();
  const initial = buildOnlinePartyProfile(state, { monsterId: monsters[2].id, displayName: "出撃テスト" });
  assert.deepEqual(initial.battleRoster.map(entry => entry.monsterId), [monsters[2].id, monsters[0].id, monsters[1].id, monsters[3].id]);
  assert.equal(initial.primaryMonsterId, monsters[2].id);
  assert.equal(initial.monsterId, initial.battleRoster[0].monsterId);

  const moved = moveOnlineBattleRosterPriority(state, monsters[2].id, "down");
  assert.equal(moved.changed, true);
  assert.deepEqual(moved.order, [monsters[0].id, monsters[2].id, monsters[1].id, monsters[3].id]);
  assert.equal(storage.get(ONLINE_STORAGE_KEYS.monsterId), monsters[0].id);

  const reloaded = buildOnlinePartyProfile(state, { monsterId: monsters[2].id, displayName: "出撃テスト" });
  assert.deepEqual(reloaded.battleRoster.map(entry => entry.monsterId), moved.order);
  assert.deepEqual(reloaded.battleRoster.map(entry => entry.rosterIndex), [0, 1, 2, 3]);
  assert.deepEqual(reloaded.battleRoster.map(entry => entry.isPrimary), [true, false, false, false]);
  assert.equal(reloaded.primaryMonsterId, monsters[0].id);
  assert.equal(reloaded.monsterId, monsters[0].id);
});

test("build257 removes stale or duplicate stored ids and appends newly formed party members", () => {
  storage.clear();
  const { state, monsters } = fixture();
  storage.set(ONLINE_STORAGE_KEYS.battleRosterOrder, JSON.stringify([monsters[3].id, "removed-id", monsters[1].id, monsters[1].id]));
  const ordered = onlineBattleRosterPriority(state);
  assert.deepEqual(ordered.map(monster => monster.id), [monsters[3].id, monsters[1].id, monsters[0].id, monsters[2].id]);
  assert.deepEqual(JSON.parse(storage.get(ONLINE_STORAGE_KEYS.battleRosterOrder)), ordered.map(monster => monster.id));
});

test("build257 derives the default online name from the surviving SLOT 1 priority", () => {
  storage.clear();
  const { state, monsters } = fixture();
  storage.set(ONLINE_STORAGE_KEYS.monsterId, "removed-primary");
  storage.set(ONLINE_STORAGE_KEYS.battleRosterOrder, JSON.stringify([
    "removed-primary", monsters[2].id, monsters[3].id, monsters[1].id,
  ]));

  const screen = OnlinePartyScreen(state);
  assert.equal(storage.get(ONLINE_STORAGE_KEYS.monsterId), monsters[2].id);
  assert.match(screen, /data-online-display-name value="出撃3"/);
  assert.match(screen, new RegExp(`data-online-roster-entry="${monsters[2].id}"[^>]*aria-current="true"`));
});

test("build257 renders four ordered mobile controls and no connection-screen social FAB", () => {
  storage.clear();
  const { state, monsters } = fixture();
  const picker = renderOnlineBattleRosterPicker(state, { monsterId: monsters[0].id });
  assert.match(picker, /出撃優先スロット/);
  assert.match(picker, /全プレイヤー合計は必ず4体以内/);
  assert.equal((picker.match(/data-online-roster-entry=/g) ?? []).length, 4);
  assert.equal((picker.match(/data-online-roster-move="up"/g) ?? []).length, 4);
  assert.equal((picker.match(/data-online-roster-move="down"/g) ?? []).length, 4);
  assert.doesNotMatch(picker, /data-online-character=/);

  const screen = OnlinePartyScreen(state);
  assert.match(screen, /data-online-roster-picker/);
  assert.doesNotMatch(screen, /class="online-friend-fab online-social-fab/);
});

test("build257 keeps roster arrows touch-sized and the picker single-column", async () => {
  const css = await readFile(new URL("../src/Styles/build257.css", import.meta.url), "utf8");
  assert.match(css, /\.online-v3-character-picker>ol\{[^}]*display:grid[^}]*gap:7px/);
  assert.match(css, /\.online-v3-roster-order button\{[^}]*width:44px[^}]*height:34px/);
  assert.match(css, /@media\(max-width:430px\)[\s\S]*?grid-template-columns:40px 50px minmax\(0,1fr\) 44px/);
});
