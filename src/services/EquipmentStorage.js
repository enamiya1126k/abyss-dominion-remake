import{abyssGoldReward}from"../core/AbyssSkillTreeSystem.js?v=3.0.9-build309";
import{equipmentDisplayRarity}from"../data/equipment.js?v=2.11.2-build166";

export const EQUIPMENT_LIMIT=500;
export const RESERVE_LIMIT=30;
export const EQUIPMENT_SELL_BASES=Object.freeze({N:50,R:150,SR:500,SSR:1500,UR:5000,LR:15000,"神話":50000,"深淵":150000,"十神":500000});
const SELL_PLUS_VALUE=500;
const SELL_LEVEL_VALUE=20;
const SELL_LEVEL_CAP=1000;

export function equipmentSellPrice(item,state=null){
 const rarityBase=EQUIPMENT_SELL_BASES[equipmentDisplayRarity(item)]??50,plus=Math.max(0,Math.min(999,Math.floor(Number(item?.plus)||0))),level=Math.max(1,Math.min(SELL_LEVEL_CAP,Math.floor(Number(item?.level)||1)));
 const base=Math.min(Number.MAX_SAFE_INTEGER,rarityBase+plus*SELL_PLUS_VALUE+level*SELL_LEVEL_VALUE),reward=state?abyssGoldReward(state,base,"equipmentSale"):base;
 return Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(reward)||0)));
}

export function slotLabel(slot){
 return{weapon:"武器",armor:"防具",accessory:"アクセ",weaponRight:"右手",weaponLeft:"左手",accessoryNeck:"首",accessoryFinger:"指",armorBody:"胴",armorSupport:"補助"}[slot]??slot;
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
