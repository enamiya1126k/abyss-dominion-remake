import {make550,start550,advance550,RICOCHET550 as C} from '../../src/ricochet550/Rules550.js';
import {writeFile,readFile} from 'node:fs/promises';
const rows=[];
for(const seed of [23,91,552,714,960,1729,2501,4191]){
 const g=make550({id:'balance',code:'B',partyId:'P',hostId:'p',now:0,members:[],mode:'pinball'});start550(g,0,seed);let seen=0,fevers=0,jackpots=0,bursts=0,leadChanges=0,lastLeader=null,lowSpeedSamples=0;const tiers={1:0,3:0,7:0};
 for(let at=20;at<=8*C.play;at+=20){advance550(g,at);for(const e of g.events)if(e.id>seen){seen=e.id;if(e.type==='fever')fevers++;if(e.type==='jackpot'){jackpots++;tiers[e.tier]++;}if(e.type==='burst')bursts++;}
  const leader=g.players.reduce((a,b)=>a.score+a.roundScore>=b.score+b.roundScore?a:b).seat;if(lastLeader!=null&&leader!==lastLeader)leadChanges++;lastLeader=leader;
  lowSpeedSamples+=g.players.filter(p=>Math.hypot(p.vx,p.vy)<8).length;
 }
 rows.push({seed,fevers,jackpots,tiers,bursts,leadChanges,lowSpeedFraction:lowSpeedSamples/(8*C.play/20*4),winner:g.results[0].seat,players:g.players.map(p=>({seat:p.seat,score:p.score,hits:p.hits,bestChain:p.bestCombo552,jackpots:p.jackpots552,bursts:p.bursts553,parts:p.parts}))});
}
const baseline=JSON.parse(await readFile(new URL('../../docs/build552/balance-report.json',import.meta.url),'utf8'));
const average=(r,f)=>r.reduce((sum,v)=>sum+f(v),0)/r.length;
const summary={scope:'8 fixed seeded AI games, 8 shots each. Useful pacing evidence, not a subjective fun score or human playtest.',baseline552:{meanHitsPerPlayer:average(baseline,r=>average(r.players,p=>p.hits)),meanFevers:average(baseline,r=>r.fevers),meanJackpots:average(baseline,r=>r.jackpots)},build553:{meanHitsPerPlayer:average(rows,r=>average(r.players,p=>p.hits)),meanFevers:average(rows,r=>r.fevers),meanJackpots:average(rows,r=>r.jackpots),meanEarnedShotsPerPlayer:average(rows,r=>average(r.players,p=>p.bursts)),tiers:rows.reduce((out,r)=>{for(const t of [1,3,7])out[t]+=r.tiers[t];return out},{1:0,3:0,7:0})}};
await writeFile(new URL('../../docs/build553/balance-report.json',import.meta.url),JSON.stringify({summary,runs:rows},null,2)+'\n');console.log(JSON.stringify(summary));
