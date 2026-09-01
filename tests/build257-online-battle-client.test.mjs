import test from "node:test";
import assert from "node:assert/strict";

const views = await import("../src/online/OnlineViews.js?build257-online-battle-client");
const { OnlinePartyController, shouldShowOnlineSocialFab } = await import("../src/online/OnlinePartyClient.js?build257-online-battle-client");

const selfId = "AD-AAAA-BBBB";
const stats = { hp: 800, mp: 80, atk: 90, matk: 70, def: 55, mdef: 50, spd: 40, crit: 5, evasion: 3, accuracy: 100 };
const skills = [
  { id: "slash", name: "斬撃", kind: "attack", mp: 3, power: 1.1, cooldown: 0, element: "neutral" },
  { id: "flare", name: "業火", kind: "attack", mp: 7, power: 2.2, cooldown: 3, element: "fire" },
  { id: "mend", name: "再生", kind: "heal", mp: 8, heal: .3, cooldown: 2, element: "light" },
  { id: "ward", name: "護壁", kind: "buff", mp: 5, cooldown: 1, element: "light" },
];

function fixture({ auto = false } = {}) {
  const staleSkill = { id: "stale", name: "古い技", kind: "attack", mp: 1, power: 1, cooldown: 0 };
  const profile = {
    displayName: "冒険者", monsterId: "m1", primaryMonsterId: "m1", monsterName: "月影狼", speciesId: "slime", fallbackEmoji: "魔",
    level: 50, plus: 0, stars: 1, attribute: "dark", battleStats: stats, currentHp: stats.hp, currentMp: stats.mp, skills: [staleSkill],
    battleRoster: [{ rosterIndex: 0, isPrimary: true, monsterId: "m1", monsterName: "月影狼", speciesId: "slime", fallbackEmoji: "魔", level: 50, plus: 0, stars: 1, attribute: "dark", battleStats: stats, currentHp: stats.hp, currentMp: stats.mp, skills: [staleSkill] }],
  };
  const actor = {
    playerId: selfId, combatantId: selfId, ownerPlayerId: selfId, monsterId: "m1", rosterIndex: 0, isPrimary: true,
    hp: stats.hp, maxHp: stats.hp, mp: stats.mp, maxMp: stats.mp, skills, cooldowns: { flare: 2 }, itemCharges: 1, captureCharges: 1, effects: [],
  };
  const battle = {
    phase: "command", round: 2, speed: 1, actions: {}, autoPlayers: auto ? [selfId] : [], players: [actor], lastEvents: [],
    enemies: [{ id: "enemy-1", name: "敵", speciesId: "slime", hp: 900, maxHp: 900, level: 30, spd: 20, effects: [] }],
  };
  return { room: { selectedFloor: 20, members: [{ playerId: selfId, connected: true, profile }] }, battle };
}

test("build257 renders the complete server actor loadout with base and remaining CT separated", () => {
  const { room, battle } = fixture();
  const html = views.renderSharedBattle({ mode: "explore", room, battle, selfId, enemies: battle.enemies, skillMenu: true, autoSupported: true });
  assert.equal((html.match(/data-skill-id=/g) ?? []).length, 4);
  for (const skill of skills) assert.match(html, new RegExp(`data-skill-id="${skill.id}"`));
  assert.doesNotMatch(html, /古い技/);
  assert.match(html, /業火[\s\S]*?CT 3[\s\S]*?残りCT 2 \/ MP 7/);
  assert.match(html, /斬撃[\s\S]*?CTなし[\s\S]*?MP 3/);
  assert.doesNotMatch(html, /CT 0/);
});

test("build257 treats an explicit empty server loadout as authoritative", () => {
  const { room, battle } = fixture();
  battle.players[0].skills = [];
  const html = views.renderSharedBattle({ mode: "explore", room, battle, selfId, enemies: battle.enemies, skillMenu: true, autoSupported: true });
  assert.doesNotMatch(html, /data-skill-id=/);
  assert.doesNotMatch(html, /古い技/);
});

