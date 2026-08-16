import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSharedDungeon } from "../online-server/src/RoomStore.js";
import { floorEnemyStats } from "../online-server/src/OfflineDungeonRules.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const screen = read("src/ui/screens/OnlinePartyScreen.js");
const client = read("src/online/OnlinePartyClient.js");
const store = read("online-server/src/RoomStore.js");
const css = read("src/Styles/v2.10.0.css");
const main = read("src/main.js");
const index = read("index.html");

for (const feature of [
  'data-online-room-view="plaza"', 'data-online-room-view="lobby"',
  "data-online-social-toggle", "data-online-dungeon-decorations",
  "data-online-stair-status", "data-online-battle-player",
]) assert.match(screen + client, new RegExp(feature));
for (const feature of [
  "roomView", "socialOpen", "selectedBattleAlly", "_renderDungeonDecorations",
  "expeditionFloorAdvanced", "stairsCountdownEndsAt",
]) assert.match(client, new RegExp(feature));
for (const feature of [
  "createSoloStyleDungeon", "floorEnemyStats", "_updateStairGathering",
  "_advanceExpeditionFloor", "leaderFloorUnlock", "stairsMemberIds",
]) assert.match(store, new RegExp(feature));
for (const feature of [
  ".online-party-screen{height:100dvh", ".online-plaza-river,.online-plaza-landmarks{display:none",
  ".online-social-bar{position:absolute", ".online-coop-battle{height:100%",
  ".online-battle-member.ally-target", ".online-stair-status{position:absolute",
]) assert.ok(css.includes(feature), `${feature} is present`);
assert.match(main, /source\.kind==="floorClear"&&leaderFloorUnlock>0/);
assert.match(index, /ASSET_BUILD = "build(?:14[8-9]|15[0-7])"/);

const floorOne = floorEnemyStats({ floor: 1, template: { id: "slime" }, random: () => .1 });
assert.equal(floorOne.level, 1);
assert.ok(floorOne.maxHp < 1_000);
const dungeon = createSharedDungeon({ roomId: "MOBILE", floor: 1, runId: "BUILD148" });
assert.ok(dungeon.cols >= 23 && dungeon.rows >= 23);
assert.equal(dungeon.objects.filter(object => object.type === "exit").length, 1);
assert.ok(dungeon.decorations.length >= 1);

console.log("ABYSS DOMINION build148 mobile online regression: PASS");
