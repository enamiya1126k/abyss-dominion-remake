import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("build156 adds quantity purchases and preserves current HP when battle max HP grows",async()=>{
 const[main,styles]=await Promise.all([read("src/main.js"),read("src/Styles/app.css")]);
 assert.match(main,/data-shop-qty/);assert.match(main,/data-shop-qty-max/);assert.match(main,/data-max-purchase/);assert.match(main,/item\.price\*count/);assert.match(main,/inventory\[item\.id\].*\+count/);assert.match(main,/captureDaily\.count\+=count/);
 assert.match(styles,/\.home-shop-quantity/);
 assert.match(main,/const previousMaxHp=Math\.max\(1,Number\(calculatedStats\(monster\)\.hp\)/);assert.match(main,/wasAlive&&hp>previousMaxHp/);assert.match(main,/monster\.currentHp\+=hp-previousMaxHp/);
});

test("online room modes share one modern stage and exploration reuses the normal screens",async()=>{
 const[screen,client,views]=await Promise.all([read("src/ui/screens/OnlinePartyScreen.js"),read("src/online/OnlinePartyClient.js"),read("src/online/OnlineViews.js")]);
 assert.equal((screen.match(/data-online-stage/g)??[]).length,1);
 assert.equal((screen.match(/data-online-route=/g)??[]).length,5);
 assert.match(client,/renderOnlineHome, renderOnlineExplore, renderOnlineRaid, renderOnlineTeam, renderOnlineChat/);
 assert.match(views,/function renderSharedBattle/);assert.match(views,/ExploreScreen\(base, \{ online: true/);
});

test("standalone Resonance is retired while legacy clients are redirected to shared exploration",async()=>{
 const[screen,client,views,store,server]=await Promise.all([read("src/ui/screens/OnlinePartyScreen.js"),read("src/online/OnlinePartyClient.js"),read("src/online/OnlineViews.js"),read("online-server/src/RoomStore.js"),read("online-server/server.js")]);
 assert.doesNotMatch(screen,/data-online-route="resonance"|data-online-resonance-board/);
 assert.doesNotMatch(client,/_send\("(?:startResonance|resonanceMove|resonanceAction)"|renderOnlineResonance/);
 assert.doesNotMatch(views,/export function renderOnlineResonance|data-online-start-resonance/);
 assert.match(client,/共鳴迷宮は共同探索へ統合されました/);
 assert.match(store,/RESONANCE_INTEGRATED/);
 assert.match(server,/message\.type==="startResonance"/);
});

test("Windows launchers are ASCII CRLF batches and direct users to safe unblock instructions",async()=>{
 const paths=["online-server/01_FIRST_SETUP.bat","online-server/02_START_SERVER.bat","online-server/03_OPEN_TUNNEL.bat","online-server/04_START_ONLINE.bat"],buffers=await Promise.all(paths.map(path=>readFile(new URL(`../${path}`,import.meta.url))));
 for(const buffer of buffers){assert.equal(buffer.some(byte=>byte>127),false);assert.match(buffer.toString("ascii"),/\r\n/);assert.equal(/(^|[^\r])\n/.test(buffer.toString("ascii")),false)}
 const launcher=buffers.at(-1).toString("ascii"),guide=await read("online-server/ONLINE_SETUP_GUIDE.md");assert.match(launcher,/start "ABYSS PARTY SERVER" cmd \/k "npm start"/);assert.match(guide,/許可する/);assert.match(guide,/npm start/);assert.match(guide,/cloudflared tunnel --url http:\/\/127\.0\.0\.1:8787/);
});
