import test from"node:test";
import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
import{APP_VERSION,SAVE_SCHEMA_VERSION}from"../src/core/config.js";
import{teamBattleDayKey,teamBattleRewardPreview,teamBattleRewardEntitlements,safeCurrencyGrant,recordTeamBattleResult}from"../src/core/EndgameSystem.js";
import{NORMAL_SUMMON_RATES,GUARANTEED_SUMMON_RATES,rollSummonRarity,selectBalancedGachaEntry}from"../src/core/GachaBalanceSystem.js";
import{ADDITIONAL_SPECIES}from"../src/data/additionalSpecies.js";
import{SPECIES}from"../src/data/species.js";
import{SaveService}from"../src/services/SaveService.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

function prng(seed=0x263201){
 let value=seed>>>0;
 return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296};
}

function teamState({stage=2,attempts=1,highest=stage-1,date=new Date("2026-09-01T00:00:00Z")}={}){
 return{player:{maxFloor:100},flags:{},endgame:{teamBattle:{unlocked:true,stage,totalWins:0,totalLosses:0,dailyKey:teamBattleDayKey(date),dailyAttempts:attempts,highestRewardedStage:highest}}};
}

class MemoryStorage{
 constructor(){this.values=new Map()}
 getItem(key){return this.values.has(key)?this.values.get(key):null}
 setItem(key,value){this.values.set(key,String(value))}
 removeItem(key){this.values.delete(key)}
}

test("build263 version and save schema are published",()=>{
 assert.equal(APP_VERSION,"2.11.87");
 assert.equal(SAVE_SCHEMA_VERSION,62);
 const html=read("index.html");
 assert.match(html,/build263\.css\?v=2\.11\.87-build263/);
 assert.match(html,/ASSET_VERSION = "2\.11\.87"/);
 assert.match(html,/ASSET_BUILD = "build263"/);
});

test("iPhone boss gate has a complete vertical scroll height chain",()=>{
 const css=read("src/Styles/build263.css");
 assert.match(css,/\.boss-gate-modal-v2>\.game-modal-card>\.game-modal-body\s*\{[^}]*min-height:0!important;[^}]*overflow:hidden!important;[^}]*display:grid!important/s);
 assert.match(css,/\.boss-gate-modal-v2 \.boss-gate-v2\s*\{[^}]*height:100%;[^}]*min-height:0/s);
 assert.match(css,/\[data-boss-gate-panel\]\s*\{[^}]*overflow-y:auto!important;[^}]*-webkit-overflow-scrolling:touch;[^}]*touch-action:pan-y/s);
 assert.match(css,/\.floor-boss-band-filter\s*\{[^}]*overflow-x:auto;[^}]*touch-action:pan-x pan-y/s);
});

test("4 VS 4 rewards start at the requested floor and scale monotonically",()=>{
 const first=teamBattleRewardPreview(1),second=teamBattleRewardPreview(2),tenth=teamBattleRewardPreview(10),eleventh=teamBattleRewardPreview(11);
 assert.equal(first.goldMultiplier,.5);assert.equal(second.goldMultiplier,.5);
 assert.equal(first.crystals,10);assert.equal(second.crystals,10);
 assert.deepEqual({crystals:tenth.breakthroughCrystals,capture:tenth.breakthroughCaptureCrystals,gear:tenth.guaranteedRarity},{crystals:100,capture:50,gear:"SR"});
 const firstMilestone=teamBattleRewardEntitlements(10,{firstClear:true}),replayedMilestone=teamBattleRewardEntitlements(10,{firstClear:false});
 assert.deepEqual({base:firstMilestone.baseCrystals,bonus:firstMilestone.bonusCrystals,capture:firstMilestone.captureCrystals,gear:firstMilestone.guaranteedRarity},{base:10,bonus:100,capture:50,gear:"SR"});
 assert.deepEqual({base:replayedMilestone.baseCrystals,bonus:replayedMilestone.bonusCrystals,capture:replayedMilestone.captureCrystals,gear:replayedMilestone.guaranteedRarity},{base:10,bonus:0,capture:0,gear:null});
 assert.equal(eleventh.experienceMultiplier,2);
 let prior=teamBattleRewardPreview(1);
 for(let stage=2;stage<=100;stage++){
  const current=teamBattleRewardPreview(stage);
  assert.ok(current.goldMultiplier>=prior.goldMultiplier,`GOLD fell at stage ${stage}`);
  assert.ok(current.crystals>=prior.crystals,`crystals fell at stage ${stage}`);
  assert.ok(current.experienceMultiplier>=prior.experienceMultiplier,`EXP fell at stage ${stage}`);
  prior=current;
 }
});

