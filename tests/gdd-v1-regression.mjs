import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {
  ABYSS_UNLOCK_FLOOR,
  APP_VERSION,
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
  ENDGAME_BOSSES,
  ENDGAME_TRIALS,
  ENDGAME_TRIAL_BATTLE_COUNT,
  WORLD_MAX_FLOOR,
  attemptEndgameContract,
  awardEmergencyFragments,
  craftEndgameEquipment,
  createEmergencyEncounter,
  createEndgameTrialEncounter,
  endgameContractStatus,
  endgameTrialLoopMultiplier,
  manifestationForFloor,
  normalizeEndgameState,
  recordEndgameTrialResult,
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
  applyEnemyStatus,
  applyPersistentAilment,
  clearPersistentAilments,
  createBattleRulesState,
  processAllyEffects,
  syncPersistentAilments,
  tickBattleEffects
} from "../src/battle/BattleRules.js";
import {createEnemyBattleState} from "../src/battle/EnemyAI.js";
import {buildTurnQueue} from "../src/battle/TurnSystem.js";
import {allLearnedSkills} from "../src/battle/SkillSystem.js";
import {
  ABYSS_CHARACTER_IDS,
  ENDGAME_CHARACTERS,
  ENDGAME_SERIES,
  TEN_GOD_CHARACTER_IDS
} from "../src/data/endgameCharacters.js";
import {MONSTER_SPRITE_FOLDERS} from "../src/data/monsterCatalog.js";
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
  assert.equal(APP_VERSION,"2.0.0");
  assert.equal(ABYSS_UNLOCK_FLOOR,100);
  assert.deepEqual([...BATTLE_SPEED_OPTIONS],[.5,1,2,4]);
  assert.equal(normalizeBattleSpeed(.5),.5);
  assert.equal(normalizeBattleSpeed(1.5),1);
  assert.equal(CAMERA_DRAG_THRESHOLD_PX,10);
  assert.deepEqual(WATER_RULES,{minPerFloor:1,maxPerFloor:5,hpRecoveryRate:.02,mpRecoveryRate:.02});
  assert.equal(CONTENT_TEST_MODE,false);
  assert.equal(WORLD_MAX_FLOOR,10000);
}

