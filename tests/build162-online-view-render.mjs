import test from "node:test";
import assert from "node:assert/strict";
import {
  renderOnlineHome, renderOnlineExplore, renderOnlineRaid, renderOnlineTeam, renderOnlineResonance, renderOnlineChat,
} from "../src/online/OnlineViews.js?v=2.10.0-build162";

const profile = Object.freeze({
  displayName: "えなみ", monsterName: "えなみ", speciesId: "myth_enami", fallbackEmoji: "魔",
  level: 967, circleId: "none", skills: [{ id: "strike", name: "連携撃", description: "敵単体へ攻撃", mp: 5, kind: "attack" }],
});

function room() {
  return {
    roomId: "AB12CD", leaderId: "p1", phase: "lobby", selectedFloor: 100,
    members: [
      { playerId: "p1", leader: true, connected: true, ready: true, teamSide: "sun", teamReady: true, profile },
      { playerId: "p2", leader: false, connected: true, ready: true, teamSide: "moon", teamReady: true, profile: { ...profile, displayName: "より" } },
    ],
    chatHistory: [], raidProgress: null,
  };
}

function battle() {
  return {
    round: 2, phase: "command", speed: 1, deadlineAt: Date.now() + 10_000, actions: {}, lastEvents: [],
    players: [
      { playerId: "p1", side: "sun", name: "えなみ", hp: 1000, maxHp: 1000, mp: 100, maxMp: 100, shield: 0 },
      { playerId: "p2", side: "moon", name: "より", hp: 900, maxHp: 1000, mp: 90, maxMp: 100, shield: 0 },
    ],
  };
}

test("all six online destinations render independently with realistic room snapshots", () => {
  const lobby = room();
  const home = renderOnlineHome(lobby, "p1");
  const exploreLobby = renderOnlineExplore(lobby, "p1");
  const raidLobby = renderOnlineRaid(lobby, "p1");
  const teamLobby = renderOnlineTeam(lobby, "p1");
  const resonanceLobby = renderOnlineResonance(lobby, "p1");
  const chat = renderOnlineChat({ ...lobby, chatHistory: [{ id: "m1", playerId: "p2", name: "<より>", text: "<script>失敗</script>", createdAt: 1 }] }, "p1", "入力途中");

  for (const html of [home, exploreLobby, raidLobby, teamLobby, resonanceLobby, chat]) {
    assert.equal(typeof html, "string");
    assert.ok(html.length > 200);
  }
  assert.match(home, /data-online-hall-destination="explore"/);
  assert.match(exploreLobby, /HOST WORLD EXPLORATION/);
  assert.match(raidLobby, /WEEKLY WORLD RAID/);
  assert.match(teamLobby, /1vs1、1vs2、1vs3、2vs2/);
  assert.match(resonanceLobby, /共鳴迷宮を開始/);
  assert.doesNotMatch(chat, /<script>/);
  assert.match(chat, /&lt;script&gt;失敗&lt;\/script&gt;/);
  assert.match(chat, />入力途中<\/textarea>/);
});

test("exploration, raid and team combat all render the solo battle component", () => {
  const base = room(), shared = battle();
  const expedition = { ...base, phase: "expedition", expedition: { floor: 100, battle: { ...shared, enemies: [{ id: "e1", name: "魔物", speciesId: "slime", hp: 500, maxHp: 500 }] } } };
  const raid = { ...base, phase: "raid", raid: { ...shared, name: "終焉融骸", boss: { id: "r1", name: "アビス＝マルガ", speciesId: "slime", hp: 5000, maxHp: 5000 }, minions: [] } };
  const team = { ...base, phase: "team", teamBattle: { ...shared, format: "1 vs 1" } };

  for (const html of [renderOnlineExplore(expedition, "p1"), renderOnlineRaid(raid, "p1"), renderOnlineTeam(team, "p1")]) {
    assert.equal((html.match(/class="battle-screen side-battle-v2/g) ?? []).length, 1);
    assert.match(html, /サーバー同期戦闘/);
    assert.match(html, /data-command="attack"/);
    assert.doesNotMatch(html, /class="online-v3-battle"/);
  }
});
