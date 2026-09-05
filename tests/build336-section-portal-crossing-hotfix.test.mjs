import assert from "node:assert/strict";
import fs from "node:fs";

const main = fs.readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
const client = fs.readFileSync(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8");
const roomStore = fs.readFileSync(new URL("../online-server/src/RoomStore.js", import.meta.url), "utf8");

const transitionStart = main.indexOf("function transitionCampaignSection()");
const transitionEnd = main.indexOf("function update(dt)", transitionStart);
assert.ok(transitionStart >= 0 && transitionEnd > transitionStart, "区画移動処理が存在する");
const transitionSource = main.slice(transitionStart, transitionEnd);
assert.match(transitionSource, /game\?\.player\?\.path\?\.length/, "残り経路がある間は区画移動を発動しない");

assert.match(client, /continueThroughPortal = this\.path\.length > 0/, "オンライン側も残り経路を送信する");
assert.match(client, /position: \{ \.\.\.self\.dungeonPosition, continueThroughPortal \}/, "通過情報をサーバーへ渡す");

const finalMoveStart = roomStore.lastIndexOf(" moveExpedition(session,position){");
const finalMoveEnd = roomStore.indexOf(" _expeditionInteractV206", finalMoveStart);
assert.ok(finalMoveStart >= 0 && finalMoveEnd > finalMoveStart, "有効なオンライン移動処理が存在する");
const finalMoveSource = roomStore.slice(finalMoveStart, finalMoveEnd);
assert.match(finalMoveSource, /continueThroughPortal=position\?\.continueThroughPortal===true/, "サーバーが通過情報を検証する");
assert.match(finalMoveSource, /portal=continueThroughPortal\?null:/, "途中マスでは区画転送しない");

console.log("build336 section portal crossing hotfix: 7/7 passed");
