import test from 'node:test';
import assert from 'node:assert/strict';
import {makeLobby463,start463,settle463,action463,public463} from '../src/sugoroku/Engine463.js';
import {applyCrystal477} from '../src/sugoroku/CrystalRules477.js';
import {grant480,finish480,validReceipt480} from '../src/sugoroku/Economy480.js';
import {checkpoint474,ECONOMY474} from '../src/sugoroku/Rewards474.js';
import {settleCrystals474} from '../online-server/src/SugorokuRewards474.js';
import {handleSugoroku463} from '../online-server/src/SugorokuCoordinator463.js';
import {reserveEntry474,applyCrystalDelivery474} from '../src/sugoroku/Wallet474.js';
import {CARDS463} from '../src/sugoroku/Catalog463.js';
import {sugorokuView463,sugorokuClick463,art463} from '../src/sugoroku/View463.js';
import {defenseChoice482} from '../src/sugoroku/Defense482.js';
import {NODES463} from '../src/sugoroku/Board463.js';
function game(fee=500){const members=Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i,choice:{id:'wolf'+i,speciesId:'wolf'}})),g=makeLobby463({id:'sg463-482-1234abcd',code:'ABCDEF',partyId:'party',hostId:'p0',members,seed:3});g.economy474={mode:'crystal',fee,entries:Object.fromEntries(members.map(m=>[m.playerId,{requestId:'entry482-'+m.playerId,amount:fee}]))};start463(g,1000);return g;}
const total=g=>g.crystalReserve480+g.players.reduce((n,p)=>n+p.crystals474,0);
function give(g,p,c){const uid=Object.keys(g.cards).find(uid=>g.cards[uid]===c.id);for(const x of g.players)x.hand=x.hand.filter(u=>u!==uid);g.deck=g.deck.filter(u=>u!==uid);g.discard=g.discard.filter(u=>u!==uid);p.hand.push(uid);return uid;}
function attack(g){const [a,b]=g.players;g.step='pre';g.queue=[{type:'crystal477',mode:'steal',actor:a.playerId,target:b.playerId,group:'theft482',source:'tile',tile:'12',harmful:true}];settle463(g);}
function context(g){return{data:{boardRooms463:{ABCDEF:g},parties462:{party:{id:'party',hostId:'p0',members:g.members}},accounts:Object.fromEntries(g.members.map(m=>[m.playerId,{sgDecisions474:{['entry482-'+m.playerId]:{status:'accepted'}}}]))},now:()=>10000};}

test('theft takes the full balance above the old holding limit without minting gems',()=>{
 for(const fee of [1,500,5000,ECONOMY474.maxFee]){
  const g=game(fee),a=g.players[0],pool=total(g);grant480(g,a,g.crystalReserve480);
  for(const b of g.players.slice(1)){const before=b.crystals474,changes=applyCrystal477(g,a,b,'steal');assert.equal(b.crystals474,0);assert.equal(changes[1].delta,before);assert.equal(total(g),pool);}
  assert.equal(a.crystals474,pool);assert.ok(Number.isSafeInteger(pool));
  for(const mode of ['gain','double','steal']){applyCrystal477(g,a,a,mode);assert.equal(a.crystals474,pool);assert.equal(total(g),pool);}
  checkpoint474(g,a,'8');assert.equal(a.crystals474,pool);
  applyCrystal477(g,a,g.players[1],'steal');assert.equal(a.crystals474,pool);
  applyCrystal477(g,a,a,'half');assert.equal(total(g),pool);assert.equal(a.crystals474,Math.floor(pool/2));
  applyCrystal477(g,a,a,'lose');assert.equal(g.crystalReserve480,pool);assert.equal(a.crystals474,0);
  for(const p of g.players)assert.equal(p.crystals474,p.crystalBase480+p.crystalShrines477+p.crystalEvents477);
 }
});

test('full theft still supports acceptance, card defense and one-hop reflection',()=>{
 for(const mode of ['accept','defend','reflect']){
  const g=game(),[a,b]=g.players;a.hand=[];b.hand=[];grant480(g,a,300);grant480(g,b,100);
  let uid;if(mode==='defend')uid=give(g,b,CARDS463.find(c=>c.defense&&!c.reflect));else b.special='tsundere';
  attack(g);assert.equal(g.pending.kind,'defense');const q=public463(g,b.playerId).pending;assert.equal(q.context464.mode477,'steal');
  if(mode!=='defend')assert.equal(q.options.find(o=>o.value==='passive-reflect').special,'tsundere');
  action463(g,b.playerId,{kind:'choice',value:mode==='defend'?uid:mode==='reflect'?'passive-reflect':'accept'},2000);
  assert.deepEqual([a.crystals474,b.crystals474],mode==='accept'?[1400,0]:mode==='reflect'?[0,1400]:[800,600]);
  assert.equal(total(g),2400);assert.equal(g.pending,null);
  if(mode==='defend')assert.ok(!b.hand.includes(uid));if(mode==='reflect')assert.equal(b.special,'tsundere');
 }
});

