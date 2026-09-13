import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {run} from '../tools/build430/native-harness.mjs';
import {CHEST_SUPPLIES427,rollChestSupplies427,grantChestSupplies427,mergeChestSupplies427} from '../src/core/ChestSupplies427.js';
import {chestSuppliesMarkup427,PARTY_MAINTENANCE427} from '../src/ui/HomeNavigation427.js';
import {HomeScreen} from '../src/ui/screens/HomeScreen.js';
import {SaveService} from '../src/services/SaveService.js';

async function fixture(){const f=await run(['slime'],['slime'],{inspect:true,floor:10});const c=f.context;c.battle=null;c.save.save=()=>true;c.snapshot=null;c.game={world:{treasureRoom:false,chests:[]},player:{path:[]},running:true};c.persistExpeditionSnapshot=()=>null;c.expeditionSnapshotFromGame=()=>null;c.showExploreNotice=()=>{};c.showToast=()=>{};c.save.state.settings.exploreAutoMode='off';c.exploreActionGeneration=1;c.save.state.player.openedChests[10]=[];return {...f,c,s:c.save.state};}
function fixedRandom(value,fn){const old=Math.random;Math.random=()=>value;try{return fn();}finally{Math.random=old;}}
function chest(id='test'){return {id,kind:'box',locked:false,open:false,mimic:false};}
function chapter(c){const s=c.save.state;s.player.inRun=false;s.player.maxFloor=100;s.campaign100.finalCompleted=true;c.chapterTwoState(s).introComplete=true;assert.equal(c.beginChapterTwoRun(s).ok,true);const r=s.chapterTwo376.run;r.room=2;return r;}

test('all fourteen former shop items are reachable and multiple rolls select distinct types',()=>{
 assert.equal(CHEST_SUPPLIES427.length,14);assert.equal(CHEST_SUPPLIES427.reduce((n,x)=>n+x.weight,0),100);
 let start=0;for(const item of CHEST_SUPPLIES427){const value=(start+item.weight/2)/100;const result=rollChestSupplies427({slots:3,random:()=>value});assert.equal(result[0].id,item.id);assert.equal(result.length,3);assert.equal(new Set(result.map(x=>x.id)).size,3);for(const row of result)assert.ok(row.quantity>=1&&row.quantity<=CHEST_SUPPLIES427.find(x=>x.id===row.id).maxQuantity);start+=item.weight;}
});

test('supply grant only writes known inventory keys and never charges gold or overflows',()=>{
 const state={player:{gold:5000},inventory:{captureCrystals:Number.MAX_SAFE_INTEGER-1,otherItem:9}};
 const got=grantChestSupplies427(state,[{id:'captureCrystals',quantity:5},{id:'potions',quantity:2},{id:'potions',quantity:3},{id:'gold',quantity:999},{id:'__proto__',quantity:999}]);
 assert.equal(state.player.gold,5000);assert.equal(state.inventory.captureCrystals,Number.MAX_SAFE_INTEGER);assert.equal(got.find(x=>x.id==='captureCrystals').quantity,1);assert.equal(state.inventory.potions,5);assert.equal(state.inventory.otherItem,9);assert.equal(state.inventory.gold,undefined);assert.equal(Object.getPrototypeOf(state.inventory),Object.prototype);
});

test('home moves the equipment button to footer, adds raid entrance on left, and keeps formation accessible',async()=>{
 const {s}=await fixture(),html=HomeScreen(s),left=html.match(/<nav class="home-left-menu"[\s\S]*?<\/nav>/)[0],bottom=html.match(/<nav class="home-bottom-nav"[\s\S]*?<\/nav>/)[0];
 assert.match(left,/id="openCoopRaid"/);assert.doesNotMatch(left,/id="openEquipment"/);assert.match(bottom,/id="openEquipment"[^>]*>[\s\S]*?装備管理/);assert.equal((html.match(/id="openEquipment"/g)||[]).length,1);assert.match(html,/id="openFormation"/);assert.doesNotMatch(html,/openItemShop|>ショップ</);assert.equal((bottom.match(/<button /g)||[]).length,5);
});

