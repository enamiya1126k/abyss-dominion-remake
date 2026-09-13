// The fourteen former home-shop consumables, awarded by local dungeon chests.
// Kept separate from the server's existing treasure contract and RNG sequence.
export const CHEST_SUPPLIES427=Object.freeze([
 ['captureCrystals','捕獲結晶',1,1],
 ['potions','薬草',20,3],['highPotions','上級回復薬',13,2],['partyPotions','全体回復薬',8,1],
 ['manaPotions','魔力水',18,3],['highManaPotions','上級魔力水',12,2],['partyManaPotions','全体魔力水',8,1],
 ['fullManaPotions','魔力全快薬',5,1],['partyFullManaPotions','全体魔力全快薬',2,1],
 ['reviveLeaves','蘇生の葉',3,1],['statusCures','浄化薬',5,2],['partyStatusCures','全体浄化薬',2,1],
 ['fullHeals','万能霊薬',2,1],['partyFullHeals','全体万能霊薬',1,1]
].map(([id,name,weight,maxQuantity])=>Object.freeze({id,name,weight,maxQuantity})));
const count=n=>Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(n)||0)));
export function mergeChestSupplies427(rows=[]){
 const totals=new Map();
 for(const row of rows){if(!CHEST_SUPPLIES427.some(x=>x.id===row?.id))continue;totals.set(row.id,count((totals.get(row.id)??0)+count(row.quantity)));}
 return [...totals].filter(([,quantity])=>quantity>0).map(([id,quantity])=>({id,name:CHEST_SUPPLIES427.find(x=>x.id===id).name,quantity}));
}
export function rollChestSupplies427({slots=2,random=Math.random}={}){
 const pool=[...CHEST_SUPPLIES427],result=[],draw=()=>Math.max(0,Math.min(1-Number.EPSILON,Number(random())||0));
 for(let i=0;i<Math.max(1,Math.min(3,count(slots)));i++){
  let cursor=draw()*pool.reduce((sum,item)=>sum+item.weight,0),index=0;
  while(index<pool.length-1&&cursor>=pool[index].weight)cursor-=pool[index++].weight;
  const item=pool.splice(index,1)[0],quantity=item.maxQuantity===1?1:1+Math.floor(draw()*item.maxQuantity);
  result.push({id:item.id,name:item.name,quantity});
 }
 return result;
}
// Called inside each chest's existing save/rollback transaction, never by a view.
export function grantChestSupplies427(state,rows){
 state.inventory??={};const awarded=[];
 for(const row of mergeChestSupplies427(rows)){
  const before=count(state.inventory[row.id]),quantity=Math.min(row.quantity,Number.MAX_SAFE_INTEGER-before);
  state.inventory[row.id]=before+quantity;if(quantity)awarded.push({...row,quantity});
 }
 return awarded;
}
