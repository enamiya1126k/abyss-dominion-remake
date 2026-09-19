// Only crystals earned during this match can be lost or stolen.
export const CRYSTAL_CAP477=4;
export const crystalFee477=g=>Number.isSafeInteger(g.economy474?.fee)&&g.economy474.fee>0?g.economy474.fee:500;
export const crystalCap477=g=>crystalFee477(g)*CRYSTAL_CAP477;
export const crystalAmount477=g=>Math.max(1,Math.floor(crystalFee477(g)/5));
export function initCrystals477(g){
 g.crystalRules477=1;
 for(const p of g.players??[]){p.crystals474??=0;p.crystalShrines477??=p.crystals474;p.crystalEvents477??=0;p.crystalVisits477??=[];}
}
export function crystalNet477(g,p){return (p?.crystals474??0)-(g.economy474?.mode==='crystal'?crystalFee477(g):0);}
export function applyCrystal477(g,actor,target,mode){
 initCrystals477(g);const cap=crystalCap477(g),unit=crystalAmount477(g),before=target.crystals474,changes=[];
 if(mode==='steal'){
  const n=actor===target?0:Math.min(unit,before,cap-actor.crystals474);
  target.crystals474-=n;actor.crystals474+=n;target.crystalEvents477-=n;actor.crystalEvents477+=n;
  changes.push({playerId:target.playerId,delta:-n,total:target.crystals474},{playerId:actor.playerId,delta:n,total:actor.crystals474});
 }else{
  const next=mode==='gain'?Math.min(cap,before+unit):mode==='double'?Math.min(cap,before*2):mode==='half'?Math.floor(before/2):mode==='lose'?0:before;
  target.crystals474=next;target.crystalEvents477+=next-before;changes.push({playerId:target.playerId,delta:next-before,total:next});
 }
 return changes;
}
const info={
 gain:{name:'魔晶石の泉',label:'💎獲得',icon:'◆',tone:'blue',text:'対戦中の💎を獲得（参加費の20％、最低1）。',mode:'gain'},
 steal:{name:'魔晶石の略奪',label:'💎を奪う',icon:'↝',tone:'purple',text:'相手1人から、対戦中に獲得した💎を奪う（参加費の20％まで、最低1）。相手の手持ちが上限。防御・反射が可能。',mode:'steal'},
 double:{name:'双晶の祭壇',label:'💎 ×2',icon:'×2',tone:'gold',text:'対戦中に獲得した💎を2倍にする。0なら0のまま。',mode:'double'},
 half:{name:'血晶の徴収',label:'💎 半減',icon:'½',tone:'black',text:'対戦中に獲得した💎が半分になる（端数切り捨て）。防御可能。',mode:'half'},
 lose:{name:'魔晶石を喰う奈落',label:'💎 全喪失',icon:'×',tone:'black',text:'対戦中に獲得した💎をすべて失う。防御可能。',mode:'lose'}
};
export const CRYSTAL_TILES477=Object.freeze({4:'gain',12:'steal',20:'double',24:'half',29:'gain',40:'steal',46:'lose',52:'double',58:'gain',66:'steal',72:'half',76:'lose'});
export function crystalTile477(node){
 const d=info[CRYSTAL_TILES477[node.id]];if(!d)return node;
 return {...node,name:d.name,kind:'crystal477',crystalMode477:d.mode,label477:d.label,icon:d.icon,tone:d.tone,text:d.text+' 各マスは1人1回。獲得分の保有上限は参加費の4倍。順位賞金・本編の残高は対象外。無料練習は参加費500相当の仮想💎。',effects:[{type:'crystal477',mode:d.mode,...(d.mode==='steal'?{target:'choose',harmful:true}:['half','lose'].includes(d.mode)?{harmful:true}:{})}]};
}
