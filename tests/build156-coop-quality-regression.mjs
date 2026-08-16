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

test("online room modes are isolated full-screen surfaces and raid reuses normal battle components",async()=>{
 const[screen,client,styles]=await Promise.all([read("src/ui/screens/OnlinePartyScreen.js"),read("src/online/OnlinePartyClient.js"),read("src/Styles/v2.10.0.css")]);
 assert.match(styles,/html\.online-immersive,body\.online-immersive/);assert.match(styles,/\.online-party-screen\.online-phase-raid \.online-raid-view/);assert.match(styles,/position:fixed!important;z-index:1100!important/);assert.match(client,/plazaView\.hidden=expedition\|\|showRaid\|\|showResonance\|\|showTrade/);
 for(const token of["battle-screen side-battle-v2","battle-header","turn-order","battle-arena side-battle-arena","battle-party side-party","enemy-party side-enemies","battle-command","command-grid","battle-log"])assert.ok(screen.includes(token),`missing normal raid component: ${token}`);
 assert.match(styles,/Raid reuses the ordinary side-battle composition/);assert.match(client,/_renderRaid\(raid\)/);
});

test("resonance maze has synchronized client, server, reconnect AI and idempotent reward hooks",async()=>{
 const[screen,client,store,server,coordinator,styles]=await Promise.all([read("src/ui/screens/OnlinePartyScreen.js"),read("src/online/OnlinePartyClient.js"),read("online-server/src/RoomStore.js"),read("online-server/server.js"),read("online-server/src/ResonanceMazeCoordinator.js"),read("src/Styles/v2.10.0.css")]);
 assert.match(screen,/data-online-room-view="resonance"/);assert.match(screen,/data-online-resonance-board/);assert.match(screen,/data-online-resonance-move/);assert.match(screen,/data-online-resonance-choice/);assert.match(screen,/data-online-open-chat/);
 assert.match(client,/startResonance/);assert.match(client,/resonanceMove/);assert.match(client,/resonanceAction/);assert.match(client,/_renderResonance/);assert.match(client,/online-phase-resonance/);
 assert.match(store,/ResonanceMazeCoordinator/);assert.match(store,/resonanceSnapshot/);assert.match(server,/resonanceMazes/);assert.match(server,/message\.type==="startResonance"/);
 assert.match(coordinator,/NEED_PARTY/);assert.match(coordinator,/switches/);assert.match(coordinator,/defense/);assert.match(coordinator,/rescue/);assert.match(coordinator,/mimic/);assert.match(coordinator,/session\?\.connected/);assert.match(coordinator,/rewardId:`resonance:/);
 assert.match(styles,/Resonance Maze/);assert.match(styles,/online-resonance-board/);
});

test("Windows launchers are ASCII CRLF batches and direct users to safe unblock instructions",async()=>{
 const paths=["online-server/01_FIRST_SETUP.bat","online-server/02_START_SERVER.bat","online-server/03_OPEN_TUNNEL.bat","online-server/04_START_ONLINE.bat"],buffers=await Promise.all(paths.map(path=>readFile(new URL(`../${path}`,import.meta.url))));
 for(const buffer of buffers){assert.equal(buffer.some(byte=>byte>127),false);assert.match(buffer.toString("ascii"),/\r\n/);assert.equal(/(^|[^\r])\n/.test(buffer.toString("ascii")),false)}
 const launcher=buffers.at(-1).toString("ascii"),guide=await read("online-server/ONLINE_SETUP_GUIDE.md");assert.match(launcher,/start "ABYSS PARTY SERVER" cmd \/k "npm start"/);assert.match(guide,/許可する/);assert.match(guide,/npm start/);assert.match(guide,/cloudflared tunnel --url http:\/\/127\.0\.0\.1:8787/);
});
