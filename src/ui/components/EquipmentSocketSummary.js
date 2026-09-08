import{RAID_VAJRA_WEAPON_DESCRIPTION}from"../../core/RaidPresentation.js?v=3.1.48-build368";
import{ensureEquipmentAffixes,affixQuality}from"../../data/equipmentAffixes.js?v=3.1.55-build375";

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
 return`<span class="equipment-socket-summary${compact?" compact":""}" aria-label="オプションスロット">${slots}</span>${item?.signatureWeaponEffectId==="raid-vajra-fang368"&&!compact?`<small class="raid-weapon-description">${RAID_VAJRA_WEAPON_DESCRIPTION}</small>`:""}`;
}
