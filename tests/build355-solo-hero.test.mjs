import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createCampaignHeroLoadout,applyCampaignHeroLoadout} from '../src/core/CampaignHeroLoadoutSystem.js';
import * as H from '../src/core/HeroAllianceSystem.js';
import {applyEnemyDamage} from '../src/battle/BattleRules.js';
import {onlineHeroAuto,onlineHeroIncoming} from '../online-server/src/HeroAllianceAdapter.js';
const opening={myth_enami:['enami_world_create',.18],myth_yori:['yori_tetrapod',.15],myth_rion:['rion_talk',.15],myth_hide:['hide_crayfish',.18]};
const enemy=id=>applyCampaignHeroLoadout({id,speciesId:id,campaignHeroId:id,level:1000,effects:[],cooldowns:{}});
const dummy=(id='dummy',extra={})=>({id,speciesId:'dummy',hp:1e8,maxHp:1e8,mp:10000,maxMp:10000,atk:40000,matk:40000,def:1000,mdef:1000,spd:1000,evasion:0,crit:0,effects:[],...extra});
const battle=u=>({round:1,party:[dummy()],enemies:[u],enemyEffects:{},allyEffects:{},enemyStatuses:{},log:[]});
const env={random:()=>.99,stats:u=>({...u,hp:u.maxHp})};

test('four solo heroes survive 65,611 post-defense damage and five consecutive hits without shields',()=>{
 for(const id of H.HERO_ORDER){const u=enemy(id),b=battle(u);for(let i=0;i<5;i++)applyEnemyDamage(b,u,65611);assert.ok(u.hp>0,id);assert.ok(u.hp<u.maxHp,id);assert.equal(b.heroAlliance348?.enemy?.lastStandUsed??false,false);}
});
test('actual shared damage resolver: normal, critical, multi-hit and 90% defense ignore, physical and magic',()=>{
 for(const id of H.HERO_ORDER)for(const damageClass of ['physical','magic'])for(const variant of [{},{guaranteedCritical:true},{guaranteedCritical:true,hits:3},{guaranteedCritical:true,defenseIgnore:.9,hits:3}]){
  const u=enemy(id),b=battle(u),a=b.party[0],events=[];
  H.runHeroAllianceAction(b,'ally',a,{id:'stress',name:'耐久検証',type:'attack',power:1.6,damageClass,...variant},{...env,events},{reserved:true});
  assert.ok(events.some(e=>e.kind==='damage'&&e.value>0));assert.ok(u.hp>0,`${id}/${damageClass}/${JSON.stringify(variant)}`);
 }
});
test('each solo opening attacks and grants the specified non-stacking shield on both sides',()=>{
 for(const id of H.HERO_ORDER)for(const side of ['ally','enemy']){
  const u=enemy(id),other=dummy(),b={round:1,party:side==='ally'?[u]:[other],enemies:side==='enemy'?[u]:[other]},s=H.chooseHeroAllianceSkill(b,side,u),events=[];
  assert.equal(s.id,opening[id][0]);H.runHeroAllianceAction(b,side,u,s,{...env,events});assert.equal(u.heroShield348,Math.floor(u.maxHp*opening[id][1]));assert.ok(events.some(e=>e.kind==='damage'));
  const shield=u.heroShield348;u.cooldowns={};H.runHeroAllianceAction(b,side,u,s,env,{reserved:true});assert.equal(u.heroShield348,shield);
 }
});
test('wounded Rion and Hide prioritize recovery; solo never spends its turn reviving itself',()=>{
 for(const id of ['myth_rion','myth_hide']){const u=enemy(id);u.hp=Math.floor(u.maxHp*.3);assert.equal(H.chooseHeroAllianceSkill(battle(u),'enemy',u).type,'allHeal');}
 for(const id of H.HERO_ORDER){const u=enemy(id);assert.notEqual(H.chooseHeroAllianceSkill(battle(u),'enemy',u).type,'revive');}
});
test('solo reduction follows living hero count and does not grant non-heroes a solo passive',()=>{
 const u=enemy('myth_enami'),b=battle(u);assert.equal(H.mitigateHeroDamage(b,'enemy',u,1000),700);const v=enemy('myth_rion');b.enemies.push(v);assert.equal(H.mitigateHeroDamage(b,'enemy',u,1000),850);v.hp=0;assert.equal(H.mitigateHeroDamage(b,'enemy',u,1000),700);const non=dummy();b.enemies.push(non);assert.equal(H.mitigateHeroDamage(b,'enemy',non,1000),1000);
});
test('Yori retaliation refreshes for three turns without stacking and shields block its trigger',()=>{
 const u=enemy('myth_yori'),b=battle(u);u.heroShield348=1000;H.mitigateHeroDamage(b,'enemy',u,100);assert.equal(H.heroEffects(b,u,'enemy').length,0);u.heroShield348=0;
 for(let i=0;i<10;i++)H.mitigateHeroDamage(b,'enemy',u,100);
 const buffs=H.heroEffects(b,u,'enemy').filter(e=>e.sourceKey==='hero355:yori-retaliation');assert.equal(buffs.length,1);assert.equal(buffs[0].value,.2);buffs[0].turns=1;H.mitigateHeroDamage(b,'enemy',u,100);assert.equal(buffs[0].turns,3);
});
test('same solo incoming damage on player, enemy and online actors',()=>{
 for(const id of H.HERO_ORDER){const e=enemy(id),p=createCampaignHeroLoadout(id).monster,o={...enemy(id),playerId:id},b=battle(e),bp={party:[p],enemies:[dummy()]},bo={players:{[id]:o},enemies:[dummy()]};assert.equal(H.mitigateHeroDamage(b,'enemy',e,65611),H.mitigateHeroDamage(bp,'ally',p,65611));assert.equal(onlineHeroIncoming(bo,o,65611),45927);}
});
test('solo AI prioritizes a nearly defeated target, otherwise the greater threat; online agrees',()=>{
 const u=enemy('myth_yori'),a=dummy('weak',{atk:50,matk:50,spd:10}),z=dummy('threat',{atk:50000}),b={players:{[u.id]:u},enemies:[a,z]};assert.equal(H.chooseHeroAllianceTarget(b,'ally',u,null).id,'threat');assert.equal(onlineHeroAuto(b,u).targetId,'threat');a.hp=a.maxHp*.2;assert.equal(H.chooseHeroAllianceTarget(b,'ally',u,null).id,'weak');assert.equal(onlineHeroAuto(b,u).targetId,'weak');
});
test('battle effect labels localize guaranteed critical/hit and never expose an unknown internal key',()=>{
 const s=fs.readFileSync(new URL('../src/ui/screens/BattleScreen.js',import.meta.url),'utf8'),from=s.indexOf('const BATTLE_EFFECT_LABELS'),to=s.indexOf('\n',s.indexOf('function battleEffectLabel',from));const c={};vm.createContext(c);vm.runInContext(s.slice(from,to),c);assert.equal(c.battleEffectLabel({kind:'guaranteedCritical'}),'確定会心');assert.equal(c.battleEffectLabel({kind:'guaranteedHit'}),'必中');assert.equal(c.battleEffectLabel({kind:'unmappedInternalKey'}),'特殊効果');
});
