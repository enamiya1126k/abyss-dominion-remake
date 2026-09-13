import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {WorldRaidCoordinator429} from '../online-server/src/WorldRaidCoordinator429.js';
import {WorldRaidCoordinator428} from '../online-server/src/WorldRaidCoordinator428.js';
import {sanitizeProfile} from '../online-server/src/RoomStore.js';
import {worldRaidRanking429,worldRaidRewardBreakdown429,totalWorldRaidReward429} from '../src/worldRaid/WorldRaidRewards429.js';
const profile=sanitizeProfile({displayName:'参加者',speciesId:'slime',level:1000,battleStats:{hp:100000,mp:1000,atk:20000,matk:20000,def:5000,mdef:5000,spd:1000},skills:[]});
function fixture(options={},Type=WorldRaidCoordinator429){let clock=Date.UTC(2026,8,14);const messages=[],a={playerId:'AD-AAAA-AAAA',profile,connected:true},b={playerId:'AD-BBBB-BBBB',profile,connected:true},sessions=new Map([[a.playerId,a],[b.playerId,b]]),c=new Type({sessions,now:()=>clock,random:()=>.5,send:(id,message)=>messages.push({id,...message}),...options});return {c,a,b,sessions,messages,tick:()=>{clock+=3000;c.advance();}};}
function start(f,who=f.a,key='request-429-00000001'){assert.equal(f.c.start(who,{requestId:key,campaignId:f.c.ledger.state.current.id,profile:who.profile}).ok,true);const a=f.c.snapshot(who.playerId).attempt;assert.equal(f.c.auto(who,{attemptId:a.id,round:1,enabled:false}).ok,true);return a;}
function hit(f,who=f.a){const a=f.c.snapshot(who.playerId).attempt;return f.c.action(who,{attemptId:a.id,round:a.raid.round,actorId:who.playerId,kind:'attack',enemyTargetId:a.raid.boss.id});}
const awards=f=>Object.values(f.c.ledger.state.rewards429??{});