test("build257 exposes the online auto toggle in every battle mode when the server capability is available", () => {
  const enabled = fixture({ auto: true });
  const html = views.renderSharedBattle({ mode: "explore", room: enabled.room, battle: enabled.battle, selfId, enemies: enabled.battle.enemies, autoSupported: true });
  assert.match(html, /data-online-battle-auto="explore"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /サーバー同期・自動戦闘/);

  for (const mode of ["raid", "team"]) {
    const modeHtml = views.renderSharedBattle({ mode, room: enabled.room, battle: enabled.battle, selfId, enemies: enabled.battle.enemies, autoSupported: true });
    assert.match(modeHtml, new RegExp(`data-online-battle-auto="${mode}"`));
    assert.match(modeHtml, /aria-pressed="true"/);
  }

  const unsupported = views.renderSharedBattle({ mode: "explore", room: enabled.room, battle: enabled.battle, selfId, enemies: enabled.battle.enemies });
  assert.doesNotMatch(unsupported, /data-online-battle-auto=/);
  assert.match(unsupported, /<b>要更新<\/b>/);
});

test("build257 auto toggle sends a mode-scoped owner preference and updates every battle immediately", () => {
  const { room, battle: exploreBattle } = fixture();
  const raidBattle = fixture().battle, teamBattle = fixture().battle;
  const sent = [], controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId, roomState: { ...room, expedition: { battle: exploreBattle }, raid: raidBattle, teamBattle }, capabilities: new Set(["battleAutoV1"]),
    skillMenu: { explore: true, raid: true, team: true }, itemMenu: { explore: false, raid: false, team: false }, itemTargetMenu: { explore: false, raid: false, team: false },
    _send: (type, payload) => { sent.push({ type, payload }); return true; }, _render: () => {}, toast: message => { throw new Error(message); },
  });
  for (const mode of ["explore", "raid", "team"]) controller._toggleOnlineBattleAuto(mode);
  for (const mode of ["explore", "raid", "team"]) controller._toggleOnlineBattleAuto(mode);
  const modes = ["explore", "raid", "team"];
  assert.deepEqual(sent, [
    ...modes.map(mode => ({ type: "battleAuto", payload: { mode, enabled: true } })),
    ...modes.map(mode => ({ type: "battleAuto", payload: { mode, enabled: false } })),
  ]);
  assert.deepEqual(exploreBattle.autoPlayers, []);
  assert.deepEqual(raidBattle.autoPlayers, []);
  assert.deepEqual(teamBattle.autoPlayers, []);
});

test("build257 allows AUTO to be disabled during result but rejects enabling or missing battles", () => {
  const { room, battle: exploreBattle } = fixture({ auto: true });
  const raidBattle = fixture({ auto: true }).battle, teamBattle = fixture({ auto: true }).battle;
  for (const battle of [exploreBattle, raidBattle, teamBattle]) battle.phase = "result";
  const sent = [], toasts = [];
  let renders = 0;
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId, roomState: { ...room, expedition: { battle: exploreBattle }, raid: raidBattle, teamBattle }, capabilities: new Set(["battleAutoV1"]),
    skillMenu: { explore: true, raid: true, team: true }, itemMenu: { explore: false, raid: false, team: false }, itemTargetMenu: { explore: false, raid: false, team: false },
    _send: (type, payload) => { sent.push({ type, payload }); return true; }, _render: () => { renders += 1; }, toast: message => { toasts.push(message); },
  });
  const modes = ["explore", "raid", "team"];
  for (const mode of modes) controller._toggleOnlineBattleAuto(mode);
  for (const mode of modes) controller._toggleOnlineBattleAuto(mode);
  controller.roomState.expedition.battle = null;
  controller.roomState.raid = null;
  controller.roomState.teamBattle = null;
  for (const mode of modes) controller._toggleOnlineBattleAuto(mode);

  assert.deepEqual(sent, modes.map(mode => ({ type: "battleAuto", payload: { mode, enabled: false } })));
  assert.deepEqual(exploreBattle.autoPlayers, []);
  assert.deepEqual(raidBattle.autoPlayers, []);
  assert.deepEqual(teamBattle.autoPlayers, []);
  assert.equal(renders, 3);
  assert.deepEqual(toasts, Array(6).fill("現在は自動戦闘を切り替えられません"));
});

test("build257 hides the floating social button until a room-safe social route is open", () => {
  assert.equal(shouldShowOnlineSocialFab({ connectionStep: "entry", route: "home" }), false);
  assert.equal(shouldShowOnlineSocialFab({ connectionStep: "gate", route: "home" }), false);
  assert.equal(shouldShowOnlineSocialFab({ connectionStep: "room", route: "home" }), true);
  assert.equal(shouldShowOnlineSocialFab({ connectionStep: "room", route: "explore" }), false);
});
