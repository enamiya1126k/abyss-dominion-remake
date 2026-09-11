import fs from 'node:fs';import{run}from'./native-harness.mjs';import{comps,scenarios}from'./scenarios.mjs';
const [scenario,mode]=process.argv.slice(2),enemy=scenarios[scenario],rows=[];let count=0;const seeds=mode==='primary'?100:20,start=Date.now();
for(const level of mode==='primary'?[1500]:[1500,3000])for(const gear of mode==='primary'?[false]:[false,true])for(const circles of mode==='primary'?[false]:[false,true]){if(mode!=='primary'&&level===1500&&!gear&&!circles)continue;
for(const[comp,ids]of Object.entries(comps))for(const enabled of [false,true]){
const samples=[];for(let seed=1;seed<=seeds;seed++){const r=await run(ids,enemy.ids,{...enemy,level,gear,circles,pairEnabled:enabled,seed,maxRounds:30});samples.push({seed,...r});count++;}rows.push({level,gear,circles,scenario,comp,enabled,n:seeds,samples});
if(globalThis.gc)globalThis.gc();
}}
fs.writeFileSync(new URL(`./chunk-${mode}-${scenario}.json`,import.meta.url),JSON.stringify({count,seconds:(Date.now()-start)/1000,rows}));console.log(scenario,mode,count,Math.round((Date.now()-start)/1000)+'s');
