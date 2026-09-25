import * as H from '../../src/hide/Rules536.js';
import {writeFile} from 'node:fs/promises';
const rows=[];
for(const seed of [...Array.from({length:24},(_,i)=>i+1),540,541]){
 const g=H.makeHide536({id:'s'+seed,code:'S',hostId:'p0',members:[{playerId:'p0',name:'鬼',choice:{speciesId:'slime'}}]});g.role='hunter';H.startHide536(g,0,seed);g.players.forEach(p=>p.ai=true);
 const events=[];let last=0;for(let at=50;at<=200000&&g.phase!=='result';at+=50){H.advanceHide536(g,at);for(const e of g.events)if(e.id>last){events.push(e);last=e.id}}
 if(g.phase!=='result')throw Error('unfinished match '+seed);
 rows.push({seed,side:g.winningSide,reason:g.reason,elapsed:g.elapsed,catches:g.players[0].catches,seals:g.heist541.seals.filter(s=>s.done).length,alarms:events.filter(e=>e.type==='alarm559').length,gate:g.players.find(p=>p.escaped541)?.escapeGate559??null});
}
const summary={games:rows.length,hunterWins:rows.filter(r=>r.side==='hunter').length,hiderWins:rows.filter(r=>r.side==='hiders').length,medianSeconds:rows.map(r=>r.elapsed/1000).sort((a,b)=>a-b)[Math.floor(rows.length/2)],maximumSeconds:Math.max(...rows.map(r=>r.elapsed/1000)),noAlarmGames:rows.filter(r=>!r.alarms).length,notes:'Deterministic AI-versus-AI calibration, not a human win-rate estimate.'};
await writeFile(new URL('../../docs/build559/simulation.json',import.meta.url),JSON.stringify({summary,rows},null,2));console.log(JSON.stringify(summary));
