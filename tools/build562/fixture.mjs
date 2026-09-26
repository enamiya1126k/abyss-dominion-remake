import * as rules from '../../src/luck/Rules511.js';
export const members=Array.from({length:4},(_,seat)=>({playerId:'p'+seat,name:['えなみ','りおん','より','ひで'][seat],choice:{id:'m'+seat,speciesId:['slime','goblin','wolf','skeleton'][seat]}}));
export function game({round=3,rounds=8,items=['echo','echo','echo','echo'],distance=[1000,3000,2000,0],order=[0,1,2,3]}={}){
 const g=rules.makeLuck511({id:'audit562',code:'AUDIT',hostId:'p0',members});g.rounds=rounds;rules.startLuck511(g,0,rules.drawPlan511(()=>0,rounds));g.round=round;g.boxes511=[0,0,0,0];g.items511=[0,0,0,0];g.auto511=[false,false,false,false];g.plan511[round-1].order=[...order];
 g.players.forEach((p,i)=>{p.distance=distance[i];g.plan511[round-1].seats[i].boxes[0][0]=items[i];g.plan511[round-1].seats[i].dice=[1,2,3];g.plan511[round-1].seats[i].jackpot=1});return g;
}
export const gear=(id,n=1,round=1)=>Array.from({length:n},()=>({id,round}));
export const resolve=g=>rules.resolveRound511(g,0);
export function commit(g,event=resolve(g)){
 const at=Math.max(g.updatedAt??0,g.phaseAt??0)+1;g.event=event;g.history.push(structuredClone(event));g.phase='run';g.phaseAt=at;g.nextAt=at+rules.LUCK511.runMs;rules.advanceLuck511(g,g.nextAt);return g;
}
export function select(g,items){g.boxes511=[0,0,0,0];g.items511=[0,0,0,0];g.auto511=[false,false,false,false];items.forEach((id,i)=>g.plan511[g.round-1].seats[i].boxes[0][0]=id);return g;}
export const bigint=x=>BigInt(x??0);
