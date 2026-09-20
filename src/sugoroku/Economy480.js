// A conserved table pool. Only this small reserve is newly supplied by the game.
export const fee480=g=>g.economy474?.fee??500;
export const bonus480=(fee,seats)=>Math.floor(fee*seats/5);
export const scale480=(amount,cap,sum)=>sum>cap?Number(BigInt(amount)*BigInt(cap)/BigInt(sum)):amount;
export function fund480(g){const fee=fee480(g);g.crystalReserve480??=bonus480(fee,4);for(const p of g.players){if(p.crystalBase480==null){p.crystalBase480=fee;p.crystals474=fee;p.crystalShrines477=0;p.crystalEvents477=0;}}}
export function grant480(g,p,wanted,ledger='crystalEvents477'){const amount=Math.max(0,Math.min(wanted,g.crystalReserve480,fee480(g)*4-p.crystals474));p.crystals474+=amount;p[ledger]+=amount;g.crystalReserve480-=amount;return amount;}
export function finish480(g){
 const fee=fee480(g),pool=g.players.reduce((sum,p)=>{p.rankStake480=Math.min(p.crystals474,Math.floor(fee/5));return sum+p.rankStake480},0),slots=[Math.floor(pool*.5),Math.floor(pool*.3),Math.floor(pool*.15)];slots.push(pool-slots.reduce((a,b)=>a+b,0));
 const rows=g.results.map(r=>{const p=g.players.find(p=>p.playerId===r.playerId),tied=g.results.filter(x=>x.place===r.place).length,prize=Math.floor(slots.slice(r.place-1,r.place-1+tied).reduce((a,b)=>a+b,0)/tied),journey=p.crystals474-p.rankStake480;return {r,p,prize,journey,raw:prize+journey}});
 const humans=rows.filter(x=>!x.p.ai),humanCap=fee*humans.length+bonus480(fee,humans.length),humanRaw=humans.reduce((n,x)=>n+x.raw,0);
 for(const x of rows){const total=x.p.ai?x.raw:scale480(x.raw,humanCap,humanRaw);x.r.crystals474={economy480:1,fee,prize:x.prize,journey:x.journey,total,net:total-fee,raw480:x.raw,stake480:x.p.rankStake480,pool480:pool,humanCount480:humans.length,humanRaw480:humanRaw,adjustment480:x.raw-total};}
}
export function validReceipt480(e){
 const ints=['fee','prize','journey','crystals','raw480','stake480','pool480','humanCount480','humanRaw480','adjustment480'];if(ints.some(k=>!Number.isSafeInteger(e[k])||e[k]<0))return false;
 const fee=e.fee,h=e.humanCount480;if(h<1||h>4||!Number.isInteger(e.place)||e.place<1||e.place>4||!Number.isInteger(e.tied)||e.tied<1||e.place+e.tied>5)return false;
 const pool=e.pool480,slots=[Math.floor(pool*.5),Math.floor(pool*.3),Math.floor(pool*.15)];slots.push(pool-slots.reduce((a,b)=>a+b,0));const prize=Math.floor(slots.slice(e.place-1,e.place-1+e.tied).reduce((a,b)=>a+b,0)/e.tied);
 // Theft can concentrate the entire conserved table pool in one player's hand.
 const tableTotal=fee*4+bonus480(fee,4);
 return pool<=Math.floor(fee/5)*4&&e.stake480<=Math.floor(fee/5)&&e.journey+e.stake480<=tableTotal&&e.prize===prize&&e.raw480===e.prize+e.journey&&e.humanRaw480>=e.raw480&&e.humanRaw480<=tableTotal&&e.crystals===scale480(e.raw480,fee*h+bonus480(fee,h),e.humanRaw480)&&e.adjustment480===e.raw480-e.crystals;
}
