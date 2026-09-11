import fs from 'node:fs';
import readline from 'node:readline';
import {createHash} from 'node:crypto';
import {run,rng} from './native-harness.mjs';
import {targetList415,makeEnemies415} from './encounters.mjs';
import {gearParty415} from './teams.mjs';
const targets=new Map(targetList415().map(t=>[t.key,t])),rows=[],differences=[],started=performance.now();
// Archived workers started with different local test storage. These five first
// samples consumed RNG during initial SaveService creation. This is a fixed
// fixture map, established by running both 415 and416 under the same conditions;
// it is not chosen from whether a replay wins.
const coldCases=new Set(JSON.parse(fs.readFileSync('docs/build416/combat-replay-resolution.json')).rows.map(r=>`${r.target}:${r.team}`));
const sourceHashes=Object.fromEntries(['src/main.js','src/battle/TrialAdaptation415.js','src/battle/SkillSystem.js','src/battle/PairSynergy409.js'].map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
for await(const line of readline.createInterface({input:fs.createReadStream('docs/build415/合格編成100シード.jsonl'),crlfDelay:Infinity})){
 const previous=JSON.parse(line),t=targets.get(previous.target),expected=previous.samples[0],seed=expected.seed;
 Math.random=rng(seed);const party=gearParty415(previous.ids,previous.level,{floor:t.floor,campaign:t.mode==='campaign'||t.mode==='heroes'&&t.stage===0}),actual=makeEnemies415(t,party);
 actual.units.forEach((u,i)=>u.id=`enemy:${i}`);
 if(coldCases.has(`${t.key}:${previous.team}`))localStorage.removeItem('abyss-dominion-remake-v001');
 const fixture=localStorage.getItem('abyss-dominion-remake-v001')?'existing-save':'initial-save';
 const result=await run(previous.ids,[],{seed,partyUnits:party,enemyUnits:actual.units,battleOptions:actual.options,floor:t.floor,circles:t.floor>=40,maxRounds:40});
 const match=result.won===expected.win&&result.rounds===expected.rounds;
 const row={target:t.key,team:previous.team,ids:previous.ids,level:previous.level,seed,fixture,expectedWin:expected.win,win:result.won,expectedRounds:expected.rounds,rounds:result.rounds,match};rows.push(row);if(!match)differences.push(row);
 if(rows.length%10===0)globalThis.gc?.();
 if(rows.length%300===0)console.log(`${rows.length}/2424 replays; differences ${differences.length}`);
}
const summary={build:416,targets:new Set(rows.map(r=>r.target)).size,comparisons:rows.length,matches:rows.length-differences.length,differences,seconds:(performance.now()-started)/1000,sourceHashes,method:'Actual main.js battle loop; first recorded seed per accepted Build415 composition. Compare outcome and round count; presentation/network/storage are stubbed.'};
for(const [name,data]of [['combat-replay.jsonl',rows.map(r=>JSON.stringify(r)).join('\n')+'\n'],['combat-replay-summary.json',JSON.stringify(summary,null,2)]]){const path='docs/build416/'+name;fs.writeFileSync(path+'.tmp',data);fs.renameSync(path+'.tmp',path);}
console.log(summary.targets,summary.comparisons,summary.matches);if(differences.length||rows.length!==2424||summary.targets!==808)process.exitCode=1;
