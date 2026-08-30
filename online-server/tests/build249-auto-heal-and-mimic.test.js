import test from "node:test";
import assert from "node:assert/strict";

import { chooseAutoBattleSupport } from "../src/AutoBattleSupport.js";
import { treasureRoomRateForFloor } from "../src/OfflineDungeonRules.js";

const groupHeal = { id: "heal", kind: "allHeal", heal: .20, mp: 20, allAllies: true };
const revive = { id: "revive", kind: "revive", revive: .35, mp: 30 };

test("build249 treasure/mimic floor rate stays rare and bounded", () => {
  assert.equal(treasureRoomRateForFloor(1), .015);
  assert.equal(treasureRoomRateForFloor(99), .015);
  assert.equal(treasureRoomRateForFloor(100), .0165);
  assert.equal(treasureRoomRateForFloor(500), .0225);
  assert.equal(treasureRoomRateForFloor(1000), .03);
  assert.equal(treasureRoomRateForFloor(9999), .03);
});

test("build249 disconnected auto AI does not heal healthy-ish allies", () => {
  const player = { playerId: "a", hp: 620, maxHp: 1000, mp: 100, maxMp: 100 };
  const battle = { players: { a: player, b: { playerId: "b", hp: 620, maxHp: 1000, mp: 50, maxMp: 100 } } };
  assert.equal(chooseAutoBattleSupport(player, battle, [groupHeal]), null);
});

test("build249 disconnected auto AI heals two truly wounded allies and targets valid actor", () => {
  const player = { playerId: "a", hp: 500, maxHp: 1000, mp: 100, maxMp: 100 };
  const battle = { players: { a: player, b: { playerId: "b", hp: 500, maxHp: 1000, mp: 50, maxMp: 100 } } };
  const action = chooseAutoBattleSupport(player, battle, [groupHeal]);
  assert.equal(action?.skill.id, "heal");
  assert.ok(["a", "b"].includes(action?.target.playerId));
});

test("build249 disconnected auto AI preserves MP outside emergencies and revives only fallen allies", () => {
  const player = { playerId: "a", hp: 500, maxHp: 1000, mp: 20, maxMp: 100 };
  const ally = { playerId: "b", hp: 500, maxHp: 1000, mp: 50, maxMp: 100 };
  const battle = { players: { a: player, b: ally } };
  assert.equal(chooseAutoBattleSupport(player, battle, [groupHeal]), null);
  ally.hp = 0; player.mp = 100;
  const action = chooseAutoBattleSupport(player, battle, [groupHeal, revive]);
  assert.equal(action?.skill.id, "revive");
  assert.equal(action?.target.playerId, "b");
});
