import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{teamBattleTargetProfile,balanceTeamBattleEnemies}from"../src/core/TeamBattleBalanceSystem.js";
import{magicCircleLevelCapForFloor,magicCircleProgressionStatus}from"../src/core/MagicCircleSystem.js";
import{abyssSkillNodeById,canLearnAbyssSkill}from"../src/core/AbyssSkillTreeSystem.js";

test("4対4は実際の部隊能力から最低耐久と攻撃力を再計算",()=>{
 const party=[{hp:5125,atk:900,matk:700,def:520,mdef:460,spd:95},{hp:1422,atk:620,matk:700,def:310,mdef:420,spd:240},{hp:1847,atk:760,matk:920,def:380,mdef:510,spd:164},{hp:3125,atk:850,matk:540,def:600,mdef:440,spd:130}],enemies=["leader","guardian","support","disruptor"].map(teamBattleRole=>({teamBattleRole,maxHp:500,hp:500,atk:80,matk:80,def:60,mdef:60,spd:40})),profile=teamBattleTargetProfile(party,6);
 balanceTeamBattleEnemies(enemies,party,6);
 assert.equal(profile.hpRatio,2.25);
 assert.ok(enemies.reduce((sum,enemy)=>sum+enemy.maxHp,0)>=Math.round(profile.partyHp*profile.hpRatio)-3);
 assert.ok(enemies.every(enemy=>enemy.atk>=profile.avgDef*.9));
 assert.ok(enemies.find(enemy=>enemy.teamBattleRole==="disruptor").spd>enemies.find(enemy=>enemy.teamBattleRole==="guardian").spd);
});

test("魔法陣の強化上限は到達階層に依存しない",()=>{
 assert.deepEqual([1,20,40,60,80,100,200,500,1000,5000].map(magicCircleLevelCapForFloor),[99,99,99,99,99,99,99,99,99,99]);
 assert.equal(magicCircleProgressionStatus({player:{maxFloor:40}},6).atCap,false);
 assert.equal(magicCircleProgressionStatus({player:{maxFloor:60}},6).atCap,false);
});

test("深淵ツリーは順路判定を優先し、既習得ノードを保護",()=>{
 const node=abyssSkillNodeById("economy-gold-sense"),locked={player:{gold:999999,maxFloor:4},abyssSkillTree:{version:8,learned:[],grandfathered:[],paidCosts:{},investedGold:0},monsters:[],party:[],magicCircles:{unlocked:{},instances:[],owned:{},goldSpent:0,version:4}};
 assert.equal(node.unlockFloor,5);assert.equal(canLearnAbyssSkill(locked,node.id).ok,true);
 const learned={...locked,player:{...locked.player,maxFloor:1},abyssSkillTree:{...locked.abyssSkillTree,learned:[node.id],grandfathered:[node.id],paidCosts:{[node.id]:1000},investedGold:1000}};
 assert.equal(canLearnAbyssSkill(learned,node.id).reason,"learned");
});

test("報酬連鎖・初心者10連・4対4AIがBuild316へ接続済み",async()=>{
 const[achievement,collection,main,endgame,ai,index]=await Promise.all(["../src/core/AchievementRewardSystem.js","../src/core/CollectionRewardSystem.js","../src/main.js","../src/core/EndgameSystem.js","../src/battle/EnemyAI.js","../index.html"].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
 assert.match(achievement,/captures:number\(state\?\.records\?\.captures\)/);assert.match(achievement,/maxFloor<entry\.rewardUnlockFloor/);
 assert.match(collection,/collectionMilestoneUnlockFloor/);assert.match(collection,/maxFloor\)<collectionMilestoneUnlockFloor/);
 assert.match(main,/beginnerTopTierSeen/);assert.match(main,/pityRarity="UR"/);assert.match(main,/balanceTeamBattleEnemies/);
 assert.match(endgame,/teamBattleRole:"leader"/);assert.match(endgame,/supportPlan=/);assert.match(ai,/function teamBattleAction/);assert.match(ai,/packRevive/);assert.match(index,/ASSET_BUILD = "build316"/);
});
