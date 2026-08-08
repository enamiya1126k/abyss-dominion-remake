import{ensureEquipmentAffixes,affixQuality}from"../../data/equipmentAffixes.js?v=2.1.0-release";

export function equipmentSocketCapacity(item){
 return 4;
}

export function equipmentSocketSummary(item,{compact=false}={}){
 const affixes=ensureEquipmentAffixes(item).slice(0,4);
 const slots=Array.from({length:4},(_,index)=>{
  const affix=affixes[index];
  if(!affix)return'<i class="socket-empty" aria-label="空きスロット">◇</i>';
  const quality=affixQuality(affix);
  return`<i class="socket-filled" style="--socket-color:${quality.color}" title="${quality.name}オプション">◆</i>`;
 }).join("");
 return`<span class="equipment-socket-summary${compact?" compact":""}" aria-label="オプションスロット">${slots}</span>`;
}