test('actual footer click shows maintenance without navigating; equipment and formation retain their existing routes',async()=>{
 const {c,s}=await fixture(),nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{handlers:{},addEventListener(name,fn){this.handlers[name]=fn;}});return nodes.get(id);};let html='';const primary={};
 c.document={getElementById:node,querySelectorAll:()=>[]};c.app={querySelector:()=>null,insertAdjacentHTML:(_,text)=>html=text};c.mountHomeEnvironment400=()=>{};c.bindHomePartyDrag=()=>{};c.topModal=()=>({querySelector:()=>primary});c.completeContextGuide=()=>{};c.go=screen=>{c.screen=screen};c.screen='home';
 const gold=s.player.gold,inventory=JSON.stringify(s.inventory);c.bindHome();node('openOnlineParty').handlers.click();assert.equal(c.screen,'home');assert.ok(html.includes(PARTY_MAINTENANCE427));assert.equal(s.player.gold,gold);assert.equal(JSON.stringify(s.inventory),inventory);
 node('openCoopRaid').handlers.click();assert.equal(c.screen,'worldRaid428');
 node('openEquipment').onclick();assert.equal(c.screen,'equipment');assert.equal(c.equipmentTarget,s.party[0]);node('openFormation').handlers.click();assert.equal(c.screen,'formation');
 const source=fs.readFileSync('src/main.js','utf8');assert.doesNotMatch(source,/HOME_ITEM_SHOP|data-home-item-buy|function openHomeItemShop/);
});

test('native first chapter chest grants and displays supplies once, including after save reload',async()=>{
 const {c,s}=await fixture(),box=chest();let reveal;c.showChestRewardReveal=plan=>reveal=plan;
 fixedRandom(.99,()=>assert.equal(c.openChest(box),true));assert.equal(reveal.supplies427.length,2);assert.ok(reveal.gold>0);
 for(const row of reveal.supplies427)assert.equal(s.inventory[row.id],row.quantity);
 const before=JSON.stringify(s.inventory);assert.equal(c.openChest(box),false);assert.equal(JSON.stringify(s.inventory),before);
 c.save.state=JSON.parse(JSON.stringify(s));assert.equal(c.openChest({...box,open:false}),false);assert.equal(JSON.stringify(c.save.state.inventory),before);
 assert.match(chestSuppliesMarkup427(reveal.supplies427),/全体万能霊薬/);
});

test('native locked chest save failure rolls back key, supplies, gear and claim together',async()=>{
 const {c,s}=await fixture(),box={...chest('locked'),locked:true};s.inventory.abyssKeys=1;c.showChestRewardReveal=()=>assert.fail('failed save must not show success');let attempted=0;c.save.save=()=>{attempted++;assert.ok(c.save.state.inventory.partyFullHeals>0);assert.ok(c.save.state.equipment.length+c.save.state.bossEquipmentVault.length>0);return false};
 const before=JSON.stringify(s);fixedRandom(.99,()=>assert.equal(c.openChest(box),false));assert.equal(JSON.stringify(c.save.state),before);assert.equal(box.open,false);assert.equal(attempted,1);
});

test('unopened locked chests and mimics never grant consumables',async()=>{
 const {c,s}=await fixture();s.inventory.abyssKeys=0;c.pauseModal=()=>null;c.setTimeout=()=>0;const before=JSON.stringify(s.inventory);c.openChest({...chest('locked-none'),locked:true});assert.equal(JSON.stringify(s.inventory),before);
 c.openChest({...chest('mimic'),mimic:true});assert.equal(JSON.stringify(s.inventory),before);
});

