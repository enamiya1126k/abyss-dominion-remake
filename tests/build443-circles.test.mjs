import test from 'node:test';import assert from 'node:assert/strict';
import * as C from '../src/core/MagicCircleSystem.js';
import {ABYSS_SKILL_NODES,magicCircleUnlockForNode} from '../src/core/AbyssSkillTreeSystem.js';
import {circleOffense443,circleExtraHits443} from '../src/battle/MagicCircleBalance443.js';
import {conditionalCircleMultiplier398} from '../src/data/magicCircles398.js';
import {relicDamageMultiplier394,recordRelicHit394,relicIncomingMultiplier394} from '../src/battle/ChapterTwoRelicCombat394.js';
import {run} from '../tools/build430/native-harness.mjs';
import {calculatedStats} from '../src/models/Monster.js';
import {maxMp} from '../src/battle/SkillSystem.js';
import {onlineOffense443,onlineExtraHits443,onlineOpeningShield443,onlineRevive443} from '../online-server/src/OnlineMagicCircleBalance443.js';
import {RaidCoordinator} from '../online-server/src/RaidCoordinator.js';
const profile=(id,level=1)=>({...C.magicCircleById(id),level});
const actor=(id,level=1)=>({playerId:id,circleId:id,circleEffect:C.magicCircleById(id).effect,circleLevel:level,hp:10000,maxHp:10000,mp:1000,maxMp:1000,effects:[],stats:{atk:100,def:100}});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('all 28 obtainable circles follow actual acquisition paths: 11 base / 14 upper / 3 raid',()=>{
 const count={};for(const c of C.MAGIC_CIRCLES.filter(c=>c.id!=='none')){const rank=C.magicCircleTier443(c.id).rank;count[rank]=(count[rank]??0)+1;}
 assert.deepEqual(count,{1:11,2:14,3:3});let tree=0;
 for(const n of ABYSS_SKILL_NODES){const id=magicCircleUnlockForNode(n.id);if(!id)continue;tree++;assert.equal(C.magicCircleTier443(id).rank,Number(n.id.split('-').at(-1))>=22?2:1,id);}
 assert.equal(tree,17);for(const id of C.RAID_EXCLUSIVE_MAGIC_CIRCLE_IDS)assert.equal(C.magicCircleTier443(id).rank,3);
});
test('raid offense dominates ordinary tree and specialized chapter-II offense at the same level',()=>{
 for(const level of [1,25,50,75,99]){
  const raid=circleOffense443(profile('raid_vajra_beast',level));
  assert.ok(raid>circleOffense443(profile('mana_reversal',level)));
  assert.ok(raid>circleOffense443(profile('weak_critical',level)));
  assert.ok(raid>conditionalCircleMultiplier398('ch2_hex398',level,{statuses:[{id:'poison'},{id:'burn'},{id:'sleep'}]}));
  assert.ok(raid>conditionalCircleMultiplier398('ch2_prism398',level,{elements:['fire','ice','water','earth']}));
  assert.ok(C.magicCircleLevelEffect('raid_zero_sovereign',level).shieldRate>C.magicCircleLevelEffect('aegis',99).shieldRate);
  assert.ok(circleOffense443(profile('raid_vajra_beast',level),{hits:99})>circleOffense443(profile('sole_survivor',level),{aliveCount:1}));
 }
});
test('tier comparisons include slot expected damage and capped high-GOLD builds',()=>{
 for(const level of [1,99]){const mean=Array.from({length:999},(_,i)=>C.slotDamageMultiplier(i,level)).reduce((a,b)=>a+b,0)/999;
 assert.ok(mean<C.goldPowerDamageMultiplier(1e12,level));assert.ok(C.goldPowerDamageMultiplier(1e12,level)<circleOffense443(profile('weak_critical',level)));assert.equal(C.slotDamageMultiplier(0,level),0);}
});
test('raid base damage, additive rage cap and early chain breakpoints',()=>{
 for(const [level,base,cap]of[[1,1.75,3.25],[99,2,4]]){close(circleOffense443(profile('raid_vajra_beast',level)),base);close(circleOffense443(profile('raid_vajra_beast',level),{hits:999}),cap);assert.deepEqual([0,1,2,3].map(n=>circleExtraHits443(profile('raid_vajra_beast',level),n)),[0,1,1,2]);}
 for(const id of ['reincarnation','raid_zero_sovereign']){close(circleOffense443(profile(id)),1.6);close(circleOffense443(profile(id,99)),1.85);}
});
test('every level is finite, caps remain bounded, and player/server arithmetic agrees without RNG',()=>{
 const random=Math.random;Math.random=()=>{throw Error('balance arithmetic consumed RNG')};try{
 for(const c of C.MAGIC_CIRCLES)for(const level of [1,50,99])for(const hits of [0,3,99]){const p=profile(c.id,level),e=C.magicCircleLevelEffect(c.id,level),a={...actor(c.id,level),circleRageHits:hits};assert.ok(e.summary&&!e.summary.includes('NaN'));close(circleOffense443(p,{hits}),onlineOffense443(a));assert.equal(circleExtraHits443(p,hits),onlineExtraHits443(a));for(const [k,v]of Object.entries(e))if(typeof v==='number')assert.ok(Number.isFinite(v),c.id+':'+k);}
 }finally{Math.random=random;}
});
test('chapter-II effects require actual hit, status, HP, element or MP conditions and exclude DOT',()=>{
 const a={id:'a',currentHp:100,_chapterTwoRelics394:{}},enemy={id:'e',hp:100,maxHp:100};const b={party:[a],turn:1,magicCircleProfiles:{a:profile('ch2_chain394',99)}};
 close(relicDamageMultiplier394(b,a,enemy),1);recordRelicHit394(b,a,enemy,0);close(relicDamageMultiplier394(b,a,enemy),1);recordRelicHit394(b,a,enemy,1);close(relicDamageMultiplier394(b,a,enemy),1.55);b.turn=2;close(relicDamageMultiplier394(b,a,enemy),1);
 b.magicCircleProfiles.a=profile('ch2_dream394',99);b.enemyStatuses={e:[{id:'sleep',turns:1}]};close(relicDamageMultiplier394(b,a,enemy),1.9);close(relicDamageMultiplier394(b,a,enemy,'excluded'),1);b.enemyStatuses.e=[];close(relicDamageMultiplier394(b,a,enemy),1);
 b.magicCircleProfiles.a=profile('ch2_crown394',99);enemy.hp=35;close(relicDamageMultiplier394(b,a,enemy),1.7);enemy.hp=36;close(relicDamageMultiplier394(b,a,enemy),1);
 b.magicCircleProfiles.a=profile('ch2_guard394',99);close(relicIncomingMultiplier394(b,a),1);b.guards={a:true};close(relicIncomingMultiplier394(b,a),.7);close(relicDamageMultiplier394(b,a,enemy,'counter'),1.7);
 close(conditionalCircleMultiplier398('ch2_reserve398',99,{mp:80,maxMp:100}),1.7);close(conditionalCircleMultiplier398('ch2_reserve398',99,{mp:79,maxMp:100}),1);
 close(conditionalCircleMultiplier398('ch2_hex398',99,{statuses:[{id:'poison'},{id:'poison'},{id:'burn',turns:0}]}),1.3);
});
test('native damage caller refreshes stale saved effects and applies each raid power without resetting battle state',async()=>{
 const f=await run(['slime','zombie'],['slime'],{inspect:true}),{b,party,context:c}=f,m=party[0];
 for(const [id,value]of[['raid_vajra_beast',2],['raid_zero_sovereign',1.85],['reincarnation',1.85]]){
 b.magicCircleProfiles[m.id]={...profile(id,99),levelEffect:{baseDamageRate:0,balanceVersion443:442}};m._circleRage=0;m._circleReviveUsed=true;b.circleShields[m.id]=123;b.reviveCount=2;
 close(c.magicCircleDamageMultiplier(m),value);assert.equal(m._circleReviveUsed,true);assert.equal(b.circleShields[m.id],123);assert.equal(b.reviveCount,2);assert.equal(c.circleInfo(m).levelEffect.balanceVersion443,443);
 }
});
test('native opening shield selects strongest owner in either party order; duplicates do not add',async()=>{
 const {b,party,context:c}=await run(['slime','zombie'],['slime'],{inspect:true});
 b.magicCircleProfiles[party[0].id]=profile('aegis',99);b.magicCircleProfiles[party[1].id]=profile('raid_zero_sovereign',1);
 for(const reverse of [false,true]){if(reverse)b.party.reverse();b.circleShields={};c.initializeOpeningCircleShields443();for(const m of party)assert.equal(b.circleShields[m.id],Math.floor(calculatedStats(m).hp*1.5));}
 b.magicCircleProfiles[party[0].id]=profile('raid_zero_sovereign',1);b.circleShields={};c.initializeOpeningCircleShields443();for(const m of party)assert.equal(b.circleShields[m.id],Math.floor(calculatedStats(m).hp*1.5));
});
test('native revival restores advertised HP/MP exactly once, and the used flag survives JSON reload',async()=>{
 const {b,party,context:c}=await run(['slime','zombie'],['slime'],{inspect:true}),m=party[0];b.magicCircleProfiles[m.id]=profile('reincarnation',1);m.currentHp=0;m.currentMp=0;
 assert.equal(c.tryUnyielding(m),true);assert.equal(m.currentHp,Math.floor(calculatedStats(m).hp*.85));assert.equal(m.currentMp,Math.floor(maxMp(m)*.75));assert.equal(b.reviveCount,1);
 const restored=JSON.parse(JSON.stringify(m));restored.currentHp=0;assert.equal(c.tryUnyielding(restored),false);assert.equal(b.reviveCount,1);
});
test('server shields cover all allies, pick strongest and do not add duplicates',()=>{
 const players={a:actor('aegis',99),b:actor('raid_zero_sovereign'),c:actor('raid_zero_sovereign')};onlineOpeningShield443(players);for(const p of Object.values(players))assert.equal(p.shield,15000);
});
test('server revival restores HP/MP and cannot repeat or ignore revival seal',()=>{
 const a=actor('reincarnation');a.hp=0;a.mp=0;assert.equal(onlineRevive443(a),true);assert.equal(a.hp,8500);assert.equal(a.mp,750);a.hp=0;assert.equal(onlineRevive443(a),false);
 const sealed=actor('reincarnation');sealed.hp=0;sealed.effects=[{kind:'reviveSeal',turns:2}];assert.equal(onlineRevive443(sealed),false);assert.equal(sealed.circleReviveUsed,undefined);
});
test('actual raid damage handler applies canonical revival and records rage from real HP damage only',()=>{
 const c=new RaidCoordinator({sessions:new Map(),random:()=>.5}),a=actor('reincarnation'),boss={id:'boss',hp:1e8,maxHp:1e8},r={players:{[a.playerId]:a},boss,minions:[],contribution:{[a.playerId]:{damage:0,taken:0}},progress:{hp:1e8,maxHp:1e8,totalDamage:0}};const events=[];
 c._damagePlayer(r,boss,a,20000,events,'test');assert.equal(a.hp,8500);assert.equal(a.mp,750);assert.equal(a.circleReviveUsed,true);
 const rage=actor('raid_vajra_beast');r.players={[rage.playerId]:rage};r.contribution={[rage.playerId]:{damage:0,taken:0}};rage.shield=1000;c._damagePlayer(r,boss,rage,100,[],'test');assert.equal(rage.circleRageHits,undefined);c._damagePlayer(r,boss,rage,1000,[],'test');assert.equal(rage.circleRageHits,1);
});
test('normalizing existing inventory keeps IDs, levels, ownership, GOLD and invested GOLD; no reissue or refund',()=>{
 const monsters=[{id:'a'},{id:'b'}],s={player:{gold:1234567},party:['a','b'],monsters};C.normalizeMagicCircleState(s);
 for(const id of ['raid_vajra_beast','ch2_dream394']){s.magicCircles.unlocked[id]=true;C.createMagicCircleInstance(s,id,{level:49,instanceId:'mc:'+id+':test',source:'reward',favorite:true});}C.equipMagicCircle(s,monsters[0],'raid_vajra_beast');s.magicCircles.goldSpent=999999;
 const before=JSON.parse(JSON.stringify(s));C.normalizeMagicCircleState(s);assert.deepEqual(s,before);C.normalizeMagicCircleState(s);assert.deepEqual(s,before);
});
for(const id of ['reincarnation','raid_zero_sovereign','raid_vajra_beast','ch2_chain394','ch2_hex398'])test(`native automatic battle progresses with ${id}`,async()=>{
 const result=await run(['slime','zombie'],['goblin','slime'],{level:200,circles:[id,'none'],maxRounds:10,seed:443});assert.ok(result.metrics.damage>0);assert.ok(result.rounds<=11);assert.ok(Number.isFinite(result.metrics.taken));
});
