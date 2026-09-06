import{ultimateIsolated}from'../src/core/EndgameUltimateSystem.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {effectValue,hasEffect,clearPersistentAilments} from '../src/battle/BattleRules.js';

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('../src/ui/screens/BattleScreen.js',import.meta.url),'utf8');
function fn(s,name){const start=s.search(new RegExp(`(?:async )?function ${name}\\(`));assert.ok(start>=0,name);const next=s.slice(start+1).search(/\n(?:async )?function /);return s.slice(start,next<0?undefined:start+1+next);}
function harness(){
 const party=[{id:'a',speciesId:'slime',level:80,currentHp:1000,currentMp:100},{id:'b',speciesId:'slime',level:80,currentHp:100,currentMp:0},{id:'c',speciesId:'slime',level:80,currentHp:0,currentMp:0}];
 let html='',buttons=[],finished=0,checkpoints=0;
 const alerts=[],inventory={potions:2,manaPotions:1,reviveLeaves:1,statusCures:1,partyPotions:1};
 const c=vm.createContext({ultimateIsolated,battle:{party,enemies:[],auto:false,busy:false,itemMenu:true,allyEffects:{},allyAilments:{}},save:{state:{inventory}},actor:()=>party[0],calculatedStats:()=>({hp:1000}),maxMp:()=>100,displayName:m=>m.id,itemIcon:()=>'<i></i>',battleInteger:String,battleParty:b=>b.party??[],unitName:m=>m.id,unitStats:()=>({hp:1000}),unitMaxMp:()=>100,htmlText:String,effectValue,hasEffect,clearPersistentAilments,heroOverheal:()=>0,hasCircleEffect:()=>false,queueBattleRecovery(){},recordBattleHealing(){},completeContextGuide(){},addBattleLog(){},syncInvincibleAllianceState(){},battleContribution:()=>null,flushBattleRecoveries:async()=>{},wait:async()=>{},finishCurrentAction:async()=>{finished++},saveBattleCheckpoint:()=>{checkpoints++},alert:s=>alerts.push(s),app:{insertAdjacentHTML:()=>assert.fail('Target picker must remain in the battle panel')},Modal:()=>assert.fail('Hidden generic modal'),renderBattle:()=>render()});
 for(const name of ['renderItems','renderItemPanel','renderOnlineItems'])vm.runInContext(fn(view,name),c);
 for(const name of ['openBattleItemTarget','useBattleItem','scaledRecovery','recoverBattleHp','recoverBattleMp','clearAilments','canBattleRevive','reviveBattleMonster'])vm.runInContext(fn(main,name),c);
 const bindings=main.split('\n').filter(l=>l.includes('document.querySelectorAll("[data-battle-item]"')||l.includes('document.querySelectorAll("[data-battle-item-target]"')||l.includes('const backItem=document')||l.includes('const closeItem=document')).join('\n');
 function render(){
  html=c.renderItems(inventory,c.battle);buttons=[...html.matchAll(/<button\b([^>]*)>/g)].map(([,attrs])=>{const dataset={};for(const [,key,value]of attrs.matchAll(/data-([\w-]+)="([^"]*)"/g))dataset[key.replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=value;return{dataset,id:attrs.match(/\bid="([^"]*)"/)?.[1],disabled:/\bdisabled\b/.test(attrs),click(){if(!this.disabled)return this.onclick?.()}}});
  c.document={querySelectorAll:selector=>buttons.filter(b=>selector==='[data-battle-item]'?b.dataset.battleItem:b.dataset.battleItemTarget),getElementById:id=>buttons.find(b=>b.id===id)};vm.runInContext(`{${bindings}}`,c);
 }
 render();return{c,party,inventory,alerts,render,get html(){return html},get finished(){return finished},get checkpoints(){return checkpoints},item:id=>buttons.find(b=>b.dataset.battleItem===id),target:id=>buttons.find(b=>b.dataset.battleItemTarget===id),button:id=>buttons.find(b=>b.id===id)};
}
test('item click opens visible inline targets; choosing a wounded ally heals once and spends one action',async()=>{
 const h=harness();h.item('potions').click();assert.match(h.html,/使用対象を選択/);assert.match(h.html,/data-battle-item-target="b"/);assert.doesNotMatch(h.html,/game-modal/);assert.equal(h.inventory.potions,2);assert.equal(h.target('c').disabled,true);
 const stale=h.target('b'),first=stale.click();await stale.click();await first;assert.equal(h.party[1].currentHp,300);assert.equal(h.inventory.potions,1);assert.equal(h.finished,1);assert.equal(h.checkpoints,1);assert.equal(h.c.battle.itemMenu,false);
});
test('MP and revival targets use the actual recovery helpers',async()=>{
 const h=harness();h.item('manaPotions').click();await h.target('b').click();assert.equal(h.party[1].currentMp,40);assert.equal(h.inventory.manaPotions,0);
 h.c.battle.itemMenu=true;h.render();h.item('reviveLeaves').click();assert.equal(h.target('a').disabled,true);assert.equal(h.target('c').disabled,false);await h.target('c').click();assert.equal(h.party[2].currentHp,300);assert.equal(h.inventory.reviveLeaves,0);assert.equal(h.c.battle.reviveCount,1);
});
test('back and touch-close spend no item or turn; reopening clears the target',()=>{
 const h=harness();h.item('potions').click();h.button('backBattleItemMenu').click();assert.ok(h.item('potions'));assert.equal(h.c.battle.itemTargetType,null);h.item('manaPotions').click();h.button('closeItemMenu').onpointerdown({button:0,preventDefault(){},stopPropagation(){}});assert.equal(h.c.battle.itemMenu,false);assert.equal(h.c.battle.itemTargetType,null);assert.equal(h.inventory.potions,2);assert.equal(h.inventory.manaPotions,1);assert.equal(h.finished,0);
});
test('unnecessary, exhausted, stale-turn and sealed-revival selections never consume stock',async()=>{
 const h=harness();h.item('potions').click();await h.target('a').click();assert.equal(h.inventory.potions,2);assert.equal(h.alerts.length,1);h.inventory.potions=0;await h.target('b').click();assert.equal(h.party[1].currentHp,100);
 h.c.battle.itemTargetActorId='previous';await h.c.useBattleItem('potions','b');assert.equal(h.finished,0);
 h.c.battle.allyEffects.c=[{kind:'reviveSeal',turns:2,value:1}];h.c.battle.itemTargetType=null;h.render();h.item('reviveLeaves').click();await h.target('c').click();assert.equal(h.inventory.reviveLeaves,1);assert.equal(h.party[2].currentHp,0);assert.equal(h.finished,0);
});
test('status cure sees battle-only ailments and clears them',async()=>{
 const h=harness();h.c.battle.allyAilments.b=[{id:'poison',name:'毒',turns:3}];h.item('statusCures').click();await h.target('b').click();assert.equal(h.c.battle.allyAilments.b.length,0);assert.equal(h.inventory.statusCures,0);assert.equal(h.finished,1);
});
test('group items and automatic emergency healing still work',async()=>{
 const h=harness();await h.item('partyPotions').click();assert.equal(h.party[1].currentHp,220);assert.equal(h.party[2].currentHp,0);assert.equal(h.inventory.partyPotions,0);
 h.party[0].currentHp=100;h.c.battle.auto=true;h.c.battle.itemMenu=false;await h.c.useBattleItem('potions','a',{automatic:true});assert.equal(h.party[0].currentHp,300);assert.equal(h.inventory.potions,1);assert.equal(h.finished,2);
});
test('online emergency item retains its separate target flow',()=>{
 const h=harness();assert.match(h.c.renderOnlineItems({onlineItemCharges:1}),/data-online-battle-item/);assert.match(h.c.renderOnlineItems({onlineItemTargetMenu:true,party:h.party}),/data-online-item-target/);assert.match(h.c.renderOnlineItems({onlineItemTargetMenu:true,party:h.party}),/closeOnlineItemTarget/);
});
