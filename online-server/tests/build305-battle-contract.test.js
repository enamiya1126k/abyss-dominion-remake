import test from "node:test";
import assert from "node:assert/strict";

import { RoomStore } from "../src/RoomStore.js";

test("build305 online explore enemy CT uses the same base+1 round contract as players", () => {
  const store = new RoomStore({ now: () => 305_000, random: () => 0 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};

  const player = {
    playerId: "player",
    hp: 1_000_000_000,
    maxHp: 1_000_000_000,
    mp: 100,
    maxMp: 100,
    guard: false,
    stats: { hp: 1_000_000_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100 },
    cooldowns: {},
    effects: [],
    circleEffect: "none",
    equipmentCombatEffects: {},
    abyssSkillEffects: {},
  };
  const action = { label: "CT2", type: "buff", utility: true, cooldown: 2, effects: [{ kind: "atkUp", value: .1, turns: 1 }] };
  const enemy = {
    id: "enemy",
    name: "Enemy",
    hp: 1_000_000,
    maxHp: 1_000_000,
    maxMp: 0,
    currentMp: 0,
    atk: 10,
    matk: 10,
    def: 10,
    mdef: 10,
    spd: 100,
    crit: 0,
    element: "neutral",
    effects: [],
    battleActions: [action],
    cooldowns: {},
    actionUses: {},
  };
  const battle = {
    id: "battle",
    floor: 1,
    round: 1,
    phase: "command",
    speed: 1,
    players: { player },
    enemies: [enemy],
    actions: {},
    lastEvents: [],
    skillUses: {},
    delayedSkillEchoes: [],
    openingCircleBuff: false,
  };
  const room = { roomId: "ROOM", expedition: { battle } }, key = "action:0:CT2";
  const resolveEnemy = () => store._resolveEnemyActions(battle, [], enemy);
  const openNextRound = () => { battle.phase = "result"; store._openNextBattleRound(room, battle); };

  resolveEnemy();
  assert.equal(enemy.actionUses[key], 1);
  assert.equal(enemy.cooldowns[key], 3, "base CT2 is stored as CT+1 during its resolution round");

  openNextRound();
  assert.equal(enemy.cooldowns[key], 2);
  resolveEnemy();
  assert.equal(enemy.actionUses[key], 1, "first following opportunity is blocked");

  openNextRound();
  assert.equal(enemy.cooldowns[key], 1);
  resolveEnemy();
  assert.equal(enemy.actionUses[key], 1, "second following opportunity is blocked");

  openNextRound();
  assert.equal(enemy.cooldowns[key], 0);
  resolveEnemy();
  assert.equal(enemy.actionUses[key], 2, "the authored enemy action returns on the third following opportunity");
});
