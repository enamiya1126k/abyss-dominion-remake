import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const html = read("index.html");
const config = read("src/core/config.js");
const main = read("src/main.js");
const client = read("src/online/OnlinePartyClient.js");
const views = read("src/online/OnlineViews.js");
const css = read("src/Styles/build206.css");
const store = read("online-server/src/RoomStore.js");
const gimmicks = read("online-server/src/CoopGimmicks.js");
const raid = read("online-server/src/RaidCoordinator.js");
const team = read("online-server/src/TeamBattleCoordinator.js");

assert.match(html, /build206\.css\?v=2\.11\.41-build206/);
assert.match(html, /ASSET_BUILD\s*=\s*"build206"/);
assert.match(config, /APP_VERSION="2\.11\.41"/);

const assets = [
  "switch-idle.png", "switch-pressed.png", "switch-charging.png", "switch-activated.png",
  "chest-black-iron.png", "chest-silver.png", "chest-gold.png", "chest-abyss.png",
  "key-fragment-cyan.png", "key-fragment-violet.png", "key-combined.png", "vault-sealed.png",
];
for (const file of assets) {
  const path = `assets/online/coop/${file}`, data = readFileSync(path);
  assert.ok(statSync(path).size > 1_000, `${file} is unexpectedly small`);
  assert.equal(data.toString("ascii", 1, 4), "PNG");
  assert.equal(data.readUInt32BE(16), 256);
  assert.equal(data.readUInt32BE(20), 256);
  assert.match(main, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

for (const token of ["dualSwitch", "relaySeal", "resonanceChest", "splitKey", "eliteVault"]) assert.match(gimmicks, new RegExp(token));
for (const token of ["black-iron", "silver", "gold", "abyss", "extraRolls"]) assert.match(gimmicks, new RegExp(token));
for (const token of ["expeditionPing", "coopBreak", "mvpTitles"]) assert.match(store, new RegExp(token));
assert.ok(store.includes("member?.connected&&Number(member.coopVitals?.hp)>0"));
for (const label of ["集合", "こっち", "宝箱", "スイッチ", "救助"]) assert.match(views, new RegExp(label));
for (const token of ["online-coop-break", "online-ping-menu", "online-mvp-badge", "online-circle-loadout"]) assert.match(css + views, new RegExp(token));
for (const token of ["circleActivate", "circleDamageFactor", "circleEffect"]) {
  assert.match(store, new RegExp(token));
  assert.match(raid, new RegExp(token));
  assert.match(team, new RegExp(token));
}
assert.match(client, /_queueBattlePresentation\("raid", message\.raid\?\.lastEvents\)/);
assert.match(client, /event\.kind === "circleActivate"/);
assert.match(main, /onlinePings/);
assert.match(main, /MAGIC_CIRCLES/);

console.log("build206 online co-op regression: ok");
