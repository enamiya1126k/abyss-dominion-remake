import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{bossExperiencePackAmount}from"../src/core/BossRewardSystem.js";
import{equipmentDropLevelForFloor}from"../src/core/EquipmentDropSystem.js";
import{WEEKDAY_ENDGAME_RATE,isTenGodSunday,rollWeekdayEndgameHit,weekdayGachaSchedule}from"../src/core/WeekdayGachaSystem.js";
import{buyOrUpgradeMagicCircle,goldPowerActionCost,goldPowerDamageMultiplier,magicCircleUpgradePrice}from"../src/core/MagicCircleSystem.js";
import{equipmentStatMultiplier,equipmentRequiredMonsterLevel}from"../src/models/Equipment.js";
import{levelGrowthMultiplier}from"../src/models/Monster.js";
import{recordSeriesBattle}from"../src/services/SeriesMastery.js";
import{activeSeriesBonuses,equipmentSeriesDefinition}from"../src/data/equipmentSeries.js";
import{MYTHIC_SERIAL_SPECIES}from"../src/data/mythicSerialSpecies.js";
import{abyssExpansionRewardScale}from"../src/core/AbyssSkillTreeSystem.js";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("boss EXP packs grow continuously to the requested caps",()=>{
 assert.equal(bossExperiencePackAmount(1),1);assert.equal(bossExperiencePackAmount(100),1);
 assert.ok(bossExperiencePackAmount(101)>1);assert.equal(bossExperiencePackAmount(500),20);
 assert.ok(bossExperiencePackAmount(501)>20);assert.equal(bossExperiencePackAmount(1000),120);
 assert.equal(bossExperiencePackAmount(5500),300);
});

test("Sunday Deep and biweekly Ten-God summons are rare, never guaranteed",()=>{
 assert.equal(WEEKDAY_ENDGAME_RATE,.001);assert.equal(rollWeekdayEndgameHit(()=>.000999),true);assert.equal(rollWeekdayEndgameHit(()=>.001),false);
 const anchor=new Date("2026-08-16T03:00:00Z"),next=new Date("2026-08-23T03:00:00Z"),following=new Date("2026-08-30T03:00:00Z");
 assert.equal(isTenGodSunday(anchor),true);assert.equal(isTenGodSunday(next),false);assert.equal(isTenGodSunday(following),true);
 assert.deepEqual(weekdayGachaSchedule(anchor).factions,["abyss","tenGod"]);assert.deepEqual(weekdayGachaSchedule(next).factions,["abyss"]);
});

test("magic-circle strengthening commits level and GOLD together",()=>{
 const price=magicCircleUpgradePrice("gold_power",1),state={player:{gold:price+1234},monsters:[],party:[],magicCircles:{unlocked:{gold_power:true},instances:[{instanceId:"mc:gold_power:test",circleId:"gold_power",level:1,source:"test"}],goldSpent:0}};
 const result=buyOrUpgradeMagicCircle(state,"mc:gold_power:test");assert.equal(result.ok,true);assert.equal(result.level,2);assert.equal(state.magicCircles.instances[0].level,2);assert.equal(state.player.gold,1234);assert.equal(state.magicCircles.goldSpent,price);
 const failed={player:{gold:0},monsters:[],party:[],magicCircles:{unlocked:{gold_power:true},instances:[{instanceId:"mc:gold_power:fail",circleId:"gold_power",level:1,source:"test"}],goldSpent:0}};
 assert.equal(buyOrUpgradeMagicCircle(failed,"mc:gold_power:fail").ok,false);assert.equal(failed.player.gold,0);assert.equal(failed.magicCircles.instances[0].level,1);
});

