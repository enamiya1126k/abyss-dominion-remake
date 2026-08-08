export const STATUS_EFFECTS = Object.freeze({
 poison:{id:"poison",name:"毒",kind:"damageOverTime",persistsAfterBattle:true,captureEligible:true},
 burn:{id:"burn",name:"炎上",kind:"damageOverTime",persistsAfterBattle:true,captureEligible:true},
 bleed:{id:"bleed",name:"出血",kind:"damageOverTime",persistsAfterBattle:true,captureEligible:true},
 curse:{id:"curse",name:"呪い",kind:"persistentDebuff",persistsAfterBattle:true,captureEligible:true},
 paralysis:{id:"paralysis",name:"麻痺",kind:"control",persistsAfterBattle:true,captureEligible:true},
 freeze:{id:"freeze",name:"凍結",kind:"control",persistsAfterBattle:true,captureEligible:true},
 shock:{id:"shock",name:"感電",kind:"control",persistsAfterBattle:true,captureEligible:true},
 sleep:{id:"sleep",name:"睡眠",kind:"control",persistsAfterBattle:true,captureEligible:true},
 atkUp:{id:"atkUp",name:"ATK上昇",kind:"buff",persistsAfterBattle:false},
 defUp:{id:"defUp",name:"DEF上昇",kind:"buff",persistsAfterBattle:false},
 spdUp:{id:"spdUp",name:"SPD上昇",kind:"buff",persistsAfterBattle:false},
 barrier:{id:"barrier",name:"バリア",kind:"buff",persistsAfterBattle:false},
 atkDown:{id:"atkDown",name:"ATK低下",kind:"debuff",persistsAfterBattle:false},
 defDown:{id:"defDown",name:"DEF低下",kind:"debuff",persistsAfterBattle:false},
 spdDown:{id:"spdDown",name:"SPD低下",kind:"debuff",persistsAfterBattle:false}
});

export function isPersistentStatus(id){
 return Boolean(STATUS_EFFECTS[String(id??"")]?.persistsAfterBattle);
}

function normalizeOnePersistentAilment(value){
 if(value==null)return null;
 const source=typeof value==="string"?{id:value}:value;
 if(!source||typeof source!=="object"||Array.isArray(source))return null;
 const id=String(source.id??source.statusId??source.kind??"");
 const definition=STATUS_EFFECTS[id];
 if(!definition?.persistsAfterBattle)return null;
 const ailment={id,name:String(source.name??definition.name),kind:definition.kind};
 const power=Number(source.power??source.value);
 if(Number.isFinite(power)&&power>0)ailment.power=Math.max(0,Math.min(1,power));
 const captureBonus=Number(source.captureBonus);
 if(Number.isFinite(captureBonus)&&captureBonus>0)ailment.captureBonus=Math.max(0,Math.min(1,captureBonus));
 if(source.sourceMonsterId)ailment.sourceMonsterId=String(source.sourceMonsterId);
 return ailment;
}

export function normalizePersistentAilments(value){
 const source=Array.isArray(value)?value:[value];
 const normalized=[];
 for(const entry of source.flat(3)){
  const ailment=normalizeOnePersistentAilment(entry);
  if(!ailment)continue;
  const existing=normalized.find(item=>item.id===ailment.id);
  if(existing){
   existing.power=Math.max(Number(existing.power)||0,Number(ailment.power)||0)||undefined;
   existing.captureBonus=Math.max(Number(existing.captureBonus)||0,Number(ailment.captureBonus)||0)||undefined;
  }else normalized.push(ailment);
 }
 return normalized;
}

// Dedicated capture values can be supplied by StatusEffectMaster through
// captureBonus. Until then, existing status power remains the data source;
// this avoids introducing a second hard-coded balance table.
export function captureStatusBonus(statuses){
 return normalizePersistentAilments(statuses).reduce((sum,status)=>{
  if(!STATUS_EFFECTS[status.id]?.captureEligible)return sum;
  const value=Number(status.captureBonus??status.power);
  return sum+(Number.isFinite(value)&&value>0?value:0);
 },0);
}

export function persistentAilmentLabel(status){
 const id=typeof status==="string"?status:status?.id;
 return STATUS_EFFECTS[id]?.name??status?.name??String(id??"");
}
