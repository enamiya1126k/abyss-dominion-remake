import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { APP_VERSION, SAVE_SCHEMA_VERSION } from "../src/core/config.js";
import {
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_ICON_KEYS,
  achievementIconKeyForId,
} from "../src/core/AchievementRewardSystem.js";
import {
  beginGuestProgressIsolation,
  onlineProgressionAllowed,
  recoverInterruptedGuestProgress,
} from "../src/online/OnlineProgressIsolation.js";
import { renderOnlineExplore } from "../src/online/OnlineViews.js";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const read = path => readFile(resolve(ROOT, path), "utf8");

const [index, main, auditCss, clientSource, serverSource, onlineViewsSource, roomStoreSource, bossWorldSource, mobileAuditCss, mobileUiCss, storyCss, finalCss] = await Promise.all([
  read("index.html"),
  read("src/main.js"),
  read("src/Styles/build311-audit.css"),
  read("src/online/OnlinePartyClient.js"),
  read("online-server/server.js"),
  read("src/online/OnlineViews.js"),
  read("online-server/src/RoomStore.js"),
  read("src/core/CampaignBossWorldSystem.js"),
  read("src/Styles/build305-final-audit.css"),
  read("src/Styles/build306-ui.css"),
  read("src/Styles/build309-story.css"),
  read("src/Styles/build310-hero-final.css"),
]);

function between(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0, `missing source marker: ${start}`);
  assert.ok(to > from, `missing source marker: ${end}`);
  return source.slice(from, to);
}

function compact(value) {
  return value.replace(/\s+/g, "");
}

function localProgressFixture() {
  return {
    flags: {
      abyssUnlocked: true,
      deepAbyssUnlocked: false,
      gameClear1000: false,
      ending1000Played: false,
      gameClear10000: false,
      ending10000Played: false,
      secondWorldEntered: false,
      tenGodObserved: false,
    },
    worldPhase: 0,
    player: {
      gold: 311,
      maxFloor: 21,
      currentFloor: 17,
      checkpoint: 11,
      inRun: false,
      nextShopFloor: 24,
      floorSeeds: { 17: 170 },
      openedChests: { 17: ["local-chest"] },
      bossRewards: { 10: true, 20: true },
      pendingBossRewards: {},
      bossKills: { 10: 1, 20: 1 },
      exploreRun: { id: null, floors: {} },
    },
    returnRewards: { manual: { active: false, startFloor: 17, lastFloor: 17, floorsCleared: 0 } },
    secretRooms: { run: null, activeRoom: null },
    biomeProgress: {},
    floorBossChallenges: {},
    secondWorld: {},
    onlineParty: {
      claimedRewards: [],
      firstCoopBossClears: [],
      activeExpeditionRunId: null,
      activeManualExploreRunId: null,
      activeExpeditionOwnerId: null,
      hostWorld: {
        ownerId: null,
        floorSeeds: {},
        openedChestIds: {},
        defeatedBossFloors: [],
        claimedBossRewardFloors: [],
      },
      progressIsolation: {},
    },
  };
}

