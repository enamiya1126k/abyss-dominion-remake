import test from"node:test";
import assert from"node:assert/strict";
import fs from"node:fs";
import{RAID_EXCLUSIVE_MAGIC_CIRCLE_IDS,isRaidExclusiveMagicCircle,magicCircleLevelCapForFloor,magicCircleLevelEffect,rollEnemyMagicCircle}from"../src/core/MagicCircleSystem.js";
import{magicCircleUnlockForNode}from"../src/core/AbyssSkillTreeSystem.js";
import{equipmentHolderRateForFloor,equipmentSlotsForFloor}from"../src/core/EnemyScalingSystem.js";
import{rollTreasureChestReward}from"../src/core/TreasureSystem.js";
import{idleReturnPreview,claimIdleReturn}from"../src/core/ReturnRewardSystem.js";

test("three strongest circles are raid-only and never roll on ordinary enemies",()=>{
 assert.deepEqual([...RAID_EXCLUSIVE_MAGIC_CIRCLE_IDS],["reincarnation","raid_zero_sovereign","raid_vajra_beast"]);
 assert.equal(magicCircleUnlockForNode("exploration-fate-compass-12"),null);
 for(const id of RAID_EXCLUSIVE_MAGIC_CIRCLE_IDS)assert.equal(isRaidExclusiveMagicCircle(id),true);
 for(let i=0;i<20;i++)assert.equal(isRaidExclusiveMagicCircle(rollEnemyMagicCircle(10000,{force:true,random:()=>i/20})?.id),false);
});

test("raid circle effects sit clearly above ordinary circles",()=>{
 assert.ok(magicCircleLevelEffect("raid_zero_sovereign",1).shieldRate>magicCircleLevelEffect("aegis",99).shieldRate);
 assert.ok(magicCircleLevelEffect("raid_vajra_beast",1).damagePerHit>magicCircleLevelEffect("blood_acceleration",99).damagePerHit);
 assert.equal(magicCircleLevelEffect("reincarnation",99).reviveHpRate,1);
});

test("circle upgrades have no reached-floor cap",()=>{
 for(const floor of[1,20,100,1000,10000])assert.equal(magicCircleLevelCapForFloor(floor),99);
});

test("enemy loadouts follow authored level bands",()=>{
 assert.equal(equipmentHolderRateForFloor(10),0);
 assert.equal(equipmentHolderRateForFloor(50),.12);
 assert.equal(equipmentSlotsForFloor(50),1);
 assert.equal(equipmentSlotsForFloor(500),4);
 assert.equal(equipmentSlotsForFloor(3000),6);
});

test("exploration and idle crystal supplies support repeat play",()=>{
 const locked=rollTreasureChestReward({floor:50,kind:"box",locked:true,random:()=>0});
 const radiant=rollTreasureChestReward({floor:50,kind:"radiant",random:()=>0});
 assert.equal(locked.crystals,12);assert.equal(radiant.crystals,4);
 const now=10_000_000,state={player:{maxFloor:50,currentFloor:50,gold:0,crystals:0},equipment:[],reserveEquipment:[],bossEquipmentVault:[],returnRewards:{idle:{lastClaimAt:now-3_600_000,lastGoldClaimAt:now-300_000,lastCrystalClaimAt:now-3_600_000,lastEquipmentClaimAt:now}}};
 const preview=idleReturnPreview(state,now);assert.equal(preview.crystals,2);claimIdleReturn(state,now);assert.equal(state.player.crystals,2);
});

test("requested UI routes and offline cache are present",()=>{
 const main=fs.readFileSync(new URL("../src/main.js",import.meta.url),"utf8"),formation=fs.readFileSync(new URL("../src/ui/screens/FormationScreen.js",import.meta.url),"utf8"),home=fs.readFileSync(new URL("../src/ui/screens/HomeScreen.js",import.meta.url),"utf8");
 assert.match(main,/POWER_RANKING_CACHE_KEY/);assert.match(main,/サーバーオフライン・前回の記録/);
 assert.match(formation,/設定中魔法陣/);assert.match(main,/data-formation-circle/);
 assert.match(home,/is-floor-boss/);
});