test('chapter two regular and vault chests grant 2/3 distinct items once and record the return summary',async()=>{
 const {c,s}=await fixture(),r=chapter(c);let regular=c.openChapterTwoChest(s,{random:()=>.99});assert.equal(regular.ok,true);assert.equal(regular.supplies427.length,2);c.recordChapterTwo380(s,regular);const before=JSON.stringify(s.inventory);assert.equal(c.openChapterTwoChest(s).ok,false);assert.equal(JSON.stringify(s.inventory),before);
 r.vault380.defeated=true;const vault=c.openVaultChest380(s,0,{random:()=>.99});assert.equal(vault.ok,true);assert.equal(vault.supplies427.length,3);const after=JSON.stringify(s.inventory);assert.equal(c.openVaultChest380(s,0).ok,false);assert.equal(JSON.stringify(s.inventory),after);
 const summary=c.takeChapterTwoSummary380(s);assert.deepEqual(summary.supplies427,mergeChestSupplies427([...regular.supplies427,...vault.supplies427]));
});

test('chapter two save failure restores both consumables and unopened status',async()=>{
 const {c}=await fixture();chapter(c);const before=JSON.stringify(c.save.state);c.save.save=()=>false;
 assert.equal(c.chapterTwoCommit(()=>c.openChapterTwoChest(c.save.state,{random:()=>.99})).ok,false);assert.equal(JSON.stringify(c.save.state),before);
});

test('SaveService retains every new chest item without resetting former shop history',async()=>{
 const {s}=await fixture();s.shop.captureDaily={key:'2026-09-12',count:2};grantChestSupplies427(s,CHEST_SUPPLIES427.map(x=>({id:x.id,quantity:3})));
 const save=new SaveService();save.state=s;assert.ok(save.save());const restored=new SaveService().state;
 for(const item of CHEST_SUPPLIES427)assert.equal(restored.inventory[item.id],s.inventory[item.id]);assert.equal(restored.shop.captureDaily.count,2);
});

test('native boss trophy adds supplies under the same receipt and suppresses replay farming',async()=>{
 const {c,s}=await fixture();const floor=c.campaignFloorState(s,10);floor.bossDefeated=true;c.campaignBossProgress(s,10,'abyss_gluttony').defeated=true;for(let i=0;i<3;i++)c.collectCampaignKey(s,10,'key'+i);let reveal;c.showCampaignTrophyReveal=r=>reveal=r;c.refreshCampaignKeyCounter=()=>{};
 const box={id:'boss-trophy',bossId:'abyss_gluttony',bossInfo:{endgameBossId:'abyss_gluttony'},open:false};
 assert.equal(c.openCampaignTrophyChest(box),true);assert.equal(reveal.supplies427.length,3);const inventory=JSON.stringify(s.inventory);assert.equal(c.openCampaignTrophyChest({...box,open:false}),false);assert.equal(JSON.stringify(s.inventory),inventory);
 // With the unique equipment still owned, the existing repair rule keeps the chest settled.
 c.beginCampaignFloorReplay(s,10,'owned-replay427');assert.equal(c.openCampaignTrophyChest({...box,open:false}),false);assert.equal(JSON.stringify(s.inventory),inventory);
 // A replay after disposing of the equipment can reopen the physical chest;
 // the durable receipt must still suppress every reward, including supplies.
 s.equipment=[];s.reserveEquipment=[];s.bossEquipmentVault=[];
 c.beginCampaignFloorReplay(s,10,'replay427');const replay=c.campaignFloorState(s,10);replay.bossDefeated=true;c.campaignBossProgress(s,10,'abyss_gluttony').defeated=true;for(let i=0;i<3;i++)c.collectCampaignKey(s,10,'replaykey'+i);
 assert.equal(c.trophyChestEntitlements(s,10,'abyss_gluttony').repeatRewardSuppressed,true);assert.equal(c.openCampaignTrophyChest({...box,open:false}),true);assert.equal(JSON.stringify(s.inventory),inventory);
});
