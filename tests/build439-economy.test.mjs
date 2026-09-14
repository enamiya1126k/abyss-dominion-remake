import '../src/battle/ChapterTwoAbilityRuntime408.js';
import '../src/battle/PairSynergy409.js';
import '../src/battle/SingleTraits410.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {SaveService} from '../src/services/SaveService.js';
import {createMonster} from '../src/models/Monster.js';
import {allLearnedSkills,skillProgressFor,SKILL_MASTERY_MAX_LEVEL} from '../src/battle/SkillSystem.js';
import {recordFloorBossDiscovery,spendFloorBossFragments,floorBossChallengeStatus} from '../src/core/FloorBossChallengeSystem.js';
import {FLOOR_BOSS_CATALOG} from '../src/data/floorBosses.js';
import {endgameContractStatus,attemptEndgameContract,emergencyFragmentStatus,craftEndgameEquipment,normalizeEndgameState} from '../src/core/EndgameSystem.js';
import {ENDGAME_BOSSES} from '../src/core/EndgameSystem.js';
import {maxSummons439,validSummonCount439,summonLevel439} from '../src/core/SummonLimits439.js';
import {captureTrainingOffer439,trainWithCapture439} from '../src/core/CaptureTraining439.js';
import {roleRoster436,roleCandidates436,roleDetail436} from '../src/ui/RoleGuide436.js';
import {worldRaidRankingView429} from '../src/worldRaid/WorldRaidRankingView429.js';
import {fixture430,reserve430} from '../tools/build430/offline-fixture.mjs';
import {WorldRaidCoordinator437} from '../online-server/src/WorldRaidCoordinator437.js';
import {WorldRaidReplay430} from '../src/worldRaid/WorldRaidReplay430.js';
import {drawChapterTwoGacha397} from '../src/chapterTwo/ChapterTwoGacha397.js';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
function fixture(){memory.clear();const s=new SaveService().state;s.player.inRun=false;delete s.activeBattle;s.player.maxFloor=1000;s.inventory.abyssKeys=100;s.inventory.captureCrystals=1000;return s;}
const price=n=>10*(n===1?5:Math.ceil(n*4.5));
test('summon maximum follows actual rounded price, capacity and empty resources, including counts above 100',()=>{
 const s={player:{crystals:10542},monsters:[],equipment:[]};assert.equal(maxSummons439(s,'monster',price),234);assert.equal(price(234),10530);assert.ok(price(235)>10542);
 s.equipment=Array(490);assert.equal(maxSummons439(s,'equipment',price),10);s.monsters=Array(2997);assert.equal(maxSummons439(s,'monster',price),3);assert.equal(maxSummons439(s,'mixed',price),13);
 s.player.crystals=49;assert.equal(maxSummons439(s,'monster',price),0);s.player.crystals=50;assert.equal(maxSummons439(s,'monster',price),1);s.player.crystals=89;assert.equal(maxSummons439(s,'monster',price),1);s.player.crystals=90;assert.equal(maxSummons439(s,'monster',price),2);
 s.player.crystals=1e9;s.monsters=[];assert.equal(maxSummons439(s,'monster',price),3000);
});
test('manual count rejects zero, empty, fractional, nonfinite and unaffordable values without clamping or charging',()=>{for(const n of ['',0,-1,1.5,Infinity,NaN,'abc',235])assert.equal(validSummonCount439(n,234),null);assert.equal(validSummonCount439('234',234),234);});
test('new summon levels include both endpoints, floor odd values, and never modify owned items',()=>{
 const s={player:{maxFloor:101},monsters:[{level:10000}],equipment:[{level:5000}]},before=structuredClone(s);
 assert.equal(summonLevel439(s,'monster',()=>0),1010);assert.equal(summonLevel439(s,'monster',()=>1),1515);assert.equal(summonLevel439(s,'equipment',()=>1),2020);assert.deepEqual(s,before);assert.equal(summonLevel439({player:{maxFloor:0}},'monster',()=>0),10);
});
for(const reward of ['monster','weapon','armor','accessory'])test(`floor ${reward} exchange costs existing fragments plus 5 keys; insufficient keys cannot grant`,()=>{
 const s=fixture(),id=FLOOR_BOSS_CATALOG[0].id;recordFloorBossDiscovery(s,id);s.floorBossChallenges.fragments[id]=100;s.inventory.abyssKeys=4;assert.equal(spendFloorBossFragments(s,id,reward).ok,false);assert.equal(s.floorBossChallenges.fragments[id],100);assert.equal(s.inventory.abyssKeys,4);
 s.inventory.abyssKeys=5;const r=spendFloorBossFragments(s,id,reward);assert.ok(r.ok);assert.equal(r.keyCost,5);assert.equal(s.inventory.abyssKeys,0);assert.equal(s.floorBossChallenges.fragments[id],reward==='monster'?50:80);assert.equal(floorBossChallengeStatus(s,id).keysEnough,false);
 if(reward==='monster'){s.inventory.abyssKeys=5;assert.equal(spendFloorBossFragments(s,id,reward).ok,false);assert.equal(s.inventory.abyssKeys,5);}
});
for(const [faction,keys]of [['abyss',10],['tenGod',15]])for(const type of ['contract','equipment'])test(`${faction} ${type}: keys ${keys}, correct fragments, one atomic charge`,()=>{
 const s=fixture(),id=Object.values(ENDGAME_BOSSES).find(b=>b.faction===faction).id,e=normalizeEndgameState(s).emergency;e.fragments[id]=1000;s.inventory.abyssKeys=keys-1;
 const action=()=>type==='contract'?attemptEndgameContract(s,id):craftEndgameEquipment(s,id);const before=e.fragments[id],failed=action();assert.equal(type==='contract'?failed.success:failed.ok,false);assert.equal(e.fragments[id],before);assert.equal(s.inventory.abyssKeys,keys-1);
 s.inventory.abyssKeys=keys;const r=action();assert.ok(type==='contract'?r.success:r.ok);assert.equal(r.keyCost,keys);assert.equal(s.inventory.abyssKeys,0);assert.equal(e.fragments[id],before-r.spent);
 assert.equal(type==='contract'?endgameContractStatus(s,id).canContract:emergencyFragmentStatus(s,id).canCraft,false);
});
test('affection training charges proportionally at cap and preserves current HP/MP and all existing levels',()=>{
 const s=fixture(),m=createMonster('slime',{level:1});s.monsters=[m];m.affection=m.bond=995;m.currentHp=2;m.currentMp=1;const r=trainWithCapture439(s,m.id,'affection');assert.ok(r.ok);assert.equal(r.cost,25);assert.equal(r.amount,5);assert.equal(s.inventory.captureCrystals,975);assert.equal(m.affection,1000);assert.equal(m.bond,1000);assert.equal(m.currentHp,2);assert.equal(m.currentMp,1);assert.equal(m.level,1);
 const before=JSON.stringify(s);assert.equal(trainWithCapture439(s,m.id,'affection').ok,false);assert.equal(JSON.stringify(s),before);
});
test('skill training works for learned unequipped skills, advances mastery, never increments actual uses',()=>{
 const s=fixture(),m=createMonster('slime',{level:200});s.monsters=[m];m.skillLoadoutInitialized=true;m.equippedSkills=[];const skill=allLearnedSkills(m)[0],p=skillProgressFor(m,skill.id);p.exp=90;p.uses=7;
 const r=trainWithCapture439(s,m.id,'skill',skill.id);assert.ok(r.ok);assert.equal(r.cost,100);assert.equal(p.level,2);assert.equal(p.exp,10);assert.equal(p.uses,7);assert.deepEqual(m.equippedSkills,[]);
 p.level=10;const before=JSON.stringify(s);assert.equal(trainWithCapture439(s,m.id,'skill',skill.id).ok,false);assert.equal(JSON.stringify(s),before);
});
test('training cannot spend while exploring, with missing crystal stock, or on unlearned skill',()=>{
 const s=fixture(),m=createMonster('slime',{level:1});s.monsters=[m];s.inventory.captureCrystals=99;const before=JSON.stringify(s);assert.equal(trainWithCapture439(s,m.id,'affection').ok,false);assert.equal(trainWithCapture439(s,m.id,'skill','made-up').ok,false);assert.equal(JSON.stringify(s),before);
 s.inventory.captureCrystals=100;s.player.inRun=true;assert.equal(captureTrainingOffer439(s,m.id,'affection').ok,false);
});
test('second chapter gacha uses the same floor level range without changing rarity distribution or price',()=>{
 const s=fixture();s.player.maxFloor=100;s.campaign100.finalCompleted=true;s.player.crystals=1000;const r=drawChapterTwoGacha397(s,10,{random:()=>.999999});assert.ok(r.ok);assert.equal(s.player.crystals,0);for(const item of r.results){assert.equal(item.item.level,1500);assert.equal(item.rarity,'神話');}
});
test('role list includes unequipped learned skills, exposes explicit actions only in editable mode, and remains read-only',()=>{
 const s=fixture(),m=createMonster('ch2_shion',{level:1000});m.equippedSkills=[];m.skillLoadoutInitialized=true;s.monsters=[m];s.party=[];const before=JSON.stringify(s),entry=roleCandidates436(roleRoster436(s),'healDown')[0];assert.ok(entry.matches.some(r=>r.learned&&!r.equipped));assert.match(roleDetail436(entry,'healDown',{editable:true}),/data-role-equip439/);assert.doesNotMatch(roleDetail436(entry,'healDown'),/data-role-equip439/);assert.equal(JSON.stringify(s),before);
});
test('raid ranking cards keep exact damage, ties, safe player names and real character art',()=>{
 const data={campaign:{sequence:1,bossName:'boss'},mine:null,rows:[{rank:1,playerId:'self',name:'<script>alert(1)</script>',damage:100000000000,portrait439:{speciesId:'slime',name:'スライム'}},{rank:1,playerId:'other',name:'同順位',damage:100000000000},{rank:3,playerId:'third',name:'3位',damage:1}],page:0,pageSize:20,total:3,latestSequence:1};
 const html=worldRaidRankingView429(data,{supported:true,playerId:'self'});assert.equal((html.match(/raid-ranking-row439 podium-1/g)||[]).length,2);assert.match(html,/100000000000/);assert.match(html,/is-self/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.match(html,/raid-portrait-placeholder439/);
});
test('online rank portraits survive disconnect without storing combat information',()=>{
 const f=fixture430();f.c=new WorldRaidCoordinator437({sessions:f.sessions,now:f.now,send:(id,m)=>f.messages.push({id,...m})});assert.ok(f.c.start(f.a,{requestId:'portrait-439-online',campaignId:f.c.ledger.state.current.id}).ok);const c=f.c.ledger.state.current;c.contribution[f.a.playerId].damage=10;f.c.rankingCache429.clear();f.c.ranking429(f.a);const p=f.messages.at(-1).rows[0].portrait439;assert.ok(p.speciesId);assert.equal(p.skills,undefined);assert.equal(p.battleStats,undefined);f.sessions.delete(f.a.playerId);f.c.ranking429(f.b);assert.deepEqual(f.messages.at(-1).rows[0].portrait439,p);
});
test('offline ticket preserves display portrait with unchanged verified replay and duplicate protection',()=>{
 const f=fixture430();f.c=new WorldRaidCoordinator437({sessions:f.sessions,now:f.now,send:(id,m)=>f.messages.push({id,...m})});const [t]=reserve430(f);assert.ok(t.portrait439);const r=new WorldRaidReplay430(t);let i=0;while(!r.ended&&i++<220)r.step({kind:'advance',round:r.room.raid.round});assert.ok(r.ended);assert.ok(f.c.submit430(f.a,{ticketId:t.id,commands:r.commands}).ok);assert.equal(f.c.submit430(f.a,{ticketId:t.id,commands:r.commands}).duplicate,true);f.c.ranking429(f.a);assert.ok(f.messages.at(-1).rows[0].portrait439);
});
