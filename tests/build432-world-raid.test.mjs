import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture430,finish430} from '../tools/build430/offline-fixture.mjs';
import {WorldRaidCoordinator432} from '../online-server/src/WorldRaidCoordinator432.js';
import {WorldRaidBattle432} from '../online-server/src/WorldRaidBattle432.js';
import {newWorldRaidCampaign428} from '../online-server/src/WorldRaidStore428.js';
import {RAID_CIRCLES432,sharedCircle432} from '../src/worldRaid/WorldRaidRules432.js';
import {magicCircleById,magicCircleLevelEffect} from '../src/core/MagicCircleSystem.js';
import {WorldRaidReplay430,createOfflineTicketBattle430} from '../src/worldRaid/WorldRaidReplay430.js';
function setup(){const f=fixture430();f.c=new WorldRaidCoordinator432({sessions:f.sessions,random:()=>.5,now:f.now,send:(id,m)=>f.messages.push({id,...m})});return f;}
function start(f,who=f.a,key='build432-start-00001'){const r=f.c.start(who,{requestId:key,campaignId:f.c.ledger.state.current.id});assert.equal(r.ok,true);const a=f.c.active(who.playerId);f.c.auto(who,{attemptId:a.id,round:1,enabled:false});return a;}
function attack(f,who=f.a){const a=f.c.active(who.playerId);return f.c.action(who,{attemptId:a.id,round:a.room.raid.round,kind:'attack',enemyTargetId:a.room.raid.boss.id});}
test('all three bosses equip the exchange-exclusive circle; matching children are Lv100 and unequipped',()=>{
 const f=setup();for(const sequence of [1,2,3]){const engine=new WorldRaidBattle432({session:f.a,random:()=>.5,now:f.now}),raid=engine.create(f.a,newWorldRaidCampaign428(sequence,f.now()),'preview').room.raid,def=RAID_CIRCLES432[raid.boss.id];
  assert.equal(raid.boss.circleId,def.id);assert.equal(raid.boss.magicCircleName,magicCircleById(def.id).name);assert.equal(raid.boss.magicCircleAsset,def.asset);
  assert.equal(raid.minions.length,2);for(const child of raid.minions){assert.equal(child.level,100);assert.equal(child.circleId,'none');assert.equal(child.magicCircleAsset,null);assert.match(child.id,new RegExp('^'+raid.weeklyBoss.subBoss.id));}
  const native=magicCircleLevelEffect(magicCircleById(def.id),1);for(const field of ['reviveHpRate','shieldRate','damagePerHit','maxDamageBonus','firstChainHits','secondChainHits'])if(def[field]!=null)assert.equal(def[field],native[field]);
 }
});
test('revival happens once for the shared boss, then a second death settles rewards and advances once',()=>{
 const f=setup();f.c.ledger.transact(s=>{s.current.hp=1;return {ok:true};});start(f);assert.equal(attack(f).ok,true);
 let c=f.c.ledger.state.current;assert.equal(c.sequence,1);assert.equal(c.hp,Math.floor(c.maxHp*.7));assert.equal(c.circle432.reviveUsed,true);assert.equal(f.c.ledger.state.history.length,0);assert.equal(Object.keys(f.c.ledger.state.rewards429).length,0);
 const a=f.c.active(f.a.playerId);f.c.retreat(f.a,{attemptId:a.id,round:a.room.raid.round});f.c.ledger.transact(s=>{s.current.hp=1;return {ok:true};});start(f,f.b,'build432-start-00002');attack(f,f.b);
 assert.equal(f.c.ledger.state.current.sequence,2);assert.equal(f.c.ledger.state.history.length,1);assert.equal(f.c.ledger.state.history[0].killerId,f.b.playerId);assert.ok(f.c.ledger.state.history[0].settlement429);
});
test('shield damage counts as contribution and the shield is shared between independent attempts',()=>{
 const f=setup();f.c.ledger.transact(s=>{s.current=newWorldRaidCampaign428(2,f.now());return {ok:true};});start(f);attack(f);const c=f.c.ledger.state.current,shield=c.circle432.shield;
 assert.equal(c.hp,c.maxHp);assert.ok(shield<c.maxHp);assert.equal(c.contribution[f.a.playerId].damage,c.maxHp-shield);
 start(f,f.b,'build432-shield-0002');attack(f,f.b);assert.ok(f.c.ledger.state.current.circle432.shield<shield);assert.equal(f.c.ledger.state.current.hp,c.maxHp);
 const state=f.c.snapshot(f.a.playerId);assert.ok(state.attempt.raid.performance432[f.a.playerId].damage>0);
});
test('thunder circle increases boss damage and chains only the boss, while the first five rounds remain quiet',()=>{
 const f=setup(),engine=new WorldRaidBattle432({session:f.a,random:()=>.5,now:f.now}),raid=engine.create(f.a,newWorldRaidCampaign428(3,f.now()),'thunder').room.raid,target=Object.values(raid.players)[0];
 raid.circle432.hits=5;raid.round=5;const waiting=[];engine._resolveBoss(raid,waiting);assert.equal(waiting.length,0);
 const bossEvents=[];engine._damagePlayer(raid,raid.boss,target,100,bossEvents,'test');assert.equal(bossEvents.filter(e=>e.kind==='enemyDamage').length,3);assert.equal(bossEvents.filter(e=>e.kind==='enemyDamage').reduce((sum,e)=>sum+e.value,0),510);
 const childEvents=[];engine._damagePlayer(raid,raid.minions[0],target,100,childEvents,'test');assert.equal(childEvents.filter(e=>e.kind==='enemyDamage').length,1);assert.equal(childEvents[0].value,100);
});
test('version-2 replay resumes identically, includes performance, and submits exactly once',()=>{
 const f=setup();assert.equal(f.c.reserve430(f.a,{requestId:'build432-reserve-0001',count:1,campaignId:f.c.ledger.state.current.id}).ok,true);const ticket=f.c._tickets430()[0];assert.equal(ticket.ruleVersion,2);
 const r=new WorldRaidReplay430(ticket);r.step({kind:'advance',round:1});const resumed=new WorldRaidReplay430(JSON.parse(JSON.stringify(ticket)));for(const command of r.commands)resumed.step(command);assert.deepEqual(resumed.snapshot(),r.snapshot());
 const complete=finish430(ticket);assert.ok(Object.keys(complete.snapshot().raid.performance432).length);assert.equal(f.c.submit430(f.a,{ticketId:ticket.id,commands:complete.commands}).ok,true);const hp=f.c.ledger.state.current.hp;assert.equal(f.c.submit430(f.a,{ticketId:ticket.id,commands:complete.commands}).duplicate,true);assert.equal(f.c.ledger.state.current.hp,hp);
});
test('previously issued version-1 tickets still run the frozen engine',()=>{
 const f=setup(),campaign=f.c.ledger.state.current,ticket={id:'legacy432',ruleVersion:1,playerId:f.a.playerId,seed:123,issuedAt:f.now(),initialRoom:createOfflineTicketBattle430(f.a,campaign,'legacy432',123,f.now(),1)};
 const r=finish430(ticket);assert.equal(r.room.raid.rules432,undefined);assert.ok(r.ended);assert.ok(r.damage>0);
});
test('failed persistence rolls back shield, HP, performance and quota together',()=>{
 const f=setup();f.c.ledger.transact(s=>{s.current=newWorldRaidCampaign428(2,f.now());return {ok:true};});start(f);const before=structuredClone(f.c.ledger.state);f.c.ledger.persistOverride=()=>false;assert.equal(attack(f).ok,false);assert.deepEqual(f.c.ledger.state,before);
});
test('late version-2 results never damage the next boss or change the last hit',()=>{
 const f=setup();f.c.reserve430(f.a,{requestId:'build432-late-00001',count:1,campaignId:f.c.ledger.state.current.id});const ticket=f.c._tickets430()[0],r=finish430(ticket);
 f.c.ledger.transact(s=>{s.current.hp=1;s.current.circle432={...sharedCircle432(s.current),reviveUsed:true};return {ok:true};});start(f,f.b,'build432-killer0001');attack(f,f.b);assert.equal(f.c.ledger.state.current.sequence,2);const hp=f.c.ledger.state.current.hp;
 f.c.submit430(f.a,{ticketId:ticket.id,commands:r.commands});assert.equal(f.c.ledger.state.current.hp,hp);assert.equal(f.c.ledger.state.history[0].killerId,f.b.playerId);assert.ok(f.c.ledger.state.history[0].settlement429);
});

test('upgrading a saved active online attempt preserves its quota, damage and issued legacy ticket',async()=>{
 const fs=await import('node:fs'),os=await import('node:os'),path=await import('node:path');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'raid-upgrade432-')),stateFile=path.join(dir,'world-raid.json');
 try{const f=fixture430({stateFile});start(f);attack(f);f.c.reserve430(f.b,{requestId:'legacy-reserved-432',count:1,campaignId:f.c.ledger.state.current.id});
  const before=f.c.snapshot(f.a.playerId),ticket=JSON.parse(JSON.stringify(f.c._tickets430()[0]));assert.equal(ticket.ruleVersion,1);
  const c=new WorldRaidCoordinator432({sessions:f.sessions,stateFile,now:f.now});const after=c.snapshot(f.a.playerId);
  assert.equal(after.remaining,before.remaining);assert.equal(after.attempt.id,before.attempt.id);assert.equal(after.attempt.damage,before.attempt.damage);assert.equal(after.campaign.hp,before.campaign.hp);assert.equal(after.attempt.raid.boss.circleId,'reincarnation');assert.deepEqual(c._tickets430()[0],ticket);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
