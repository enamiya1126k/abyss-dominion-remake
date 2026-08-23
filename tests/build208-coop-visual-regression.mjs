import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html"), config = read("src/core/config.js"), main = read("src/main.js");
const client = read("src/online/OnlinePartyClient.js"), views = read("src/online/OnlineViews.js"), css = read("src/Styles/build208.css");
const store = read("online-server/src/RoomStore.js"), expansion = read("online-server/src/OnlineExpansion208.js");

assert.match(html, /build208\.css\?v=2\.11\.43-build208/);
assert.match(html, /build209\.css\?v=2\.11\.44-build209/);
assert.match(html, /ASSET_BUILD\s*=\s*"build209"/);
assert.match(config, /APP_VERSION="2\.11\.44"/);
for (const token of ["createRareTreasureRealm208", "wallAlcoves", "persistent", "rarePortalGuardian", "rareReturnPortal"]) assert.match(expansion + store, new RegExp(token));
for (const token of ["online-rare-merchant-modal", "online-key-fusion-fx", "online-treasure-realm"]) assert.match(css + views + client, new RegExp(token));
for (const token of ["treasureRealm", "drawExplorationWallAsset", "rare_golden_beast", "chest-abyss-open", "merchant-talk", "portal-active"]) assert.match(main, new RegExp(token));

const assets = [
  ...["idle1", "idle2", "idle3", "walk1", "walk2", "attack", "damage", "down"].map(name => `assets/monsters/rare_golden_beast/${name}.png`),
  ...["idle1", "idle2", "idle3", "talk"].map(name => `assets/online/coop/merchant/${name}.png`),
  ...["black-iron", "silver", "gold", "abyss"].flatMap(tier => ["closed", "open"].map(state => `assets/online/coop/chests/${tier}-${state}.png`)),
  ...["key-fragment-cyan", "key-fragment-violet", "key-combined", "vault-sealed"].map(name => `assets/online/coop/keys/${name}.png`),
  ...["portal-dormant", "portal-active"].map(name => `assets/online/coop/portal/${name}.png`),
];
for (const file of assets) {
  const path = new URL(`../${file}`, import.meta.url), data = readFileSync(path);
  assert.ok(statSync(path).size > 300, `${file} is unexpectedly small`);
  assert.equal(data.toString("ascii", 1, 4), "PNG", `${file} must be PNG`);
  assert.equal(data.readUInt8(25), 6, `${file} must be RGBA`);
}

console.log(`build208 co-op visual regression: ok (${assets.length} RGBA assets)`);
