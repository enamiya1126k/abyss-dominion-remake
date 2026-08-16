import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{buildOnlineTradeCatalog,reserveOnlineTradeAsset,releaseOnlineTradeAsset,commitOnlineTrade}from"../src/online/OnlineTradeSystem.js";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("build155 keeps the requested attribute chart, online surfaces, chat, stamps and boss spring",async()=>{
 const[species,home,main,screen,client,styles,roomStore,raidStore]=await Promise.all([
  read("src/data/mythicSerialSpecies.js"),read("src/ui/screens/HomeScreen.js"),read("src/main.js"),read("src/ui/screens/OnlinePartyScreen.js"),read("src/online/OnlinePartyClient.js"),read("src/Styles/v2.10.0.css"),read("online-server/src/RoomStore.js"),read("online-server/src/RaidCoordinator.js")
 ]);
 assert.match(species,/myth_rion[\s\S]*?element:"wind"/);
 assert.match(home,/HOME_ATTRIBUTE_CYCLE/);assert.match(home,/home-attribute-cycle/);assert.doesNotMatch(home,/compactAttributeChart/);
 assert.match(main,/applyBossHotSpringRecovery/);assert.match(main,/now-last<200/);assert.match(main,/hpMax\*\.2/);assert.match(main,/mpMax\*\.2/);assert.match(main,/defeatedBossPosition/);
 assert.match(screen,/online-solo-resource-hud/);assert.match(screen,/data-online-expedition-auto/);assert.match(screen,/data-online-room-code/);assert.match(screen,/data-online-trade-amount/);assert.match(screen,/normal-battle-layout/);
 for(const emoji of["👍","❤️","😂","😭","👏","❗","❓","✨"])assert.ok(screen.includes(emoji));
 assert.match(client,/setTimeout\(\(\)=>\{opened=true[\s\S]*?,500\)/);assert.match(client,/requestSubmit/);assert.match(client,/chatUnread/);assert.match(client,/_planDungeonAutoPath/);
 assert.match(styles,/has-online-gate/);assert.match(styles,/online-emote-wheel/);assert.match(styles,/online-expedition-shell\.online-solo-explore/);assert.match(styles,/online-raid-battle\.normal-battle-layout/);
 assert.match(roomStore,/"buff"/);assert.match(roomStore,/partyShieldRate/);assert.match(roomStore,/circleDamageFactor/);assert.match(raidStore,/partyShieldRate/);assert.match(raidStore,/circleDamageFactor/);
});

test("trade preserves full assets, rejects active equipment, supports quantities and is idempotent",()=>{
 const monster={id:"reserve",nickname:"継承個体",level:88,stars:7,plus:51,iv:{atk:99},skills:["alpha"],equipment:{weaponRight:null},locked:false,favorite:false},state={player:{gold:5000,crystals:60},inventory:{captureCrystals:12,potions:4},monsters:[{id:"party",nickname:"出撃中",equipment:{}},monster],party:["party"],equipment:[{id:"blade",name:"深淵剣",rarity:"LR",level:80,slots:[{kind:"atk",value:9}]}],reserveEquipment:[],bossEquipmentVault:[],onlineParty:{tradeEscrow:{},completedTradeIds:[],tradeHistory:[]}};
 const catalog=buildOnlineTradeCatalog(state);assert.equal(catalog.find(entry=>entry.ref==="monster:party").unavailable,true);assert.ok(catalog.some(entry=>entry.ref==="currency:gold"));assert.ok(catalog.some(entry=>entry.ref==="currency:crystals"));assert.ok(catalog.some(entry=>entry.ref==="currency:captureCrystals"));assert.equal(catalog.some(entry=>entry.kind==="circle"),false);
 const reserved=reserveOnlineTradeAsset(state,"trade-currency","currency:gold",{amount:1250});assert.equal(reserved.ok,true);assert.equal(state.player.gold,3750);assert.equal(reserved.asset.payload.amount,1250);releaseOnlineTradeAsset(state,"trade-currency");assert.equal(state.player.gold,5000);
 const outgoing=reserveOnlineTradeAsset(state,"trade-monster","monster:reserve");assert.equal(outgoing.ok,true);assert.equal(outgoing.asset.payload.iv.atk,99);assert.deepEqual(outgoing.asset.payload.skills,["alpha"]);
 const incoming={assetId:"equipment:remote",kind:"equipment",name:"星剣",rarity:"LR",level:99,details:"装備庫",payload:{id:"remote",name:"星剣",rarity:"LR",level:99,slots:[{kind:"crit",value:12}]}};
 const first=commitOnlineTrade(state,"trade-monster",incoming,{partnerId:"AD-TEST-TEST",partnerName:"相手"}),second=commitOnlineTrade(state,"trade-monster",incoming,{partnerId:"AD-TEST-TEST"});assert.equal(first.ok,true);assert.equal(second.duplicate,true);assert.equal(state.equipment.filter(item=>item.name==="星剣").length,1);assert.equal(state.onlineParty.tradeHistory.length,1);
});
