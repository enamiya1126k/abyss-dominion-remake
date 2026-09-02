import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8");

function between(startName,endName){
 const start=main.indexOf(`function ${startName}(`),end=main.indexOf(`function ${endName}(`,start+1);
 assert.ok(start>=0,`${startName} must exist`);assert.ok(end>start,`${endName} must follow ${startName}`);return main.slice(start,end)
}

const restoreSource=between("restoreCampaignFinalParty","showCampaignEnding");
const retreatSource=between("retreatCampaignFinalBattle","retreatSpecialBattle");
const retreatDispatcher=between("retreatSpecialBattle","finishSpecialBattle");
const heroCarrySource=main.slice(main.indexOf("function campaignHeroEncounter("),main.indexOf("function campaignFinalVitals("));

function campaignRetreatHarness(stage){
 const state={
  player:{inRun:true},activeBattle:{battleId:"campaign-final-checkpoint"},expeditionSnapshot:{floor:100},
  monsters:[
   {id:"party-1",currentHp:1,currentMp:0,ailments:["burn"]},
   {id:"party-2",currentHp:2,currentMp:1,ailments:[]},
   {id:"bench",currentHp:88,currentMp:9,ailments:[]},
   {id:"campaign-sairan",obtainedMethod:"campaignFinalTemporary",campaignFinalTemporary:true,currentHp:999,currentMp:999},
   {id:"stale-sairan",obtainedMethod:"campaignFinalTemporary",currentHp:999,currentMp:999}
  ],
  party:stage==="sairan"?["campaign-sairan"]:["party-1","party-2"],
  campaign100:{
   finalPartyBackup:["party-1","bench"],sairanMonsterId:"campaign-sairan",
   finalVitals:{"party-1":{hp:47,mp:11,ailments:["poison"]},"party-2":{hp:63,mp:17,ailments:[]}}
  }
 };
 const harness=new Function("state","stage",`
  const events={saved:0,synergy:0,removed:0,snapshotClears:0,routes:[],toasts:[]};
  const save={state,save(){events.saved++}};
  const normalizeCampaignState=value=>value.campaign100;
  const normalizePersistentAilments=value=>Array.isArray(value)?[...value]:[];
  const clearPartySynergy=()=>events.synergy++;
  const document={querySelector(){return{remove(){events.removed++}}}};
  const clearExpeditionSnapshot=()=>{events.snapshotClears++;save.state.expeditionSnapshot=null};
  const go=route=>events.routes.push(route),showToast=message=>events.toasts.push(message);
  let activeEnemy={id:"hero"},battle={specialBattle:true,specialBattleType:"campaignFinal",campaignStage:stage,escapePending:true},snapshot={floor:100};
  ${restoreSource}
  ${retreatSource}
  const result=retreatCampaignFinalBattle(battle);
  return{result,events,battle,activeEnemy,snapshot};
 `)(state,stage);
 return{state,...harness}
}

test("campaign-final retreat is dispatched before generic special-battle cleanup",()=>{
 const campaignBranch=retreatDispatcher.indexOf('if(type==="campaignFinal")return retreatCampaignFinalBattle(current)');
 const gauntletBranch=retreatDispatcher.indexOf('if(type==="gauntlet")');
 const genericRestore=retreatDispatcher.indexOf("restorePartyVitals(prior)");
 assert.ok(campaignBranch>=0);assert.ok(campaignBranch<gauntletBranch);assert.ok(campaignBranch<genericRestore);
 assert.match(retreatDispatcher,/if\(type==="floorBoss"\)\{openEndgameTrialPicker\(\)/,"other special retreat routes remain intact");
});

for(const stage of ["party","sairan"]){
 test(`campaign-final ${stage} retreat restores the saved roster atomically`,()=>{
  const{state,result,events,battle,activeEnemy,snapshot}=campaignRetreatHarness(stage);
  assert.equal(result,true);assert.deepEqual(state.party,["party-1","bench"]);
  assert.deepEqual(state.monsters.map(monster=>monster.id),["party-1","party-2","bench"]);
  assert.deepEqual(state.monsters.find(monster=>monster.id==="party-1"),{id:"party-1",currentHp:47,currentMp:11,ailments:["poison"]});
  assert.equal(state.monsters.find(monster=>monster.id==="party-2").currentHp,63);
  assert.equal(state.monsters.find(monster=>monster.id==="party-2").currentMp,17);
  assert.equal(state.player.inRun,false);assert.equal("activeBattle" in state,false);assert.equal(state.expeditionSnapshot,null);
  assert.equal(state.campaign100.sairanMonsterId,null);assert.deepEqual(state.campaign100.finalPartyBackup,[]);assert.deepEqual(state.campaign100.finalVitals,{});
  assert.equal(battle,null);assert.equal(activeEnemy,null);assert.equal(snapshot,null);
  assert.equal(events.saved,1);assert.equal(events.synergy,1);assert.equal(events.removed,1);assert.equal(events.snapshotClears,1);
  assert.deepEqual(events.routes,["home"]);assert.match(events.toasts[0],/最終決戦から撤退/);
 });
}

test("temporary Sairan receives an explicit marker as well as a temporary acquisition method",()=>{
 assert.match(main,/obtainedMethod:"campaignFinalTemporary"\}\);sairan\.equippedSkills=recommendedSkillLoadout\(sairan\)\.slice\(0,4\);sairan\.skillLoadoutInitialized=true;sairan\.id=`campaign-sairan-\$\{Date\.now\(\)\}`;sairan\.campaignFinalTemporary=true/);
 assert.match(restoreSource,/monster\.obtainedMethod!=="campaignFinalTemporary"&&!monster\.campaignFinalTemporary/);
});

test("campaign-final carry removes defeated heroes and preserves exact HP with the same loadout",()=>{
 const harness=new Function(`
  const HERO_PARTY_IDS=["enami","yori","hide","rion"],SPECIES={};
  const CAMPAIGN_MAX_FLOOR=100,campaignFloorToLegacyFloor=floor=>floor*10;
  const prepareEnemyEntry=payload=>payload;
  const original=[
   {speciesId:"enami",loadoutToken:"a"},{speciesId:"yori",loadoutToken:"b"},{speciesId:"hide",loadoutToken:"c"},{speciesId:"rion",loadoutToken:"d"}
  ];
  let battle={specialWaves:[original],enemies:[
   {speciesId:"enami",hp:0,maxHp:100},
   {speciesId:"yori",hp:25,maxHp:100},
   {speciesId:"hide",hp:100,maxHp:100},
   {speciesId:"rion",hp:1,maxHp:200}
  ]};
  ${heroCarrySource}
  const carry=campaignHeroSurvivors(50),next=campaignHeroEncounter(50,carry);
  return{carry,next};
 `)();
 assert.deepEqual(harness.next.map(enemy=>enemy.speciesId),["yori","hide","rion"]);
 assert.equal(harness.next.find(enemy=>enemy.speciesId==="yori").carryHp,25);
 assert.equal(harness.next.find(enemy=>enemy.speciesId==="rion").carryHp,1);
 assert.equal(harness.next.find(enemy=>enemy.speciesId==="yori").loadoutToken,"b");
});
