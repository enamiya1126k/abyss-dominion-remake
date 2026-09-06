import{isEndgameUltimate,ultimateAvailability,ultimateBasicOnly}from'../src/core/EndgameUltimateSystem.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {simulate} from './build357-balance-simulation.mjs';
import * as H from '../src/core/HeroAllianceSystem.js';
import {applyCampaignHeroLoadout} from '../src/core/CampaignHeroLoadoutSystem.js';

test('GM loadout balance model: every solo hero can win and lose; the quartet stays overwhelming',()=>{
 for(const id of H.HERO_ORDER){const rows=Array.from({length:40},(_,i)=>simulate([id],i+1)),wins=rows.filter(r=>r.won).length;assert.ok(wins>=10&&wins<=36,`${id}: ${wins}/40`);assert.ok(rows.filter(r=>r.damage>0).length>=30,id);}
 const wins=Array.from({length:40},(_,i)=>simulate(H.HERO_ORDER,i+1)).filter(r=>r.won).length;assert.equal(wins,0);
});
test('solo authored skills have identical player/enemy damage and shields after tuning',()=>{
 for(const id of H.HERO_ORDER)for(const skill of H.heroAuthoredSkills({speciesId:id,level:1000})){
  const run=side=>{const u=applyCampaignHeroLoadout({id:'hero',speciesId:id,campaignHeroId:id,level:1000}),target={id:'target',speciesId:'slime',hp:1e7,maxHp:1e7,atk:1000,matk:1000,def:5000,mdef:5000,spd:1000,evasion:0},b={turn:1,party:side==='ally'?[u]:[target],enemies:side==='enemy'?[u]:[target]},events=[];H.runHeroAllianceAction(b,side,u,skill,{random:()=>.9,events,stats:x=>({...x,hp:x.maxHp})});return{hp:target.hp,shield:u.heroShield348,mp:u.currentMp,damage:events.filter(e=>e.kind==='damage').map(e=>e.value)}};
  assert.deepEqual(run('ally'),run('enemy'),skill.id);
 }
});
test('shield starts outside the HP bar; skill effect markup includes every description line',()=>{
 const s=fs.readFileSync(new URL('../src/ui/screens/BattleScreen.js',import.meta.url),'utf8'),start=s.indexOf('function shieldLabel'),end=s.indexOf('function hpBar',start),c={battleInteger:n=>n.toLocaleString('ja-JP')};vm.createContext(c);vm.runInContext(s.slice(start,end),c);assert.equal(c.shieldLabel({heroShield348:53893}),'<div class="battle-shield-label">盾 53,893</div>');assert.equal(c.shieldLabel({heroShield348:0}),'');assert.doesNotMatch(s,/HP .*?盾/);
 const context={isEndgameUltimate,ultimateAvailability,ultimateBasicOnly,cooldownRemaining:()=>0,skillMpCost:()=>23,htmlText:s=>String(s),skillElementLabel:()=> '土',skillCombatKeywords:()=>['HP回復27%','防御上昇','回避上昇'],battleInteger:String,unitMaxMp:()=>100};vm.createContext(context);vm.runInContext(s.slice(s.indexOf('function renderSkills('),s.indexOf('\nfunction ',s.indexOf('function renderSkills(')+1)),context);const html=context.renderSkills({}, {currentMp:100},[{id:'long',name:'試験スキル',description:'長い効果説明。'.repeat(12)}]);for(const text of ['HP回復27%','防御上昇','回避上昇'])assert.ok(html.includes(text));assert.equal((html.match(/<li>/g)||[]).length,4);
 const css=fs.readFileSync(new URL('../src/Styles/build357-battle-readability.css',import.meta.url),'utf8');assert.match(css,/flex:0 0 auto!important/);assert.match(css,/max-height:none!important/);assert.match(css,/overflow-y:auto!important/);
});
