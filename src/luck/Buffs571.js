export const copies571=gear=>gear.stack??1;
export const count571=(gear,id)=>(gear??[]).filter(x=>x.id===id).reduce((n,x)=>n+copies571(x),0);
export const total571=gear=>(gear??[]).reduce((n,x)=>n+copies571(x),0);
export const retain571=(n,copies)=>copies&&n>0?n-Math.ceil(n/2**Math.min(1023,copies)):0;
export const eligible571=(item,round,rounds)=>!item.early||round<=Math.max(1,Math.floor(rounds*item.early));
export function groupGear571(player){const map=new Map();for(const gear of player.loadout??[]){const e=map.get(gear.id)??{id:gear.id,count:0};e.count+=copies571(gear);map.set(gear.id,e);}return [...map.values()];}
export const MULTIPLIERS571=[['growth','成長'],['solar','太陽'],['coil','コイル'],['hunt','命中チャージ'],['combo','攻撃実績'],['miles','走破'],['pioneer','先陣'],['interest','出発記録'],['wings','無傷'],['battery','大技装備'],['overdrive','限界突破'],['crown','終幕'],['turbine','タービン']];

// Each tenfold milestone adds a tier: no metre ceiling and no self-exponentiating distance feedback.
export function milestone571(distance,step){const n=BigInt(distance??0)/BigInt(step);return n<1n?1n:1n+BigInt(n.toString().length);}
