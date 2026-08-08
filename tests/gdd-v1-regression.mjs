import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {
  ABYSS_UNLOCK_FLOOR,
  BATTLE_SPEED_OPTIONS,
  CAMERA_DRAG_THRESHOLD_PX,
  CONTENT_TEST_MODE,
  SAVE_KEY,
  WATER_RULES,
  normalizeBattleSpeed
} from "../src/core/config.js";
import {
  ENDGAME_EMERGENCY_COOLDOWN_FLOORS,
  ENDGAME_EMERGENCY_RATE,
  ENDGAME_TRIAL_BATTLE_COUNT,
  WORLD_MAX_FLOOR,
  attemptEndgameContract,
  awardEmergencyFragments,
  createEmergencyEncounter,
  endgameContractStatus,
  endgameTrialLoopMultiplier,
  manifestationForFloor,
  normalizeEndgameState,
  recordSpecialBattleSettlement,
  specialBattleSettlement,
  shouldTriggerEmergency
} from "../src/core/EndgameSystem.js";
import {
  captureStatusBonus,
  normalizePersistentAilments
} from "../src/data/statusEffects.js";
import {
  applyBattleEffect,
  applyPersistentAilment,
  clearPersistentAilments,
  createBattleRulesState,
  processAllyEffects,
  syncPersistentAilments,
  tickBattleEffects
} from "../src/battle/BattleRules.js";
import {createEnemyBattleState} from "../src/battle/EnemyAI.js";
import {buildTurnQueue} from "../src/battle/TurnSystem.js";
import {SPECIES} from "../src/data/species.js";
import {SaveService} from "../src/services/SaveService.js";
import {BattleScreen} from "../src/ui/screens/BattleScreen.js";
import {HomeScreen} from "../src/ui/screens/HomeScreen.js";
import {SettingsScreen} from "../src/ui/screens/SettingsScreen.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");

class MemoryStorage{
  constructor(){this.map=new Map()}
  getItem(key){return this.map.get(key)??null}
  setItem(key,value){this.map.set(key,String(value))}
  removeItem(key){this.map.delete(key)}
}

globalThis.localStorage=new MemoryStorage();
globalThis.window={dispatchEvent(){}};
globalThis.CustomEvent=class CustomEvent{
  constructor(type,init={}){this.type=type;this.detail=init.detail}
};

function testSharedRules(){
  assert.equal(ABYSS_UNLOCK_FLOOR,100);
  assert.deepEqual([...BATTLE_SPEED_OPTIONS],[.5,1,2,4]);
  assert.equal(normalizeBattleSpeed(.5),.5);
  assert.equal(normalizeBattleSpeed(1.5),1);
  assert.equal(CAMERA_DRAG_THRESHOLD_PX,10);
  assert.deepEqual(WATER_RULES,{minPerFloor:1,maxPerFloor:5,hpRecoveryRate:.02,mpRecoveryRate:.02});
  assert.equal(CONTENT_TEST_MODE,false);
  assert.equal(WORLD_MAX_FLOOR,10000);
}

function testEndgameRules(){
  assert.equal(ENDGAME_TRIAL_BATTLE_COUNT,22);
  assert.equal(ENDGAME_EMERGENCY_RATE,.03);
  assert.equal(ENDGAME_EMERGENCY_COOLDOWN_FLOORS,10);
  for(const [floor,percent] of [[500,40],[1000,40],[3000,60],[5000,100],[10000,100]]){
    assert.equal(manifestationForFloor(floor).percent,percent);
  }
  assert.equal(endgameTrialLoopMultiplier(1),1);
  assert.equal(endgameTrialLoopMultiplier(4),2.5);

  const state={player:{currentFloor:100,maxFloor:100},flags:{},endgame:{}};
  normalizeEndgameState(state);
  assert.equal(specialBattleSettlement(state,"special-1"),null);
  assert.equal(recordSpecialBattleSettlement(state,"special-1",{specialGold:123,fragments:5}).created,true);
  assert.equal(recordSpecialBattleSettlement(state,"special-1",{specialGold:999,fragments:99}).created,false);
  assert.equal(specialBattleSettlement(state,"special-1").specialGold,123);
  const originalRandom=Math.random;
  Math.random=()=>0;
  assert.equal(shouldTriggerEmergency(state),true);
  const pending=structuredClone(state.endgame.emergency.pendingEncounter);
  assert.equal(pending.floor,100);
  assert.equal(shouldTriggerEmergency(state),true);
  assert.deepEqual(state.endgame.emergency.pendingEncounter,pending);
  assert.equal(createEmergencyEncounter(state).boss.id,pending.bossId);
  state.endgame.emergency.pendingEncounter=null;
  state.player.currentFloor=109;
  assert.equal(shouldTriggerEmergency(state),false);
  state.player.currentFloor=110;
  assert.equal(shouldTriggerEmergency(state),true);
  state.endgame.emergency.pendingEncounter=null;

  assert.equal(awardEmergencyFragments(state,"abyss_gluttony",true,"win-1"),5);
  assert.equal(awardEmergencyFragments(state,"abyss_gluttony",true,"win-1"),5);
  assert.equal(state.endgame.emergency.fragments.abyss_gluttony,5);
  assert.equal(awardEmergencyFragments(state,"abyss_gluttony",false,"loss-1"),1);
  Math.random=()=>.5;
  assert.equal(awardEmergencyFragments(state,"abyss_gluttony",false,"loss-2"),0);
  Math.random=originalRandom;

  state.endgame.emergency.fragments.abyss_gluttony=50;
  assert.equal(endgameContractStatus(state,"abyss_gluttony").required,50);
  assert.equal(attemptEndgameContract(state,"abyss_gluttony").success,true);
  assert.equal(state.endgame.emergency.fragments.abyss_gluttony,0);
  state.endgame.emergency.fragments.ten_fire=150;
  assert.equal(endgameContractStatus(state,"ten_fire").required,150);
  assert.equal(attemptEndgameContract(state,"ten_fire").success,true);
}

