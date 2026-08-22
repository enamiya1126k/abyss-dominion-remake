const STACKS=Object.freeze({
 potions:["薬草","N"],highPotions:["上級回復薬","R"],partyPotions:["全体回復薬","SR"],manaPotions:["魔力水","N"],highManaPotions:["上級魔力水","R"],partyManaPotions:["全体魔力水","SR"],fullManaPotions:["完全魔力水","SSR"],partyFullManaPotions:["全体完全魔力水","UR"],reviveLeaves:["蘇生葉","SR"],statusCures:["浄化薬","R"],partyStatusCures:["全体浄化薬","SSR"],fullHeals:["完全回復薬","UR"],partyFullHeals:["全体完全回復薬","LR"],experienceItems:["経験値パック（小）","R"],experienceItemsMedium:["経験値パック（中）","SR"],experienceItemsLarge:["経験値パック（大）","SSR"],experienceItemsUltra:["経験値パック（超）","UR"],abyssKeys:["深淵鍵","LR"]
});
const CURRENCIES=Object.freeze({gold:["GOLD","G"],crystals:["魔晶石","💎"],captureCrystals:["捕獲結晶","捕獲"]});
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
function equipmentOwner(state,id){return(state.monsters??[]).find(monster=>Object.values(monster.equipment??{}).includes(id))??null}
function currencyCount(state,key){if(key==="gold")return Math.max(0,Math.floor(Number(state.player?.gold)||0));if(key==="crystals")return Math.max(0,Math.floor(Number(state.player?.crystals)||0));if(key==="captureCrystals")return Math.max(0,Math.floor(Number(state.inventory?.captureCrystals)||0));return 0}
function changeCurrency(state,key,delta){if(key==="gold")state.player.gold=Math.max(0,Math.floor(Number(state.player.gold)||0)+delta);else if(key==="crystals")state.player.crystals=Math.max(0,Math.floor(Number(state.player.crystals)||0)+delta);else if(key==="captureCrystals")state.inventory.captureCrystals=Math.max(0,Math.floor(Number(state.inventory.captureCrystals)||0)+delta);else throw new Error("交換通貨を復元できません")}
function monsterTradeRarity(monster){return String(monster?.endgameFaction==="tenGod"?"十神":monster?.endgameFaction==="abyss"?"深淵":monster?.summonTier??monster?.summonRarity??monster?.rarity??"N")}

export function buildOnlineTradeCatalog(state){
 const catalog=[],party=new Set(state.party??[]);
 for(const monster of state.monsters??[]){
  const inParty=party.has(monster.id),hasEquipment=Object.values(monster.equipment??{}).some(Boolean),unavailable=inParty||hasEquipment||monster.locked||monster.favorite,reason=inParty?"出撃編成中":hasEquipment?"装備中":monster.locked||monster.favorite?"ロック・お気に入り中":"";
  catalog.push({ref:`monster:${monster.id}`,kind:"monster",name:String(monster.nickname||monster.name||"仲間"),rarity:monsterTradeRarity(monster),level:Math.max(1,Number(monster.level)||1),details:`+${Math.max(0,Number(monster.plus)||0)}${reason?`・${reason}`:""}`,locked:Boolean(monster.locked),favorite:Boolean(monster.favorite),unavailable,reason,maxAmount:1});
 }
 for(const collection of COLLECTIONS)for(const item of state[collection]??[]){
  const owner=equipmentOwner(state,item.id),unavailable=Boolean(owner||item.locked||item.favorite),reason=owner?`${owner.nickname||owner.name||"仲間"}が装備中`:item.locked||item.favorite?"ロック・お気に入り中":"";
  catalog.push({ref:`equipment:${item.id}`,kind:"equipment",name:String(item.name||"装備"),rarity:String(item.rarity||item.displayRarity||"N"),level:Math.max(1,Number(item.level)||1),details:`${collection==="equipment"?"装備庫":"保管庫"}${reason?`・${reason}`:""}`,locked:Boolean(item.locked),favorite:Boolean(item.favorite),unavailable,reason,maxAmount:1});
 }
 for(const[key,[name,rarity]]of Object.entries(STACKS)){const count=Math.max(0,Math.floor(Number(state.inventory?.[key])||0));if(count)catalog.push({ref:`stack:${key}`,kind:"stack",name,rarity,level:1,details:`所持 ${count}`,count,maxAmount:count,unavailable:false})}
 for(const[key,[name,rarity]]of Object.entries(CURRENCIES)){const count=currencyCount(state,key);if(count)catalog.push({ref:`currency:${key}`,kind:"currency",name,rarity,level:1,details:`所持 ${count.toLocaleString()}`,count,maxAmount:count,unavailable:false})}
 return catalog;
}

