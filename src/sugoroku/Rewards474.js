import{grant480,finish480}from'./Economy480.js';
import{initCrystals477,crystalCap477}from'./CrystalRules477.js';
// Shared integer arithmetic for game-earned crystals. AI seats receive no wallet payout.
export const ECONOMY474=Object.freeze({defaultFee:500,maxFee:Math.floor(Number.MAX_SAFE_INTEGER/16),checkpoints:['8','31','63']});
export const validFee474=n=>Number.isSafeInteger(n)&&n>=1&&n<=ECONOMY474.maxFee;
export const rewardMode474=g=>g.economy474?.mode==='crystal'&&validFee474(g.economy474.fee);
export const prizeSlots474=fee=>[fee*3,Math.floor(fee*7/5),Math.floor(fee*2/5),0];
export const checkpointAmount474=fee=>Math.floor(fee/5);
export function checkpoint474(g,p,node){
 if((!rewardMode474(g)&&!g.crystalRules477)||!ECONOMY474.checkpoints.includes(node))return 0;
 p.crystalStops474??=[];if(p.crystalStops474.includes(node))return 0;p.crystalStops474.push(node);initCrystals477(g);const amount=g.crystalRules480?grant480(g,p,Math.floor((g.economy474?.fee??500)/10),'crystalShrines477'):Math.min(checkpointAmount474(g.economy474?.fee??500),Math.max(0,crystalCap477(g)-p.crystals474));if(!g.crystalRules480){p.crystals474+=amount;p.crystalShrines477+=amount;}return amount;
}
export function prizes474(results,fee){const slots=prizeSlots474(fee);return results.map(row=>{const tied=results.filter(r=>r.place===row.place).length;return Math.floor(slots.slice(row.place-1,row.place-1+tied).reduce((a,b)=>a+b,0)/tied)})}
export function finishRewards474(g){if(!rewardMode474(g)||!g.results)return;if(g.crystalRules480)return finish480(g);const fee=g.economy474.fee,amounts=prizes474(g.results,fee);for(const [i,r]of g.results.entries()){const p=g.players.find(p=>p.playerId===r.playerId);r.crystals474={...(g.crystalRules477?{crystalRules477:1,shrines477:p.crystalShrines477??0,events477:p.crystalEvents477??0}:{}),fee,prize:amounts[i],journey:p.crystals474??0,total:amounts[i]+(p.crystals474??0),net:amounts[i]+(p.crystals474??0)-fee}}}
