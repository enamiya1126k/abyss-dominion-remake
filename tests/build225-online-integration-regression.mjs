import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("build225 advertises one cache-coherent application version", async () => {
  const [index, config, main] = await Promise.all([read("index.html"), read("src/core/config.js"), read("src/main.js")]);
  assert.match(index, /ASSET_VERSION = "2\.11\.54"/);
  assert.match(index, /ASSET_BUILD = "build228"/);
  assert.match(index, /Styles\/build228\.css\?v=2\.11\.54-build228/);
  assert.match(index, /Styles\/build227\.css\?v=2\.11\.54-build227/);
  assert.match(index, /Styles\/build226\.css\?v=2\.11\.54-build226/);
  assert.match(index, /Styles\/build225\.css\?v=2\.11\.54-build225/);
  assert.match(index, /Styles\/build218\.css\?v=2\.11\.53-build218/);
  assert.match(config, /APP_VERSION="2\.11\.54"/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.54-build228/);
});

test("online profile carries offline expedition attrition and host key stock", async () => {
  const profile = await read("src/ui/screens/OnlinePartyScreen.js");
  assert.match(profile, /currentHp: Math\.max\(0, Math\.min\(stats\.hp/);
  assert.match(profile, /currentMp: Math\.max\(0, Math\.min\(maxMp\(monster\)/);
  assert.match(profile, /abyssKeyStock: Math\.max\(0, Number\(state\.inventory\?\.abyssKeys\)/);
  assert.match(profile, /explorePickupDone: Boolean\(state\.settings\?\.contextualGuide\?\.completed\?\.explore_pickup\)/);
});

test("online secret rooms preserve the session and return to the same controller", async () => {
  const [main, client] = await Promise.all([read("src/main.js"), read("src/online/OnlinePartyClient.js")]);
  assert.match(client, /snapshot\.secretRooms = \{ run: \{ id, seed \} \}/);
  assert.match(client, /message\.type === "secretRoomEntered"/);
  assert.match(client, /String\(message\.playerId \?\? ""\) !== this\.selfId/);
  assert.match(client, /syncExpeditionProfile\(\)/);
  assert.match(client, /this\._send\("expeditionProfileSync", \{ profile: this\.profile \}\)/);
  assert.match(client, /if \(connected\)[^]*this\._showConnectionStep\(this\.roomState \? "room" : "gate"\)/);
  assert.match(main, /ensureSecretRoomExpedition\(save\.state\);enterSecretRoom\(save\.state,roomId,floor\)/);
  assert.match(main, /secretRoomObject=objects\.find\(object=>object\.type==="secretRoom"/);
  assert.match(main, /shop:secretRoomObject\?\{x:secretRoomObject\.x,y:secretRoomObject\.y,roomId:/);
  assert.match(main, /onlinePartyController\.unmount\(\{disconnect:false\}\);screen="shop";render\(\)/);
  assert.match(main, /onlinePartyController\?\.syncExpeditionProfile\(\);onlineSecretRoomContext=null;screen="onlineParty";render\(\)/);
  assert.match(main, /if\(!onlineSecretRoomContext&&exploreAutoActive\(\)\)requestAnimationFrame\(runSecretRoomAuto\)/);
});

test("only a new leader departure rotates the online secret-room run", async () => {
  const [main, client] = await Promise.all([read("src/main.js"), read("src/online/OnlinePartyClient.js")]);
  assert.match(main, /onBeginSecretRoomExpedition:\(\)=>\{const run=beginSecretRoomExpedition\(save\.state\);save\.save\(\);return run\}/);
  const start = client.match(/if \(button\.matches\("\[data-online-start-explore\]"\)\) \{[^}]*?this\._send\("startExpedition", \{ profile: this\.profile, hostWorld: this\._hostWorldNetworkSnapshot\(\) \}\); return; \}/)?.[0] ?? "";
  assert.match(start, /const isLeader =/);
  assert.match(start, /if \(isLeader\) this\.onBeginSecretRoomExpedition\(\)/);
  assert.ok(start.indexOf("onBeginSecretRoomExpedition") < start.indexOf("_hostWorldNetworkSnapshot"));
  assert.doesNotMatch(start, /this\._send\("profile"/);
});

test("online first-floor guide completion is shared with normal exploration", async () => {
  const client = await read("src/online/OnlinePartyClient.js");
  assert.match(client, /message\.event\?\.tutorialGuide === "firstPickup"/);
  assert.match(client, /this\._notifyTutorialGuide\("explore_pickup"\)/);
  assert.match(client, /if \(sent\) this\._notifyTutorialGuide\("explore_move"\)/);
});

test("online persistence is idempotent and mirrors the host normal world", async () => {
  const [main, save] = await Promise.all([read("src/main.js"), read("src/services/SaveService.js")]);
  for (const callback of ["onOnlineStateMutation", "onRaidWorldUpdate", "onRaidExchange", "onOnlineVitalsUpdate", "onBattleDefeated"]) assert.match(main, new RegExp(`${callback}:`));
  assert.match(main, /processedVitalMutationIds\.includes\(mutationId\)/);
  assert.match(main, /processedBattleEventIds\.includes\(eventId\)/);
  assert.match(main, /save\.state\.player\.floorSeeds\[floor\]=seed/);
  assert.match(main, /recordBiomeChest\(save\.state,Number\(floor\)\|\|1,rawId\)/);
  assert.match(main, /prepareOnlineFloorBossReward\(\{floor,ownerId,resume:false\}\)/);
  assert.match(save, /processedVitalMutationIds/);
  assert.match(save, /processedBattleEventIds/);
  assert.match(save, /onlineParty\.raidWorld/);
  assert.match(save, /ranking:raidRanking/);
  assert.match(save, /hostWorld\.floorSeeds/);
  assert.match(main, /if\(depth===1000\)mark1000FloorCleared/);
  assert.match(main, /if\(depth===WORLD_MAX_FLOOR\)mark10000FloorCleared/);
});

test("resource rewards use normal toasts and only an acquired weapon opens ONLINE LOOT", async () => {
  const [main, client] = await Promise.all([read("src/main.js"), read("src/online/OnlinePartyClient.js")]);
  assert.match(main, /showResourceToast\("gold",gold\)/);
  assert.match(main, /showResourceToast\("crystal",crystals\)/);
  assert.match(main, /showResourceToast\("capture",captureCrystals\)/);
  assert.match(main, /abyssKeyCost/);
  assert.match(main, /gold=cap\(reward\.gold,Number\.MAX_SAFE_INTEGER\)/);
  assert.match(main, /isWeapon:Boolean\(equipmentAcquired&&equipmentName&&equipmentSlot==="weapon"\)/);
  assert.match(client, /result\?\.isWeapon !== true/);
  assert.match(client, /if \(!result\.duplicate && result\.isWeapon === true\) this\._showRewardReceipt/);
});

test("online handshake and host-world transport are versioned and bounded", async () => {
  const [client, server, roomStore] = await Promise.all([read("src/online/OnlinePartyClient.js"), read("online-server/server.js"), read("online-server/src/RoomStore.js")]);
  assert.match(client, /const ONLINE_PROTOCOL = "1\.14\.0"/);
  assert.match(client, /this\._send\("hello", \{ protocol: ONLINE_PROTOCOL/);
  assert.match(client, /message\.protocol !== ONLINE_PROTOCOL/);
  assert.match(client, /_hostWorldNetworkSnapshot\(\)/);
  assert.match(client, /56 \* 1024/);
  assert.match(server, /message\.protocol!=="1\.14\.0"/);
  assert.match(roomStore, /publicHostWorld\(room\.hostWorld,currentFloor\)/);
});

test("battle metadata and raid exchange retain offline records and fixed prices", async () => {
  const main = await read("src/main.js");
  assert.match(main, /ONLINE_RAID_EXCHANGE_PRICES=Object\.freeze\(\{character:240,equipment:180,circle:120,crystals:30\}\)/);
  assert.match(main, /recordWeaponKill\(save\.state,monster\.id,enemy\)/);
  assert.match(main, /recordSeriesBattle\(save\.state,\[monster\]/);
  assert.match(main, /recordBiomeEncounter\(save\.state,floor,speciesId\)/);
  assert.match(main, /monster\.history\.victories/);
  assert.match(main, /monster\.affection=Math\.min\(1000/);
});

console.log("ABYSS DOMINION build225 online integration regression: PASS");
