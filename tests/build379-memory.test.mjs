import test from 'node:test';import assert from 'node:assert/strict';
import {SaveService} from '../src/services/SaveService.js';
import {royalState,beginRoyalAttempt,settleRoyalAttempt,abandonRoyalAttempt} from '../src/core/RoyalChamberSystem.js';
import {memoryProgress,memoryLevel} from '../src/core/RoyalMemory379.js';
import {applyCampaignHeroLoadout} from '../src/core/CampaignHeroLoadoutSystem.js';
import {tuneFinalHero} from '../src/core/Postgame361System.js';
import {fieldFixture} from './helpers/chapterTwoField.mjs';
function fresh(){const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};const save=new SaveService();save.state.campaign100.finalCompleted=true;return save;}
test('memory levels unlock by highest defeated stage, replay does not advance, and defeats restore supplies',()=>{
 const save=fresh(),s=save.state,l=s.campaign100.heroEncounters310;royalState(s);assert.deepEqual(memoryProgress(s),{best:0,unlocked:1});assert.equal(beginRoyalAttempt(s,l,{memory:true,stage:2}),false);
 for(const [stage,won,resultId]of [[1,true,'a'],[1,true,'b'],[2,false,'c'],[2,true,'d']]){assert.equal(beginRoyalAttempt(s,l,{memory:true,stage}),true);assert.equal(royalState(s).attempt.memoryLevel379,memoryLevel(stage));s.inventory.potions=0;const result=settleRoyalAttempt(s,{won,resultId});assert.equal(result.stage,stage);assert.equal(royalState(s).attempt,null);if(resultId!=='d')assert.equal(memoryProgress(s).unlocked,2);}
 assert.equal(memoryProgress(s).unlocked,3);assert.equal(settleRoyalAttempt(s,{won:true,resultId:'d'}).duplicate,true);assert.equal(memoryProgress(s).unlocked,3);save.save();const reload=new SaveService();assert.equal(memoryProgress(reload.state).best,2);assert.equal(beginRoyalAttempt(reload.state,l,{memory:true,stage:3}),true);abandonRoyalAttempt(reload.state);assert.equal(memoryProgress(reload.state).best,2);
});
test('legacy victories migrate once, old in-flight battle keeps its stage, and level cap is explicit',()=>{const s=fresh().state,r=royalState(s);r.memoryWins=4;s.campaign100.revengeBest361=6;assert.equal(memoryProgress(s).unlocked,7);r.memoryWins=200;assert.equal(memoryProgress(s).unlocked,7);r.attempt={memory:true,stage:7,items:{},gold:0};settleRoyalAttempt(s,{won:true,resultId:'legacy'});assert.equal(memoryProgress(s).unlocked,8);r.memoryCleared379=19;assert.equal(memoryProgress(s).unlocked,19);assert.equal(memoryLevel(19),10000);assert.equal(beginRoyalAttempt(s,{}, {memory:true,stage:20}),false);});
test('selected memory level creates actual stronger hero stats; first encounter scaling remains the same',()=>{
 let previous=0;for(const level of [1000,1500,2000,2500,10000]){const enemy={campaignHeroId:'myth_enami',level};applyCampaignHeroLoadout(enemy);tuneFinalHero(enemy,{count:4,stage:1});assert.equal(enemy.level,level);assert.ok(enemy.maxHp>previous);assert.equal(enemy.hp,enemy.maxHp);previous=enemy.maxHp;}
});
test('auto remains on after clearing and still walks to a remaining objective',()=>{const f=fieldFixture(0);try{f.run.defeated=['patrol','west','east','heart'];f.run.completed=true;f.g.chapterTwoToggleAuto();f.tick(2);assert.equal(f.run.auto377,true);assert.ok(f.g.player.path.length>0);f.g.chapterTwoToggleAuto();assert.equal(f.run.auto377,false);}finally{f.cleanup()}});
test('auto walks towards an enemy in an uncleared room',()=>{const f=fieldFixture(1);try{f.g.chapterTwoToggleAuto();f.tick(60);assert.equal(f.run.auto377,true);assert.equal(f.contacts[0]?.type,'enemy');}finally{f.cleanup()}});
