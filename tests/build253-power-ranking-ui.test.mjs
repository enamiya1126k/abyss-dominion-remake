import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const main=readFileSync(join(root,"src/main.js"),"utf8");
const css=readFileSync(join(root,"src/Styles/build253.css"),"utf8");
const html=readFileSync(join(root,"index.html"),"utf8");

assert.match(html,/build253\.css\?v=2\.11\.77-build253/);
assert.match(html,/ASSET_VERSION = "2\.11\.82"/);
assert.match(html,/ASSET_BUILD = "build258"/);

assert.match(main,/data-power-record-tab="own"/);
assert.match(main,/data-power-record-tab="ranking"/);
assert.match(main,/全体戦力ランキング/);
assert.match(main,/slice\(0,100\)/);
assert.match(main,/state\?\.self/);
assert.match(main,/data-power-ranking-player/);
assert.match(main,/公開パーティー/);
assert.match(main,/power-ranking-party-card/);

assert.match(main,/partyCombatPower\(save\.state\)/);
assert.match(main,/\(save\.state\.party\?\?\[\]\)\.slice\(0,4\)/);
assert.match(main,/battleStats:\{hp:/);
assert.match(main,/equipment,magicCircle:/);
assert.match(main,/customVisualBase:monster\.customVisualBase\?\?null/);
assert.match(main,/ONLINE_STORAGE_KEYS\.displayName/);
assert.match(main,/return\(stored\|\|"冒険者"\)\.slice\(0,16\)/,"初回接続前も保存済みプレイヤー名を使用する");
assert.doesNotMatch(main,/displayName:String\(onlinePartyController\?\.profile\?\.displayName\?\?party\[0\]\?\.name/,"スロット1魔物名をプレイヤー名として公開しない");
assert.match(main,/return\{slot:item\.slot,name:/,"公開装備は描画用の装備種別を送る");
assert.match(main,/equipmentVisual\(item,\{className:"power-ranking-equipment-art",label:"公開装備"\}\)/);
assert.match(main,/onPowerRankingState:handlePowerRankingState/);
assert.match(main,/onPowerRankingProfile:handlePowerRankingProfile/);
assert.match(main,/publishPowerRankingSnapshot/);
assert.match(main,/controller\.publishPowerRankingSnapshot\(snapshot,\{force\}\)/);
assert.match(main,/requestPowerRankings/);
assert.match(main,/requestPowerRankingProfile/);
assert.doesNotMatch(main,/setTimeout\(\(\)=>\{[^}]*requestPowerRankings\(\{force:true\}\)/s,"閉じたモーダルからランキング再取得を永久継続しない");
assert.match(main,/_powerRankingListTimer=setTimeout\(\(\)=>\{/);
assert.match(main,/!modal\.isConnected\|\|modal\.dataset\.powerRecordTab!=="ranking"/,"ランキング取得timeoutは接続中のranking modalだけを更新する");
assert.match(main,/powerRankingUi\.listTimedOut=true/);
assert.match(main,/_powerRankingScrollTop=previousList\.scrollTop/);
assert.match(main,/rankingList\.scrollTop=Math\.max\(0,Number\(modal\._powerRankingScrollTop\)\|\|0\)/,"再描画後もTOP100のスクロール位置を戻す");
assert.doesNotMatch(main,/then\(result=>\{if\(result\?\.entries\|\|result\?\.state\)handlePowerRankingState/,"Promiseとstate callbackで一覧を二重描画しない");
assert.match(main,/modal\?\.isConnected\|\|modal\.dataset\.playerId!==expected/,"遅着した別プレイヤーのプロフィールを描画しない");
assert.match(main,/profile&&String\(profile\.playerId\)!==expected/);
assert.match(main,/if\(!profile&&!context\)return/,"対象不明のmissing応答を別モーダルへ描画しない");

assert.match(main,/initial\?1800:30000/);
assert.match(main,/Date\.now\(\)-powerRankingLastPublishedAt>=300000/);
assert.match(main,/document\.addEventListener\("visibilitychange"/);
assert.match(main,/typeof value==="number"\?value:Date\.parse\(value\)/);
assert.match(main,/setInterval\(\(\)=>\{/);
assert.match(main,/ensureOnlinePartyController\(\)/);
assert.match(main,/startBackground\(\{connect:true\}\)/);

assert.match(css,/\.power-record-tabs/);
assert.match(css,/\.power-ranking-self-divider\+\.power-ranking-row/);
assert.match(css,/position:sticky/);
assert.match(css,/data-power-record-tab="ranking"\]\s+\.game-modal-body/);
assert.match(css,/grid-template-rows:auto minmax\(0,1fr\)/,"ランキングはリストだけを縦スクロール領域にする");
assert.match(css,/@media\(max-width:520px\)/);
assert.match(css,/-webkit-overflow-scrolling:touch/);

console.log("build253 power-ranking UI regression: PASS");
