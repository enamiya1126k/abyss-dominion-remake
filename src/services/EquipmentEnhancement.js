const RARITY_MATERIAL_EXP={N:20,R:45,SR:100,SSR:220,LR:500};
export const EQUIPMENT_LEVEL_CAP=99;

export function equipmentExpNeed(level){
 const lv=Math.max(1,Number(level)||1);
 return Math.floor(35+lv*18+Math.pow(lv,1.35)*7);
}

export function equipmentMaterialExp(material,target){
 const base=RARITY_MATERIAL_EXP[material?.rarity]??15;
 const growth=(Math.max(1,Number(material?.level??1))-1)*8+(Number(material?.plus??0)*55);
 const sameName=material?.name===target?.name?5:1;
 return Math.max(1,Math.floor((base+growth)*sameName));
}

export function addEquipmentExp(item,amount){
 item.level=Math.max(1,Number(item.level??1));
 item.exp=Math.max(0,Number(item.exp??0));
 let gained=0,remaining=Math.max(0,Math.floor(amount));
 while(remaining>0&&item.level<EQUIPMENT_LEVEL_CAP){
  const need=equipmentExpNeed(item.level);
  const step=Math.min(remaining,need-item.exp);
  item.exp+=step;remaining-=step;
  if(item.exp>=need){item.exp=0;item.level++;gained++}
 }
 if(item.level>=EQUIPMENT_LEVEL_CAP)item.exp=0;
 return{gained,level:item.level,exp:item.exp,overflow:remaining};
}

export function enhancementMaterialCandidates(state,targetId){
 const target=state.equipment?.find(item=>item.id===targetId);
 if(!target)return[];
 return(state.equipment??[]).filter(item=>item.id!==targetId&&!item.equippedBy&&!item.favorite&&!item.locked)
  .sort((a,b)=>Number(b.name===target.name)-Number(a.name===target.name)||equipmentMaterialExp(b,target)-equipmentMaterialExp(a,target));
}

export function consumeEquipmentMaterial(state,targetId,materialId){
 const target=state.equipment?.find(item=>item.id===targetId);
 const material=state.equipment?.find(item=>item.id===materialId);
 if(!target||!material)return{ok:false,message:"装備が見つかりません。"};
 if(target.id===material.id)return{ok:false,message:"強化対象自身は素材にできません。"};
 if(material.equippedBy||material.favorite||material.locked)return{ok:false,message:"装備中・お気に入り・ロック中の装備は素材にできません。"};
 if((target.level??1)>=EQUIPMENT_LEVEL_CAP)return{ok:false,message:"現在のレベル上限に到達しています。"};
 const amount=equipmentMaterialExp(material,target);
 state.equipment=state.equipment.filter(item=>item.id!==material.id);
 const result=addEquipmentExp(target,amount);
 return{ok:true,target,material,amount,...result,sameName:material.name===target.name};
}


export function projectEquipmentGrowth(item,amount){
 const copy={level:Math.max(1,Number(item?.level??1)),exp:Math.max(0,Number(item?.exp??0))};
 return addEquipmentExp(copy,amount);
}

export function consumeEquipmentMaterials(state,targetId,materialIds=[]){
 const target=state.equipment?.find(item=>item.id===targetId);
 if(!target)return{ok:false,message:"強化対象が見つかりません。"};
 const unique=[...new Set(materialIds)].filter(id=>id!==targetId),materials=unique.map(id=>state.equipment?.find(item=>item.id===id)).filter(Boolean);
 if(!materials.length)return{ok:false,message:"素材が選択されていません。"};
 const invalid=materials.find(item=>item.equippedBy||item.favorite||item.locked);
 if(invalid)return{ok:false,message:`${invalid.name}は装備中・お気に入り・ロック中のため素材にできません。`};
 if((target.level??1)>=EQUIPMENT_LEVEL_CAP)return{ok:false,message:"現在のレベル上限に到達しています。"};
 const amount=materials.reduce((sum,item)=>sum+equipmentMaterialExp(item,target),0),ids=new Set(materials.map(item=>item.id));
 state.equipment=state.equipment.filter(item=>!ids.has(item.id));
 const result=addEquipmentExp(target,amount);
 return{ok:true,target,materials,amount,...result};
}
