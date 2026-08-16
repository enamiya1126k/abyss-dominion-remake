const RESONANCES=Object.freeze({
 myth_enami:Object.freeze({id:"enami-multitask",ownerId:"myth_enami",ownerName:"えなみ",name:"多動共鳴",description:"スキル使用後、各ラウンド1回まで35%で追加行動。",extraActionChance:.35}),
 myth_yori:Object.freeze({id:"yori-chain",ownerId:"myth_yori",ownerName:"より",name:"照準連鎖",description:"同じ敵を狙い続けるほど与ダメージと会心率が上昇。",damagePerStack:.1,critPerStack:.05,maxStacks:4}),
 myth_rion:Object.freeze({id:"rion-care",ownerId:"myth_rion",ownerName:"りおん",name:"支援共鳴",description:"回復・蘇生時、味方全体へ最大HP12%の盾と最大MP8%回復。",shieldRate:.12,mpRate:.08}),
 myth_hide:Object.freeze({id:"hide-guardian",ownerId:"myth_hide",ownerName:"ひで",name:"守護反撃",description:"HP35%以下の味方をかばい、被害40%軽減後に反撃。",lowHpThreshold:.35,damageReduction:.4,counterPower:.75})
});

export function signatureWeaponOwnerId(item){
 if(!item||item.slot!=="weapon")return null;
 const owner=String(item.ruleOverrides?.mythicOwner??"");
 return RESONANCES[owner]?owner:null;
}

export function signatureWeaponDefinition(ownerId){return RESONANCES[String(ownerId??"")]??null}

export function signatureWeaponForMonster(state,monster){
 if(!state||!monster)return null;
 const items=new Map((state.equipment??[]).map(item=>[item.id,item]));
 for(const slot of["weaponRight","weaponLeft"]){
  const item=items.get(monster.equipment?.[slot]),ownerId=signatureWeaponOwnerId(item);
  if(ownerId)return{item,slot,ownerId,definition:RESONANCES[ownerId],active:monster.speciesId===ownerId};
 }
 return null;
}

export function signatureWeaponState(state,monster,item=null){
 const ownerId=item?signatureWeaponOwnerId(item):null;
 if(item&&!ownerId)return null;
 const resonance=item?{item,ownerId,definition:RESONANCES[ownerId],active:monster?.speciesId===ownerId}:signatureWeaponForMonster(state,monster);
 if(!resonance)return null;
 return{...resonance,status:resonance.active?"専用共鳴 発動中":"専用効果 未発動"};
}

export function activeSignatureResonances(state,party=[]){
 return party.map(monster=>({monster,...(signatureWeaponForMonster(state,monster)??{})})).filter(entry=>entry.active&&entry.definition);
}

export const SIGNATURE_WEAPON_RESONANCES=RESONANCES;
