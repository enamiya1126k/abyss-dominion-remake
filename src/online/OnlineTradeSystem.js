import{MAGIC_CIRCLES,magicCircleById,magicCircleInstances,removeMagicCircleInstance,createMagicCircleInstance,normalizeMagicCircleState}from"../core/MagicCircleSystem.js?v=2.10.0-build149";

const STACKS=Object.freeze({
 potions:["薬草","N"],highPotions:["上級回復薬","R"],partyPotions:["全体回復薬","SR"],manaPotions:["魔力水","N"],highManaPotions:["上級魔力水","R"],partyManaPotions:["全体魔力水","SR"],fullManaPotions:["完全魔力水","SSR"],partyFullManaPotions:["全体完全魔力水","UR"],reviveLeaves:["蘇生葉","SR"],statusCures:["浄化薬","R"],partyStatusCures:["全体浄化薬","SSR"],fullHeals:["完全回復薬","UR"],partyFullHeals:["全体完全回復薬","LR"],experienceItems:["経験結晶","SR"],captureCrystals:["捕獲結晶","SR"],abyssKeys:["深淵鍵","LR"]
});
const COLLECTIONS=Object.freeze(["equipment","reserveEquipment","bossEquipmentVault"]);

function clone(value){return JSON.parse(JSON.stringify(value))}
function cleanId(value){return String(value??"").replace(/[^a-zA-Z0-9:_-]/g,"").slice(0,120)}
function nowId(prefix){return`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}
function onlineState(state){
 const online=state.onlineParty??={};
 online.claimedRewards=Array.isArray(online.claimedRewards)?online.claimedRewards:[];
 online.tradeEscrow=online.tradeEscrow&&typeof online.tradeEscrow==="object"&&!Array.isArray(online.tradeEscrow)?online.tradeEscrow:{};
 online.completedTradeIds=Array.isArray(online.completedTradeIds)?online.completedTradeIds:[];
 online.tradeHistory=Array.isArray(online.tradeHistory)?online.tradeHistory:[];
 online.raidMaterials=Math.max(0,Math.floor(Number(online.raidMaterials)||0));
 online.raidWins=Math.max(0,Math.floor(Number(online.raidWins)||0));
 online.raidExchange=online.raidExchange&&typeof online.raidExchange==="object"&&!Array.isArray(online.raidExchange)?online.raidExchange:{};
 state.onlineParty=online;return online;
}
function equipmentLocation(state,id){for(const name of COLLECTIONS){const list=Array.isArray(state[name])?state[name]:[];const index=list.findIndex(item=>item.id===id);if(index>=0)return{name,list,index,item:list[index]}}return null}
function removeEquipmentReferences(state,id){for(const monster of state.monsters??[])for(const key of Object.keys(monster.equipment??{}))if(monster.equipment[key]===id)monster.equipment[key]=null}
function magicCircleName(id){return magicCircleById(id)?.name??"魔法陣"}

export function buildOnlineTradeCatalog(state){
 normalizeMagicCircleState(state);const catalog=[];
 for(const monster of state.monsters??[])catalog.push({ref:`monster:${monster.id}`,kind:"monster",name:String(monster.nickname||monster.name||"仲間"),rarity:`★${Math.max(1,Number(monster.stars)||1)}`,level:Math.max(1,Number(monster.level)||1),details:`+${Math.max(0,Number(monster.plus)||0)}`,locked:Boolean(monster.locked),favorite:Boolean(monster.favorite)});
 for(const collection of COLLECTIONS)for(const item of state[collection]??[])catalog.push({ref:`equipment:${item.id}`,kind:"equipment",name:String(item.name||"装備"),rarity:String(item.rarity||item.displayRarity||"N"),level:Math.max(1,Number(item.level)||1),details:collection==="equipment"?"装備庫":"保管庫",locked:Boolean(item.locked),favorite:Boolean(item.favorite)});
 for(const[key,[name,rarity]]of Object.entries(STACKS)){const count=Math.max(0,Math.floor(Number(state.inventory?.[key])||0));if(count)catalog.push({ref:`stack:${key}`,kind:"stack",name,rarity,level:1,details:`所持 ${count}`,count,locked:false,favorite:false})}
 for(const instance of magicCircleInstances(state)){const circle=magicCircleById(instance.circleId);catalog.push({ref:`circle:${instance.instanceId}`,kind:"circle",name:circle.name,rarity:"魔法陣",level:instance.level,details:state.magicCircles.unlocked?.[instance.circleId]?"術式解禁済み":"術式未解禁",locked:Boolean(instance.locked),favorite:Boolean(instance.favorite)})}
 return catalog;
}

export function reserveOnlineTradeAsset(state,tradeId,ref,{forceUnlock=false,replace=false}={}){
 const id=cleanId(tradeId),online=onlineState(state);if(!id)return{ok:false,message:"交換IDが不正です"};if(online.tradeEscrow[id]){if(!replace||online.tradeEscrow[id].asset?.assetId===String(ref??""))return{ok:true,asset:clone(online.tradeEscrow[id].asset),duplicate:true};releaseOnlineTradeAsset(state,id)}
 const [kind,...rest]=String(ref??"").split(":"),assetId=rest.join(":");let payload,name,rarity="N",level=1,details="";
 if(kind==="monster"){
  const index=(state.monsters??[]).findIndex(item=>item.id===assetId),monster=state.monsters?.[index];if(!monster)return{ok:false,message:"仲間が見つかりません"};if((monster.locked||monster.favorite)&&!forceUnlock)return{ok:false,needsUnlock:true,message:"ロック・お気に入り中です。解除して交換してください"};if((state.monsters??[]).length<=1)return{ok:false,message:"最後の1体は交換できません"};
  for(const key of Object.keys(monster.equipment??{}))monster.equipment[key]=null;payload=clone(monster);name=String(monster.nickname||monster.name||"仲間");rarity=`★${Math.max(1,Number(monster.stars)||1)}`;level=Math.max(1,Number(monster.level)||1);details=`+${Math.max(0,Number(monster.plus)||0)}`;state.monsters.splice(index,1);state.party=(state.party??[]).filter(value=>value!==assetId);
 }else if(kind==="equipment"){
  const found=equipmentLocation(state,assetId);if(!found)return{ok:false,message:"装備が見つかりません"};if((found.item.locked||found.item.favorite)&&!forceUnlock)return{ok:false,needsUnlock:true,message:"ロック・お気に入り中です。解除して交換してください"};removeEquipmentReferences(state,assetId);payload=clone(found.item);name=String(found.item.name||"装備");rarity=String(found.item.rarity||found.item.displayRarity||"N");level=Math.max(1,Number(found.item.level)||1);details=found.name;found.list.splice(found.index,1);
 }else if(kind==="stack"){
  if(!STACKS[assetId])return{ok:false,message:"交換できないアイテムです"};const count=Math.max(0,Math.floor(Number(state.inventory?.[assetId])||0));if(count<1)return{ok:false,message:"所持数が足りません"};state.inventory[assetId]=count-1;payload={key:assetId,amount:1};[name,rarity]=STACKS[assetId];details="1個";
 }else if(kind==="circle"){
  const instance=magicCircleInstances(state).find(item=>item.instanceId===assetId);if(!instance)return{ok:false,message:"魔法陣の現物が見つかりません"};if((instance.locked||instance.favorite)&&!forceUnlock)return{ok:false,needsUnlock:true,message:"ロック・お気に入り中です。解除して交換してください"};payload=clone(removeMagicCircleInstance(state,assetId));name=magicCircleName(instance.circleId);rarity="魔法陣";level=instance.level;details="現物1個";
 }else return{ok:false,message:"交換対象を選択してください"};
 const asset={assetId:`${kind}:${assetId}`,kind,name,rarity,level,details,payload};online.tradeEscrow[id]={asset:clone(asset),reservedAt:Date.now(),status:"reserved"};return{ok:true,asset};
}

function addAsset(state,asset){
 const payload=clone(asset?.payload??{});if(asset?.kind==="monster"){
  if((state.monsters??=[]).some(item=>item.id===payload.id))payload.id=nowId("trade-monster");payload.equipment={};state.monsters.push(payload);return;
 }if(asset?.kind==="equipment"){
  if(COLLECTIONS.some(name=>(state[name]??[]).some(item=>item.id===payload.id)))payload.id=nowId("trade-equipment");(state.equipment??=[]).push(payload);return;
 }if(asset?.kind==="stack"){
  if(!STACKS[payload.key])throw new Error("交換アイテムを復元できません");state.inventory[payload.key]=Math.max(0,Math.floor(Number(state.inventory[payload.key])||0))+Math.max(1,Math.floor(Number(payload.amount)||1));return;
 }if(asset?.kind==="circle"){
  normalizeMagicCircleState(state);const created=createMagicCircleInstance(state,payload.circleId,{...payload,instanceId:payload.instanceId,source:"trade"})??createMagicCircleInstance(state,payload.circleId,{...payload,instanceId:null,source:"trade"});if(!created)throw new Error("交換魔法陣を復元できません");return;
 }throw new Error("未対応の交換資産です");
}

export function releaseOnlineTradeAsset(state,tradeId){const id=cleanId(tradeId),online=onlineState(state),escrow=online.tradeEscrow[id];if(!escrow)return{ok:true,duplicate:true};addAsset(state,escrow.asset);delete online.tradeEscrow[id];return{ok:true,asset:escrow.asset}}

export function commitOnlineTrade(state,tradeId,incomingAsset,{partnerId="",partnerName=""}={}){
 const id=cleanId(tradeId),online=onlineState(state);online.completedTradeIds=Array.isArray(online.completedTradeIds)?online.completedTradeIds:[];if(online.completedTradeIds.includes(id))return{ok:true,duplicate:true};const escrow=online.tradeEscrow[id];if(!escrow)return{ok:false,message:"交換用に預けた資産が見つかりません。自動確定を停止しました"};
 try{addAsset(state,incomingAsset)}catch(error){return{ok:false,message:error.message||"受取処理に失敗しました"}}delete online.tradeEscrow[id];online.completedTradeIds.push(id);online.completedTradeIds=online.completedTradeIds.slice(-100);online.tradeHistory=(Array.isArray(online.tradeHistory)?online.tradeHistory:[]).concat({tradeId:id,at:Date.now(),partnerId:String(partnerId).slice(0,24),partnerName:String(partnerName).slice(0,24),gave:{kind:escrow.asset.kind,name:escrow.asset.name,rarity:escrow.asset.rarity},received:{kind:incomingAsset.kind,name:incomingAsset.name,rarity:incomingAsset.rarity}}).slice(-50);return{ok:true,gave:escrow.asset,received:incomingAsset};
}

export function recoverOrphanedTradeEscrows(state,activeTradeIds=[]){const online=onlineState(state),active=new Set(activeTradeIds.map(cleanId)),released=[];for(const id of Object.keys(online.tradeEscrow??{}))if(!active.has(id)){const result=releaseOnlineTradeAsset(state,id);if(result.asset)released.push(result.asset)}return released}

export function unlockedCircleKnowledgeAfterTrade(state,circleId){normalizeMagicCircleState(state);return Boolean(state.magicCircles.unlocked?.[circleId])}
export{STACKS as ONLINE_TRADE_STACKS};
