import{abyssGoldReward}from"../core/AbyssSkillTreeSystem.js?v=1.1.0";
import{equipmentDisplayRarity}from"../data/equipment.js?v=1.2.0";

export const EQUIPMENT_LIMIT=500;
export const RESERVE_LIMIT=30;

export function equipmentSellPrice(item,state=null){
 const base=({N:15,R:45,SR:110,SSR:260,UR:430,LR:650,"神話":1100,"深淵":1800,"十神":3000}[equipmentDisplayRarity(item)]??10)+(item.plus??0)*25+(item.level??1)*2;
 return state?abyssGoldReward(state,base,"equipmentSale"):base;
}

export function slotLabel(slot){
 return{weapon:"武器",armor:"防具",accessory:"アクセ",weaponRight:"右手武器",weaponLeft:"左手武器",armorBody:"胴防具",armorSupport:"補助防具",accessoryNeck:"首アクセ",accessoryFinger:"指アクセ"}[slot]??slot;
}

export function ensureEquipmentStorage(state){
 state.equipment??=[];
 state.reserveEquipment??=[];
 state.bossEquipmentVault??=[];
}

export function receiveEquipment(state,item,{bossReward=false}={}){
 ensureEquipmentStorage(state);
 if(state.equipment.length<EQUIPMENT_LIMIT){
  state.equipment.push(item);
  return{location:"inventory",message:"装備一覧へ追加"};
 }
 if(state.reserveEquipment.length<RESERVE_LIMIT){
  item.equippedBy=null;
  state.reserveEquipment.push(item);
  return{location:"reserve",message:`所持上限のため予備BOXへ転送（${state.reserveEquipment.length}/${RESERVE_LIMIT}）`};
 }
 if(bossReward||item.ruleOverrides?.unsellable){
  item.equippedBy=null;
  state.bossEquipmentVault.push(item);
  return{location:"bossVault",message:"売却不可の限定報酬を王装保管庫へ転送"};
 }
 const gold=equipmentSellPrice(item,state);
 state.player.gold+=gold;
 return{location:"sold",gold,message:`所持上限・予備BOX満杯のため ${gold}G に自動換金`};
}

export function takeFromStorage(state,itemId,source){
 ensureEquipmentStorage(state);
 if(state.equipment.length>=EQUIPMENT_LIMIT)return{ok:false,message:"通常所持が500個で満杯です。先に整理してください。"};
 const key=source==="reserve"?"reserveEquipment":"bossEquipmentVault";
 const list=state[key];
 const index=list.findIndex(item=>item.id===itemId);
 if(index<0)return{ok:false,message:"装備が見つかりません。"};
 const[item]=list.splice(index,1);
 item.equippedBy=null;
 state.equipment.push(item);
 return{ok:true,item};
}