test("Build311 publishes one 3.1.1 entry identity and loads its audit stylesheet last", async () => {
  assert.equal(APP_VERSION, "3.1.1");
  assert.equal(SAVE_SCHEMA_VERSION, 76, "the presentation audit must not reset the save schema");
  assert.match(index, /const ASSET_VERSION = "3\.1\.1";/);
  assert.match(index, /const ASSET_BUILD = "build311";/);
  assert.match(index, /import\(`\.\/src\/main\.js\?v=\$\{ASSET_VERSION\}-\$\{ASSET_BUILD\}`\)/);

  const styles = [...index.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
    .map(match => match[1]);
  const build310 = "./src/Styles/build310-hero-final.css?v=3.1.0-build310";
  const build311 = "./src/Styles/build311-audit.css?v=3.1.1-build311";
  assert.equal(styles.filter(href => href === build311).length, 1, "Build311 CSS must be linked exactly once");
  assert.ok(styles.indexOf(build311) > styles.indexOf(build310), "Build311 must override the Build310 hero layer");
  assert.equal(styles.at(-1), build311, "no older stylesheet may override the release audit");
});

test("Build311 challenge UI uses canonical Japanese floor labels and exposes no legacy F labels", () => {
  const team = between(main, "function openTeamBattle()", "function testScaleEmergency(");
  const result = between(main, "function finishFloorBossChallengeBattle(", "function retreatCampaignFinalBattle(");
  const picker = between(main, "function triggerFloorBossChallenge(", "function openEndgameDossier(");
  const challengeUi = `${team}\n${result}\n${picker}`;

  assert.match(team, /floorBossDisplayFloor\(stageBoss\)\}階・\$\{stageBoss\.name\}/);
  assert.match(result, /floorBossDisplayFloor\(boss\)\}階・階層支配者/);
  assert.match(picker, /floorBossDisplayFloor\(event\.definition\)\}階・\$\{event\.definition\.name\}/);
  assert.match(picker, /\$\{displayFloor\}階・\$\{status\.unlocked\?boss\.rarity/);
  assert.match(picker, /\$\{value\+1\}–\$\{value\+9\}階/);
  assert.doesNotMatch(challengeUi, /\}F(?:・|<)/, "challenge copy must not regress to 10F/20F-style labels");
  assert.doesNotMatch(onlineViewsSource, /<b>F<\/b>|\$\{[^}]+\}F/);
  assert.doesNotMatch(roomStoreSource, /\$\{(?:floor|clearedFloor)\}F/);
  assert.doesNotMatch(bossWorldSource, /\$\{value\}F/);
});

test("Build311 renders the online challenge-floor picker with the Japanese floor suffix", () => {
  const playerId = "AD-B3UI-AAAB";
  const html = renderOnlineExplore({
    phase: "lobby",
    ownerId: playerId,
    leaderId: playerId,
    selectedFloor: 20,
    members: [{
      playerId,
      connected: true,
      leader: true,
      ready: false,
      profile: {
        displayName: "階層表示試験",
        monsterName: "スライム",
        speciesId: "slime",
        maxFloor: 20,
        battleStats: { hp: 100, mp: 20, atk: 10, matk: 10, def: 10, mdef: 10, spd: 10 },
      },
    }],
  }, playerId);

  assert.match(html, /value="20"[^>]*data-online-floor[^>]*><b>階<\/b>/);
  assert.doesNotMatch(html, /<b>\s*F\s*<\/b>/, "the rendered picker must not expose the old F suffix");
});

test("Build311 pixelizes unknown emoji clusters through the generic atlas fallback", () => {
  const mapSource = between(main, "const UI_EMOJI_ICONS=new Map([", "const UI_EMOJI_TOKENS=");
  const literal = main.match(/^const UI_EMOJI_PATTERN=(\/[^\n]+\/u);$/m)?.[1];
  assert.ok(literal, "the generic Unicode emoji matcher must remain defined");
  const pattern = vm.runInNewContext(literal);

  for (const emoji of ["🧬", "🧑🏽‍🚀", "🇯🇵"]) {
    assert.equal(mapSource.includes(`["${emoji}"`), false, `${emoji} must exercise the generic fallback, not the known-token map`);
    const match = new RegExp(pattern.source, pattern.flags).exec(emoji);
    assert.equal(match?.index, 0);
    assert.equal(match?.[0], emoji, `${emoji} must be consumed as one emoji cluster`);
  }

  assert.match(main, /!UI_EMOJI_TOKENS\.some\(token=>text\.includes\(token\)\)&&!UI_EMOJI_PATTERN\.test\(text\)/);
  assert.match(main, /if\(emoji\?\.index===0\)\{fragment\.append\(pixelIconElement\("event"\)\);cursor\+=emoji\[0\]\.length;continue\}/);
  assert.match(main, /uiEmojiObserver\.observe\(app,\{childList:true,subtree:true\}\)/,
    "emoji introduced by later online/UI renders must also be pixelized");
});

