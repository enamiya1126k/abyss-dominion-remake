import{SLOT_UNLOCK_LEVEL,compatibleSubslots}from"../data/equipment.js?v=0.9.15-alpha.32-phase10-10-release-audit";

export const EQUIPMENT_SLOT_ORDER=Object.freeze([
 "weaponRight",
 "armorBody",
 "accessoryNeck",
 "armorSupport",
 "accessoryFinger",
 "weaponLeft"
]);

export function emptyEquipmentLoadout(){
 return Object.fromEntries(EQUIPMENT_SLOT_ORDER.map(slot=>[slot,null]));
}

function migratedLoadout(monster){
 const old=monster?.equipment&&typeof monster.equipment==="object"?monster.equipment:{};
 return{
  weaponRight:old.weaponRight??old.weapon??null,
  armorBody:old.armorBody??old.armor??null,
  accessoryNeck:old.accessoryNeck??old.accessory??null,
  armorSupport:old.armorSupport??null,
  accessoryFinger:old.accessoryFinger??null,
  weaponLeft:old.weaponLeft??null
 };
}

export function canEquipInSubslot(item,monster,subslot){
 if(!item||!monster||!EQUIPMENT_SLOT_ORDER.includes(subslot))return false;
 if((Number(monster.level)||1)<(SLOT_UNLOCK_LEVEL[subslot]??1))return false;
 return compatibleSubslots(item).includes(subslot);
}

export function normalizeEquipmentLoadouts(state,{partyOnly=true}={}){
 state.equipment=Array.isArray(state.equipment)?state.equipment:[];
 state.monsters=Array.isArray(state.monsters)?state.monsters:[];
 const byId=new Map(state.equipment.filter(Boolean).map(item=>[item.id,item]));
 const partyIds=new Set(Array.isArray(state.party)?state.party:[]);
 const globallyEquipped=new Set();
 const repairs={missing:0,duplicate:0,incompatible:0,locked:0,twoHanded:0,reserve:0};
 for(const item of state.equipment)item.equippedBy=null;

 for(const monster of state.monsters){
  const source=migratedLoadout(monster),slots=emptyEquipmentLoadout();
  if(partyOnly&&!partyIds.has(monster.id)){
   repairs.reserve+=Object.values(source).filter(Boolean).length;
   monster.equipment=slots;
   continue;
  }
  for(const subslot of EQUIPMENT_SLOT_ORDER){
   const id=source[subslot];
   if(!id)continue;
   const item=byId.get(id);
   if(!item){repairs.missing++;continue}
   if(globallyEquipped.has(id)){repairs.duplicate++;continue}
   if(!canEquipInSubslot(item,monster,subslot)){
    if((Number(monster.level)||1)<(SLOT_UNLOCK_LEVEL[subslot]??1))repairs.locked++;
    else repairs.incompatible++;
    continue;
   }
   if(subslot==="weaponLeft"){
    const right=byId.get(slots.weaponRight);
    if(right?.handedness==="twoHanded"){repairs.twoHanded++;continue}
   }
   slots[subslot]=id;
   globallyEquipped.add(id);
   item.equippedBy=monster.id;
  }
  monster.equipment=slots;
 }
 return{byId,repairs};
}

export function assignEquipmentToSubslot(state,itemId,monsterId,subslot){
 const item=state.equipment?.find(entry=>entry.id===itemId);
 const monster=state.monsters?.find(entry=>entry.id===monsterId);
 if(!item||!monster)return{ok:false,reason:"missing",message:"装備またはモンスターが見つかりません。"};
 if(!Array.isArray(state.party)||!state.party.includes(monsterId))return{ok:false,reason:"reserve",message:"控えモンスターには装備できません。"};
 if(!canEquipInSubslot(item,monster,subslot))return{ok:false,reason:"incompatible",message:"この装備は選択した部位へ装備できません。"};
 const displacedItemIds=new Set();
 const affectedMonsterIds=new Set([monsterId]);

 for(const owner of state.monsters??[]){
  for(const slot of EQUIPMENT_SLOT_ORDER){
   if(owner.equipment?.[slot]!==itemId)continue;
   owner.equipment[slot]=null;
   affectedMonsterIds.add(owner.id);
  }
 }

 const prior=monster.equipment?.[subslot];
 if(prior&&prior!==itemId)displacedItemIds.add(prior);
 monster.equipment??=emptyEquipmentLoadout();
 monster.equipment[subslot]=itemId;

 if(item.handedness==="twoHanded"&&subslot==="weaponRight"){
  const left=monster.equipment.weaponLeft;
  if(left&&left!==itemId)displacedItemIds.add(left);
  monster.equipment.weaponLeft=null;
 }
 if(subslot==="weaponLeft"){
  const rightId=monster.equipment.weaponRight;
  const right=state.equipment?.find(entry=>entry.id===rightId);
  if(right?.handedness==="twoHanded"){
   displacedItemIds.add(rightId);
   monster.equipment.weaponRight=null;
  }
 }

 const normalized=normalizeEquipmentLoadouts(state);
 return{ok:true,item,monster,affectedMonsterIds:[...affectedMonsterIds],displacedItemIds:[...displacedItemIds],repairs:normalized.repairs};
}
