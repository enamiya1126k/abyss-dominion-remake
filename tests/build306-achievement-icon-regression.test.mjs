import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_ICON_KEYS,
  achievementIconKeyForId,
  achievementRewardId,
  achievementMetrics,
} from "../src/core/AchievementRewardSystem.js";

const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const between = (start, end) => {
  const from = mainSource.indexOf(start);
  const to = mainSource.indexOf(end, from + start.length);
  assert.ok(from >= 0, `missing source marker: ${start}`);
  assert.ok(to > from, `missing source marker: ${end}`);
  return mainSource.slice(from, to);
};

test("build306 every achievement uses an approved image key without emoji fallback", () => {
  assert.equal(ACHIEVEMENT_DEFINITIONS.length, 35);
  assert.ok(Object.isFrozen(ACHIEVEMENT_ICON_KEYS));
  const approved = new Set(ACHIEVEMENT_ICON_KEYS);

  for (const entry of ACHIEVEMENT_DEFINITIONS) {
    assert.equal(Object.hasOwn(entry, "icon"), false, `${entry.id} must not retain a text/emoji icon`);
    assert.equal(typeof entry.iconKey, "string", `${entry.id} must expose iconKey`);
    assert.match(entry.iconKey, /^[a-z][a-z-]*$/, `${entry.id} iconKey must be a semantic pixel-art token`);
    assert.equal(approved.has(entry.iconKey), true, `${entry.id} uses an unapproved iconKey`);
    assert.doesNotMatch(entry.iconKey, /\p{Extended_Pictographic}|\uFE0F|[\u2600-\u27BF]/u);
  }
});

test("build306 direct and durable reward ids restore the same achievement image key", () => {
  for (const entry of ACHIEVEMENT_DEFINITIONS) {
    assert.equal(achievementIconKeyForId(entry.id), entry.iconKey, `direct id: ${entry.id}`);
    assert.equal(achievementIconKeyForId(achievementRewardId(entry.id)), entry.iconKey, `v1 reward id: ${entry.id}`);
    assert.equal(achievementIconKeyForId(achievementRewardId(entry.id, 37)), entry.iconKey, `future reward id: ${entry.id}`);
  }

  const legacyQueuedTradeReward = {
    id: "achievement-trade-1-v1",
    source: "achievement",
    icon: "🔁",
  };
  assert.equal(
    achievementIconKeyForId(legacyQueuedTradeReward),
    "formation",
    "legacy saved emoji must be ignored in favour of the stable reward id",
  );
  assert.equal(achievementIconKeyForId("achievement-trade-1-vx"), "event");
  assert.equal(achievementIconKeyForId("unknown", { fallback: "map" }), "map");
  assert.equal(achievementIconKeyForId("unknown", { fallback: "not-approved" }), "event");
});

test("build306 achievement ledger and queued rewards render pixel image markup", () => {
  assert.match(
    mainSource,
    /import\{achievementSummary,syncAchievementRewardInbox,achievementIconKeyForId\}from"\.\/core\/AchievementRewardSystem\.js\?v=3\.0\.9-build309"/,
  );

  const ledger = between("function openAchievementLedger()", "function openCodexHub()");
  assert.match(ledger, /class="achievement-icon">\$\{pixelIcon\(entry\.iconKey\?\?achievementIconKeyForId\(entry\)\)\}/);
  assert.doesNotMatch(ledger, /class="achievement-icon">\$\{entry\.icon\}/);
  assert.doesNotMatch(ledger, /🏆|🎖️/u);

  const inbox = between("function rewardInboxCard(entry)", "function openNoticeCenter()");
  assert.match(inbox, /entry\.source==="achievement"\?achievementIconKeyForId\(entry\)/);
  assert.match(inbox, /iconKey\?pixelIcon\(iconKey\)/);
  assert.doesNotMatch(inbox, /entry\.source==="achievement"[^;]+\?escapeAttribute\(entry\.icon/);
});

test("build306 floor-boss achievements accept both current and legacy save keys", () => {
  const base = { player: { bossKills: {}, bossRewards: {}, pendingBossRewards: {} }, floorBossChallenges: { victories: {} } };
  assert.equal(achievementMetrics({ ...base, player: { ...base.player, bossKills: { 1: 1 } } }).floorBosses, 1);
  assert.equal(achievementMetrics({ ...base, player: { ...base.player, bossKills: { 10: 1 } } }).floorBosses, 1);
  assert.equal(achievementMetrics({ ...base, player: { ...base.player, bossKills: { 1: 1, 10: 1 } } }).floorBosses, 1);
});
