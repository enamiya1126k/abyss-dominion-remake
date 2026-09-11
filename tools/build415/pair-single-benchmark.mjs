import fs from 'node:fs';
import {run,rng} from './native-harness.mjs';
import {targetList415,makeEnemies415} from './encounters.mjs';
import {gearParty415,LATE_TEAMS415} from './teams.mjs';
const targets=targetList415().filter(t=>t.mode==='chapter'&&/^(heart|a[1-4]_heart)$/.test(t.id)&&t.run.challengeTier===0),out='docs/build415/acceptance-pair-single.jsonl';fs.writeFileSync(out,'');
for(const t of targets){
 Math.random=rng(415);const initial=makeEnemies415(t),level=Math.min(10000,Math.max(...initial.units.map(u=>u.level)));
 for(const index of [17,15,16]){const ids=LATE_TEAMS415[index],samples=[];let wins=0;
  for(let k=0;k<100;k++){const seed=1000+k;Math.random=rng(seed);const party=gearParty415(ids,level),actual=makeEnemies415(t,party);actual.units.forEach((u,i)=>u.id=`enemy:${i}`);
   const r=await run(ids,[],{seed,partyUnits:party,enemyUnits:actual.units,battleOptions:actual.options,floor:100,circles:true,maxRounds:40});wins+=Number(r.won);samples.push({seed,win:r.won,rounds:r.rounds,remaining:r.remaining,metrics:r.metrics,synergy:r.synergy});if(k%10===9)globalThis.gc?.();
  }
  fs.appendFileSync(out,JSON.stringify({target:t.key,mode:t.mode,team:index,ids,level,seeds:100,wins,rate:wins/100,accepted:wins>=70,error:null,samples})+'\n');console.log(t.key,index,wins+'/100');if(wins>=70)break;
 }
}
