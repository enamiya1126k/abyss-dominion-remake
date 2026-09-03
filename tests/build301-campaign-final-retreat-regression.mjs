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

function campaignRetreatHarness(){
 const state={
  player:{inRun:true},activeBattle:{battleId:"campaign-final-checkpoint"},expeditionSnapshot:{floor:100},
  monsters:[
   {id:"party-1",currentHp:1,currentMp:0,ailments:["burn"]},
   {id:"party-2",currentHp:2,currentMp:1,ailments:[]},
   {id:"bench",currentHp:88,currentMp:9,ailments:[]},
   {id:"campaign-sairan",obtainedMethod:"campaignFinalTemporary",campaignFinalTemporary:true,currentHp:999,currentMp:999},
   {id:"stale-sairan",obtainedMethod:"campaignFinalTemporary",currentHp:999,currentMp:999}
  ],
  party:["party-1","party-2"],
  campaign100:{
   finalPartyBackup:["party-1","bench"],sairanMonsterId:"campaign-sairan",
   finalVitals:{"party-1":{hp:47,mp:11,ailments:["poison"]},"party-2":{hp:63,mp:17,ailments:[]}}
  }
 };
 const harness=new Function("state",`
  const events={saved:0,synergy:0,removed:0,snapshotClears:0,routes:[],toasts:[]};
  const save={state,save(){events.saved++}};
  const normalizeCampaignState=value=>value.campaign100;
  const normalizePersistentAilments=value=>Array.isArray(value)?[...value]:[];
  const clearPartySynergy=()=>events.synergy++;
  const document={querySelector(){return{remove(){events.removed++}}}};
  const clearExpeditionSnapshot=()=>{events.snapshotClears++;save.state.expeditionSnapshot=null};
  const go=route=>events.routes.push(route),showToast=message=>events.toasts.push(message);
  let activeEnemy={id:"hero"},battle={specialBattle:true,specialBattleType:"campaignFinal",campaignStage:"party",escapePending:true},snapshot={floor:100};
  ${restoreSource}
  ${retreatSource}
  const result=retreatCampaignFinalBattle(battle);
  return{result,events,battle,activeEnemy,snapshot};
 `)(state);
 return{state,...harness}
}

test("campaign-final retreat is dispatched before generic special-battle cleanup",()=>{
 const campaignBranch=retreatDispatcher.indexOf('if(type==="campaignFinal")return retreatCampaignFinalBattle(current)');
 const gauntletBranch=retreatDispatcher.indexOf('if(type==="gauntlet")');
 const genericRestore=retreatDispatcher.indexOf("restorePartyVitals(prior)");
 assert.ok(campaignBranch>=0);assert.ok(campaignBranch<gauntletBranch);assert.ok(campaignBranch<genericRestore);
 assert.match(retreatDispatcher,/if\(type==="floorBoss"\)\{openEndgameTrialPicker\(\)/,"other special retreat routes remain intact");
});

test("Build309 one-stage party-final retreat restores the saved roster atomically",()=>{
  const{state,result,events,battle,activeEnemy,snapshot}=campaignRetreatHarness();
  assert.equal(result,true);assert.deepEqual(state.party,["party-1","bench"]);
  assert.deepEqual(state.monsters.map(monster=>monster.id),["party-1","party-2","bench"]);
  assert.deepEqual(state.monsters.find(monster=>monster.id==="party-1"),{id:"party-1",currentHp:47,currentMp:11,ailments:["poison"]});
  assert.equal(state.monsters.find(monster=>monster.id==="party-2").currentHp,63);
  assert.equal(state.monsters.find(monster=>monster.id==="party-2").currentMp,17);
  assert.equal(state.player.inRun,false);assert.equal("activeBattle" in state,false);assert.equal(state.expeditionSnapshot,null);
  assert.equal(Object.hasOwn(state.campaign100,"sairanMonsterId"),false);assert.deepEqual(state.campaign100.finalPartyBackup,[]);assert.deepEqual(state.campaign100.finalVitals,{});
  assert.equal(battle,null);assert.equal(activeEnemy,null);assert.equal(snapshot,null);
  assert.equal(events.saved,1);assert.equal(events.synergy,1);assert.equal(events.removed,1);assert.equal(events.snapshotClears,1);
  assert.deepEqual(events.routes,["home"]);assert.match(events.toasts[0],/最終決戦から撤退/);
});

test("Build309 never creates a temporary Sairan but still removes old temporary markers",()=>{
 assert.doesNotMatch(main,/createMonster\("abyss_dominion",\{nickname:"魔王サイラーン"/);
 assert.doesNotMatch(main,/campaignStage:"sairan"/);
 assert.match(restoreSource,/monster\.obtainedMethod!=="campaignFinalTemporary"&&!monster\.campaignFinalTemporary/);
});

test("Build309 final encounter always starts the four heroes once and has no second-stage carry",()=>{
 assert.match(heroCarrySource,/return HERO_PARTY_IDS\.map\(\(speciesId,index\)=>prepareEnemyEntry/);
 assert.doesNotMatch(heroCarrySource,/campaignHeroSurvivors|carryHp|heroCarry|sairan/i);
 const finalFlow=main.slice(main.indexOf("function finishCampaignFinalBattle("),main.indexOf("function finishFloorBossChallengeBattle("));
 assert.match(finalFlow,/if\(!won\)return showCampaignEnding\("defeat"\)/);
 assert.equal((finalFlow.match(/startSpecialBattle\(/g)??[]).length,1);
 assert.match(finalFlow,/campaignStage:"party"/);
});
