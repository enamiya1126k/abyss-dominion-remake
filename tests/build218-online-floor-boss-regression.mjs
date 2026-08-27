import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(resolve(root, path), "utf8");
const indexSource = read("index.html");
const configSource = read("src/core/config.js");
const mainSource = read("src/main.js");
const clientSource = read("src/online/OnlinePartyClient.js");
const viewSource = read("src/online/OnlineViews.js");
const battleScreenSource = read("src/ui/screens/BattleScreen.js");
const roomStoreSource = read("online-server/src/RoomStore.js");
const cssSource = read("src/Styles/build218.css");

assert.match(indexSource, /build218\.css\?v=2\.11\.53-build218/);
assert.match(indexSource, /build225\.css\?v=2\.11\.54-build225/);
assert.match(indexSource, /ASSET_BUILD = "build228"/);
assert.match(configSource, /APP_VERSION="2\.11\.54"/);

// The online floor is sourced from the same canonical boss catalogue as solo.
assert.match(roomStoreSource, /floorBossTemplates217\(floor\)/);
assert.match(roomStoreSource, /prepareFloorBossExpedition218/);
assert.match(roomStoreSource, /object\.type==="floorBoss"/);
assert.match(roomStoreSource, /type:"hotSpring"/);
assert.match(roomStoreSource, /type:"floorBossDefeated"/);
assert.match(roomStoreSource, /claimedBossRewardFloors/);
assert.match(roomStoreSource, /expedition\.floorBoss\.defeated=true/);

assert.match(roomStoreSource, /const templates=boss\?floorBossTemplates217\(floor\)/);
assert.match(roomStoreSource, /milestoneBossIdsForFloor\(floor\)/);
assert.match(roomStoreSource, /partyHpScale=partySize>=2\?1\+\(partySize-1\)\*\.82:1/);

// Contact is confirmed before battle; defeat hands off report + exact solo choice.
assert.match(clientSource, /floorBossConfirm/);
assert.match(clientSource, /data-online-confirm-floor-boss/);
assert.match(clientSource, /pendingFloorBossReward/);
assert.match(clientSource, /isWorldOwner/);
assert.match(mainSource, /prepareOnlineFloorBossReward/);
assert.match(mainSource, /createBossRewardOptions\(depth,candidate\)/);
assert.match(mainSource, /repairMissedOnlineFloorBossRewards\(\)/);
assert.match(mainSource, /claimedBossRewardFloors/);
assert.match(viewSource, /online-floor-boss-confirm/);
assert.match(viewSource, /online-coop-report/);
assert.match(viewSource, /online-shared-battle-shell[^]*linkArts/);
assert.doesNotMatch(battleScreenSource, /2\.11\.52-build217/);

// The gathering-hall destinations are actual authored pixel assets, not CSS shapes.
for (const name of ["raid-pavilion", "dungeon-gate", "arena", "notice-board"]) {
  assert.ok(existsSync(resolve(root, `assets/online/hall/build218/${name}.png`)), `${name}.png is required`);
  assert.match(viewSource, new RegExp(`build218/${name}\\.png`));
}
assert.match(cssSource, /hall-facility-art img/);
assert.match(cssSource, /hall-facility-art::before,[^]*display:none!important/);
assert.match(cssSource, /online-shared-battle-shell>\.online-coop-break/);

console.log("build218 online floor boss regression: ok");
