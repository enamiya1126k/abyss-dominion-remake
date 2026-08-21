import test from"node:test";
import assert from"node:assert/strict";
import fs from"node:fs/promises";
import path from"node:path";
import{fileURLToPath}from"node:url";
import{SPECIES}from"../src/data/species.js";
import{createMonster,calculatedStats,speciesLevelStats,applyTotalExperience}from"../src/models/Monster.js";
import{allSpeciesSkills}from"../src/battle/SkillSystem.js";
import{expectedNaturalExperienceAtFloor}from"../src/core/ProgressionSystem.js";
import{EXPERIENCE_PACK_TYPES,availableExperiencePackTypes,previewExperiencePacks}from"../src/core/ExperiencePackSystem.js";
import{bossExperiencePackReward}from"../src/core/BossRewardSystem.js";
import{enemyLevelForFloor,enemyRankRatesForFloor,equipmentSlotsForFloor,enemyEquipmentLevelForFloor}from"../src/core/EnemyScalingSystem.js";
import{enemyMagicCircleRateForFloor,enemyMagicCircleLevelForFloor}from"../src/core/MagicCircleSystem.js";
import{FLOOR_BOSS_CATALOG,floorBossCatalogSummary,floorBossDefinitionForFloor,milestoneBossIdsForFloor}from"../src/data/floorBosses.js";
import{createEnemyBattleState,specialActionInfo}from"../src/battle/EnemyAI.js";
import{ENDGAME_BOSSES,createEndgameTrialEncounter,endgameTrialThreat}from"../src/core/EndgameSystem.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const protectedIds=new Set(["myth_enami","myth_rion","myth_hide","myth_yori"]);

test("natural dungeon EXP reaches the Lv1000 and Lv10000 axes without grinding",()=>{
 const at1000=createMonster("slime");applyTotalExperience(at1000,expectedNaturalExperienceAtFloor(1000));
 const at10000=createMonster("slime");applyTotalExperience(at10000,expectedNaturalExperienceAtFloor(10000));
 assert.ok(at1000.level>=990&&at1000.level<=1040,`1000F => Lv.${at1000.level}`);
 assert.equal(at10000.level,10000);
});

test("four pack tiers use N-standard 1/3/6/10 levels and unlock at fixed floors",()=>{
 const expected={small:1,medium:3,large:6,ultra:10};
 for(const[id,levels]of Object.entries(expected)){const monster=createMonster("slime",{level:100});const preview=previewExperiencePacks(monster,1,1,id);assert.equal(preview.levelAfter-monster.level,levels,id)}
 assert.deepEqual(availableExperiencePackTypes(299).map(x=>x.id),["small"]);
 assert.deepEqual(availableExperiencePackTypes(300).map(x=>x.id),["small","medium"]);
 assert.deepEqual(availableExperiencePackTypes(750).map(x=>x.id),["small","medium","large"]);
 assert.deepEqual(availableExperiencePackTypes(1000).map(x=>x.id),Object.keys(EXPERIENCE_PACK_TYPES));
 for(const floor of[10,100,300,750,1000,9990]){const reward=bossExperiencePackReward(floor);assert.ok(reward.levelSpan*reward.amount<=10,`${floor}F reward`)}
});

test("stars, IVs, personality and traits are historical only",()=>{
 const base={speciesId:"slime",level:600,rank:1,plus:0,affection:0,bond:0,_equipmentStats:{},_equipmentAffixes:{},_seriesCounts:{}};
 const low={...base,stars:1,ivs:{hp:0,atk:0,def:0,spd:0},personalityId:"bold",traitId:"fierce"};
 const high={...base,stars:10,ivs:{hp:100,atk:100,def:100,spd:100},personalityId:"timid",traitId:"sturdy"};
 assert.deepEqual(calculatedStats(low),calculatedStats(high));
 assert.equal(createMonster("slime",{stars:10}).stars,1);
});

test("level outweighs rarity: N Lv1000 overwhelms Ten-God Lv10",()=>{
 const normal=speciesLevelStats(SPECIES.slime,1000,{rarity:"N"}),god=speciesLevelStats(SPECIES.ancient_dragon,10,{rarity:"十神"});
 for(const key of["hp","atk","def","spd"])assert.ok(normal[key]>god[key]*2,`${key}: ${normal[key]} > ${god[key]}`);
});

