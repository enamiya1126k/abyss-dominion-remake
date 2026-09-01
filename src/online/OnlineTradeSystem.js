const STACKS=Object.freeze({
 potions:["薬草","N"],highPotions:["上級回復薬","R"],partyPotions:["全体回復薬","SR"],manaPotions:["魔力水","N"],highManaPotions:["上級魔力水","R"],partyManaPotions:["全体魔力水","SR"],fullManaPotions:["完全魔力水","SSR"],partyFullManaPotions:["全体完全魔力水","UR"],reviveLeaves:["蘇生葉","SR"],statusCures:["浄化薬","R"],partyStatusCures:["全体浄化薬","SSR"],fullHeals:["完全回復薬","UR"],partyFullHeals:["全体完全回復薬","LR"],experienceItems:["経験値パック（小）","R"],experienceItemsMedium:["経験値パック（中）","SR"],experienceItemsLarge:["経験値パック（大）","SSR"],experienceItemsUltra:["経験値パック（超）","UR"],abyssKeys:["深淵鍵","LR"]
});
const CURRENCIES=Object.freeze({gold:["GOLD","G"],crystals:["魔晶石","💎"],captureCrystals:["捕獲結晶","捕獲"]});
const COLLECTIONS=Object.freeze(["equipment","reserveEquipment","bossEquipmentVault"]);
const NON_PLAYER_TRADEABLE_MONSTER_SPECIES=Object.freeze(new Set(["juvenile_amalga"]));
export const ONLINE_TRADE_MAX_AMOUNT=Number.MAX_SAFE_INTEGER;