test("Build311 achievements use only approved image tokens, including migrated rewards", () => {
  const approved = new Set(ACHIEVEMENT_ICON_KEYS);
  for (const entry of ACHIEVEMENT_DEFINITIONS) {
    assert.equal(Object.hasOwn(entry, "icon"), false, `${entry.id} cannot retain an emoji icon`);
    assert.equal(approved.has(entry.iconKey), true, `${entry.id} needs an approved image token`);
    assert.doesNotMatch(entry.iconKey, /\p{Extended_Pictographic}|\uFE0F|[\u2600-\u27BF]/u);
    assert.equal(achievementIconKeyForId(`achievement-${entry.id}-v1`), entry.iconKey);
  }
});

test("Build311 keeps story and ending skip controls at 44px and clears the north hero HUD", () => {
  const css = auditCss.replace(/\/\*[\s\S]*?\*\//g, "");
  const skip = css.match(/\.campaign-story-skip\s*,\s*\.ending1000-skip\s*,\s*\.ending10000-skip\s*\{([^}]*)\}/)?.[1];
  assert.ok(skip, "all three skip controls must share the Build311 touch-target rule");
  assert.match(compact(skip), /min-width:44px!important/);
  assert.match(compact(skip), /min-height:44px!important/);
  assert.match(compact(skip), /touch-action:manipulation/);

  const north = css.match(/\.campaign-hero-edge-chip\.is-north\s*\{([^}]*)\}/)?.[1];
  assert.ok(north, "the north pursuit marker override must exist");
  assert.match(compact(north), /top:64px!important/);
  assert.match(compact(north), /z-index:37!important/);

  const mobile = between(css, "@media (max-width: 720px) {", "}");
  assert.match(compact(mobile), /\.campaign-hero-edge-chip\.is-north\{top:58px!important/,
    "the phone override must remain below the compact chase HUD");
});

test("Build311 keeps the iPhone Safari-equivalent viewport, safe areas and non-overlapping controls", () => {
  assert.match(index, /name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/);
  assert.match(mobileAuditCss, /max-height:calc\(100dvh[^;]+safe-area-inset-top[^;]+safe-area-inset-bottom/);
  assert.match(mobileAuditCss, /-webkit-overflow-scrolling:touch/);
  assert.match(mobileAuditCss, /\.game-modal[^}]+overflow-y:auto/is);
  assert.match(mobileUiCss, /grid-template-rows:auto auto auto minmax\(0,1fr\) calc\(50px \+ max\(2px,env\(safe-area-inset-bottom\)\)\)/);
  assert.match(mobileUiCss, /\.explore-screen-dungeon>\.explore-nav[^{]*\{[^}]+position:relative!important/is);
  assert.match(mobileUiCss, /\.explore-auto-toggle[^{]*\{[^}]+height:44px!important[^}]+touch-action:none!important/is);
  assert.match(storyCss, /\.campaign-story-modal[^}]+safe-area-inset-top[^}]+safe-area-inset-bottom/is);
  assert.match(finalCss, /\.campaign-final-floor-screen[^{]*\{[^}]+height:100dvh/is);
});

test("Build311 replaces the online leader glyph with versioned pixel atlas art", () => {
  const leader = auditCss.match(/\.online-leader-crown::before\s*\{([^}]*)\}/)?.[1];
  assert.ok(leader, "online leader crown override must exist");
  assert.match(compact(leader), /content:""!important/);
  assert.match(leader, /home-ui-icons\.png\?v=3\.1\.1-build311/);
  assert.match(compact(leader), /image-rendering:pixelated/);
  assert.doesNotMatch(leader, /♟/);
});

test("Build311 leaves the live online protocol at 1.17.0 across client and server metadata", async () => {
  const [packageJson, packageLock] = await Promise.all([
    read("online-server/package.json").then(JSON.parse),
    read("online-server/package-lock.json").then(JSON.parse),
  ]);
  assert.equal(packageJson.version, "1.17.0");
  assert.equal(packageLock.version, "1.17.0");
  assert.equal(packageLock.packages?.[""]?.version, "1.17.0");
  assert.match(clientSource, /const ONLINE_PROTOCOL = "1\.17\.0";/);
  assert.match(serverSource, /message\.protocol!=="1\.17\.0"/);
  assert.match(serverSource, /type:"helloAck",protocol:"1\.17\.0"/);
  assert.match(serverSource, /type:"recoveryComplete",orphanedExpedition:/);
});

