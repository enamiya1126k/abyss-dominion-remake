const RARITY_MATERIAL_EXP={N:20,R:45,SR:100,SSR:220,LR:500};

export function equipmentExpNeed(level){
 const lv=Math.max(1,Number(level)||1);
 return Math.floor(35+lv*18+Math.pow(lv,1.35)*7);
}

export function equipmentInvestedExp(item){
 const level=Math.max(1,Number(item?.level??1));
 let total=Math.max(0,Number(item?.exp??0));
 for(let lv=1;lv<level;lv++)total+=equipmentExpNeed(lv);
 return Math.floor(total);
}

export function equipmentMaterialExp(material,target){
 const base=RARITY_MATERIAL_EXP[material?.rarity]??15;
 const sameName=material?.name===target?.name?5:1;
 const inherited=equipmentInvestedExp(material);
 const plusValue=Math.max(0,Number(material?.plus??0))*55;
 return Math.max(1,Math.floor(base*sameName+inherited+plusValue));
}

export function addEquipmentExp(item,amount){
 item.level=Math.max(1,Number(item.level??1));
 item.exp=Math.max(0,Number(item.exp??0));
 let gained=0,remaining=Math.max(0,Math.floor(amount));
 while(remaining>0){
  const need=equipmentExpNeed(item.level);
  const step=Math.min(remaining,Math.max(0,need-item.exp));
  item.exp+=step;remaining-=step;
  if(item.exp>=need){item.exp-=need;item.level++;gained++;continue}
  break
 }
 return{gained,level:item.level,exp:item.exp,overflow:0};
}

export function enhancementMaterialCandidates(state,targetId){
 const target=state.equipment?.find(item=>item.id===targetId);
 if(!target)return[];
 return(state.equipment??[]).filter(item=>item.id!==targetId&&!item.equippedBy&&!item.favorite&&!item.locked&&!item.ruleOverrides?.unsellable)
  .sort((a,b)=>Number(b.name===target.name)-Number(a.name===target.name)||equipmentMaterialExp(b,target)-equipmentMaterialExp(a,target));
}

export function consumeEquipmentMaterial(state,targetId,materialId){
 return consumeEquipmentMaterials(state,targetId,[materialId]);
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
 const invalid=materials.find(item=>item.equippedBy||item.favorite||item.locked||item.ruleOverrides?.unsellable);
 if(invalid)return{ok:false,message:`${invalid.name}は保護中のため素材にできません。`};
 const amount=materials.reduce((sum,item)=>sum+equipmentMaterialExp(item,target),0),ids=new Set(materials.map(item=>item.id));
 state.equipment=state.equipment.filter(item=>!ids.has(item.id));
 const result=addEquipmentExp(target,amount);
 return{ok:true,target,materials,amount,...result};
}
