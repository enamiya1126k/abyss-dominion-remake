import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { BattleScreen } from '../src/ui/screens/BattleScreen.js';
import { createMonster } from '../src/models/Monster.js';
import { SPECIES } from '../src/data/species.js';
const main = fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function fixture(){
 const ally=createMonster('slime',{level:10});
 return {party:[ally],enemies:[{id:'enemy',speciesId:'myth_enami',name:'えなみ',hp:100,maxHp:100,level:1000}],species:SPECIES,turn:1,queueIndex:0,turnQueue:[],allyEffects:{},enemyEffects:{},allyAilments:{},enemyStatuses:{}};
}
const render=b=>BattleScreen(b,{captureCrystals:1},{battleSpeed:1},100);
test('empty shields add no gauge; a shield appears and disappears without touching combat state',()=>{
 const b=fixture();render(b);let before=JSON.stringify(b);assert.ok(!render(b).includes('class="battle-shield-gauge'));assert.equal(JSON.stringify(b),before);
 b.party[0].heroShield348=100;b.enemies[0].heroShield348=25;before=JSON.stringify(b);const html=render(b);
 assert.equal((html.match(/class="battle-shield-gauge /g)||[]).length,2);assert.ok(html.includes('aria-valuenow="25"'));assert.equal(JSON.stringify(b),before);
 b.party[0].heroShield348=0;b.enemies[0].heroShield348=0;assert.ok(!render(b).includes('class="battle-shield-gauge'));
});
test('all effects survive rendering for both sides, including effects after the old two-row limit',()=>{
 const b=fixture(),kinds=['atkUp','defUp','spdUp','accuracyUp','evasionDown','vulnerable','regen','counter','healDown','mpRecoveryDown'];
 const effects=kinds.map((kind,i)=>({kind,value:.2,turns:i+1}));b.allyEffects[b.party[0].id]=effects;b.enemyEffects.enemy=effects;
 const html=render(b);for(const kind of kinds)assert.equal((html.match(new RegExp(`class="status-chip ${kind}"`,'g'))||[]).length,2);
 assert.ok(html.includes('被ダメ↑'));assert.ok(!html.includes('被ダメージ増加'));assert.ok(html.includes('10T'));
});
test('pointerdown opens once before rerender, suppresses bubbling, and keyboard activation still works',()=>{
 const ctx=vm.createContext({});vm.runInContext(main.slice(main.indexOf('function bindBattleDetailTap('),main.indexOf('function openBattleStatusDetail(')),ctx);
 const node={};let opens=0,stopped=0,prevented=0;ctx.bindBattleDetailTap(node,()=>opens++);
 node.onpointerdown({button:0,preventDefault:()=>prevented++,stopPropagation:()=>stopped++});assert.equal(opens,1);assert.equal(stopped,1);assert.equal(prevented,1);
 node.onclick({detail:1,stopPropagation(){}});assert.equal(opens,1);
 node.onclick({detail:0,stopPropagation(){}});assert.equal(opens,2);
 node.onpointerdown({button:2});assert.equal(opens,2);
});
test('detail sheet includes innate fortitude, shield and ultimate effects even without ordinary buffs',()=>{
 const b=fixture();b.enemies[0].heroShield348=45;let body='',closed=0;const primary={},modal={classList:{add(){}},querySelector:q=>q==='[data-modal-primary]'?primary:null,remove:()=>closed++};
 const ctx=vm.createContext({battle:b,BATTLE_EFFECT_DETAIL:{},calculatedStats:()=>({}),displayName:()=>'',effectStackBreakdown:()=>[],effectValue:()=>0,ultimateLabels:()=>['時間停止 残2'],hasHeroFortitude:()=>true,heroFortitudeUsed:()=>false,formatBattleInteger:v=>String(v),escapeAttribute:v=>String(v),app:{insertAdjacentHTML(){}},Modal:(title,html)=>{body=html;return ''},topModal:()=>modal});
 vm.runInContext(main.slice(main.indexOf('function openBattleStatusDetail('),main.indexOf('function scheduleBattleBiomePanelCollapse(')),ctx);ctx.openBattleStatusDetail('enemy');
 assert.ok(body.includes('時間停止 残2'));assert.ok(body.includes('残り1回'));assert.ok(body.includes('45'));assert.ok(!body.includes('状態効果はありません'));primary.onclick();assert.equal(closed,1);
});
