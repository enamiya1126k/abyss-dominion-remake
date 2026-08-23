import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html"), config = read("src/core/config.js"), main = read("src/main.js");
const client = read("src/online/OnlinePartyClient.js"), views = read("src/online/OnlineViews.js"), css = read("src/Styles/build209.css");
const store = read("online-server/src/RoomStore.js"), gimmicks = read("online-server/src/CoopGimmicks.js");
const packageJson = JSON.parse(read("online-server/package.json")), server = read("online-server/server.js");

assert.match(html, /build209\.css\?v=2\.11\.44-build209/);
assert.match(html, /ASSET_BUILD\s*=\s*"build209"/);
assert.match(config, /APP_VERSION="2\.11\.44"/);
assert.equal(packageJson.version, "1.11.1");
assert.match(server, /protocol:"1\.11\.1"/);

for (const token of ["drawExplorationGroundAsset", "onlineExploreCameraStates", "開封可能", "あと1人", "支援受取済", "!object.unlocked"]) assert.match(main, new RegExp(token));
for (const token of ["interactionPending", "merchantPending", "merchantResult", "処理中…"]) assert.match(client + views, new RegExp(token));
for (const token of ["partySize", "participantTier", "rewardTierLabel", "nearestDistance", "固定品質"]) assert.match(store + gimmicks, new RegExp(token));
for (const token of ["online-merchant-receipt", "aria-busy", "touch-action:none"]) assert.match(css + views, new RegExp(token));
assert.doesNotMatch(main, /object\.unlocked\?"portal-dormant":"vault-sealed"/);

const chestFiles = ["black-iron", "silver", "gold", "abyss"].flatMap(tier => ["closed", "open"].map(state => `assets/online/coop/chests/${tier}-${state}.png`));
for (const file of chestFiles) {
  const url = new URL(`../${file}`, import.meta.url), data = readFileSync(url);
  assert.ok(statSync(url).size > 10_000, `${file} is unexpectedly small`);
  assert.equal(data.toString("ascii", 1, 4), "PNG", `${file} must be PNG`);
  assert.equal(data.readUInt32BE(16), 128, `${file} width`);
  assert.equal(data.readUInt32BE(20), 112, `${file} height`);
  assert.equal(data.readUInt8(25), 6, `${file} must be RGBA`);
}

console.log(`build209 co-op polish regression: ok (${chestFiles.length} frontal RGBA chest assets)`);