test("currency rewards stay exact at Number.MAX_SAFE_INTEGER",()=>{
 const maximum=Number.MAX_SAFE_INTEGER;
 assert.equal(safeCurrencyGrant(maximum-7,100),7);
 assert.equal(safeCurrencyGrant(maximum,Infinity),0);
 assert.equal(safeCurrencyGrant(0,Infinity),maximum);
 assert.equal(safeCurrencyGrant(-50,10),10);
});

test("defeat refunds only the charged day's attempt and first clear is idempotent",()=>{
 const date=new Date("2026-09-01T00:00:00Z"),state=teamState({date});
 const loss=recordTeamBattleResult(state,false,{stage:2,attemptCharged:true,attemptDayKey:teamBattleDayKey(date),date});
 assert.equal(loss.attemptRefunded,true);assert.equal(loss.remaining,10);assert.equal(state.endgame.teamBattle.dailyAttempts,0);assert.equal(state.endgame.teamBattle.stage,2);
 state.endgame.teamBattle.dailyAttempts=1;
 const win=recordTeamBattleResult(state,true,{stage:2,attemptCharged:true,attemptDayKey:teamBattleDayKey(date),date});
 assert.equal(win.firstClear,true);assert.equal(win.stage,3);assert.equal(state.endgame.teamBattle.dailyAttempts,1);
 const replay=recordTeamBattleResult(state,true,{stage:2,date});assert.equal(replay.firstClear,false);
 const rollover=teamState({attempts:0,date:new Date("2026-09-02T00:00:00Z")});
 const oldDayLoss=recordTeamBattleResult(rollover,false,{stage:2,attemptCharged:true,attemptDayKey:"2026-09-01",date:new Date("2026-09-02T00:00:00Z")});
 assert.equal(oldDayLoss.attemptRefunded,false);assert.equal(rollover.endgame.teamBattle.dailyAttempts,0,"old defeat must not subtract from the new day");
});

test("an in-progress build262 team battle receives refund metadata during migration",()=>{
 const previousStorage=globalThis.localStorage;globalThis.localStorage=new MemoryStorage();
 try{
  const seed=new SaveService();seed.state.schemaVersion=61;seed.state.endgame.teamBattle={unlocked:true,stage:7,totalWins:6,totalLosses:0,dailyKey:"2026-09-01",dailyAttempts:1,highestRewardedStage:6};seed.state.activeBattle={specialBattle:true,specialBattleType:"team",enemies:[{speciesId:"slime",hp:1,maxHp:1}]};seed.save();
  const migrated=new SaveService().state;
  assert.equal(migrated.activeBattle.specialTeamStage,7);
  assert.equal(migrated.activeBattle.teamAttemptCharged,true);
  assert.equal(migrated.activeBattle.teamAttemptDayKey,"2026-09-01");
 }finally{if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage}
});