function testCharacterBible(){
  assert.equal(ABYSS_CHARACTER_IDS.length,7);
  assert.equal(TEN_GOD_CHARACTER_IDS.length,10);
  assert.equal(Object.keys(ENDGAME_CHARACTERS).length,17);
  assert.deepEqual(ABYSS_CHARACTER_IDS,["abyss_gluttony","abyss_wrath","abyss_envy","abyss_sloth","abyss_greed","abyss_lust","abyss_pride"]);
  assert.deepEqual(TEN_GOD_CHARACTER_IDS,["ten_time","ten_space","ten_life","ten_death","ten_fate","ten_chaos","ten_dominion","ten_creation","ten_end","ten_divinity"]);
  assert.equal(ENDGAME_CHARACTERS.abyss_extinction,undefined);
  assert.equal(ENDGAME_CHARACTERS.ten_fire,undefined);
  assert.equal(Object.keys(ENDGAME_SERIES).length,17);
  const allSkills=[],allGear=[];
  for(const character of Object.values(ENDGAME_CHARACTERS)){
    assert.equal(character.skills.length,5,`${character.id}: skill count`);
    assert.equal(character.gear.length,6,`${character.id}: gear count`);
    assert.deepEqual(character.gear.map(gear=>gear.subslot),["weaponRight","weaponLeft","accessoryNeck","accessoryFinger","armorBody","armorSupport"]);
    assert.ok(character.passive.length>10);
    assert.ok(character.awakening.length>10);
    assert.ok(character.ai.length>10);
    assert.ok(character.lore.length>10);
    assert.equal(Object.keys(character.elementMultipliers).length,6);
    assert.deepEqual(Object.keys(ENDGAME_SERIES[character.seriesId].bonuses).map(Number),[2,4,6]);
    allSkills.push(...character.skills.map(skill=>skill.id));
    allGear.push(...character.gear.map(gear=>gear.name));
  }
  assert.equal(allSkills.length,85);
  assert.equal(new Set(allSkills).size,85);
  assert.equal(allGear.length,102);
  assert.equal(Object.keys(ENDGAME_BOSSES).length,17);
  for(const characterId of [...ABYSS_CHARACTER_IDS,...TEN_GOD_CHARACTER_IDS]){
    const folder=MONSTER_SPRITE_FOLDERS[characterId];
    assert.ok(folder,`${characterId}: sprite mapping`);
    for(const frame of ["idle1","idle2","idle3","walk1","walk2","attack","damage","down"]){
      assert.equal(fs.existsSync(path.join(root,"assets/monsters",folder,`${frame}.png`)),true,`${characterId}: ${frame}`);
    }
  }

  const contracted={speciesId:"ogre",level:100,currentMp:999,endgameBossId:"abyss_gluttony",equippedSkills:[]};
  assert.equal(allLearnedSkills(contracted).length,5);

  const enemy={id:"gluttony",hp:100,maxHp:100,endgameBossId:"abyss_gluttony",statusProfile:ENDGAME_CHARACTERS.abyss_gluttony.statusProfile};
  const rules={enemies:[enemy],enemy,targetEnemyId:enemy.id,party:[],...createBattleRulesState([])};
  assert.equal(applyEnemyStatus(rules,{id:"poison",name:"毒",turns:3,power:.05},enemy.id),false);
  const wrath={id:"wrath",hp:100,maxHp:100,endgameBossId:"abyss_wrath",statusProfile:ENDGAME_CHARACTERS.abyss_wrath.statusProfile};
  rules.enemies=[wrath];rules.enemy=wrath;rules.targetEnemyId=wrath.id;
  assert.equal(applyEnemyStatus(rules,{id:"sleep",name:"睡眠",turns:1},wrath.id),true);
  assert.equal(rules.enemyEffects[wrath.id][0].kind,"stun");
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
  state.endgame.emergency.fragments.ten_divinity=150;
  assert.equal(endgameContractStatus(state,"ten_divinity").required,150);
  assert.equal(attemptEndgameContract(state,"ten_divinity").success,true);

  assert.equal(ENDGAME_TRIALS.length,22);
  assert.deepEqual(ENDGAME_TRIALS.slice(0,17).flatMap(trial=>trial.bossIds),[...ABYSS_CHARACTER_IDS,...TEN_GOD_CHARACTER_IDS]);
  assert.deepEqual(ENDGAME_TRIALS[21].bossIds,["ten_chaos","ten_dominion","ten_divinity"]);
  const trialState={player:{currentFloor:100,maxFloor:100},flags:{},endgame:{trials:{battle:1,loop:1,cleared:[]}}};
  const firstTrial=createEndgameTrialEncounter(trialState,1);
  assert.equal(firstTrial.trial.number,1);
  assert.equal(firstTrial.enemies.length,4);
  assert.equal(firstTrial.enemies[0].endgameBossId,"abyss_gluttony");
  assert.equal(recordEndgameTrialResult(trialState,1,true).battle,2);
  trialState.endgame.trials.battle=22;
  const loopResult=recordEndgameTrialResult(trialState,22,true);
  assert.equal(loopResult.loopCompleted,true);
  assert.equal(loopResult.loop,2);
  assert.equal(endgameTrialLoopMultiplier(loopResult.loop),1.5);

  const forgeState={player:{currentFloor:100,maxFloor:100},flags:{},endgame:{}};
  normalizeEndgameState(forgeState);
  forgeState.endgame.emergency.fragments.abyss_gluttony=1000;
  const crafted=Array.from({length:6},()=>craftEndgameEquipment(forgeState,"abyss_gluttony"));
  assert.ok(crafted.every(result=>result.ok));
  assert.deepEqual(crafted.map(result=>result.item.ruleOverrides.subslot),["weaponRight","weaponLeft","accessoryNeck","accessoryFinger","armorBody","armorSupport"]);
  assert.ok(crafted.every(result=>result.item.fixedEffectText&&Object.keys(result.item.fixedEffects).length));
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
  assert.equal(fresh.state.schemaVersion,44);
  assert.equal(fresh.state.settings.minimapVisible,false);
  assert.equal(fresh.state.settings.battleSpeed,1);
  assert.equal(fresh.state.settings.audioEnabled,true);
  assert.equal(fresh.state.settings.musicVolume,.28);
  assert.equal(fresh.state.settings.sfxVolume,.45);
  assert.deepEqual(fresh.state.endgame.trials,{battle:1,loop:1,cleared:[]});
  assert.deepEqual(fresh.state.endgame.processedSpecialResults,{});

  const old=structuredClone(fresh.state);
  const monsterId=old.monsters[0].id;
  old.schemaVersion=43;
  delete old.settings.minimapVisible;
  old.settings.battleSpeed=1.5;
  old.player.inRun=true;
  old.monsters[0].ailments=[];
  old.monsters[0].statuses=[{id:"poison",name:"毒",power:.05}];
  old.monsters[0].endgameBossId="abyss_extinction";
  old.endgame.emergency.fragments={ten_fire:155};
  old.endgame.emergency.contracts={abyss_extinction:{contracted:true,attempts:1}};
  delete old.settings.audioEnabled;
  delete old.settings.musicVolume;
  delete old.settings.sfxVolume;
  old.activeBattle={
    enemies:[{id:"legacy-enemy",speciesId:"slime",hp:1,maxHp:1,endgameBossId:"ten_dark"}],
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
  assert.equal(migrated.state.schemaVersion,44);
  assert.equal(migrated.state.settings.minimapVisible,true);
  assert.equal(migrated.state.settings.battleSpeed,1);
  assert.equal(migrated.state.monsters[0].ailments[0].id,"poison");
  assert.deepEqual(migrated.state.monsters[0].statuses,[]);
  assert.equal(migrated.state.activeBattle.allyAilments[monsterId][0].id,"poison");
  assert.equal(migrated.state.activeBattle.allyEffects[monsterId][0].kind,"atkDown");
  assert.equal(migrated.state.activeBattle.actionCommitted,false);
  assert.equal(migrated.state.activeBattle.enemies[0].endgameBossId,"ten_death");
  assert.equal(migrated.state.monsters[0].endgameBossId,"abyss_lust");
  assert.equal(migrated.state.endgame.emergency.fragments.ten_end,155);
  assert.equal(migrated.state.endgame.emergency.fragments.ten_fire,undefined);
  assert.equal(migrated.state.endgame.emergency.contracts.abyss_lust.contracted,true);
  assert.equal(migrated.state.settings.audioEnabled,true);
  assert.equal(migrated.state.settings.musicVolume,.28);
  assert.equal(migrated.state.settings.sfxVolume,.45);
  assert.equal(migrated.state.expeditionSnapshot.floor,8);
  assert.equal(migrated.state.expeditionSnapshot.cameraData.z,1.4);
  assert.deepEqual(migrated.state.expeditionSnapshot.player.path,[]);
  assert.deepEqual(migrated.state.lastMigration.from,43);
  assert.deepEqual(migrated.state.lastMigration.to,44);
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
  assert.match(settings,/v2\.0\.0/);
  assert.match(settings,/id="toggleAudio"/);
  assert.match(settings,/id="musicVolume"/);
  assert.match(settings,/id="sfxVolume"/);

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
    "core/AudioSystem.js",
    "core/EndgameSystem.js",
    "data/endgameCharacters.js",
    "services/SaveService.js",
    "battle/BattleRules.js",
    "battle/EnemyAI.js",
    "battle/SkillSystem.js",
    "ui/screens/EquipmentScreen.js",
    "ui/screens/MonsterDetailScreen.js",
    "ui/screens/SettingsScreen.js"
  ]){
    assert.ok(main.includes(`${modulePath}?v=2.0.0-release`),`Stale release cache tag: ${modulePath}`);
  }
  const audio=fs.readFileSync(path.join(root,"src/core/AudioSystem.js"),"utf8");
  assert.match(audio,/Original procedural score/);
  assert.doesNotMatch(audio,/https?:\/\//);
  assert.match(audio,/home:.*explore:.*battle:.*abyss:.*divine:/s);
  assert.match(index,/import\(`\.\/src\/main\.js/);
  assert.doesNotMatch(index,/app\.bundle\.js/);
  assert.match(index,/2\.0\.0-release/);
}

testSharedRules();
testCharacterBible();
testEndgameRules();
testPersistentAilments();
testSaveMigration();
testScreenRendering();
testStaticReferences();

console.log("GDD v1.0 regression suite: PASS");