test("all 231 non-protected species have unique rarity-sized tactical kits",()=>{
 const rows=Object.values(SPECIES).filter(species=>!protectedIds.has(species.id)).map(species=>({species,skills:allSpeciesSkills(species.id)}));
 const counts={N:4,R:5,SR:6,SSR:7,UR:8,LR:9,"神話":10,SECRET:7};
 for(const{species,skills}of rows)assert.equal(skills.length,counts[species.rarity]??4,species.id);
 const skills=Object.values(SPECIES).flatMap(species=>allSpeciesSkills(species.id));
 assert.equal(new Set(skills.map(skill=>skill.id)).size,skills.length);
 assert.equal(new Set(skills.map(skill=>skill.name)).size,skills.length);
 const signature=skills=>JSON.stringify(skills.map(skill=>({type:skill.type,power:skill.power,target:skill.target,damageClass:skill.damageClass,allEnemies:skill.allEnemies,effects:skill.effects,status:skill.status,heal:skill.heal,revive:skill.revive,circle:skill.removeEnemyMagicCircle,dispel:skill.dispelEnemyBuff,sacrifice:skill.selfSacrificeHpDamage,shield:skill.partyShieldRate})));
 assert.equal(new Set(rows.map(row=>signature(row.skills))).size,rows.length);
 for(const id of protectedIds)assert.ok(allSpeciesSkills(id).every(skill=>!skill.id.includes("__identity_")),id);
});

test("advanced skill mechanics are battle-usable and broadly distributed",()=>{
 const skills=Object.values(SPECIES).flatMap(species=>allSpeciesSkills(species.id));
 assert.ok(skills.filter(skill=>skill.removeEnemyMagicCircle).length>=80);
 assert.ok(skills.filter(skill=>skill.dispelEnemyBuff).length>=60);
 assert.ok(skills.filter(skill=>skill.selfSacrificeHpDamage).length>=20);
 assert.ok(skills.filter(skill=>skill.type==="revive"||skill.revive).length>=20);
 assert.ok(skills.filter(skill=>skill.effects?.some(effect=>effect.kind==="taunt")).length>=80);
 assert.ok(skills.filter(skill=>skill.effects?.some(effect=>effect.kind==="magicToPhysical")).length>=40);
});

test("90 normal floor bosses own 360 named actions and 90 dedicated weapons",()=>{
 const expected=[];for(let floor=10;floor<=990;floor+=10)if(floor%100)expected.push(floor);
 assert.deepEqual(FLOOR_BOSS_CATALOG.map(entry=>entry.floor),expected);
 assert.deepEqual(floorBossCatalogSummary(),{normalBosses:90,actions:360,dedicatedWeapons:90});
 assert.equal(new Set(FLOOR_BOSS_CATALOG.map(entry=>entry.name)).size,90);
 assert.equal(new Set(FLOOR_BOSS_CATALOG.map(entry=>entry.dedicatedWeapon.name)).size,90);
 assert.equal(floorBossDefinitionForFloor(1010).id,floorBossDefinitionForFloor(10).id);
});

test("Deep and Ten-God milestones match the fixed floor schedule",()=>{
 assert.deepEqual(milestoneBossIdsForFloor(100),["abyss_gluttony"]);
 assert.deepEqual(milestoneBossIdsForFloor(500),["abyss_greed","abyss_lust"]);
 assert.deepEqual(milestoneBossIdsForFloor(900),["abyss_greed","abyss_lust","abyss_pride"]);
 assert.deepEqual(milestoneBossIdsForFloor(1000),["ten_time"]);
 assert.deepEqual(milestoneBossIdsForFloor(2000),["ten_space"]);
 assert.deepEqual(milestoneBossIdsForFloor(10000),["ten_divinity"]);
 for(let floor=100;floor<=10000;floor+=100)for(const id of milestoneBossIdsForFloor(floor))assert.ok(ENDGAME_BOSSES[id],`${floor}:${id}`);
});

