// Shared integer arithmetic for game-earned crystals. AI seats receive no wallet payout.
export const ECONOMY474=Object.freeze({defaultFee:500,maxFee:Math.floor(Number.MAX_SAFE_INTEGER/16),checkpoints:['8','31','63']});
export const validFee474=n=>Number.isSafeInteger(n)&&n>=1&&n<=ECONOMY474.maxFee;
export const rewardMode474=g=>g.economy474?.mode==='crystal'&&validFee474(g.economy474.fee);
export const prizeSlots474=fee=>[fee*3,Math.floor(fee*7/5),Math.floor(fee*2/5),0];
export const checkpointAmount474=fee=>Math.floor(fee/5);
export function checkpoint474(g,p,node){
 if(!rewardMode474(g)||!ECONOMY474.checkpoints.includes(node))return 0;
 p.crystalStops474??=[];if(p.crystalStops474.includes(node))return 0;p.crystalStops474.push(node);const amount=checkpointAmount474(g.economy474.fee);p.crystals474=p.crystalStops474.length*amount;return amount;
}
export function prizes474(results,fee){const slots=prizeSlots474(fee);return results.map(row=>{const tied=results.filter(r=>r.place===row.place).length;return Math.floor(slots.slice(row.place-1,row.place-1+tied).reduce((a,b)=>a+b,0)/tied)})}
export function finishRewards474(g){if(!rewardMode474(g)||!g.results)return;const fee=g.economy474.fee,amounts=prizes474(g.results,fee);for(const [i,r]of g.results.entries()){const p=g.players.find(p=>p.playerId===r.playerId);r.crystals474={fee,prize:amounts[i],journey:p.crystals474??0,total:amounts[i]+(p.crystals474??0),net:amounts[i]+(p.crystals474??0)-fee}}}
