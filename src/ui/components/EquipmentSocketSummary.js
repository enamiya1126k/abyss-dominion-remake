import{equipmentDisplayRarity}from"../../data/equipment.js?v=1.13.0-alpha115";
import{ensureEquipmentAffixes,affixQuality}from"../../data/equipmentAffixes.js?v=1.2.0";

const CAPACITY=Object.freeze({
 N:1,R:1,SR:2,SSR:3,UR:4,LR:5,"神話":6,"深淵":6,"十神":6
});

export function equipmentSocketCapacity(item){
 return Math.max(1,Math.min(6,CAPACITY[equipmentDisplayRarity(item)]??1));
}

export function equipmentSocketSummary(item,{compact=false}={}){
 const affixes=ensureEquipmentAffixes(item).slice(0,6);
 const capacity=equipmentSocketCapacity(item);
 const slots=Array.from({length:6},(_,index)=>{
  if(index>=capacity)return'<i class="socket-locked" aria-label="未解禁">−</i>';
  const affix=affixes[index];
  if(!affix)return'<i class="socket-empty" aria-label="空きスロット">◇</i>';
  const quality=affixQuality(affix);
  return`<i class="socket-filled" style="--socket-color:${quality.color}" title="${quality.name}オプション">◆</i>`;
 }).join("");
 return`<span class="equipment-socket-summary${compact?" compact":""}" aria-label="オプションスロット">${slots}</span>`;
}
