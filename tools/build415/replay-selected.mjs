import fs from 'node:fs';
import readline from 'node:readline';
import {run,rng} from './native-harness.mjs';
import {targetList415,makeEnemies415} from './encounters.mjs';
import {gearParty415} from './teams.mjs';
const targets=new Map(targetList415().map(t=>[t.key,t]));
const output=process.env.OUT??'docs/build415/replay-result.jsonl';fs.writeFileSync(output,'');
const lines=readline.createInterface({input:fs.createReadStream('docs/build415/合格編成100シード.jsonl'),crlfDelay:Infinity});
let count=0;
for await(const line of lines){
 const row=JSON.parse(line);if(process.env.TARGET&&row.target!==process.env.TARGET)continue;
 const t=targets.get(row.target);if(!t)throw Error('Unknown target '+row.target);
 let wins=0;
 for(let k=0;k<100;k++){
  const seed=1000+k;Math.random=rng(seed);
  const party=gearParty415(row.ids,row.level,{floor:t.floor,campaign:t.mode==='campaign'||t.mode==='heroes'&&t.stage===0}),actual=makeEnemies415(t,party);
  actual.units.forEach((u,i)=>u.id=`enemy:${i}`);
  const result=await run(row.ids,[],{seed,partyUnits:party,enemyUnits:actual.units,battleOptions:actual.options,floor:t.floor,circles:t.floor>=40,maxRounds:40});
  wins+=Number(result.won);if(k%10===9)globalThis.gc?.();
 }
 if(wins!==row.wins)throw Error(`Replay differs: ${row.target} ${row.team}: ${wins}, expected ${row.wins}`);
 fs.appendFileSync(output,JSON.stringify({target:row.target,team:row.team,wins,seeds:100,match:true})+'\n');
 console.log(++count,row.target,row.team,wins+'/100');
}
