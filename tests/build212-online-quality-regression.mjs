import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APP_VERSION, SAVE_SCHEMA_VERSION } from "../src/core/config.js";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const index = read("index.html");
const main = read("src/main.js");
const views = read("src/online/OnlineViews.js");
const client = read("src/online/OnlinePartyClient.js");
const styles = read("src/Styles/build212.css");
const roomStore = read("online-server/src/RoomStore.js");
const expansion = read("online-server/src/OnlineExpansion208.js");

assert.equal(APP_VERSION, "2.11.47");
assert.equal(SAVE_SCHEMA_VERSION, 58);
assert.match(index, /build212\.css\?v=2\.11\.47-build212/);
assert.match(index, /ASSET_BUILD = "build212"/);

// Exploration objects and players share one depth-sorted display list.
assert.match(main, /objects\.push\(\.\.\.onlineExploreSceneObjects\(\)\)/);
assert.match(main, /objects\.push\(\.\.\.explorationPartySceneObjects\(\)\)/);
assert.match(main, /objects\.sort\(\(a,b\)=>a\.y-b\.y\|\|a\.order-b\.order\)/);
assert.match(main, /expedition=game\.onlineRoom\?\.expedition,objects=\[\],now=Date\.now\(\)/);
assert.match(main, /object\.type==="bone"\?"bones":"water"/);

// Hall movement is incremental, with inline chat/emotes and facility art.
assert.match(client, /message\.type === "memberMoved"[\s\S]*?_updateHallPlayerDom/);
assert.match(client, /_moveHallStep\(now\)[\s\S]*?_updateHallPlayerDom\(this\.selfId\)/);
assert.match(client, /ONLINE_HALL_EMOTE_POSITION/);
assert.match(views, /online-hall-chat-bar/);
assert.match(views, /hall-facility-art/);
assert.match(styles, /\.zone-raid \.hall-facility-art/);
assert.match(styles, /\.zone-explore \.hall-facility-art/);
assert.match(styles, /\.zone-team \.hall-facility-art/);
assert.match(styles, /\.zone-chat \.hall-facility-art/);

// Chat/emotes remain available while exploring, but never overlay battles.
assert.match(views, /online-explore-chat-bar/);
assert.match(views, /online-explore-emote/);
assert.doesNotMatch(views.match(/export function renderSharedBattle[\s\S]*?function dungeonBoard/)?.[0] ?? "", /data-online-emote-anchor/);
assert.match(styles, /\.online-battle-emote-anchor,\.online-battle-emote-bubble\{display:none!important\}/);

// Battle UI reuses solo hierarchy with biome data and slower readable feedback.
assert.match(views, /function onlineBattleBiome/);
assert.match(views, /biomeForFloor/);
assert.match(views, /biomeBattle, specialTitle/);
assert.match(client, /const spacing = mode === "raid" \? 760 : 560/);
assert.match(client, /setTimeout\(\(\) => float\.remove\(\), 2400\)/);
assert.match(client, /equipmentAuthority/);
assert.match(styles, /\.online-coop-break\{top:126px!important/);
assert.match(styles, /animation-duration:2200ms!important/);
assert.match(styles, /raid-main-boss \.side-unit-sprite\{left:57%!important/);

// Every reward is itemised; common and personal rolls are separated.
assert.match(client, /_showRewardReceipt/);
assert.match(client, /全員共通/);
assert.match(client, /あなたの追加抽選/);
assert.match(styles, /\.online-reward-receipt/);

// Co-op keeps solo encounter pressure and gives props resource/break rewards.
assert.match(expansion, /const soloBaseline = Math\.max\(4, Math\.min\(6/);
assert.match(expansion, /\(partySize - 1\) \* \.1/);
assert.match(roomStore, /\["crystal","barrel","crate"\]\.includes\(entry\.type\)/);
assert.match(roomStore, /crystal\?\{crystals:1\}:\{gold:/);
assert.match(roomStore, /decoration\.destroyed=true/);
assert.match(roomStore, /encounterCooldownUntil=this\.now\(\)\+1400/);

console.log("build212 online quality regression: ok");