test('same damage shares rank and reward; zero damage never ranks',()=>{
 const rows=worldRaidRanking429({contribution:{a:{damage:100},b:{damage:100},c:{damage:50},d:{damage:0}}});assert.deepEqual(rows.map(r=>r.rank),[1,1,3]);assert.deepEqual(rows.map(r=>r.share),[.4,.4,.2]);assert.deepEqual(totalWorldRaidReward429(worldRaidRewardBreakdown429(rows[0].rank)),totalWorldRaidReward429(worldRaidRewardBreakdown429(rows[1].rank)));
});
test('all ranking tier boundaries have the intended additive rewards',()=>{
 for(const [rank,fragments]of [[1,200],[2,140],[3,110],[4,80],[10,80],[11,50],[50,50],[51,30],[1000,30]])assert.equal(totalWorldRaidReward429(worldRaidRewardBreakdown429(rank)).raidMaterials,fragments);
 assert.deepEqual(totalWorldRaidReward429(worldRaidRewardBreakdown429(1,true)),{raidMaterials:250,crystals:4200,gold:6200000,experienceItemsUltra:140});
});
test('ranking accumulates across attempts and returns the personal row outside page one',()=>{
 const f=fixture();start(f);hit(f);let a=f.c.snapshot(f.a.playerId).attempt;const first=a.damage;f.c.retreat(f.a,{attemptId:a.id,round:1});start(f,f.a,'second-attempt-42901');hit(f);assert.equal(f.c.snapshot(f.a.playerId).campaign.myDamage,first*2);
 for(let i=0;i<25;i++)f.c.ledger.state.current.contribution['p'+i]={damage:first*3+i,attempts:1,name:'人'+i};f.c.rankingCache429.clear();
 f.c.ranking429(f.a,{requestId:'rank',page:0});const result=f.messages.at(-1);assert.equal(result.rows.length,20);assert.equal(result.mine.rank,26);assert.equal(result.mine.damage,first*2);assert.equal(result.rows.some(r=>r.playerId===f.a.playerId),false);
 f.c.ranking429(f.a,{page:1});assert.equal(f.messages.at(-1).rows.length,6);
});
test('simultaneous finishing requests settle every player once with exactly one last hit',async()=>{
 const f=fixture();f.c.ledger.state.current.hp=10;f.c.ledger.state.current.contribution[f.b.playerId]={damage:100,attempts:1,name:'先行者'};
 const aa=start(f),bb=start(f,f.b,'second-killer-429001');const command=(who,a)=>f.c.action(who,{attemptId:a.id,round:1,actorId:who.playerId,kind:'attack',enemyTargetId:a.raid.boss.id});
 const results=await Promise.all([Promise.resolve().then(()=>command(f.a,aa)),Promise.resolve().then(()=>command(f.b,bb))]);assert.equal(results.filter(r=>r.ok).length,1);assert.equal(f.c.ledger.state.history.length,1);assert.equal(awards(f).length,2);assert.equal(awards(f).filter(r=>r.source.lastHit).length,1);assert.equal(awards(f).find(r=>r.source.lastHit).playerId,f.a.playerId);assert.equal(awards(f).find(r=>r.playerId===f.a.playerId).source.damage,10);
 const before=JSON.stringify(awards(f));f.c.ledger.transact(s=>{f.c._settleRewards429(s,s.history[0]);return {ok:true};});assert.equal(JSON.stringify(awards(f)),before);
});
test('a past boss freezes ranks; next boss begins without carrying scores',()=>{
 const f=fixture();f.c.ledger.state.current.hp=10;start(f);hit(f);const old=awards(f)[0];start(f,f.b,'next-boss-429-00001');hit(f,f.b);f.c.ranking429(f.a,{sequence:1});const ranking=f.messages.at(-1);assert.equal(ranking.mine.rank,1);assert.equal(ranking.mine.damage,10);assert.equal(ranking.myReward.rewardId,old.rewardId);assert.equal(ranking.campaign.completedAt!=null,true);assert.equal(f.c.snapshot(f.a.playerId).campaign.myDamage,0);
});
test('disconnected contributors keep rewards, while zero-damage attempts get none',()=>{
 const f=fixture();f.c.ledger.state.current.contribution.offline={damage:75,attempts:1,name:'休憩中'};f.c.ledger.state.current.contribution.zero={damage:0,attempts:3,name:'未攻撃'};f.c.ledger.state.current.hp=10;start(f);hit(f);assert.equal(awards(f).length,2);assert.ok(awards(f).some(r=>r.playerId==='offline'));assert.ok(!awards(f).some(r=>r.playerId==='zero'));
 const session={playerId:'offline',profile,connected:true};f.sessions.set('offline',session);assert.equal(f.c.deliverRewards429(session).ok,true);assert.equal(f.messages.at(-1).entries.length,1);
});
test('save failure rolls back boss death, all rewards, scores, and next boss together',()=>{
 let writable=true;const f=fixture({persist:()=>writable});f.c.ledger.state.current.hp=10;start(f);const before=JSON.stringify(f.c.ledger.state);writable=false;assert.equal(hit(f).ok,false);assert.equal(JSON.stringify(f.c.ledger.state),before);assert.equal(awards(f).length,0);writable=true;assert.equal(hit(f).ok,true);assert.equal(awards(f).length,1);
});
test('receipt ownership, ack retry, and failed ack persistence cannot double settle or lose pending rewards',()=>{
 let writable=true;const f=fixture({persist:()=>writable});f.c.ledger.state.current.hp=10;start(f);hit(f);const reward=awards(f)[0],message={rewardId:reward.rewardId};assert.equal(f.c.acknowledgeReward429(f.b,message).ok,false);assert.equal(f.c.acknowledgeReward429({...f.a},message).ok,false);
 writable=false;assert.equal(f.c.acknowledgeReward429(f.a,message).ok,false);assert.equal(f.c._pending429(f.a.playerId).length,1);writable=true;assert.equal(f.c.acknowledgeReward429(f.a,message).ok,true);const revision=f.c.ledger.state.revision;assert.equal(f.c.acknowledgeReward429(f.a,message).duplicate,true);assert.equal(f.c.ledger.state.revision,revision);f.c.deliverRewards429(f.a);assert.equal(f.messages.at(-1).entries.length,0);
});
test('server restart preserves outstanding and acknowledged rewards with their original IDs',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'reward429-')),stateFile=path.join(dir,'raid.json');try{const f=fixture({stateFile});f.c.ledger.state.current.hp=10;start(f);hit(f);const reward=awards(f)[0];let restarted=new WorldRaidCoordinator429({stateFile,sessions:f.sessions});assert.equal(Object.values(restarted.ledger.state.rewards429)[0].rewardId,reward.rewardId);restarted.acknowledgeReward429(f.a,{rewardId:reward.rewardId});restarted=new WorldRaidCoordinator429({stateFile,sessions:f.sessions});assert.equal(restarted._pending429(f.a.playerId).length,0);assert.equal(restarted.ledger.state.history.length,1);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('Build428 completed records migrate to rewards once without resetting HP, attempts or daily count',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'migrate429-')),stateFile=path.join(dir,'raid.json');try{const f=fixture({stateFile},WorldRaidCoordinator428);f.c.ledger.state.current.hp=10;start(f);hit(f);const before=structuredClone(f.c.ledger.state),next=new WorldRaidCoordinator429({stateFile,sessions:f.sessions});assert.equal(next.ledger.state.current.hp,before.current.hp);assert.deepEqual(next.ledger.state.days,before.days);assert.equal(Object.values(next.ledger.state.rewards429).length,1);const saved=fs.readFileSync(stateFile,'utf8');new WorldRaidCoordinator429({stateFile,sessions:f.sessions});assert.equal(fs.readFileSync(stateFile,'utf8'),saved);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('ranking and reward listing require the authenticated connected session',()=>{
 const f=fixture();assert.equal(f.c.ranking429({...f.a},{}).ok,false);assert.equal(f.c.deliverRewards429({...f.a}).ok,false);assert.equal(f.c.ranking429(f.a,{sequence:999}).ok,false);assert.equal(f.c.ranking429(f.a,{sequence:1.5}).ok,false);f.a.connected=false;assert.equal(f.c.ranking429(f.a,{}).ok,false);
});

test('incomplete reward data stops delivery without overwriting the saved ledger',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'corrupt429-')),stateFile=path.join(dir,'raid.json');try{const f=fixture({stateFile});f.c.ledger.state.current.hp=10;start(f);hit(f);const damaged=JSON.parse(fs.readFileSync(stateFile,'utf8'));damaged.rewards429={};fs.writeFileSync(stateFile,JSON.stringify(damaged));const original=fs.readFileSync(stateFile,'utf8'),c=new WorldRaidCoordinator429({stateFile,sessions:f.sessions});assert.equal(c.healthy(),false);assert.equal(c.deliverRewards429(f.a).ok,false);assert.equal(fs.readFileSync(stateFile,'utf8'),original);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('backlog delivery is paged, and acknowledged pages never appear again',()=>{
 const f=fixture();for(let i=0;i<21;i++){f.c.ledger.state.current.hp=1;const day=Object.keys(f.c.ledger.state.days)[0];if(day)f.c.ledger.state.days[day][f.a.playerId]=0;start(f,f.a,'backlog-request-'+String(i).padStart(5,'0'));hit(f);}
 f.c.deliverRewards429(f.a);const first=f.messages.at(-1);assert.equal(first.entries.length,20);assert.equal(first.hasMore,true);for(const e of first.entries)assert.equal(f.c.acknowledgeReward429(f.a,{rewardId:e.rewardId}).ok,true);
 f.c.deliverRewards429(f.a);assert.equal(f.messages.at(-1).entries.length,1);assert.equal(f.messages.at(-1).hasMore,false);
});