test("displayed normal and guaranteed rarity tables are the actual draw tables",()=>{
 assert.equal(Object.values(NORMAL_SUMMON_RATES).reduce((sum,value)=>sum+value,0),1);
 assert.equal(Object.values(GUARANTEED_SUMMON_RATES).reduce((sum,value)=>sum+value,0),1);
 const random=prng(),count=1_000_000,tallies=Object.fromEntries(Object.keys(NORMAL_SUMMON_RATES).map(key=>[key,0]));
 for(let index=0;index<count;index++)tallies[rollSummonRarity("normal",random)]++;
 for(const[rarity,rate]of Object.entries(NORMAL_SUMMON_RATES)){
  const actual=tallies[rarity]/count,tolerance=Math.max(.00035,rate*.07);
  assert.ok(Math.abs(actual-rate)<=tolerance,`${rarity}: expected ${rate}, got ${actual}`);
 }
 const guaranteedRandom=prng(0x263aaa),guaranteedTallies=Object.fromEntries(Object.keys(GUARANTEED_SUMMON_RATES).map(key=>[key,0]));
 for(let index=0;index<count;index++)guaranteedTallies[rollSummonRarity("guaranteed",guaranteedRandom)]++;
 for(const[rarity,rate]of Object.entries(GUARANTEED_SUMMON_RATES)){
  const actual=guaranteedTallies[rarity]/count,tolerance=Math.max(.0004,rate*.05);
  assert.ok(Math.abs(actual-rate)<=tolerance,`guaranteed ${rarity}: expected ${rate}, got ${actual}`);
 }
 const main=read("src/main.js");
 assert.match(main,/summonRatePercent\("神話"\)/);
 assert.match(main,/campaign==="daily"\?\.3:\.5/);
 assert.match(main,/function summonGuerrillaOne\([^)]*\)\{const rarity=rollSummonRarity\(guaranteedRare\?"guaranteed":"normal"\)/);
 assert.match(main,/装備は3部位を各1\/3で選び、その部位内を均等抽選/);
});

test("within-pool selection is uniform and never returns one item three times",()=>{
 const pool=Array.from({length:7},(_,index)=>({id:`item-${index}`})),random=prng(0xface263),tallies=Object.fromEntries(pool.map(entry=>[entry.id,0]));let recent=[];
 for(let index=0;index<700_000;index++){
  const selected=selectBalancedGachaEntry(pool,{random,recentKeys:recent,keyOf:entry=>entry.id});
  tallies[selected.id]++;recent=[...recent,selected.id].slice(-4);
  assert.equal(recent.length>=3&&recent.at(-1)===recent.at(-2)&&recent.at(-2)===recent.at(-3),false,"third identical result");
 }
 const values=Object.values(tallies),ratio=Math.max(...values)/Math.min(...values);assert.ok(ratio<1.03,`uniformity ratio ${ratio}`);
});

test("hidden featured and equipment-native weights cannot reach standard gacha",()=>{
 const main=read("src/main.js"),summon=main.slice(main.indexOf("function summonOne("),main.indexOf("function summonEndgameGacha("));
 assert.doesNotMatch(summon,/newArrivalIds|unownedFeatured|selectedPool/);
 assert.match(summon,/balancedGachaEntry\(pool,deep\?"monster:deep"/);
 assert.match(summon,/base=balancedGachaEntry\(EQUIPMENT_BASES\[slot\]/);
 assert.match(summon,/createEquipment\(slot,\{rarity,base\}\)/);
 assert.equal(ADDITIONAL_SPECIES.dev_familiar_chappy.serialOnly,true);
 assert.equal(ADDITIONAL_SPECIES.dev_familiar_chappy.gachaExcluded,true);
 assert.equal(SPECIES.mimic.gachaExcluded,true);
});

test("4 VS 4 settlement persists refund metadata and never divides rewards by 100",()=>{
 const main=read("src/main.js"),finish=main.slice(main.indexOf("function finishSpecialBattle(won)"),main.indexOf("function openEndgameForge()"));
 assert.match(main,/specialTeamStage:battle\.specialTeamStage/);
 assert.match(main,/teamAttemptDayKey:battle\.teamAttemptDayKey/);
 assert.match(finish,/recordTeamBattleResult\(save\.state,won/);
 assert.match(finish,/goldForClearedFloor\(rewardFloor\)\*teamReward\.goldMultiplier/);
 assert.match(finish,/teamBaseCrystals\+teamBonusCrystals/);
 assert.match(finish,/teamBattleRewardEntitlements\(teamStage,\{firstClear:teamProgress\.firstClear\}\)/);
 assert.match(finish,/receiveEquipment\(save\.state,item,\{bossReward:true\}\)/);
 assert.match(finish,/specialGold=safeCurrencyGrant\(save\.state\.player\.gold,calculatedGold\)/);
 assert.doesNotMatch(finish,/specialGold\/100|reward\.crystals\/100/);
 const save=read("src/services/SaveService.js");
 assert.match(save,/from<62&&s\.activeBattle\?\.specialBattleType==="team"/);
 assert.match(save,/teamAttemptDayKey=team\.dailyKey/);
});