function testPersistentAilments(){
  const normalized=normalizePersistentAilments([
    {id:"poison",power:.04},
    {id:"poison",power:.07},
    {id:"atkDown",value:.2}
  ]);
  assert.equal(normalized.length,1);
  assert.equal(normalized[0].id,"poison");
  assert.equal(normalized[0].power,.07);
  assert.equal(captureStatusBonus(normalized),.07);

  const originalRandom=Math.random;
  Math.random=()=>0;
  const monster={id:"m1",currentHp:100,ailments:[]};
  const battle={party:[monster],...createBattleRulesState([monster])};
  assert.equal(applyPersistentAilment(battle,"m1",{id:"poison",power:.1,chance:1}),true);
  assert.equal(processAllyEffects(battle,()=>({hp:100}))[0].amount,10);
  assert.equal(monster.currentHp,90);
  applyBattleEffect(battle,"m1",{kind:"atkDown",value:.2,turns:1,chance:1},"ally");
  syncPersistentAilments(battle);
  assert.equal(monster.ailments[0].id,"poison");
  clearPersistentAilments(battle,"m1");
  assert.equal(monster.ailments.length,0);
  assert.equal(battle.allyEffects.m1[0].kind,"atkDown");
  tickBattleEffects(battle);
  assert.equal(battle.allyEffects.m1.length,0);
  Math.random=originalRandom;
}

function testSaveMigration(){
  localStorage.removeItem(SAVE_KEY);
  const fresh=new SaveService();
  assert.equal(fresh.state.schemaVersion,43);
  assert.equal(fresh.state.settings.minimapVisible,false);
  assert.equal(fresh.state.settings.battleSpeed,1);
  assert.deepEqual(fresh.state.endgame.processedSpecialResults,{});

  const old=structuredClone(fresh.state);
  const monsterId=old.monsters[0].id;
  old.schemaVersion=42;
  delete old.settings.minimapVisible;
  old.settings.battleSpeed=1.5;
  old.player.inRun=true;
  old.monsters[0].ailments=[];
  old.monsters[0].statuses=[{id:"poison",name:"毒",power:.05}];
  old.activeBattle={
    enemies:[{id:"legacy-enemy",speciesId:"slime",hp:1,maxHp:1}],
    allyEffects:{[monsterId]:[
      {kind:"poison",name:"毒",power:.04,turns:2},
      {kind:"atkDown",value:.2,turns:2}
    ]}
  };
  old.expeditionSnapshot={
    floor:8,
    world:{
      cols:3,rows:3,tiles:[[1,1,1],[1,0,1],[1,1,1]],
      start:{x:1,y:1},exit:{x:1,y:1},chests:[],decorations:[],steps:4,nextEncounter:9
    },
    player:{x:1,y:1,rx:1,ry:1},
    cameraData:{x:10,y:20,z:1.4,manual:true},
    partyTrail:[{x:1,y:1}]
  };
  localStorage.setItem(SAVE_KEY,JSON.stringify(old));
  const migrated=new SaveService();
  assert.equal(migrated.state.schemaVersion,43);
  assert.equal(migrated.state.settings.minimapVisible,true);
  assert.equal(migrated.state.settings.battleSpeed,1);
  assert.equal(migrated.state.monsters[0].ailments[0].id,"poison");
  assert.deepEqual(migrated.state.monsters[0].statuses,[]);
  assert.equal(migrated.state.activeBattle.allyAilments[monsterId][0].id,"poison");
  assert.equal(migrated.state.activeBattle.allyEffects[monsterId][0].kind,"atkDown");
  assert.equal(migrated.state.activeBattle.actionCommitted,false);
  assert.equal(migrated.state.expeditionSnapshot.floor,8);
  assert.equal(migrated.state.expeditionSnapshot.cameraData.z,1.4);
  assert.deepEqual(migrated.state.expeditionSnapshot.player.path,[]);
  assert.deepEqual(migrated.state.lastMigration.from,42);
  assert.deepEqual(migrated.state.lastMigration.to,43);
  migrated.reset();
  assert.equal(migrated.state.settings.minimapVisible,false);
}

