import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {fixture430,reserve430} from '../tools/build430/offline-fixture.mjs';
import {WorldRaidCoordinator437,WorldRaidBattle437} from '../online-server/src/WorldRaidCoordinator437.js';
import {WorldRaidReplay430,createOfflineTicketBattle430,replayOffline430} from '../src/worldRaid/WorldRaidReplay430.js';
import {WorldRaidOfflineClient430} from '../src/worldRaid/WorldRaidOfflineClient430.js';
import {newWorldRaidCampaign428} from '../online-server/src/WorldRaidStore428.js';
import {WORLD_RAID_SPEEDS438,raidResultDelay438} from '../src/worldRaid/WorldRaidSpeed438.js';
import {onlineBattlePresentationDelay} from '../src/online/OnlinePartyClient.js';
import {renderSharedBattle} from '../src/online/OnlineViews.js';
const protect=r=>{for(const p of Object.values(r.players)){p.hp=p.maxHp=p.stats.hp=1e12;p.stats.def=p.stats.mdef=1e9;p.effects.push({kind:'regen',value:1,turns:999});}};
function fixture438(){const f=fixture430();f.c=new WorldRaidCoordinator437({sessions:f.sessions,now:f.now,random:()=>.5,send:(id,m)=>f.messages.push({id,...m})});return f;}
function ticket(version=3,sequence=1){const f=fixture438(),t={id:'speed438-'+version+'-'+sequence,playerId:f.a.playerId,ruleVersion:version,seed:422,issuedAt:f.now()};t.initialRoom=createOfflineTicketBattle430(f.a,newWorldRaidCampaign428(sequence,f.now()),t.id,t.seed,t.issuedAt,version);protect(t.initialRoom.raid);return t;}
function finish(t,speed){const r=new WorldRaidReplay430(t);r.step({kind:'speed',round:1,speed});let n=0;while(!r.ended&&n++<220)r.step({kind:'advance',round:r.room.raid.round});assert.ok(r.ended);return r;}
const result=r=>({round:r.room.raid.round,outcome:r.room.raid.outcome,damage:r.damage,performance:r.room.raid.performance432,players:r.room.raid.players,boss:r.room.raid.boss,minions:r.room.raid.minions});
test('shared battle UI preserves 16x and 32x labels and CSS animation timing',()=>{
 const f=fixture438(),t=ticket(),raid=t.initialRoom.raid;
 for(const speed of WORLD_RAID_SPEEDS438){raid.speed=speed;const html=renderSharedBattle({mode:'raid',room:{members:[{playerId:f.a.playerId,profile:f.a.profile}]},battle:raid,selfId:f.a.playerId,enemies:[raid.boss,...raid.minions]});assert.ok(html.includes(`data-online-speed-cycle="raid">×${speed}</button>`));assert.ok(html.includes(`--battle-lunge:${Math.round(220/speed)}ms`));}
});
test('all six speeds change result deadlines and animation duration, with no skipped round',()=>{
 const f=fixture438();for(const speed of WORLD_RAID_SPEEDS438){const e=new WorldRaidBattle437({session:f.a,now:f.now,random:()=>.5}),room=e.create(f.a,newWorldRaidCampaign428(1,f.now()),'pace-'+speed).room;protect(room.raid);assert.ok(e.setSpeed(room,f.a,speed).ok);e.advance(room);assert.equal(room.raid.round,1);assert.equal(room.raid.phase,'result');const due=room.raid.nextRoundAt;assert.equal(due-f.now(),raidResultDelay438(speed));f.setNow(due-1);e.advance(room);assert.equal(room.raid.round,1);f.setNow(due);e.advance(room);assert.equal(room.raid.round,2);assert.equal(room.raid.phase,'command');assert.equal(onlineBattlePresentationDelay(3200,speed),3200/speed);}
});
test('invalid speed and another player cannot change the clock or current speed',()=>{
 const f=fixture438(),e=new WorldRaidBattle437({session:f.a,now:f.now}),room=e.create(f.a,newWorldRaidCampaign428(1,f.now()),'invalid438').room;
 for(const s of [0,-1,8,64,NaN,Infinity,'oops'])assert.equal(e.setSpeed(room,f.a,s).ok,false);
 assert.equal(e.setSpeed(room,f.b,32).code,'LEADER_ONLY');assert.equal(room.raid.speed,1);
});
test('changing speed while an animation is in progress preserves the elapsed proportion',()=>{
 const t=ticket(),r=new WorldRaidReplay430(t);r.step({kind:'advance',round:1});const begin=r.time;r.time+=1300;r.step({kind:'speed',round:1,speed:32});assert.equal(r.room.raid.nextRoundAt-r.time,41);r.step({kind:'speed',round:1,speed:1});assert.ok(r.room.raid.nextRoundAt-r.time<=1320);assert.equal(r.room.raid.round,1);assert.ok(r.time>begin);
});
for(const sequence of [1,2,3])test(`boss ${sequence}: all six playback speeds preserve damage, effects, contribution and final round`,()=>{
 const t=ticket(3,sequence),normal=finish(t,1);assert.equal(normal.room.raid.round,sequence===3?6:99);for(const speed of WORLD_RAID_SPEEDS438)assert.deepEqual(result(finish(t,speed)),result(normal));
});
for(const version of [1,2])test(`legacy v${version} ticket keeps its original 10-round rules at new playback speeds`,()=>{
 const t=ticket(version),normal=finish(t,1);for(const speed of [4,16,32]){const r=finish(t,speed);assert.equal(r.room.raid.round,10);assert.deepEqual(result(r),result(normal));}
});
test('32x offline battle resumes from serialized commands and server accepts its result only once',()=>{
 const f=fixture438(),[t]=reserve430(f),r=finish(t,32),commands=JSON.parse(JSON.stringify(r.commands));const half=replayOffline430(t,commands.slice(0,5),{complete:false});for(const c of commands.slice(5))half.step(c);assert.deepEqual(result(half),result(r));
 const before=f.c.ledger.state.current.hp;assert.ok(f.c.submit430(f.a,{ticketId:t.id,commands}).ok);const after=f.c.ledger.state.current.hp;assert.equal(before-after,r.damage);assert.equal(f.c.submit430(f.a,{ticketId:t.id,commands}).duplicate,true);assert.equal(f.c.ledger.state.current.hp,after);assert.equal(f.c.snapshot(f.a.playerId).remaining,2);
});
test('online 32x progresses faster than 16x while charging the same quota',()=>{
 const duration=speed=>{const f=fixture438(),start=f.now();assert.ok(f.c.start(f.a,{requestId:'build438-online-speed-'+speed,campaignId:f.c.ledger.state.current.id}).ok);const a=f.c.active(f.a.playerId);assert.ok(f.c.speed(f.a,{attemptId:a.id,round:1,speed}).ok);let n=0;while(f.c.active(f.a.playerId)&&n++<5000){f.setNow(f.now()+50);f.c.advance();}assert.ok(!f.c.active(f.a.playerId));return{elapsed:f.now()-start,state:f.c.snapshot(f.a.playerId)};};
 const normal=duration(1),fast=duration(16),fastest=duration(32);assert.ok(fast.elapsed<normal.elapsed);assert.ok(fastest.elapsed<fast.elapsed);assert.equal(fastest.state.remaining,2);assert.equal(fastest.state.attempt.report.damage,normal.state.attempt.report.damage);assert.equal(fastest.state.attempt.report.rounds,normal.state.attempt.report.rounds);
});
test('offline 32x is saved with a shorter next tick and cannot run early',async()=>{
 const f=fixture438(),[t]=reserve430(f);let bank;const transport={selfId:f.a.playerId,connectionReady:false,ws:{readyState:0},_handleMessage(){},_notifyServerAvailability(){},capabilities:new Set(),_send(){return false;}};
 const c=new WorldRaidOfflineClient430({transport,getBank:()=>bank,setBank:b=>(bank=structuredClone(b),true),now:f.now,prepare:async()=>({reload:false})});f.c.ticketList430(f.a);await c.receive(f.messages.at(-1));await c.start(t.id);await c.command(t.id,{kind:'speed',round:1,speed:32});let e=c.active();assert.ok(e.nextAt-f.now()<50);const count=e.commands.length;c.tick();await c.queue;assert.equal(c.active().commands.length,count);f.setNow(e.nextAt);c.tick();await c.queue;e=c.active();assert.equal(e.commands.length,count+1);assert.equal(c.view(t.id).raid.phase,'result');assert.equal(e.nextAt-f.now(),81);
});
test('438 boot and offline assets include every new material and runtime module',()=>{
 const html=fs.readFileSync('index.html','utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(fs.readFileSync('world-raid-offline439-assets.json'));
 for(const n of ['src/main.js','src/ui/screens/EquipmentScreen.js','src/online/OnlinePartyClient.js','src/worldRaid/WorldRaidSpeed438.js','src/worldRaid/WorldRaidClient432.js','src/worldRaid/WorldRaidReplay430.js']){assert.match(map['./'+n],n==='src/main.js'?/3\.1\.118-build439$/:/3\.1\.117-build438$/);assert.ok(assets.includes('./'+n));}
 for(const n of ['frame','button','archive','raid'])assert.ok(assets.includes('./assets/ui/build438/'+n+'.webp'));for(const n of assets)assert.ok(fs.existsSync(n),n);assert.ok(!Object.keys(map).some(k=>k.includes('/runtime430/')));assert.match(html,/world-raid-offline439-sw.js/);
});