test("enemy level, gear growth and magic circles use only the floor axis",()=>{
 assert.equal(enemyLevelForFloor(456,.01),456);assert.equal(enemyLevelForFloor(456,.99),456);
 assert.deepEqual(Object.keys(enemyRankRatesForFloor(9000)),["N","R","SR","SSR","UR","LR"]);
 assert.equal(equipmentSlotsForFloor(49),0);assert.equal(equipmentSlotsForFloor(50),1);assert.equal(equipmentSlotsForFloor(3000),6);
 assert.ok(enemyEquipmentLevelForFloor(100,{rank:"N"})<100);
 assert.equal(enemyMagicCircleRateForFloor(119,"十神"),0);assert.ok(enemyMagicCircleRateForFloor(300)>.29&&enemyMagicCircleRateForFloor(300)<.31);
 const low=enemyMagicCircleLevelForFloor(120,{rank:"N",random:()=>0}),high=enemyMagicCircleLevelForFloor(10000,{rank:"十神",random:()=>.999});assert.ok(low<=2);assert.ok(high>=90&&high<=99);
});

test("floor-boss custom stats and actions enter the shared enemy battle engine",()=>{
 const definition=floorBossDefinitionForFloor(490),species=SPECIES[definition.speciesId],plain=createEnemyBattleState(species,{speciesId:species.id,level:505,boss:true},490),custom=createEnemyBattleState(species,{speciesId:species.id,level:505,boss:true,floorBossStats:definition.stats,floorBossActionIds:definition.actionIds},490);
 assert.notDeepEqual({hp:custom.maxHp,atk:custom.atk,def:custom.def,spd:custom.spd},{hp:plain.maxHp,atk:plain.atk,def:plain.def,spd:plain.spd});
 for(const id of definition.actionIds)assert.ok(specialActionInfo(`floorBoss:${id}`)?.label,id);
});

test("Gauntlet loop transition stays harder after finite endgame multipliers",()=>{
 const state={player:{maxFloor:1000},flags:{gameClear1000:true},endgame:{trials:{battle:22,loop:1,cleared:[],run:null,dailyKey:null,dailyAttempts:0}}};
 const previous=createEndgameTrialEncounter(state,22);state.endgame.trials.loop=2;const next=createEndgameTrialEncounter(state,1);
 assert.ok(endgameTrialThreat(next)>endgameTrialThreat(previous));
});

test("schema 55 saves retain level, progress and historical individual records",async()=>{
 const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
 const{SaveService}=await import("../src/services/SaveService.js"),service=new SaveService(),legacy=structuredClone(service.state),monster=legacy.monsters[0];
 legacy.schemaVersion=55;monster.level=432;monster.exp=12345;monster.totalExp=9_000_000_000;monster.stars=10;monster.ivs={hp:1,atk:100,def:50,spd:99};delete legacy.inventory.experienceItemsMedium;
 const migrated=service.migrate(legacy);
 assert.equal(migrated.schemaVersion,56);assert.equal(migrated.monsters[0].level,432);assert.equal(migrated.monsters[0].exp,12345);
 assert.equal(migrated.monsters[0].stars,10);assert.deepEqual(migrated.monsters[0].ivs,{hp:1,atk:100,def:50,spd:99});assert.equal(migrated.inventory.experienceItemsMedium,0);assert.equal(migrated.flags.individualValuesDisabled,true);
});

test("main route excludes roaming endgame units and marks milestones no-drop",async()=>{
 const [main,index,config]=await Promise.all([fs.readFile(path.join(root,"src/main.js"),"utf8"),fs.readFile(path.join(root,"index.html"),"utf8"),fs.readFile(path.join(root,"src/core/config.js"),"utf8")]);
 assert.doesNotMatch(main,/endgameRoaming\s*:\s*true/);
 assert.doesNotMatch(main,/applyPracticalEndgameScaling/);
 assert.match(main,/noItemDrops:true/);assert.match(main,/floorBossDedicated:true/);assert.match(main,/enemyExperienceReward\(e\.level/);
 assert.match(main,/floor>=300\?\{small:70,medium:30\}:\{small:100\}/);
 assert.match(index,/ASSET_BUILD = "build164"/);assert.match(index,/build164\.css\?v=2\.11\.0-build164/);
 assert.match(config,/SAVE_SCHEMA_VERSION=56/);assert.match(config,/APP_VERSION="2\.11\.0"/);
});
