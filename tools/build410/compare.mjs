// Seeded native-flow smoke matrix. This is not a PvP ranking or real-area win-rate claim.
import fs from 'node:fs';import {run} from './native-harness.mjs';
const teams={
 pact:['ch2_senela','ch2_rostia','ch2_althea','ten_life'],
 inversion:['ch2_lumea','ch2_mirea','ch2_viola','ten_life'],
 winter:['ch2_noctia','ch2_ferne','ch2_clarisse','ten_life'],
 absorb:['ch2_velg','ch2_lyriet','ch2_rosette','ten_life'],
 paper:['ch2_fiora','ch2_sephira','ch2_astrelle','ten_life'],
 winterPaper:['ch2_noctia','ch2_fiora','ch2_ferne','ch2_clarisse'],
 gods:['ten_time','ten_life','ten_fate','ten_end'],
 pairs:['ch2_sephira','ch2_astrelle','ch2_nemesia','ch2_everia']
};
const foes={ordinary:['ch2_grant','ch2_kororu','ch2_mirea','ch2_viola'],special:['ch2_senela','ch2_lumea','ch2_noctia','ch2_fiora']},rows=[];
for(const[name,team]of Object.entries(teams))for(const[enemy,ids]of Object.entries(foes))for(const boss of [false,true])for(let seed=1;seed<=10;seed++){
 const level=seed%2?1500:3000,r=await run(team,ids,{seed,level,gear:true,boss,maxRounds:24,circles:seed%2===0});
 if(!Object.values(r.metrics).every(Number.isFinite))throw new Error('Non-finite metrics '+name);
 for(const q of Object.values(r.abilities?.quotas??{}))if(!Number.isFinite(q.total))throw new Error('Non-finite quota');
 const stacks=Object.entries(r.abilities?.meters??{}).filter(([k])=>k.includes('death-absorb'));if(stacks.some(([,n])=>n>3))throw new Error('Growth quota exceeded');
 rows.push({team:name,enemy,boss,seed,level,won:r.won,lost:r.lost,rounds:r.rounds,metrics:r.metrics,abilities:r.abilities,traits:r.traits,pairs:r.synergy});
 if(rows.length%10===0)globalThis.gc?.();
}
const summary=Object.keys(teams).map(team=>{const r=rows.filter(x=>x.team===team);return{team,battles:r.length,wins:r.filter(x=>x.won).length,losses:r.filter(x=>x.lost).length,turnLimit:r.filter(x=>!x.won&&!x.lost).length,meanRounds:r.reduce((n,x)=>n+x.rounds,0)/r.length};});
const dest=new URL('../../docs/build410/',import.meta.url);fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(new URL('combat-samples.json',dest),JSON.stringify(rows));fs.writeFileSync(new URL('combat-summary.json',dest),JSON.stringify({count:rows.length,teams,foes,summary},null,2));console.log(JSON.stringify({count:rows.length,summary}));