function clone(value){return JSON.parse(JSON.stringify(value))}
function cleanId(value){return String(value??"").replace(/[^a-zA-Z0-9:_-]/g,"").slice(0,120)}
function cleanRequestId(value){const id=String(value??"").trim();return/^[a-zA-Z0-9:_-]{8,96}$/.test(id)?id:""}
function nowId(prefix){return`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}
function safeCount(value){const amount=Math.floor(Number(value));return Number.isSafeInteger(amount)&&amount>0?Math.min(amount,ONLINE_TRADE_MAX_AMOUNT):0}
export function parseOnlineTradeAmount(value,maxAmount=ONLINE_TRADE_MAX_AMOUNT){
 const normalized=String(value??"").normalize("NFKC").replace(/[,_，\s]/g,"");
 if(!/^\d+$/.test(normalized))return null;
 const amount=Number(normalized),maximum=safeCount(maxAmount);
 if(!Number.isSafeInteger(amount)||amount<1||!maximum||amount>maximum)return null;
 return amount;
}
function assetAmount(asset){const amount=Number(asset?.amount??asset?.payload?.amount);if(!Number.isSafeInteger(amount)||amount<1||amount>ONLINE_TRADE_MAX_AMOUNT)throw new Error("交換数量を確認できません");return amount}
function amountDetails(kind,key,amount){return`${amount.toLocaleString("ja-JP")}${kind==="currency"&&key==="gold"?"G":"個"}`}
function onlineState(state){
 const online=state.onlineParty??={};
 online.claimedRewards=Array.isArray(online.claimedRewards)?online.claimedRewards:[];
 online.tradeEscrow=online.tradeEscrow&&typeof online.tradeEscrow==="object"&&!Array.isArray(online.tradeEscrow)?online.tradeEscrow:{};
 online.tradeEscrowQuarantine=Array.isArray(online.tradeEscrowQuarantine)?online.tradeEscrowQuarantine.slice(-20):[];
 online.completedTradeIds=Array.isArray(online.completedTradeIds)?online.completedTradeIds:[];
 online.tradeHistory=Array.isArray(online.tradeHistory)?online.tradeHistory:[];
 online.raidMaterials=Math.max(0,Math.floor(Number(online.raidMaterials)||0));
 online.raidWins=Math.max(0,Math.floor(Number(online.raidWins)||0));
 online.raidExchange=online.raidExchange&&typeof online.raidExchange==="object"&&!Array.isArray(online.raidExchange)?online.raidExchange:{};
 state.onlineParty=online;return online;
}
function equipmentLocation(state,id){for(const name of COLLECTIONS){const list=Array.isArray(state[name])?state[name]:[];const index=list.findIndex(item=>item.id===id);if(index>=0)return{name,list,index,item:list[index]}}return null}
function equipmentOwner(state,id){return(state.monsters??[]).find(monster=>Object.values(monster.equipment??{}).includes(id))??null}
function currencyCount(state,key){let value=0;if(key==="gold")value=state.player?.gold;else if(key==="crystals")value=state.player?.crystals;else if(key==="captureCrystals")value=state.inventory?.captureCrystals;else return 0;return Math.min(ONLINE_TRADE_MAX_AMOUNT,Math.max(0,Math.floor(Number(value)||0)))}
function changeCurrency(state,key,delta){const current=currencyCount(state,key),next=current+delta;if(!Number.isSafeInteger(delta)||!Number.isSafeInteger(next)||next<0||next>ONLINE_TRADE_MAX_AMOUNT)throw new Error("交換通貨の数量を保存できません");if(key==="gold")state.player.gold=next;else if(key==="crystals")state.player.crystals=next;else if(key==="captureCrystals")state.inventory.captureCrystals=next;else throw new Error("交換通貨を復元できません")}
function monsterTradeRarity(monster){return String(monster?.endgameFaction==="tenGod"?"十神":monster?.endgameFaction==="abyss"?"深淵":monster?.summonTier??monster?.summonRarity??monster?.rarity??"N")}
function monsterTradeRestriction(monster){return NON_PLAYER_TRADEABLE_MONSTER_SPECIES.has(String(monster?.speciesId??""))?"レイド契約個体は個人交換できません":""}

export function buildOnlineTradeCatalog(state){
	 const catalog=[],party=new Set(state.party??[]);
	 for(const monster of state.monsters??[]){
	  const restriction=monsterTradeRestriction(monster),inParty=party.has(monster.id),hasEquipment=Object.values(monster.equipment??{}).some(Boolean),hasCircle=Boolean(monster.magicCircleInstanceId||monster.magicCircleId&&monster.magicCircleId!=="none"),unavailable=Boolean(restriction||inParty||hasEquipment||hasCircle||monster.locked||monster.favorite),reason=restriction||(inParty?"出撃編成中":hasEquipment?"装備中":hasCircle?"魔法陣を装備中":monster.locked||monster.favorite?"ロック・お気に入り中":"");
  catalog.push({ref:`monster:${monster.id}`,kind:"monster",name:String(monster.nickname||monster.name||"仲間"),rarity:monsterTradeRarity(monster),level:Math.max(1,Number(monster.level)||1),details:`+${Math.max(0,Number(monster.plus)||0)}${reason?`・${reason}`:""}`,locked:Boolean(monster.locked),favorite:Boolean(monster.favorite),unavailable,reason,maxAmount:1});
 }
 for(const collection of COLLECTIONS)for(const item of state[collection]??[]){
  const owner=equipmentOwner(state,item.id),unavailable=Boolean(owner||item.locked||item.favorite),reason=owner?`${owner.nickname||owner.name||"仲間"}が装備中`:item.locked||item.favorite?"ロック・お気に入り中":"";
  catalog.push({ref:`equipment:${item.id}`,kind:"equipment",name:String(item.name||"装備"),rarity:String(item.rarity||item.displayRarity||"N"),level:Math.max(1,Number(item.level)||1),details:`${collection==="equipment"?"装備庫":"保管庫"}${reason?`・${reason}`:""}`,locked:Boolean(item.locked),favorite:Boolean(item.favorite),unavailable,reason,maxAmount:1});
 }
 for(const[key,[name,rarity]]of Object.entries(STACKS)){const count=Math.min(ONLINE_TRADE_MAX_AMOUNT,Math.max(0,Math.floor(Number(state.inventory?.[key])||0)));if(count)catalog.push({ref:`stack:${key}`,kind:"stack",name,rarity,level:1,details:`所持 ${count.toLocaleString()}`,count,maxAmount:count,unavailable:false})}
 for(const[key,[name,rarity]]of Object.entries(CURRENCIES)){const count=currencyCount(state,key);if(count)catalog.push({ref:`currency:${key}`,kind:"currency",name,rarity,level:1,details:`所持 ${count.toLocaleString()}`,count,maxAmount:count,unavailable:false})}
 return catalog;
}

function tradeMutationBackup(state,online){return{player:clone(state.player??{}),inventory:clone(state.inventory??{}),monsters:clone(state.monsters??[]),collections:Object.fromEntries(COLLECTIONS.map(name=>[name,clone(state[name]??[])])),escrow:clone(online.tradeEscrow??{}),quarantine:clone(online.tradeEscrowQuarantine??[]),completedTradeIds:clone(online.completedTradeIds??[]),tradeHistory:clone(online.tradeHistory??[])}}
function restoreTradeMutation(state,online,backup){state.player=backup.player;state.inventory=backup.inventory;state.monsters=backup.monsters;for(const name of COLLECTIONS)state[name]=backup.collections[name];online.tradeEscrow=backup.escrow;online.tradeEscrowQuarantine=backup.quarantine;online.completedTradeIds=backup.completedTradeIds;online.tradeHistory=backup.tradeHistory}
function rollbackHandle(state,online,backup){let active=true;return()=>{if(!active)return false;active=false;restoreTradeMutation(state,online,backup);return true}}
export function sameOnlineTradeAsset(left,right){if(!left&&!right)return true;if(!left||!right)return false;if(String(left.kind)!==String(right.kind)||String(left.assetId)!==String(right.assetId))return false;if(["stack","currency"].includes(String(left.kind))){const leftAmount=Number(left.amount??left.payload?.amount),rightAmount=Number(right.amount??right.payload?.amount);return Number.isSafeInteger(leftAmount)&&leftAmount>0&&leftAmount===rightAmount}return true}
export function sameLegacyOnlineTradeAsset(localAsset,publicAsset){
 if(sameOnlineTradeAsset(localAsset,publicAsset))return true;
 if(!localAsset||!publicAsset||String(localAsset.kind)!==String(publicAsset.kind)||String(localAsset.assetId)!==String(publicAsset.assetId))return false;
 const kind=String(localAsset.kind);if(!["stack","currency"].includes(kind))return true;
 try{
  const amount=assetAmount(localAsset),key=String(localAsset.payload?.key??localAsset.assetId?.split(":").slice(1).join(":")??"");
  return Boolean(key&&String(publicAsset.details??"")===amountDetails(kind,key,amount));
 }catch{return false}
}

export function reserveOnlineTradeAsset(state,tradeId,ref,{amount=1,replace=false,requestId=""}={}){
 const id=cleanId(tradeId),online=onlineState(state);if(!id)return{ok:false,message:"交換IDが不正です"};
 const previousEntry=online.tradeEscrow[id]?clone(online.tradeEscrow[id]):null,previous=previousEntry?.asset??null;if(previous&&!replace)return{ok:true,asset:previous,duplicate:true};
 const[kind,...rest]=String(ref??"").split(":"),assetId=rest.join(":"),requested=parseOnlineTradeAmount(amount);if(!requested)return{ok:false,message:"数量は1以上の整数で指定してください"};
 const backup=tradeMutationBackup(state,online);
 try{if(previous){const released=releaseOnlineTradeAsset(state,id);if(!released.ok)throw new Error(released.message||"以前の交換品を戻せません")}}catch(error){restoreTradeMutation(state,online,backup);return{ok:false,message:error.message||"交換品を入れ替えられません"}}
 let payload,name,rarity="N",level=1,details="",failure="";
	 if(kind==="monster"){
	  const index=(state.monsters??[]).findIndex(item=>item.id===assetId),monster=state.monsters?.[index];if(!monster)failure="仲間が見つかりません";
	  else if(monsterTradeRestriction(monster))failure=monsterTradeRestriction(monster);
	  else if(monster.locked||monster.favorite)failure="ロック・お気に入りを解除してから交換してください";
  else if((state.party??[]).includes(assetId))failure="出撃編成中の仲間は交換できません。編成から外してください";
  else if(Object.values(monster.equipment??{}).some(Boolean))failure="装備中の品をすべて外してから交換してください";
  else if(monster.magicCircleInstanceId||monster.magicCircleId&&monster.magicCircleId!=="none")failure="魔法陣を外してから交換してください";
  else if((state.monsters??[]).length<=1)failure="最後の1体は交換できません";
  else{payload=clone(monster);name=String(monster.nickname||monster.name||"仲間");rarity=monsterTradeRarity(monster);level=Math.max(1,Number(monster.level)||1);details=`+${Math.max(0,Number(monster.plus)||0)}`;state.monsters.splice(index,1)}
 }else if(kind==="equipment"){
  const found=equipmentLocation(state,assetId);if(!found)failure="装備が見つかりません";
  else if(found.item.locked||found.item.favorite)failure="ロック・お気に入りを解除してから交換してください";
  else if(equipmentOwner(state,assetId))failure="装備中の品は交換できません。装備から外してください";
  else{payload=clone(found.item);name=String(found.item.name||"装備");rarity=String(found.item.rarity||found.item.displayRarity||"N");level=Math.max(1,Number(found.item.level)||1);details=found.name;found.list.splice(found.index,1)}
 }else if(kind==="stack"){
  if(!STACKS[assetId])failure="交換できないアイテムです";else{const count=Math.max(0,Math.floor(Number(state.inventory?.[assetId])||0));if(count<requested)failure="所持数が足りません";else{state.inventory[assetId]=count-requested;payload={key:assetId,amount:requested};[name,rarity]=STACKS[assetId];details=amountDetails(kind,assetId,requested)}}
 }else if(kind==="currency"){
  if(!CURRENCIES[assetId])failure="交換できない通貨です";else{const count=currencyCount(state,assetId);if(count<requested)failure="所持数が足りません";else{changeCurrency(state,assetId,-requested);payload={key:assetId,amount:requested};[name,rarity]=CURRENCIES[assetId];details=amountDetails(kind,assetId,requested)}}
 }else failure="交換対象を選択してください";
 if(failure){restoreTradeMutation(state,online,backup);return{ok:false,message:failure,previousAsset:previous}}
 const asset={assetId:`${kind}:${assetId}`,kind,name,rarity,level,details,payload,...(["stack","currency"].includes(kind)?{amount:requested}:null)},offerRequestId=cleanRequestId(requestId);
 online.tradeEscrow[id]={asset:clone(asset),reservedAt:Date.now(),status:offerRequestId?"offerPending":"reserved",offerRequestId,offerRevision:0,...(previousEntry?{previousOffer:{asset:clone(previousEntry.asset),requestId:cleanRequestId(previousEntry.offerRequestId),revision:Math.max(0,Math.floor(Number(previousEntry.offerRevision)||0))}}:{})};
 return{ok:true,asset,previousAsset:previous,previousEntry,rollback:rollbackHandle(state,online,backup)};
}

function addAsset(state,asset){
 const payload=clone(asset?.payload??{});
 if(asset?.kind==="monster"){if((state.monsters??=[]).some(item=>item.id===payload.id))payload.id=nowId("trade-monster");state.monsters.push(payload);return}
 if(asset?.kind==="equipment"){if(COLLECTIONS.some(name=>(state[name]??[]).some(item=>item.id===payload.id)))payload.id=nowId("trade-equipment");(state.equipment??=[]).push(payload);return}
 if(asset?.kind==="stack"){if(!STACKS[payload.key])throw new Error("交換アイテムを復元できません");const amount=assetAmount(asset),current=Math.max(0,Math.floor(Number(state.inventory[payload.key])||0)),next=current+amount;if(!Number.isSafeInteger(next)||next>ONLINE_TRADE_MAX_AMOUNT)throw new Error("交換アイテムの数量を保存できません");state.inventory[payload.key]=next;return}
 if(asset?.kind==="currency"){changeCurrency(state,payload.key,assetAmount(asset));return}
 throw new Error("未対応の交換資産です");
}

export function releaseOnlineTradeAsset(state,tradeId){const id=cleanId(tradeId),online=onlineState(state),escrow=online.tradeEscrow[id];if(!escrow)return{ok:true,duplicate:true};const backup=tradeMutationBackup(state,online);try{addAsset(state,escrow.asset);delete online.tradeEscrow[id]}catch(error){restoreTradeMutation(state,online,backup);return{ok:false,message:error.message||"交換品を所持品へ戻せません"}}return{ok:true,asset:escrow.asset,rollback:rollbackHandle(state,online,backup)}}
export function rollbackOnlineTradeAssetReservation(state,tradeId,previousAsset=null){const id=cleanId(tradeId),online=onlineState(state),backup=tradeMutationBackup(state,online);try{const released=releaseOnlineTradeAsset(state,id);if(!released.ok)throw new Error(released.message);if(!previousAsset)return{ok:true,released:released.asset??null,asset:null,rollback:rollbackHandle(state,online,backup)};const amount=["stack","currency"].includes(previousAsset.kind)?assetAmount(previousAsset):1,result=reserveOnlineTradeAsset(state,id,previousAsset.assetId,{amount});if(!result.ok)throw new Error(result.message||"元の交換品を復元できません");return{ok:true,released:released.asset??null,asset:result.asset,rollback:rollbackHandle(state,online,backup)}}catch(error){restoreTradeMutation(state,online,backup);return{ok:false,message:error.message||"元の交換品を復元できません"}}}
export function reconcileOnlineTradeEscrow(state,tradeId,serverOffer,{requestId="",revision=0}={}){
 const id=cleanId(tradeId),online=onlineState(state);if(!id)return{ok:false,message:"交換IDが不正です"};
 const backup=tradeMutationBackup(state,online),escrow=online.tradeEscrow[id]??null,safeRequestId=cleanRequestId(requestId),safeRevision=Math.max(0,Math.floor(Number(revision)||0));
 try{
  if(!serverOffer){if(!escrow)return{ok:true,changed:false,asset:null};const released=releaseOnlineTradeAsset(state,id);if(!released.ok)throw new Error(released.message);return{ok:true,changed:true,asset:null,released:released.asset,rollback:rollbackHandle(state,online,backup)}}
  if(escrow&&sameOnlineTradeAsset(escrow.asset,serverOffer)){const changed=escrow.status!=="offered"||escrow.offerRequestId!==safeRequestId||Number(escrow.offerRevision)!==safeRevision||Boolean(escrow.previousOffer);escrow.status="offered";escrow.offerRequestId=safeRequestId;escrow.offerRevision=safeRevision;delete escrow.previousOffer;return{ok:true,changed,asset:escrow.asset,rollback:changed?rollbackHandle(state,online,backup):null}}
  if(escrow){const released=releaseOnlineTradeAsset(state,id);if(!released.ok)throw new Error(released.message)}
  const amount=["stack","currency"].includes(serverOffer.kind)?assetAmount(serverOffer):1,reserved=reserveOnlineTradeAsset(state,id,serverOffer.assetId,{amount,requestId:safeRequestId});if(!reserved.ok)throw new Error(reserved.message||"サーバーの交換品を所持品から確保できません");
  const next=online.tradeEscrow[id];next.status="offered";next.offerRequestId=safeRequestId;next.offerRevision=safeRevision;delete next.previousOffer;
  return{ok:true,changed:true,asset:next.asset,rollback:rollbackHandle(state,online,backup)};
 }catch(error){restoreTradeMutation(state,online,backup);return{ok:false,message:error.message||"交換品をサーバー状態へ復元できません"}}
}
export function commitOnlineTrade(state,tradeId,incomingAsset,{partnerId="",partnerName=""}={}){const id=cleanId(tradeId),online=onlineState(state);if(online.completedTradeIds.includes(id))return{ok:true,duplicate:true};const escrow=online.tradeEscrow[id];if(!escrow)return{ok:false,message:"交換用に預けた資産が見つかりません。自動確定を停止しました"};const backup=tradeMutationBackup(state,online);try{addAsset(state,incomingAsset);delete online.tradeEscrow[id];online.completedTradeIds.push(id);online.completedTradeIds=online.completedTradeIds.slice(-100);online.tradeHistory=online.tradeHistory.concat({tradeId:id,at:Date.now(),partnerId:String(partnerId).slice(0,24),partnerName:String(partnerName).slice(0,24),gave:{kind:escrow.asset.kind,name:escrow.asset.name,rarity:escrow.asset.rarity,details:escrow.asset.details},received:{kind:incomingAsset.kind,name:incomingAsset.name,rarity:incomingAsset.rarity,details:incomingAsset.details}}).slice(-50)}catch(error){restoreTradeMutation(state,online,backup);return{ok:false,message:error.message||"受取処理に失敗しました"}}return{ok:true,gave:escrow.asset,received:incomingAsset,rollback:rollbackHandle(state,online,backup)}}
export function recoverOrphanedTradeEscrows(state,activeTradeIds=[]){const online=onlineState(state),backup=tradeMutationBackup(state,online),active=new Set(activeTradeIds.map(cleanId)),released=[],quarantined=[];for(const id of Object.keys(online.tradeEscrow??{}))if(!active.has(id)){const escrow=clone(online.tradeEscrow[id]),result=releaseOnlineTradeAsset(state,id);if(!result.ok){online.tradeEscrowQuarantine.push({tradeId:id,escrow,reason:String(result.message||"復元不能").slice(0,120),quarantinedAt:Date.now()});online.tradeEscrowQuarantine=online.tradeEscrowQuarantine.slice(-20);delete online.tradeEscrow[id];quarantined.push(id);continue}if(result.asset)released.push(result.asset)}Object.defineProperties(released,{rollback:{value:rollbackHandle(state,online,backup),enumerable:false},quarantined:{value:quarantined,enumerable:false}});return released}
export{STACKS as ONLINE_TRADE_STACKS};
