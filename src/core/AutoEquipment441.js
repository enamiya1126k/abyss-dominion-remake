import{signatureEquipmentOwnerId,signatureEquipmentMatchesMonster}from'./SignatureWeaponSystem.js';
// Reserve each signature for its owner before considering it for another member.
export function autoEquipmentEligible441(item,monster,party,canEquip,subslot){
 if(!canEquip(item,monster,subslot))return false;
 if(signatureEquipmentMatchesMonster(item,monster))return true;
 if(item.equippedBy&&item.equippedBy!==monster.id)return false;
 if(signatureEquipmentOwnerId(item)&&party.some(m=>m.id!==monster.id&&signatureEquipmentMatchesMonster(item,m)&&['weaponRight','weaponLeft'].some(slot=>canEquip(item,m,slot))))return false;
 return true;
}
export function bestAutoEquipment441(items,monster,power){
 const sorted=[...items].sort((a,b)=>power(b)-power(a)),strongest=sorted[0];if(!strongest)return null;
 const own=sorted.find(item=>signatureEquipmentMatchesMonster(item,monster));
 // Prefer owner resonance without replacing much stronger base equipment.
 return own&&power(own)>=power(strongest)*.75?own:strongest;
}
