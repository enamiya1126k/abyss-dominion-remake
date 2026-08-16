import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
import{createSharedDungeon}from"../online-server/src/RoomStore.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),read=relative=>fs.readFileSync(path.join(root,relative),"utf8"),screen=read("src/ui/screens/OnlinePartyScreen.js"),client=read("src/online/OnlinePartyClient.js"),store=read("online-server/src/RoomStore.js"),server=read("online-server/server.js"),main=read("src/main.js"),save=read("src/services/SaveService.js"),css=read("src/Styles/v2.10.0.css"),index=read("index.html");

for(const feature of["data-online-coop-battle","data-online-battle-enemies","data-online-battle-party","data-online-battle-countdown","data-online-battle-action=\"capture\"","data-online-battle-skills","onlineEnemyVisual","battleStats","captureStock"])assert.match(screen,new RegExp(feature));
for(const feature of["battleStarted","battleRound","battleResolved","battleEnded","battleAction","battleSpeed","_renderBattle","_playBattleEvents","_showBattleBanner","captureStorageFull"])assert.match(client,new RegExp(feature));
for(const feature of["BATTLE_COMMAND_MS","submitBattleAction","setBattleSpeed","advanceBattles","_createBattleEnemies","_autoBattleAction","PERFECT LINK","battleCapture","captureCrystalCost"])assert.match(store,new RegExp(feature));
assert.match(server,/protocol:"1\.[2-5]\.0"/);assert.match(server,/battleAction/);assert.match(server,/battleClock/);
assert.match(main,/onlineCoopCapture/);assert.match(main,/captureStorageFull/);assert.match(main,/source\.kind==="battle"/);assert.match(save,/battlesWon:0,captures:0/);
for(const selector of[".online-coop-battle",".online-battle-enemies",".online-battle-party",".online-battle-actions",".online-battle-banner",".online-battle-float",".online-dungeon-object.encounter"])assert.match(css,new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
assert.match(index,/ASSET_BUILD = "build(?:14[7-9]|15[0-4])"/);

const dungeon=createSharedDungeon({roomId:"FIGHT4",floor:301,runId:"BUILD147"});assert.equal(dungeon.objects.filter(object=>object.type==="encounter").length,3);assert.equal(dungeon.totalEncounters,3);for(const encounter of dungeon.objects.filter(object=>object.type==="encounter"))assert.equal(dungeon.tiles[encounter.y][encounter.x],".");

const localValues=new Map();globalThis.localStorage={getItem:key=>localValues.get(key)??null,setItem:(key,value)=>localValues.set(key,String(value))};globalThis.location={search:""};const{createMonster}=await import("../src/models/Monster.js");const{OnlinePartyScreen,buildOnlinePartyProfile}=await import("../src/ui/screens/OnlinePartyScreen.js");const monster=createMonster("slime",{level:80}),state={party:[monster.id],monsters:[monster],equipment:[],magicCircles:{owned:{}},player:{maxFloor:300,currentFloor:1,gold:0,crystals:0},inventory:{captureCrystals:5,abyssKeys:0}};const profile=buildOnlinePartyProfile(state,{monsterId:monster.id,displayName:"共闘テスト"}),html=OnlinePartyScreen(state);assert.ok(profile.battleStats.hp>0);assert.ok(profile.skills.length<=4);assert.equal(profile.captureStock,5);assert.match(html,/data-online-coop-battle/);assert.match(html,/PERFECT LINK|CO-OP RESONANCE/);

console.log("ABYSS DOMINION build147 online battle regression: PASS");