export function reserveOnlineTradeAsset(state,tradeId,ref,{amount=1,replace=false}={}){
 const id=cleanId(tradeId),online=onlineState(state);if(!id)return{ok:false,message:"交換IDが不正です"};
 if(online.tradeEscrow[id]){if(!replace)return{ok:true,asset:clone(online.tradeEscrow[id].asset),duplicate:true};releaseOnlineTradeAsset(state,id)}
 const[kind,...rest]=String(ref??"").split(":"),assetId=rest.join(":"),requested=Math.max(1,Math.floor(Number(amount)||1));let payload,name,rarity="N",level=1,details="";
 if(kind==="monster"){
  const index=(state.monsters??[]).findIndex(item=>item.id===assetId),monster=state.monsters?.[index];if(!monster)return{ok:false,message:"仲間が見つかりません"};
  if(monster.locked||monster.favorite)return{ok:false,message:"ロック・お気に入りを解除してから交換してください"};
  if((state.party??[]).includes(assetId))return{ok:false,message:"出撃編成中の仲間は交換できません。編成から外してください"};
  if(Object.values(monster.equipment??{}).some(Boolean))return{ok:false,message:"装備中の品をすべて外してから交換してください"};
  if((state.monsters??[]).length<=1)return{ok:false,message:"最後の1体は交換できません"};
  payload=clone(monster);name=String(monster.nickname||monster.name||"仲間");rarity=monsterTradeRarity(monster);level=Math.max(1,Number(monster.level)||1);details=`+${Math.max(0,Number(monster.plus)||0)}`;state.monsters.splice(index,1);
 }else if(kind==="equipment"){
  const found=equipmentLocation(state,assetId);if(!found)return{ok:false,message:"装備が見つかりません"};
  if(found.item.locked||found.item.favorite)return{ok:false,message:"ロック・お気に入りを解除してから交換してください"};
  if(equipmentOwner(state,assetId))return{ok:false,message:"装備中の品は交換できません。装備から外してください"};
  payload=clone(found.item);name=String(found.item.name||"装備");rarity=String(found.item.rarity||found.item.displayRarity||"N");level=Math.max(1,Number(found.item.level)||1);details=found.name;found.list.splice(found.index,1);
 }else if(kind==="stack"){
  if(!STACKS[assetId])return{ok:false,message:"交換できないアイテムです"};const count=Math.max(0,Math.floor(Number(state.inventory?.[assetId])||0));if(count<requested)return{ok:false,message:"所持数が足りません"};state.inventory[assetId]=count-requested;payload={key:assetId,amount:requested};[name,rarity]=STACKS[assetId];details=`${requested.toLocaleString()}個`;
 }else if(kind==="currency"){
  if(!CURRENCIES[assetId])return{ok:false,message:"交換できない通貨です"};const count=currencyCount(state,assetId);if(count<requested)return{ok:false,message:"所持数が足りません"};changeCurrency(state,assetId,-requested);payload={key:assetId,amount:requested};[name,rarity]=CURRENCIES[assetId];details=`${requested.toLocaleString()}${assetId==="gold"?"G":"個"}`;
 }else return{ok:false,message:"交換対象を選択してください"};
 const asset={assetId:`${kind}:${assetId}`,kind,name,rarity,level,details,payload};online.tradeEscrow[id]={asset:clone(asset),reservedAt:Date.now(),status:"reserved"};return{ok:true,asset};
}

function addAsset(state,asset){
 const payload=clone(asset?.payload??{});
 if(asset?.kind==="monster"){if((state.monsters??=[]).some(item=>item.id===payload.id))payload.id=nowId("trade-monster");state.monsters.push(payload);return}
 if(asset?.kind==="equipment"){if(COLLECTIONS.some(name=>(state[name]??[]).some(item=>item.id===payload.id)))payload.id=nowId("trade-equipment");(state.equipment??=[]).push(payload);return}
 if(asset?.kind==="stack"){if(!STACKS[payload.key])throw new Error("交換アイテムを復元できません");state.inventory[payload.key]=Math.max(0,Math.floor(Number(state.inventory[payload.key])||0))+Math.max(1,Math.floor(Number(payload.amount)||1));return}
 if(asset?.kind==="currency"){changeCurrency(state,payload.key,Math.max(1,Math.floor(Number(payload.amount)||1)));return}
 throw new Error("未対応の交換資産です");
}

export function releaseOnlineTradeAsset(state,tradeId){const id=cleanId(tradeId),online=onlineState(state),escrow=online.tradeEscrow[id];if(!escrow)return{ok:true,duplicate:true};addAsset(state,escrow.asset);delete online.tradeEscrow[id];return{ok:true,asset:escrow.asset}}
export function commitOnlineTrade(state,tradeId,incomingAsset,{partnerId="",partnerName=""}={}){const id=cleanId(tradeId),online=onlineState(state);if(online.completedTradeIds.includes(id))return{ok:true,duplicate:true};const escrow=online.tradeEscrow[id];if(!escrow)return{ok:false,message:"交換用に預けた資産が見つかりません。自動確定を停止しました"};try{addAsset(state,incomingAsset)}catch(error){return{ok:false,message:error.message||"受取処理に失敗しました"}}delete online.tradeEscrow[id];online.completedTradeIds.push(id);online.completedTradeIds=online.completedTradeIds.slice(-100);online.tradeHistory=online.tradeHistory.concat({tradeId:id,at:Date.now(),partnerId:String(partnerId).slice(0,24),partnerName:String(partnerName).slice(0,24),gave:{kind:escrow.asset.kind,name:escrow.asset.name,rarity:escrow.asset.rarity,details:escrow.asset.details},received:{kind:incomingAsset.kind,name:incomingAsset.name,rarity:incomingAsset.rarity,details:incomingAsset.details}}).slice(-50);return{ok:true,gave:escrow.asset,received:incomingAsset}}
export function recoverOrphanedTradeEscrows(state,activeTradeIds=[]){const online=onlineState(state),active=new Set(activeTradeIds.map(cleanId)),released=[];for(const id of Object.keys(online.tradeEscrow??{}))if(!active.has(id)){const result=releaseOnlineTradeAsset(state,id);if(result.asset)released.push(result.asset)}return released}
export{STACKS as ONLINE_TRADE_STACKS};
