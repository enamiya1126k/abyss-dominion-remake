import fs from 'node:fs';
import {run,rng} from './native-harness.mjs';
import {makeEnemies415,targetList415} from './encounters.mjs';
import {gearParty415} from './teams.mjs';
export const GOD_COUNTERS415=[
 ['primordial_phoenix','world_serpent','frost_sovereign','storm_sovereign'],
 ['light_sovereign','world_serpent','frost_sovereign','storm_sovereign'],
 ['fate_weaver','world_serpent','bechi','storm_sovereign'],
 ['forest_cernunnos','infinite_hydra','genesis_golem','nightmare_empress'],
 ['primordial_phoenix','light_sovereign','crownless_hero','storm_sovereign'],
 ['primordial_phoenix','fate_weaver','crownless_hero','storm_sovereign'],
 ['celestial_pegasus','world_serpent','storm_sovereign','crownless_hero'],
 ['forest_cernunnos','genesis_golem','frost_sovereign','storm_sovereign'],
 ['light_sovereign','space_whale','frost_sovereign','storm_sovereign'],
 ['light_sovereign','genesis_golem','nightmare_empress','storm_sovereign'],
 ['primordial_phoenix','earth_sovereign','frost_sovereign','storm_sovereign'],
 ['celestial_pegasus','world_serpent','bechi','storm_sovereign'],
 ['time_keeper','king_behemoth','bechi','storm_sovereign'],
 ['primordial_phoenix','world_serpent','crownless_hero','eternal_valkyrie'],
 ['forest_cernunnos','genesis_golem','crownless_hero','infinite_hydra'],
 ['seraphim','world_serpent','crownless_hero','storm_sovereign'],
 ['light_sovereign','fate_weaver','storm_sovereign','chaos_king'],
 ['primordial_phoenix','celestial_pegasus','frost_sovereign','chaos_king'],
 ['forest_cernunnos','time_keeper','crownless_hero','eternal_valkyrie'],
 ['primordial_phoenix','light_sovereign','time_dragon','celestial_kirin']
];
const count=Number(process.env.SEEDS??10),selected=process.env.TEAMS?.split(',').map(Number)??[...GOD_COUNTERS415.keys()],out=process.env.OUT??'docs/build415/campaign-counter-probe.jsonl';
const target=targetList415().find(t=>t.key===(process.env.TARGET??'campaign:100:ten_divinity'));
Math.random=rng(415);const initial=makeEnemies415(target),level=target.mode==='campaign'?3000:Math.min(10000,Math.max(...initial.units.map(u=>u.level)));
fs.writeFileSync(out,'');
for(const i of selected){const ids=GOD_COUNTERS415[i],samples=[];let wins=0;
 for(let k=0;k<count;k++){const seed=1000+k;Math.random=rng(seed);const party=gearParty415(ids,level,{floor:100,campaign:target.mode==='campaign'}),actual=makeEnemies415(target,party);actual.units.forEach((u,j)=>u.id=`enemy:${j}`);
 const r=await run(ids,[],{seed,partyUnits:party,enemyUnits:actual.units,battleOptions:actual.options,floor:100,circles:true,maxRounds:40});wins+=Number(r.won);samples.push({seed,win:r.won,rounds:r.rounds,remaining:r.remaining,metrics:r.metrics,synergy:r.synergy});if(k%10===9)globalThis.gc?.();}
 const row={target:target.key,mode:target.mode,team:`counter-${i}`,ids,level,seeds:count,wins,rate:wins/count,accepted:count>=100&&wins/count>=.7,error:null,samples};fs.appendFileSync(out,JSON.stringify(row)+'\n');console.log(i,wins+'/'+count);}