test("Build311 guest reload recovery restores local floors once while retaining earned assets", () => {
  const state = localProgressFixture();
  const entered = beginGuestProgressIsolation(state, {
    roomId: "ROOM31",
    ownerId: "host",
    selfId: "guest",
    runId: "run-311",
    now: 100,
  });
  assert.equal(entered.captured, true);

  state.player.maxFloor = 81;
  state.player.currentFloor = 81;
  state.player.checkpoint = 80;
  state.player.floorSeeds[81] = 811;
  state.player.bossKills[80] = 1;
  state.player.gold += 500;
  state.onlineParty.claimedRewards.push("run-311:guest-reward");

  const recovered = recoverInterruptedGuestProgress(state, 311_000);
  assert.equal(recovered.restored, true);
  assert.deepEqual(
    [state.player.maxFloor, state.player.currentFloor, state.player.checkpoint],
    [21, 17, 11],
  );
  assert.equal(state.player.floorSeeds[81], undefined);
  assert.equal(state.player.bossKills[80], undefined);
  assert.equal(state.player.gold, 811, "non-progression assets earned online must survive isolation recovery");
  assert.deepEqual(state.onlineParty.claimedRewards, ["run-311:guest-reward"]);
  assert.equal(state.onlineParty.progressIsolation.interruptedRecovery.reason, "reload");
  assert.equal(recoverInterruptedGuestProgress(state, 311_001).restored, false, "reload recovery must be idempotent");

  assert.equal(onlineProgressionAllowed({ worldOwnerId: "host" }, { selfId: "guest", roomOwnerId: "host" }), false);
  assert.equal(onlineProgressionAllowed({ worldOwnerId: "guest" }, { selfId: "guest", roomOwnerId: "host" }), false);
  assert.equal(onlineProgressionAllowed({ worldOwnerId: "guest" }, { selfId: "guest", roomOwnerId: "guest" }), true);
});

test("Build311 recoveryComplete waits for the preceding reward save before orphan recovery", async () => {
  const previousWebSocket = globalThis.WebSocket;
  globalThis.WebSocket = { OPEN: 1, CONNECTING: 0 };
  try {
    const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?build311-recovery-barrier");
    let releaseReward;
    const rewardGate = new Promise(resolve => { releaseReward = resolve; });
    const order = [];
    const sent = [];
    const controller = new OnlinePartyController({
      getState: () => ({ monsters: [], party: [] }),
      onReward: async () => {
        order.push("reward-start");
        const result = await rewardGate;
        order.push("reward-saved");
        return result;
      },
      onExpeditionOrphaned: async () => {
        order.push("orphan-recovery");
        return { ok: true, active: false };
      },
    });
    controller.selfId = "AD-B311-TEST";
    controller.capabilities = new Set(["expeditionResultsV1"]);
    controller.connectionReady = true;
    controller.ws = { readyState: 1, send: value => sent.push(JSON.parse(value)) };
    controller.recoverySettlementBatch = 311;
    controller.recoverySettlementTasks = new Set();
    controller.recoverySettlementFailed = false;

    controller._handleMessage({
      type: "onlineReward",
      rewardId: "run-311:floor-clear",
      reward: {},
      source: { kind: "floorClear", expeditionRunId: "run-311" },
    });
    controller._handleMessage({ type: "recoveryComplete", orphanedExpedition: true });
    await Promise.resolve();
    assert.deepEqual(order, ["reward-start"], "orphan cleanup cannot overtake a pending durable reward write");

    releaseReward({ ok: true });
    for (let attempt = 0; attempt < 20 && !order.includes("orphan-recovery"); attempt += 1) {
      await new Promise(resolve => setImmediate(resolve));
    }
    assert.deepEqual(order, ["reward-start", "reward-saved", "orphan-recovery"]);
    assert.equal(controller.recoverySettlementFailed, false);
    assert.equal(sent.some(message => message.type === "rewardAck" && message.rewardId === "run-311:floor-clear"), true);
  } finally {
    if (previousWebSocket === undefined) delete globalThis.WebSocket;
    else globalThis.WebSocket = previousWebSocket;
  }
});
