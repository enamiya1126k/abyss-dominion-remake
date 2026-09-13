import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {run} from '../tools/build430/native-harness.mjs';
import {SaveService} from '../src/services/SaveService.js';
import {royalState,beginRoyalAttempt,settleRoyalAttempt,abandonRoyalAttempt} from '../src/core/RoyalChamberSystem.js';
import {royalVisits434,royalSoloLevel435,beginRoyalSolo434,settleRoyalSolo434,claimRoyalGift434,royalSoloCheckpoint434} from '../src/core/RoyalHero434.js';
import {memoryProgress,memoryLevel} from '../src/core/RoyalMemory379.js';
import {motherState422,beginMother422,settleMother422} from '../src/primordial/State422.js';
import {raidQuota435} from '../src/worldRaid/WorldRaidQuota435.js';
import {fixture430,reserve430,finish430} from '../tools/build430/offline-fixture.mjs';
const heroes=['myth_enami','myth_yori','myth_hide','myth_rion'];
async function fixture(){const f=await run(heroes,['slime'],{inspect:true,level:4000}),c=f.context,s=c.save.state;c.battle=null;delete s.activeBattle;s.player.inRun=false;s.campaign100.finalCompleted=true;delete s.campaign100.royalVisits434;delete s.campaign100.royal360;royalState(s);c.save.save=()=>true;c.showToast=()=>{};return f;}
test('mother with an unread ending stays visible and can rematch after a real reload',async()=>{
 const f=await fixture(),s=f.context.save.state;s.chapterTwo376={areaClears378:{4:1}};s.primordial422={phase:'victory',cleared:true,wins:1,endingRead:false,serial:1,position:{x:10,y:19}};
 const store=new SaveService();store.state=s;assert.ok(store.save());const next=new SaveService().state,r=motherState422(next);assert.equal(r.phase,'cleared');assert.equal(r.endingRead,false);const a=beginMother422(next);assert.ok(a.ok);const gold=next.player.gold;const result=settleMother422(next,true);assert.equal(result.first,false);assert.equal(next.player.gold,gold);assert.equal(motherState422(next).phase,'cleared');
});
test('personal levels advance independently from 1500, survive saving, and losses do not advance',async()=>{
 const f=await fixture(),s=f.context.save.state;
 for(const id of heroes){assert.equal(royalSoloLevel435(s,id),1500);let hp=0;for(const level of [1500,2000,2500]){const a=beginRoyalSolo434(s,id);assert.equal(a.level435,level);const e=f.context.makeBattleEnemy({...f.context.campaignHeroBattleEntry(id),level:a.level435,royalSolo434:true});assert.equal(e.level,level);assert.ok(e.maxHp>hp);hp=e.maxHp;assert.equal(e.enemyGear.length,6);assert.ok(royalSoloCheckpoint434(s,{battleId:a.id,specialBattleType:'royalSolo434',enemies:[e]}));const result=settleRoyalSolo434(s,{id:a.id,won:true});assert.equal(result.nextLevel,level+500);assert.equal(settleRoyalSolo434(s,{id:a.id,won:true}).ok,false);}
 const loss=beginRoyalSolo434(s,id);settleRoyalSolo434(s,{id:loss.id,won:false});assert.equal(royalSoloLevel435(s,id),3000);}
 const store=new SaveService();store.state=s;assert.ok(store.save());const loaded=new SaveService().state;for(const id of heroes)assert.equal(royalSoloLevel435(loaded,id),3000);assert.equal(loaded.equipment.filter(e=>e.obtainedMethod==='royalSolo434').length,4);
});
test('434 reward flags and an in-flight Lv1000 fight migrate without duplicated gifts or inferred wins',async()=>{
 const f=await fixture(),s=f.context.save.state;s.campaign100.royalVisits434={gifts:{myth_enami:true},victories:{myth_enami:true},serial:4};assert.equal(royalSoloLevel435(s,heroes[0]),1500);assert.equal(claimRoyalGift434(s,heroes[0]).amount,0);
 const a=beginRoyalSolo434(s,heroes[0]);delete royalVisits434(s).attempt.level435;const r=settleRoyalSolo434(s,{id:a.id,won:true});assert.equal(r.reward,null);assert.equal(r.level,1000);assert.equal(r.nextLevel,1500);
});
test('failed personal result save rolls back the stage, reward and receipt; retry advances once',async()=>{
 const {context:c}=await fixture(),a=beginRoyalSolo434(c.save.state,heroes[0]);c.save.save=()=>false;const bad=c.chapterTwoCommit(()=>settleRoyalSolo434(c.save.state,{id:a.id,won:true}));assert.equal(bad.ok,false);assert.equal(royalSoloLevel435(c.save.state,heroes[0]),1500);assert.ok(royalVisits434(c.save.state).attempt);assert.equal(royalVisits434(c.save.state).victories[heroes[0]],undefined);c.save.save=()=>true;const good=c.chapterTwoCommit(()=>settleRoyalSolo434(c.save.state,{id:a.id,won:true}));assert.ok(good.ok);assert.equal(good.nextLevel,2000);
});
test('native personal menu starts the selected hero at the saved challenge level',async()=>{
 const {context:c}=await fixture();let entries,options;c.stopGame=()=>{};c.startSpecialBattle=(e,o)=>{entries=e;options=o};c.openRoyalSolo434(heroes[2],{remove(){}});assert.equal(entries[0].level,1500);assert.equal(entries[0].campaignHeroId,heroes[2]);assert.equal(options.battleId,royalVisits434(c.save.state).attempt.id);
});
test('personal maximum matches the existing 10000 battle limit',async()=>{const {context:c}=await fixture();royalVisits434(c.save.state).soloCleared435.myth_enami=9500;const a=beginRoyalSolo434(c.save.state,'myth_enami');assert.equal(a.level435,10000);settleRoyalSolo434(c.save.state,{id:a.id,won:true});assert.equal(royalSoloLevel435(c.save.state,'myth_enami'),10000);});
test('a completed original group fight unlocks 1500; default retries select the next won stage',async()=>{
 const {context:c}=await fixture(),s=c.save.state,r=royalState(s);r.memoryCleared379=0;r.memoryWins=0;assert.deepEqual(memoryProgress(s),{best:1,unlocked:2});
 for(const level of [1500,2000,2500]){assert.ok(beginRoyalAttempt(s,c.campaignHeroLedger(),{memory:true}));assert.equal(r.attempt.memoryLevel379,level);const e=c.makeBattleEnemy({...c.campaignHeroBattleEntry('myth_enami'),campaignHeroFinal:true});assert.equal(e.level,level);settleRoyalAttempt(s,{won:true,resultId:'group-'+level});}
 assert.equal(memoryLevel(memoryProgress(s).unlocked),3000);beginRoyalAttempt(s,{}, {memory:true});abandonRoyalAttempt(s);assert.equal(memoryLevel(memoryProgress(s).unlocked),3000);
 const store=new SaveService();store.state=s;assert.ok(store.save());assert.equal(memoryLevel(memoryProgress(new SaveService().state).unlocked),3000);
});
test('reserved daily slots show 3,2,1,0 while server remaining stays zero; submissions cannot inflate quota',()=>{
 const f=fixture430(),tickets=reserve430(f,f.a,3),entries=tickets.map(ticket=>({ticket,phase:'ready'})),state=f.c.snapshot(f.a.playerId);assert.equal(state.remaining,0);for(let n=3;n>=0;n--)assert.equal(raidQuota435(state,entries.slice(0,n),f.now()).remaining,n);
 const replay=finish430(tickets[0]);assert.ok(f.c.submit430(f.a,{ticketId:tickets[0].id,commands:replay.commands}).ok);assert.equal(f.c.snapshot(f.a.playerId).remaining,0);assert.equal(raidQuota435(f.c.snapshot(f.a.playerId),entries.slice(1),f.now()).remaining,2);
});
test('JST rollover lists previous-day tickets separately and never trusts yesterday cached quota',()=>{
 const now=Date.UTC(2026,8,14,15,1),old={day:'2026-09-14',remaining:2},entries=[{ticket:{day:'2026-09-14',issuedAt:now-3600000}}];assert.deepEqual(raidQuota435(old,entries,now),{fresh:false,today:0,older:1,remaining:0});assert.deepEqual(raidQuota435({day:'2026-09-15',remaining:3},entries,now),{fresh:true,today:0,older:1,remaining:3});
});
test('435 boot includes all generated art and routes updates without redirecting frozen replay code',()=>{
 const html=fs.readFileSync('index.html','utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(fs.readFileSync('world-raid-offline435-assets.json'));
 for(const p of ['src/core/RoyalMemory379.js','src/core/RoyalHero434.js','src/primordial/State422.js','src/worldRaid/WorldRaidView432.js','src/worldRaid/WorldRaidQuota435.js']){assert.ok(map['./'+p].endsWith(p==='src/worldRaid/WorldRaidView432.js'?'3.1.116-build437':'3.1.114-build435'));assert.ok(assets.includes('./'+p));}
 for(const n of ['ranking-frame','summon-banner','gift-seal'])assert.ok(assets.includes('./assets/ui/build435/'+n+'.webp'));assert.ok(!Object.keys(map).some(k=>k.includes('/runtime430/')));assert.match(html,/build435-polish.css/);
});
