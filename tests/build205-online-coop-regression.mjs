import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html");
const views = read("src/online/OnlineViews.js");
const client = read("src/online/OnlinePartyClient.js");
const main = read("src/main.js");
const css = read("src/Styles/build205.css");
const raid = read("online-server/src/RaidCoordinator.js");
const room = read("online-server/src/RoomStore.js");

assert.match(html, /build205\.css\?v=2\.11\.40-build205/);
assert.match(html, /ASSET_BUILD\s*=\s*"build206"/);
assert.match(raid, /FIRST_RAID_HP=50_000,FIRST_RAID_LEVEL=50/);
assert.match(raid, /JUVENILE_RAID_LEVEL=200/);
assert.doesNotMatch(views, /初回挑戦時にボスHP/);
assert.match(views, /固定HP 50,000・Lv\.50/);
assert.match(views, /enemyMagicCircleArt/);
assert.match(css, /build205RaidBossEightStep/);
assert.match(css, /build205RaidSubBossEightStep/);
assert.match(css, /enemy-battle-magic-circle/);
assert.match(views, /id="miniMapToggle"/);
assert.match(views, /data-online-explore-chat-form/);
assert.match(client, /_bindExploreChatDrag/);
assert.match(client, /_hostWorldSnapshot/);
assert.match(main, /onlineExploreCameraState/);
assert.match(main, /drawOnlineExploreOverlays/);
assert.match(room, /openResonanceChest/);
assert.match(room, /switchHoldStartedAt/);
assert.match(room, /action==="rescue"/);
assert.match(room, /value\.exploration\*100/);
assert.match(room, /type:"expeditionEnded",summary/);

console.log("build205 online co-op regression: ok");