test('above-cap winnings settle once and actual new supply remains 20 percent',()=>{
 const g=game(),a=g.players[0];grant480(g,a,400);for(const b of g.players.slice(1))applyCrystal477(g,a,b,'steal');
 g.results=g.players.map((p,i)=>({playerId:p.playerId,place:i+1}));finish480(g);g.phase='result';const c=context(g);settleCrystals474(c,g);settleCrystals474(c,g);
 const receipts=Object.values(c.data.accounts).flatMap(a=>a.sgDeliveries474);assert.equal(receipts.length,4);assert.equal(receipts.reduce((n,e)=>n+e.crystals,0),2400);
 const e=receipts.find(e=>e.playerId==='p0');assert.equal(e.journey+e.stake480,2400);assert.equal(e.crystals,2350);assert.equal(validReceipt480(e),true);assert.equal(validReceipt480({...e,crystals:e.crystals+1}),false);
 const save={state:{player:{crystals:10000}},save:()=>true},key='server|p0';reserveEntry474(save,key,{gameId:g.id,requestId:e.requestId,amount:500});applyCrystalDelivery474(save,key,e);assert.equal(save.state.player.crystals,11850);assert.equal(applyCrystalDelivery474(save,key,e).duplicate,true);
});

test('replayed acceptance never transfers twice and Build481 commands are rejected',()=>{
 const g=game(),[a,b]=g.players;b.hand=[];b.special='tsundere';grant480(g,b,400);attack(g);const c=context(g),m={op:'sg463',kind:'choice',value:'accept',rulesVersion:18,gameId:g.id,revision:g.revision,choiceId:g.pending.id,requestId:'accept-theft-482'};
 assert.throws(()=>handleSugoroku463(c,{playerId:b.playerId},{...m,rulesVersion:16}),/Build483/);
 handleSugoroku463(c,{playerId:b.playerId},m);assert.deepEqual([a.crystals474,b.crystals474],[1400,0]);c.data=JSON.parse(JSON.stringify(c.data));const snapshot=JSON.stringify(c.data);handleSugoroku463(c,{playerId:b.playerId},m);assert.equal(JSON.stringify(c.data),snapshot);
});

test('single awakening defense uses the real card, preselects it, and waits for explicit confirmation',()=>{
 const g=game(),[a,b]=g.players;grant480(g,b,100);b.hand=[];b.special='tsundere';attack(g);const sent=[],c={state:{sugoroku:public463(g,b.playerId),party:{members:g.members}},root:null,transport:{selfId:b.playerId},offset:0,connected:()=>true,render(){},raw:(...args)=>sent.push(args)};
 const html=sugorokuView463(c),footer=html.slice(html.indexOf('<footer class="sg-modal-footer477">'));
 assert.match(html,/sg-defense-threat482/);assert.match(html,/💎 600 を奪われる/);assert.match(html,/sg-premium476/);assert.match(html,/S-011/);assert.match(html,/sg-art/);assert.doesNotMatch(html,/sg-defense-ability477/);
 assert.match(html,/aria-pressed="true"/);assert.match(footer,/data-value="passive-reflect" >ツンデレで跳ね返す/);assert.equal(sent.length,0);
 assert.match(html,/<details class="sg-defense-details482"><summary>攻撃の詳細/);assert.doesNotMatch(html,/<details[^>]+open/);
 sugorokuClick463(c,{dataset:{sgAction:'choice',value:'passive-reflect'}});sugorokuClick463(c,{dataset:{sgAction:'choice',value:'passive-reflect'}});assert.equal(sent.length,1);assert.equal(sent[0][1].rulesVersion,18);assert.equal(sent[0][1].value,'passive-reflect');
});

test('multiple defenses require a selection and block card buttons while sending or disconnected',()=>{
 const g=game(),[a,b]=g.players;b.hand=[];b.special='tsundere';const card=CARDS463.find(c=>c.defense&&!c.reflect),uid=give(g,b,card);attack(g);
 const q=public463(g,b.playerId).pending,args={g,source:NODES463['12'],owner:b,actor:a,art:art463};let html=defenseChoice482(q,{},false,args);
 assert.doesNotMatch(html,/aria-pressed="true"/);assert.match(html,/data-value="" disabled>防御を確定/);
 html=defenseChoice482(q,{choicePick465:uid},false,args);assert.match(html,/aria-pressed="true"/);assert.match(html,/このカードで防御/);
 html=defenseChoice482(q,{choicePick465:uid},true,args);for(const tag of html.match(/<button\b[^>]*>/g))assert.match(tag,/ disabled/);
});