function testScreenRendering(){
  localStorage.removeItem(SAVE_KEY);
  const save=new SaveService();
  const home=HomeScreen(save.state);
  assert.match(home,/ABYSS DOMINION/);
  assert.doesNotMatch(home,/プレゼント/);
  const settings=SettingsScreen(save.state);
  assert.doesNotMatch(settings,/TEST ACCESS ACTIVE/);
  assert.match(settings,/v1\.8\.0/);

  const monster=save.state.monsters[0];
  monster.currentHp=100;
  monster.currentMp=10;
  monster.ailments=[{id:"poison",name:"毒",kind:"damageOverTime",power:.05}];
  const enemy=createEnemyBattleState(SPECIES.goblin,{speciesId:"goblin",level:1},1);
  enemy.id="enemy-test";
  const battle={
    enemies:[enemy],enemy,targetEnemyId:enemy.id,party:[monster],species:SPECIES,
    turn:1,busy:false,auto:false,guards:{},queueIndex:0,
    ...createBattleRulesState([monster])
  };
  buildTurnQueue(battle);
  const html=BattleScreen(battle,save.state.inventory,{...save.state.settings,battleSpeed:.5},1);
  assert.match(html,/×0\.5/);
  assert.match(html,/毒・持続/);
  assert.match(html,/--battle-lunge:440ms/);
  assert.doesNotMatch(html,/NaN|undefinedms/);
}

function testStaticReferences(){
  const sourceFiles=[];
  const walk=directory=>{
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      const full=path.join(directory,entry.name);
      if(entry.isDirectory())walk(full);
      else sourceFiles.push(full);
    }
  };
  walk(path.join(root,"src"));
  let importCount=0;
  for(const file of sourceFiles.filter(file=>file.endsWith(".js"))){
    const source=fs.readFileSync(file,"utf8");
    for(const match of source.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g)){
      const specifier=match[1].split("?")[0];
      if(!specifier.startsWith("."))continue;
      importCount++;
      assert.equal(fs.existsSync(path.resolve(path.dirname(file),specifier)),true,`Missing import: ${specifier} from ${file}`);
    }
  }
  assert.ok(importCount>100);

  const main=fs.readFileSync(path.join(root,"src/main.js"),"utf8");
  assert.doesNotMatch(main,/statusCures"\|\|type==="partyStatusCures"[^\n]*clearNegativeAllyEffects/);
  assert.doesNotMatch(main,/fullHeals"\|\|type==="partyFullHeals"[^\n]*clearNegativeAllyEffects/);
  const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
  assert.match(main,/party\.length!==4/);
  assert.match(main,/startClientX:e\.clientX,startClientY:e\.clientY/);
  assert.doesNotMatch(main,/wait\([^\n]*\/battleSpeed\(\)/);
  for(const modulePath of [
    "core/config.js",
    "core/EndgameSystem.js",
    "core/WorldSystem.js",
    "models/Monster.js",
    "services/SaveService.js",
    "ui/screens/BattleScreen.js",
    "ui/screens/ExploreScreen.js",
    "ui/screens/ShopScreen.js"
  ]){
    assert.ok(main.includes(`${modulePath}?v=1.8.0-gdd-v1`),`Stale cache tag: ${modulePath}`);
  }
  assert.match(index,/import\(`\.\/src\/main\.js/);
  assert.doesNotMatch(index,/app\.bundle\.js/);
}

testSharedRules();
testEndgameRules();
testPersistentAilments();
testSaveMigration();
testScreenRendering();
testStaticReferences();

console.log("GDD v1.0 regression suite: PASS");
