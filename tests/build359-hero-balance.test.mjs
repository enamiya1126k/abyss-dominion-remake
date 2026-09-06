import test from 'node:test';import assert from 'node:assert/strict';
import {heroResonanceProfile} from '../src/core/HeroResonanceSystem.js';
import {HERO_ORDER,heroAuthoredSkills,runHeroAllianceAction,mitigateHeroDamage} from '../src/core/HeroAllianceSystem.js';
import {MYTHIC_SERIAL_SPECIES} from '../src/data/mythicSerialSpecies.js';
import {simulateFinale} from './build359-balance-simulation.mjs';

test('2/3/4 hero output is identical on both sides; only the damage coefficient changes',()=>{
 const make=(id)=>({id,speciesId:id,name:id,level:1000,hp:100000,maxHp:100000,mp:10000,maxMp:10000,atk:1000,matk:1000,def:0,mdef:0,spd:100,crit:0,evasion:0,effects:[],cooldowns:{}});
 for(const n of [2,3,4])for(const sourceId of HERO_ORDER.slice(0,n)){
  const play=side=>{const heroes=HERO_ORDER.slice(0,n).map(make),other=[make('neutral')],b={round:1,players:Object.fromEntries((side==='ally'?heroes:other).map(u=>[u.id,u])),enemies:side==='ally'?other:heroes},actor=heroes.find(u=>u.id===sourceId),events=[];runHeroAllianceAction(b,side,actor,heroAuthoredSkills(actor)[0],{random:()=>.99,events,stats:u=>({...u,hp:u.maxHp})},{reserved:true,followup:true});return{damage:events.filter(e=>e.kind==='damage').map(e=>e.value),mp:actor.mp,cooldown:actor.cooldowns};};
  assert.deepEqual(play('ally'),play('enemy'));assert.ok(play('ally').damage.every(d=>d>0));
 }
 assert.deepEqual([2,3,4].map(n=>heroResonanceProfile(n).totalActions),[4,9,16]);assert.deepEqual([2,3,4].map(n=>heroResonanceProfile(n).outgoingDamageRate),[.12,.06,.04]);
 const heroes=HERO_ORDER.map(make),b={party:heroes,enemies:[make('dummy')]};assert.equal(mitigateHeroDamage(b,'ally',heroes[0],10000),5000);heroes[0].hp=0;assert.equal(mitigateHeroDamage(b,'ally',heroes[1],10000),7000);
 for(const row of Object.values(MYTHIC_SERIAL_SPECIES)){assert.ok(row.passiveDescription.includes('4人：4%'));assert.ok(row.passiveDescription.includes('50%軽減'));}
});
test('reference party has a contested finale with no opening wipe and benefits from using skills',()=>{
 const skilled=Array.from({length:40},(_,i)=>simulateFinale(i+1)),basic=Array.from({length:20},(_,i)=>simulateFinale(i+1,{basicOnly:true}));
 const wins=skilled.filter(r=>r.won).length;assert.ok(wins>=12&&wins<=28,`wins ${wins}/40`);assert.equal(skilled.some(r=>r.outcome==='timeout'),false);assert.equal(skilled.some(r=>!r.won&&r.rounds===1),false);assert.ok(skilled.some(r=>r.ultimateCasts>0));assert.ok(wins/40>basic.filter(r=>r.won).length/20);
 const lr=Array.from({length:20},(_,i)=>simulateFinale(i+1,{legacyLR:true}));assert.ok(lr.filter(r=>r.won).length/20<wins/40);
 for(const id of HERO_ORDER){const rows=Array.from({length:4},(_,i)=>simulateFinale(i+1,{ids:[id]}));assert.ok(rows.every(r=>r.won));assert.ok(rows.every(r=>r.rounds>=2));}
});