test("Golden conversion has logarithmic hard caps",()=>{
 assert.ok(goldPowerDamageMultiplier(Number.MAX_SAFE_INTEGER,1)<=1.18);assert.ok(goldPowerDamageMultiplier(Number.MAX_SAFE_INTEGER,99)<=1.30);
 assert.ok(goldPowerDamageMultiplier(1_000_000_000,1)>goldPowerDamageMultiplier(1_000_000,1));assert.equal(goldPowerActionCost(Number.MAX_SAFE_INTEGER),100_000);
});

test("series mastery reads every storage and is idempotent",()=>{
 const monster={id:"hero",equipment:{weaponRight:"a",armorBody:"b"}},state={equipment:[],reserveEquipment:[{id:"a",series:"flame"}],bossEquipmentVault:[{id:"b",series:"flame"}],seriesMastery:{}};
 const first=recordSeriesBattle(state,[monster],null,{battleId:"normal:1"});assert.equal(first[0].amount,2);assert.equal(state.seriesMastery.flame.exp,2);
 assert.deepEqual(recordSeriesBattle(state,[monster],null,{battleId:"normal:1"}),[]);assert.equal(state.seriesMastery.flame.exp,2);
 recordSeriesBattle(state,[monster],null,{boss:true,battleId:"boss:1"});assert.equal(state.seriesMastery.flame.exp,8);
 assert.ok(equipmentSeriesDefinition("signature-slime"));assert.ok(activeSeriesBonuses({"signature-slime":6}).length>=3);
});

test("character level matters while late growth and gear enhancement diminish",()=>{
 const earlyStep=levelGrowthMultiplier(402,"hp")-levelGrowthMultiplier(401,"hp"),lateStep=levelGrowthMultiplier(3002,"hp")-levelGrowthMultiplier(3001,"hp");
 assert.ok(earlyStep>lateStep*2,"late level growth should be strongly diminished");
 const levelItem=level=>({level,plus:0});assert.ok(equipmentStatMultiplier(levelItem(251))-equipmentStatMultiplier(levelItem(250))>equipmentStatMultiplier(levelItem(1001))-equipmentStatMultiplier(levelItem(1000)));
 assert.equal(equipmentRequiredMonsterLevel({level:600,ruleOverrides:{}}),300);assert.equal(equipmentRequiredMonsterLevel({level:600,ruleOverrides:{signature:true}}),1);
 assert.ok(equipmentDropLevelForFloor(500,{random:()=>0})>=475);assert.ok(equipmentDropLevelForFloor(500,{random:()=>1})<=525);assert.ok(equipmentDropLevelForFloor(500,{boss:true,random:()=>1})<=580);
});

test("late Abyss-tree rewards become materially richer and ATK means both attack classes",async()=>{
 assert.equal(abyssExpansionRewardScale(0),1);assert.equal(abyssExpansionRewardScale(8),1.25);assert.equal(abyssExpansionRewardScale(16),1.5);assert.equal(abyssExpansionRewardScale(24),2);assert.equal(abyssExpansionRewardScale(30),2.5);
 const[tree,monster]=await Promise.all([read("src/core/AbyssSkillTreeSystem.js"),read("src/models/Monster.js")]);assert.match(tree,/物理・魔法ATK/);assert.match(monster,/if\(key==="atk"\)result\.matk/);
});

test("Rion is Nature, Tetrapod cannot lifesteal, and refresh keeps the current route",async()=>{
 assert.equal(MYTHIC_SERIAL_SPECIES.myth_rion.element,"nature");assert.equal(MYTHIC_SERIAL_SPECIES.myth_yori.authoredSkills.find(skill=>skill.id==="yori_tetrapod").noLifeSteal,true);
 const main=await read("src/main.js");assert.match(main,/SCREEN_SESSION_KEY/);assert.match(main,/inviteKey&&inviteKey!==lastInvite/);assert.match(main,/else if\(restored&&REFRESHABLE_SCREENS\.has\(restored\)\)screen=restored/);assert.match(main,/!skill\.noLifeSteal/);assert.match(main,/前衛／後衛による補正はありません/);
});
