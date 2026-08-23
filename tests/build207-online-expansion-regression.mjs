import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html");
const config = read("src/core/config.js");
const save = read("src/services/SaveService.js");
const main = read("src/main.js");
const client = read("src/online/OnlinePartyClient.js");
const views = read("src/online/OnlineViews.js");
const css = read("src/Styles/build207.css");
const server = read("online-server/server.js");
const store = read("online-server/src/RoomStore.js");
const expansion = read("online-server/src/OnlineExpansion207.js");
const raid = read("online-server/src/RaidCoordinator.js");
const packageJson = JSON.parse(read("online-server/package.json"));

assert.match(html, /build207\.css\?v=2\.11\.42-build207/);
assert.match(html, /build208\.css\?v=2\.11\.43-build208/);
assert.match(html, /build209\.css\?v=2\.11\.44-build209/);
assert.match(html, /ASSET_BUILD\s*=\s*"build209"/);
assert.match(config, /APP_VERSION="2\.11\.44"/);
assert.equal(packageJson.version, "1.11.1");
assert.match(server, /protocol:"1\.11\.1"/);

for (const file of ["rare-golden-monster.png", "otherworld-merchant.png", "hidden-portal.png"]) {
  const path = new URL(`../assets/online/coop/${file}`, import.meta.url);
  const data = readFileSync(path);
  assert.ok(statSync(path).size > 8_000, `${file} is unexpectedly small`);
  assert.equal(data.toString("ascii", 1, 4), "PNG");
  assert.equal(data.readUInt32BE(16), 512);
  assert.equal(data.readUInt32BE(20), 512);
  assert.equal(data.readUInt8(25), 6, `${file} must be RGBA`);
}

for (const token of ["goldenMonster", "otherworldMerchant", "hiddenPortal", "personalBonusDraw", "rareEventChance", "resonanceContributionScore"]) {
  assert.match(expansion, new RegExp(token));
}
for (const token of ["sharedBase", "personalBonus", "rareMerchantClaim", "focusTarget", "battleCheer", "ownerReconnectDeadline", "bossFirstClear", "bossAssist", "worldOwnerTimeout"]) {
  assert.match(store, new RegExp(token));
}
for (const route of ["rareMerchantClaim", "social", "focusTarget", "battleCheer"]) {
  assert.match(server, new RegExp(`message\\.type===\\"${route}\\"`));
}
for (const token of ["_beginEmoteGesture", "focusTarget", "battleCheer", "rareMerchantClaim", "socialBubbles"]) {
  assert.match(client, new RegExp(token));
}
for (const token of ["online-spectator-cheer", "online-focus-target", "online-emote-wheel", "online-coop-run-status", "online-rare-merchant-panel"]) {
  assert.match(css + views, new RegExp(token));
}
for (const token of ["randomEquipmentRarity", "bossFirstClear", "dedicatedFloorBossEquipment", "floorBossDefinitionForFloor", "rareGoldenMonster", "rarePortalChest", "rare_golden_beast"]) {
  assert.match(main, new RegExp(token));
}
for (const token of ["firstCoopBossClears", "defeatedBossFloors"]) assert.match(save, new RegExp(token));

// The user explicitly deferred raid phase transformations in this build.
assert.doesNotMatch(raid, /build207RaidPhase|phaseThreshold|raidPhaseChange/);

console.log("build207 online expansion regression: ok");
