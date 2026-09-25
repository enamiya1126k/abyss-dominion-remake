import {make550,start550,advance550,RICOCHET550 as C} from '../../src/ricochet550/Rules550.js';
import {writeFile} from 'node:fs/promises';
const rows=[];
for(const seed of [23,91,554,714,960,1729,2501,4191]){
 const g=make550({id:'GP',code:'GP',partyId:'P',hostId:'p',now:0,members:[],mode:'junkgp'});start550(g,0,seed);let seen=0,leadChanges=0,lastLeader=null;const events={nitro:0,gate:0,safe:0,wild:0,six:0};
 for(let at=20;at<=8*C.play;at+=20){advance550(g,at);for(const e of g.events)if(e.id>seen){seen=e.id;if(e.type==='nitro')events.nitro++;if(e.type==='gate'){events.gate++;events[e.kind]++;if(e.die===6)events.six++;}}
  const leader=g.players.reduce((a,b)=>a.maxY>=b.maxY?a:b).seat;if(lastLeader!=null&&leader!==lastLeader)leadChanges++;lastLeader=leader;
 }
 rows.push({seed,events,leadChanges,winner:g.results[0].seat,players:g.players.map(p=>({seat:p.seat,distance:p.score,hits:p.hits,nitros:p.nitroShots554,gates:p.gateWins554,sixes:p.gateSixes554,parts:p.parts}))});
 if(g.phase!=='result'||g.history.length!==8||g.players.some(p=>p.score!==Math.round((p.maxY-2)*10)))throw Error('invalid distance or unfinished GP');
}
const average=(r,f)=>r.reduce((sum,v)=>sum+f(v),0)/r.length;
const summary={scope:'Eight seeded AI races, eight continuous shots each. Counts characterize pacing, not subjective fun or human skill.',meanAdditionalShotsPerDriver:average(rows,r=>average(r.players,p=>p.nitros)),meanContactsPerDriver:average(rows,r=>average(r.players,p=>p.hits)),meanGatePassesPerDriver:average(rows,r=>average(r.players,p=>p.gates)),meanSixesPerRace:average(rows,r=>r.events.six),winners:rows.map(r=>r.winner)};
await writeFile(new URL('../../docs/build554/balance-report.json',import.meta.url),JSON.stringify({summary,runs:rows},null,2)+'\n');console.log(JSON.stringify(summary));
