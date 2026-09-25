import {make550,start550,advance550,RICOCHET550 as C} from '../../src/ricochet550/Rules550.js';
import {writeFile} from 'node:fs/promises';
const rows=[];
for(const seed of [23,91,552,714,960,1729,2501,4191]){
 const g=make550({id:'balance',code:'B',partyId:'P',hostId:'p',now:0,members:[],mode:'pinball'});start550(g,0,seed);let seen=0,fevers=0,jackpots=0;
 for(let at=20;at<=8*C.play;at+=20){advance550(g,at);for(const e of g.events)if(e.id>seen){seen=e.id;if(e.type==='fever')fevers++;if(e.type==='jackpot')jackpots++;}}
 rows.push({seed,fevers,jackpots,winner:g.results[0].seat,players:g.players.map(p=>({seat:p.seat,score:p.score,hits:p.hits,bestChain:p.bestCombo552,jackpots:p.jackpots552,parts:p.parts}))});
}
await writeFile(new URL('../../docs/build552/balance-report.json',import.meta.url),JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify(rows.map(({seed,fevers,jackpots,winner,players})=>({seed,fevers,jackpots,winner,scores:players.map(p=>p.score),hits:players.map(p=>p.hits)}))));
