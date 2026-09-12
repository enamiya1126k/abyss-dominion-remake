import fs from 'node:fs';
import {run,monster,rng} from './native-harness.mjs';
import {MOTHER_ENEMY422,tuneMother422} from '../../src/primordial/Mother422.js';
const parties=[['ch2_seria','ch2_carmia','ch2_rostia','ch2_althea'],['ch2_ryune','ch2_rose','ch2_mirea','ch2_viola'],['ch2_dracia','ch2_rucie','ch2_tillea','ch2_grant'],['ch2_nemesia','ch2_everia','ch2_aeriel','ch2_vespera'],['ch2_noelle','ch2_aure','ch2_ione','ch2_noctia']];
const f=await run(parties[0],['slime'],{inspect:true}),e=tuneMother422(f.context.makeBattleEnemy(MOTHER_ENEMY422));
const rows=[];
for(const level of [4500,5500,6000])for(const [p,ids] of parties.entries())for(const seed of [1,7,29]){

 // Use the actual six-slot gear formula at the fixture level; no extra team multiplier.
 const out=await run(ids,[],{level,gear:true,enemyUnits:[e],seed,circles:true,maxRounds:40,battleOptions:{specialBattleType:'mother422',specialBattle:true}});
 const row={level,party:p,ids,seed,won:out.won,lost:out.lost,rounds:out.rounds,remaining:out.remaining,...out.metrics};rows.push(row);console.log(JSON.stringify(row));
}
for(const seed of [1,7,29]){const previousRandom=Math.random;Math.random=rng(seed+1234);let party;try{party=parties[0].map((id,i)=>monster(id,[3670,3608,10000,6905][i],true));}finally{Math.random=previousRandom;}const out=await run([],[],{partyUnits:party,enemyUnits:[e],seed,circles:true,maxRounds:40,battleOptions:{specialBattleType:'mother422',specialBattle:true}});const row={level:'screenshot-levels (not save replica)',party:0,seed,won:out.won,lost:out.lost,rounds:out.rounds,remaining:out.remaining,...out.metrics};rows.push(row);console.log(JSON.stringify(row));}
fs.writeFileSync('docs/build423/mother-audit.json',JSON.stringify(rows,null,2));
