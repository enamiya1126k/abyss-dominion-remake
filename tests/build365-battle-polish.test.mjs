import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {SaveService} from '../src/services/SaveService.js';
import {createMonster,totalExperience} from '../src/models/Monster.js';
import {royalState,beginRoyalAttempt,settleRoyalAttempt,abandonRoyalAttempt} from '../src/core/RoyalChamberSystem.js';
import {royalRevengeRewards,grantRoyalRevengeRewards} from '../src/core/RoyalRevengeRewards.js';
import {runBattleGaugeAnimation} from '../src/ui/BattleGaugeAnimation.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const section=(start,end)=>main.slice(main.indexOf(start),main.indexOf(end,main.indexOf(start)+start.length));
function state(){globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};const s=new SaveService().state;s.campaign100.finalCompleted=true;s.monsters=Array.from({length:4},()=>createMonster('slime',{level:1}));s.party=s.monsters.map(m=>m.id);s.player.gold=1000;s.player.crystals=25;royalState(s).phase='cleared';return s;}
test('four deployed members gain EXP including fallen members; restored supplies precede net currency reward; receipt survives reload',()=>{
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 try{const s=state();s.monsters[1].currentHp=0;const exp=s.monsters.map(totalExperience);s.inventory.potions=10;beginRoyalAttempt(s,{heroes:{}},{memory:true});s.player.gold=0;s.inventory.potions=0;
 const result=settleRoyalAttempt(s,{won:true,resultId:'win1'}),receipt=grantRoyalRevengeRewards(s,result,'win1');
 assert.equal(receipt.members.length,4);s.monsters.forEach((m,i)=>assert.equal(totalExperience(m)-exp[i],120000));assert.equal(s.player.gold,251000);assert.equal(s.player.crystals,125);assert.equal(s.inventory.potions,10);
 const before=JSON.stringify(s);grantRoyalRevengeRewards(s,result,'win1');assert.equal(JSON.stringify(s),before);assert.equal(settleRoyalAttempt(s,{won:true,resultId:'win1'}).duplicate,true);
 const saver=new SaveService();saver.state=s;assert.ok(saver.save());const loaded=new SaveService().state;assert.equal(loaded.campaign100.royal360.rewardReceipt365.resultId,'win1');assert.equal(loaded.player.gold,251000);
 assert.equal(grantRoyalRevengeRewards(loaded,{memory:true,won:true,duplicate:true},'win1'),null);
 }finally{delete globalThis.localStorage}
});
test('defeat and retreat pay nothing; higher stages increase rewards; capped wallets cannot overflow',()=>{
 for(const mode of ['loss','retreat']){const s=state(),before=s.monsters.map(totalExperience);beginRoyalAttempt(s,{heroes:{}},{memory:true});s.player.gold=0;
 if(mode==='loss'){const r=settleRoyalAttempt(s,{won:false,resultId:'loss'});assert.equal(grantRoyalRevengeRewards(s,r,'loss'),null)}else abandonRoyalAttempt(s);
 assert.equal(s.player.gold,1000);assert.equal(s.player.crystals,25);assert.deepEqual(s.monsters.map(totalExperience),before);assert.equal(royalState(s).memoryWins,0);}
 for(const key of ['experience','gold','crystals'])assert.ok(royalRevengeRewards(2)[key]>royalRevengeRewards(1)[key]);
 const s=state();s.player.gold=Number.MAX_SAFE_INTEGER-5;s.player.crystals=Number.MAX_SAFE_INTEGER-2;beginRoyalAttempt(s,{heroes:{}},{memory:true});const r=settleRoyalAttempt(s,{won:true,resultId:'cap'}),receipt=grantRoyalRevengeRewards(s,r,'cap');assert.equal(receipt.gold,5);assert.equal(receipt.crystals,2);assert.equal(s.player.gold,Number.MAX_SAFE_INTEGER);
});
test('failed final save rolls rewards back; retry commits once and shows the persisted result',()=>{
 const s=state(),ledger={heroes:{},finalArena:{}};beginRoyalAttempt(s,ledger,{memory:true});const beforeGold=s.player.gold,beforeExp=totalExperience(s.monsters[0]);let succeeds=false,shown=0;const retry={querySelector:()=>({}),remove(){}};
 const ctx=vm.createContext({battle:{battleId:'retry',party:s.monsters},save:{state:s,save:()=>succeeds},campaignHeroLedger:()=>ledger,campaignCanonicalEnding:()=>({ending:'complete'}),campaignRemainingHeroes:()=>[],royalState,beginRoyalAttempt,settleRoyalAttempt,grantRoyalRevengeRewards,cleanupUltimateBattle(){},restoreCampaignFinalParty(){},fullyRecoverParty(){},clearPartySynergy(){},normalizeCampaignState:s=>s.campaign100,recordCampaignConclusion(){},app:{insertAdjacentHTML(){}},Modal:()=>'',topModal:()=>retry,document:{querySelector:()=>null},audio:{setScene(){}},go(){},showRoyalRevengeRewards365:()=>shown++,showToast(){},activeEnemy:null,snapshot:null});
 vm.runInContext(section('function finishCampaignFinalBattle(won)','function showRoyalRevengeRewards365('),ctx);
 ctx.finishCampaignFinalBattle(true);assert.equal(ctx.save.state.player.gold,beforeGold);assert.equal(totalExperience(ctx.save.state.monsters[0]),beforeExp);assert.equal(ctx.save.state.campaign100.royal360.rewardReceipt365,undefined);assert.equal(shown,0);
 succeeds=true;ctx.finishCampaignFinalBattle(true);assert.equal(ctx.save.state.player.gold,beforeGold+250000);assert.equal(totalExperience(ctx.save.state.monsters[0]),beforeExp+120000);assert.equal(shown,1);ctx.finishCampaignFinalBattle(true);assert.equal(shown,1);
});
test('failed ultimate takes a normal action in auto, preserves manual choice, and enemy retry bypasses the same ultimate',async()=>{
 for(const side of ['auto','manual','enemy']){const u={id:'u'},calls=[];const b={party:side==='enemy'?[]:[u],auto:side==='auto',busy:true};const ctx=vm.createContext({battle:b,prepareBattleUltimates358(){},castEndgameUltimate:()=>({ok:false,reason:'条件変化'}),finishUltimateAction(){},addBattleLog(){},alert:()=>calls.push('alert'),command:kind=>calls.push(kind),enemyTurn:options=>calls.push(options.skipUltimate?'enemy-fallback':'bad')});
 vm.runInContext(section('async function performUltimate358(','async function command('),ctx);await ctx.performUltimate358(u,'skill');assert.equal(b.busy,false);assert.deepEqual(calls,[side==='auto'?'attack':side==='manual'?'alert':'enemy-fallback']);}
});
test('finishing an action releases busy state before the next action; last action reaches endRound once',async()=>{
 for(const finished of [false,true]){let advanced=0,continued=0,ended=0;const b={busy:true,actionCommitted:true};const ctx=vm.createContext({battle:b,flushUltimateEvents358:async()=>{},currentTurnEntry:()=>({type:'ally',id:'x'}),advanceQueue:()=>advanced++,queueFinished:()=>finished,endRound:()=>ended++,renderBattle(){},wait:async()=>{},continueBattleFlow:()=>{assert.equal(b.busy,false);continued++}});
 vm.runInContext(section('async function finishCurrentAction()','async function endRound()'),ctx);await ctx.finishCurrentAction();assert.equal(advanced,1);assert.equal(ended,finished?1:0);assert.equal(continued,finished?0:1);}
});
test('auto delay does not execute stale commands after auto is disabled, queue changes, or battle is replaced',async()=>{
 for(const change of ['off','queue','replace']){const u={id:'ally'},b={auto:true,busy:false,turn:1,queueIndex:0,ultimateActionKey358:'1:0:ally'};let commands=0;const ctx=vm.createContext({battle:b,sanitizeBattleParty(){},skipInvalidEntries(){},queueFinished:()=>false,currentTurnEntry:()=>({type:'ally',id:'ally'}),prepareBattleUltimates358(){},currentAlly:()=>u,renderBattle(){},prepareMagicCircleTurn:async()=>false,wait:async()=>{if(change==='off')b.auto=false;else if(change==='queue')b.queueIndex++;else ctx.battle={...b}},command:()=>commands++});
 vm.runInContext(section('async function continueBattleFlow()','function expNeed('),ctx);await ctx.continueBattleFlow();assert.equal(commands,0);}
});
test('gauge completes exactly once even if rAF never arrives; late frames cannot restart it',async()=>{
 const saved={requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};let frame,timeout,completed=0,updates=0,cancelled=0;
 try{globalThis.requestAnimationFrame=fn=>{frame=fn;return 1};globalThis.cancelAnimationFrame=()=>cancelled++;globalThis.setTimeout=fn=>{timeout=fn;return 2};globalThis.clearTimeout=()=>{};
 const promise=runBattleGaugeAnimation({duration:500,isConnected:()=>true,update:()=>updates++,complete:()=>completed++});timeout();await promise;frame(performance.now()+10000);timeout();assert.equal(completed,1);assert.equal(updates,0);assert.equal(cancelled,1);
 }finally{Object.assign(globalThis,saved)}
});
