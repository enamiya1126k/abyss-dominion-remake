import{ensureEquipmentAffixes,rollAffixForSlot}from"../data/equipmentAffixes.js?v=1.1.0";
import{equipmentDisplayRarity}from"../data/equipment.js?v=1.1.0";
import{goldForClearedFloor}from"../core/GoldEconomySystem.js?v=1.1.0";

const LOCK_MULTIPLIERS=[1,2.25,4.75,8];
const RARITY_MULTIPLIERS={N:.70,R:.85,SR:1,SSR:1.35,LR:1.75,"神話":2.15,"深淵":2.65,"十神":3.25};
const MINIMUM_COSTS={N:200,R:300,SR:450,SSR:700,LR:1000,"神話":1500,"深淵":2200,"十神":3200};

function safeInteger(value,fallback=0){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(number))):fallback;
}
function roundedGold(value){
 const amount=Math.max(1,Math.min(Number.MAX_SAFE_INTEGER,Number(value)||1));
 const unit=amount>=100000000?1000000:amount>=1000000?10000:amount>=10000?100:10;
 return Math.max(unit,Math.min(Number.MAX_SAFE_INTEGER,Math.round(amount/unit)*unit));
}
export function normalizeEquipmentCraftingState(state){
 const source=state.equipmentCrafting&&typeof state.equipmentCrafting==="object"&&!Array.isArray(state.equipmentCrafting)?state.equipmentCrafting:{};
 state.equipmentCrafting={
  rerolls:safeInteger(source.rerolls),
  goldSpent:safeInteger(source.goldSpent),
  maxLocksUsed:Math.max(0,Math.min(3,safeInteger(source.maxLocksUsed)))
 };
 return state.equipmentCrafting;
}
export function maxLockableAffixes(item){
 return Math.max(0,Math.min(3,ensureEquipmentAffixes(item).length-1));
}
export function normalizeEquipmentAffixLocks(item){
 const list=ensureEquipmentAffixes(item),maximum=maxLockableAffixes(item);
 let kept=0;
 list.forEach(affix=>{
  const shouldKeep=Boolean(affix.locked)&&kept<maximum;
  affix.locked=shouldKeep;
  if(shouldKeep)kept++;
 });
 return list;
}
export function lockedAffixCount(item){
 return normalizeEquipmentAffixLocks(item).filter(affix=>affix.locked).length;
}
export function rerollLockMultiplier(item){
 return LOCK_MULTIPLIERS[lockedAffixCount(item)]??LOCK_MULTIPLIERS.at(-1);
}
export function rerollGoldCost(state,item){
 const floor=Math.max(1,Math.min(10000,safeInteger(state?.player?.maxFloor,1))),rarity=equipmentDisplayRarity(item);
 const floorBase=goldForClearedFloor(floor)*.25,rarityBase=Math.max(MINIMUM_COSTS[rarity]??500,floorBase*(RARITY_MULTIPLIERS[rarity]??1));
 const level=Math.max(1,safeInteger(item?.level,1)),levelMultiplier=1+Math.min(.75,Math.log10(level)*.15);
 return roundedGold(rarityBase*levelMultiplier*rerollLockMultiplier(item));
}
export function toggleAffixLock(item,index){
 const list=normalizeEquipmentAffixLocks(item),affix=list[index];
 if(!affix)return{ok:false,message:"対象オプションがありません"};
 if(affix.locked){
  affix.locked=false;
  return{ok:true,locked:false,lockedCount:lockedAffixCount(item),maxLocks:maxLockableAffixes(item)}
 }
 const maximum=maxLockableAffixes(item),locked=lockedAffixCount(item);
 if(locked>=maximum)return{ok:false,message:maximum?`固定できるのは最大${maximum}枠です。1枠以上は再抽選してください。`:"この装備は固定できません。1枠以上は再抽選してください。"};
 affix.locked=true;
 return{ok:true,locked:true,lockedCount:locked+1,maxLocks:maximum}
}
export function rerollUnlockedAffixes(state,item){
 if(!state?.player||!item)return{ok:false,message:"装備データを確認できません"};
 const list=normalizeEquipmentAffixLocks(item);
 if(!list.length)return{ok:false,message:"この装備には再抽選できるオプションがありません"};
 const unlocked=list.map((affix,index)=>affix.locked?null:index).filter(index=>index!==null);
 if(!unlocked.length)return{ok:false,message:"再抽選するオプションを1枠以上残してください"};
 const cost=rerollGoldCost(state,item),gold=safeInteger(state.player.gold);
 if(gold<cost)return{ok:false,message:`GOLDが足りません（必要 ${cost.toLocaleString()}G）`,cost};

 const originalIds=new Set(list.map(affix=>affix.id)),used=new Set(list.filter(affix=>affix.locked).map(affix=>affix.id)),replacements=new Map();
 for(const index of unlocked){
  const rarity=equipmentDisplayRarity(item);
  let next=rollAffixForSlot(item.slot,rarity,[...originalIds,...used]);
  if(!next)next=rollAffixForSlot(item.slot,rarity,[...used]);
  if(!next)return{ok:false,message:"再抽選候補を生成できませんでした。GOLDは消費されていません"};
  next.locked=false;replacements.set(index,next);used.add(next.id);
 }

 const before=list.map(affix=>({...affix}));
 item.affixes=list.map((affix,index)=>replacements.get(index)??affix);
 state.player.gold=gold-cost;
 const history=normalizeEquipmentCraftingState(state);
 history.rerolls=safeInteger(history.rerolls+1);
 history.goldSpent=safeInteger(history.goldSpent+cost);
 history.maxLocksUsed=Math.max(history.maxLocksUsed,lockedAffixCount(item));
 item.rerollCount=safeInteger(item.rerollCount)+1;
 item.lastRerolledAt=new Date().toISOString();
 return{ok:true,cost,before,after:item.affixes.map(affix=>({...affix})),lockedCount:lockedAffixCount(item),rerolledCount:unlocked.length}
}
