import fs from 'node:fs';
import {run,rng} from './native-harness.mjs';
import {targetList415,makeEnemies415} from './encounters.mjs';
import {gearParty415} from './teams.mjs';
const cases=JSON.parse(fs.readFileSync(process.argv[2])).differences,targets=new Map(targetList415().map(t=>[t.key,t])),rows=[];
for(const row of cases){const t=targets.get(row.target);Math.random=rng(row.seed);const party=gearParty415(row.ids,row.level,{floor:t.floor,campaign:t.mode==='campaign'||t.mode==='heroes'&&t.stage===0}),actual=makeEnemies415(t,party);actual.units.forEach((u,i)=>u.id=`enemy:${i}`);
 const input=JSON.parse(JSON.stringify({party,enemies:actual.units,options:actual.options}));
 if(process.env.COLD==='1')localStorage.removeItem('abyss-dominion-remake-v001');
 const result=await run(row.ids,[],{seed:row.seed,partyUnits:party,enemyUnits:actual.units,battleOptions:actual.options,floor:t.floor,circles:t.floor>=40,maxRounds:40,trace:true});rows.push({target:row.target,team:row.team,input,result});}
fs.writeFileSync(process.argv[3],JSON.stringify(rows,null,2));console.log(rows.map(r=>({target:r.target,win:r.result.won,rounds:r.result.rounds})));
