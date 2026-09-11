import {equipmentDisplayRarity} from '../data/equipment.js?v=3.1.55-build375';

export function equippedEquipmentIds404(state){
 return new Set((state.monsters??[]).flatMap(monster=>Object.values(monster.equipment??{})).filter(Boolean));
}
export function equipmentProtection404(state,item,equipped=equippedEquipmentIds404(state)){
 return {equipped:Boolean(item.equippedBy||equipped.has(item.id)),locked:Boolean(item.locked),favorite:Boolean(item.favorite),permanent:Boolean(item.ruleOverrides?.unsellable)};
}
export function equipmentMaterialSummary404(state,targetId){
 const equipped=equippedEquipmentIds404(state),summary={total:0,usable:0,excluded:0,equipped:0,locked:0,favorite:0,permanent:0};
 for(const item of state.equipment??[]){
  if(item.id===targetId)continue;
  summary.total++;
  const protection=equipmentProtection404(state,item,equipped);
  for(const key of ['equipped','locked','favorite','permanent'])if(protection[key])summary[key]++;
  if(Object.values(protection).some(Boolean))summary.excluded++;else summary.usable++;
 }
 return summary;
}
export function equipmentLockEntries404(state,{slot='all',status='all',rarity='all',targetId=null}={}){
 return (state.equipment??[]).filter(item=>item.id!==targetId&&(slot==='all'||item.slot===slot)&&(rarity==='all'||equipmentDisplayRarity(item)===rarity)&&(status==='all'||(status==='locked'?item.locked:!item.locked)));
}
export function equipmentLockPreset404(entries,mode,target=null){
 return entries.filter(item=>mode==='all'||mode==='low'&&['N','R'].includes(equipmentDisplayRarity(item))||mode==='same'&&target&&item.name===target.name).map(item=>item.id);
}
// A lock changes protection only. Equipment owners, permanent restrictions,
// affix locks, currency and levels never change. Favorites require an opt-in.
export function applyEquipmentProtection404(state,ids,locked,{clearFavorites=false,excludeId=null,persist=null}={}){
 if(typeof locked!=='boolean')return {ok:false,message:'ロック操作を確認できません。'};
 const selected=new Set(ids),targets=(state.equipment??[]).filter(item=>item.id!==excludeId&&selected.has(item.id));
 const changed=targets.filter(item=>Boolean(item.locked)!==locked||!locked&&clearFavorites&&item.favorite);
 if(!changed.length)return {ok:false,message:targets.length?'選択した装備はすでにこの状態です。':'装備を選択してください。'};
 const before=changed.map(item=>({item,locked:item.locked,hasLock:Object.hasOwn(item,'locked'),favorite:item.favorite,hasFavorite:Object.hasOwn(item,'favorite')}));
 const favoritesCleared=!locked&&clearFavorites?changed.filter(item=>item.favorite).length:0;
 for(const item of changed){item.locked=locked;if(!locked&&clearFavorites)item.favorite=false;}
 try{if(persist&&persist()===false)throw new Error('save failed');}
 catch{
  for(const row of before){if(row.hasLock)row.item.locked=row.locked;else delete row.item.locked;if(row.hasFavorite)row.item.favorite=row.favorite;else delete row.item.favorite;}
  return {ok:false,message:'保存できなかったため、ロック状態を元に戻しました。'};
 }
 return {ok:true,count:changed.length,locked,favoritesCleared};
}
