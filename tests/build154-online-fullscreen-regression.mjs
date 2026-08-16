import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { floorEnemyStats, ONLINE_ENEMY_HP_DIVISOR } from "../online-server/src/OfflineDungeonRules.js";
import { RaidCoordinator } from "../online-server/src/RaidCoordinator.js";

const root = fileURLToPath(new URL("..", import.meta.url));

function profile(name = "TEST") {
  return {
    displayName: name,
    battleStats: { hp: 50_000, mp: 500, atk: 20_000, matk: 18_000, def: 12_000, mdef: 11_000, spd: 3_000, crit: 10 },
    skills: [],
  };
}

test("online encounter HP receives the requested one-fiftieth tempo correction", () => {
  assert.equal(ONLINE_ENEMY_HP_DIVISOR, 50);
  const enemy = floorEnemyStats({ floor: 300, template: { id: "ancient_dragon" }, random: () => 0.5 });
  assert.ok(enemy.maxHp > 0);
  assert.ok(enemy.maxHp < 1_000_000, `unexpected co-op HP: ${enemy.maxHp}`);
  assert.ok(enemy.atk > 0 && enemy.def > 0, "offensive and defensive threat must remain");
});

test("raid starts with exactly the calamity boss and one independent Amarga sub-boss", () => {
  const sessions = new Map([
    ["p1", { playerId: "p1", connected: true, ready: true, profile: profile("P1") }],
    ["p2", { playerId: "p2", connected: true, ready: true, profile: profile("P2") }],
  ]);
  const raid = new RaidCoordinator({ now: () => 1_000, random: () => 0.5, sessions });
  const room = { roomId: "ABC123", leaderId: "p1", members: new Set(["p1", "p2"]), phase: "lobby", selectedFloor: 300 };
  const result = raid.start(room, sessions.get("p1"));
  assert.equal(result.ok, true);
  assert.equal(result.raid.boss.name, "終焉融骸・アビス＝マルガ");
  assert.equal(result.raid.minions.length, 1);
  assert.equal(result.raid.minions[0].role, "subBoss");
  assert.match(result.raid.minions[0].name, /アマルガ/);
  assert.match(result.raid.minions[0].magicCircleAsset, /death-mirror-raid/);
});

test("connected online UI is full-screen and keeps READY and ally targeting in-screen", () => {
  const screen = fs.readFileSync(`${root}/src/ui/screens/OnlinePartyScreen.js`, "utf8");
  const client = fs.readFileSync(`${root}/src/online/OnlinePartyClient.js`, "utf8");
  const css = fs.readFileSync(`${root}/src/Styles/v2.10.0.css`, "utf8");
  const main = fs.readFileSync(`${root}/src/main.js`, "utf8");
  assert.match(screen, /data-online-raid-ready/);
  assert.match(screen, /data-online-expedition-header/);
  assert.match(client, /selectedBattleAlly/);
  assert.match(client, /online-phase-battle/);
  assert.match(css, /\.online-party-screen\.has-online-room\{position:fixed!important/);
  assert.match(css, /@media\(min-width:900px\)/);
  assert.match(css, /online-raid-minion-circle/);
  assert.match(main, /assets\/online\/raid\/juvenile-amalga\.png/);
  assert.doesNotMatch(main, /monster\.customVisualAsset="\.\/assets\/online\/raid-abyss-amalgam\.png"/);
});
