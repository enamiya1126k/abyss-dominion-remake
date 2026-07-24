import{createEquipment}from"../models/Equipment.js?v=1.2.0";
import{createMonster,calculatedStats,displayName}from"../models/Monster.js?v=1.3.0";
import{maxMp}from"../battle/SkillSystem.js?v=1.3.0";
import{SPECIES}from"../data/species.js?v=1.3.0";
import{receiveEquipment,EQUIPMENT_LIMIT,RESERVE_LIMIT,slotLabel}from"../services/EquipmentStorage.js?v=1.2.0";
import{equipmentStatLabel}from"../data/equipment.js?v=1.2.0";
import{formatAffix}from"../data/equipmentAffixes.js?v=1.2.0";
import{goldForClearedFloor}from"./GoldEconomySystem.js?v=1.2.0";

export const SECRET_ROOM_CHANCE=.09;
export const CASINO_WIN_RATE=.08;
export const CASINO_PAYOUT_MULTIPLIER=10;
export const DARK_MARKET_ITEM_LIMIT=10;

export const SECRET_ROOM_RECOVERY_ITEMS=Object.freeze([
 {id:"highPotions",icon:"🧪",name:"ハイポーション",description:"単体HPを大回復",price:90},
 {id:"partyPotions",icon:"💚",name:"全体回復薬",description:"生存者全員のHPを回復",price:120},
 {id:"highManaPotions",icon:"🔷",name:"ハイマナポーション",description:"単体MPを大回復",price:130},
 {id:"partyManaPotions",icon:"🌊",name:"全体マナポーション",description:"生存者全員のMPを回復",price:180},
 {id:"fullHeals",icon:"✨",name:"完全回復薬・単体",description:"単体のHP・MP・異常を全回復",price:280},
 {id:"partyFullHeals",icon:"🌟",name:"完全回復薬・全体",description:"全員のHP・MP・異常を全回復",price:780}
]);

const MARKET_RARITIES=[
 {id:"SR",threshold:.50,equipmentRate:10,monsterRate:16,stars:2},
 {id:"SSR",threshold:.76,equipmentRate:24,monsterRate:38,stars:3},
 {id:"UR",threshold:.94,equipmentRate:50,monsterRate:78,stars:4},
 {id:"LR",threshold:.995,equipmentRate:110,monsterRate:170,stars:5},
 {id:"神話",threshold:1,equipmentRate:260,monsterRate:400,stars:5}
];

const MAX_GOLD=Number.MAX_SAFE_INTEGER;

function safeInteger(value,fallback=0,min=0,max=MAX_GOLD){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback;
}
function uid(prefix="secret"){
 return`${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random()*0x7fffffff).toString(36)}`;
}
function seeded(seed){
 let value=seed>>>0;
 return()=>{value=(value*1664525+1013904223)>>>0;return value/4294967296};
}
function mixSeed(seed,floor){
 let value=(safeInteger(seed,1,1,0x7fffffff)^(safeInteger(floor,1,1,10000)*2654435761))>>>0;
 value^=value>>>16;value=Math.imul(value,2246822507);value^=value>>>13;value=Math.imul(value,3266489909);value^=value>>>16;
 return value>>>0;
}
function roundedPrice(value){
 const amount=Math.max(1,Math.min(MAX_GOLD,Math.round(Number(value)||1)));
 const unit=amount>=1e9?1e6:amount>=1e6?10000:amount>=10000?100:amount>=1000?10:1;
 return Math.max(1,Math.round(amount/unit)*unit);
}
function rarityProfile(random=Math.random){
 const roll=Math.max(0,Math.min(.999999,Number(random())||0));
 return MARKET_RARITIES.find(entry=>roll<entry.threshold)??MARKET_RARITIES[0];
}
function marketPrice(reference,random=Math.random){
 const roll=Math.max(0,Math.min(.999999,Number(random())||0));
 let multiplier,label,tone;
 if(roll<.01){
  multiplier=.01+Math.max(0,Math.min(1,Number(random())||0))*.08;
  label="ありえない掘り出し物";
  tone="bargain";
 }else if(roll<.56){
  multiplier=.9+Math.max(0,Math.min(1,Number(random())||0))*.45;
  label="相応価格";
  tone="fair";
 }else if(roll<.90){
  multiplier=1.4+Math.max(0,Math.min(1,Number(random())||0))*1.6;
  label="高額";
  tone="high";
 }else{
  multiplier=3.2+Math.max(0,Math.min(1,Number(random())||0))*4.8;
  label="法外価格";
  tone="extreme";
 }
 return{price:roundedPrice(reference*multiplier),referencePrice:roundedPrice(reference),priceLabel:label,priceTone:tone};
}
function equipmentDescription(item){
 const stats=Object.entries(item.stats??{}).map(([key,value])=>`${equipmentStatLabel(key)}+${value}`).join(" / ");
 const affixes=(item.affixes??[]).slice(0,2).map(formatAffix).join("・");
 return`${slotLabel(item.slot)}・Lv.${item.level}${stats?` / ${stats}`:""}${affixes?` / ${affixes}`:""}`;
}
function monsterDescription(monster){
 const species=SPECIES[monster.speciesId]??{};
 const element={neutral:"無",fire:"火",water:"水",ice:"氷",wind:"風",earth:"土",lightning:"雷",thunder:"雷",light:"光",dark:"闇",poison:"毒",nature:"自然"}[species.element]??species.element??"無";
 return`${element}属性・Lv.${monster.level}・${"★".repeat(monster.stars??1)}`;
}
function marketEquipmentOffer(floor,index,random){
 const profile=rarityProfile(random),slot=["weapon","armor","accessory"][Math.floor(random()*3)]??"weapon";
 const item=createEquipment(slot,{rarity:profile.id});
 item.level=Math.max(1,Math.round(Math.max(1,floor)/20*(.85+random()*.3)));
 item.obtainedFloor=floor;item.obtainedMethod="darkMarket";
 const reference=Math.max(500,goldForClearedFloor(floor)*profile.equipmentRate),price=marketPrice(reference,random);
 return{id:`equipment-${index}`,kind:"equipment",rarity:profile.id,name:item.name,icon:{weapon:"⚔️",armor:"🛡️",accessory:"💍"}[slot],description:equipmentDescription(item),sold:false,payload:item,...price};
}
function marketMonsterOffer(floor,index,random){
 const profile=rarityProfile(random);
 let pool=Object.values(SPECIES).filter(species=>species.rarity===profile.id&&(species.minFloor??1)<=floor&&!species.isTenGod&&!species.isAbyss&&!species.tags?.includes?.("tenGod")&&!species.tags?.includes?.("abyss"));
 if(!pool.length)pool=Object.values(SPECIES).filter(species=>species.rarity===profile.id&&!species.isTenGod&&!species.isAbyss&&!species.tags?.includes?.("tenGod")&&!species.tags?.includes?.("abyss"));
 const species=pool[Math.floor(random()*pool.length)]??SPECIES.slime;
 const level=Math.max(1,Math.min(1000,Math.round(1+(floor-1)*.72*(.9+random()*.2))));
 const plus=profile.id==="神話"?Math.max(0,Math.floor(floor/500)):profile.id==="LR"?Math.max(0,Math.floor(floor/1500)):0;
 const monster=createMonster(species.id,{nickname:species.name,level,stars:profile.stars,plus,obtainedFloor:floor,obtainedMethod:"darkMarket"});
 monster.summonRarity=profile.id;if(profile.id==="神話")monster.summonTier="神話";
 const reference=Math.max(800,goldForClearedFloor(floor)*profile.monsterRate),price=marketPrice(reference,random);
 return{id:`monster-${index}`,kind:"monster",rarity:profile.id,name:displayName(monster),icon:species.emoji??"👹",description:monsterDescription(monster),sold:false,payload:monster,...price};
}
function createRoom(roomId,floor,random=Math.random){
 const offers=[
  marketEquipmentOffer(floor,1,random),
  marketEquipmentOffer(floor,2,random),
  marketEquipmentOffer(floor,3,random),
  marketMonsterOffer(floor,1,random),
  marketMonsterOffer(floor,2,random)
 ];
 return{
  id:String(roomId),floor:safeInteger(floor,1,1,10000),createdAt:new Date().toISOString(),rested:false,
  casino:{spins:0,wins:0,netGold:0,lastResult:null},
  offers,
  recoveryPurchased:Object.fromEntries(SECRET_ROOM_RECOVERY_ITEMS.map(item=>[item.id,0]))
 };
}

export function normalizeSecretRoomState(state){
 state.secretRooms=state.secretRooms&&typeof state.secretRooms==="object"&&!Array.isArray(state.secretRooms)?state.secretRooms:{};
 const run=state.secretRooms.run&&typeof state.secretRooms.run==="object"&&!Array.isArray(state.secretRooms.run)?state.secretRooms.run:null;
 state.secretRooms.run=run?{
  id:String(run.id??uid("run")),
  seed:safeInteger(run.seed,1,1,0x7fffffff),
  startedAt:Number.isFinite(Number(run.startedAt))?Number(run.startedAt):Date.now()
 }:null;
 const room=state.secretRooms.activeRoom;
 if(!room||typeof room!=="object"||Array.isArray(room)){state.secretRooms.activeRoom=null;return state.secretRooms}
 room.id=String(room.id??"legacy-room");room.floor=safeInteger(room.floor,1,1,10000);room.rested=Boolean(room.rested);
 room.casino=room.casino&&typeof room.casino==="object"?room.casino:{};
 for(const key of["spins","wins"])room.casino[key]=safeInteger(room.casino[key],0);
 room.casino.netGold=Math.trunc(Number(room.casino.netGold)||0);room.casino.lastResult??=null;
 room.offers=Array.isArray(room.offers)?room.offers.filter(offer=>offer&&typeof offer==="object"&&["equipment","monster"].includes(offer.kind)).map((offer,index)=>({
  ...offer,
  id:String(offer.id??`${offer.kind}-${index+1}`),
  rarity:String(offer.rarity??offer.payload?.summonTier??offer.payload?.summonRarity??offer.payload?.rarity??"SR"),
  name:String(offer.name??offer.payload?.name??"名もなき裏商品"),
  icon:String(offer.icon??(offer.kind==="monster"?"👹":"⚔️")),
  description:String(offer.description??"詳細不明"),
  sold:Boolean(offer.sold),
  price:safeInteger(offer.price,1,1),
  referencePrice:safeInteger(offer.referencePrice,offer.price??1,1),
  priceLabel:String(offer.priceLabel??"相応価格"),
  priceTone:["bargain","fair","high","extreme"].includes(offer.priceTone)?offer.priceTone:"fair"
 })):[];
 room.recoveryPurchased=room.recoveryPurchased&&typeof room.recoveryPurchased==="object"?room.recoveryPurchased:{};
 for(const item of SECRET_ROOM_RECOVERY_ITEMS)room.recoveryPurchased[item.id]=safeInteger(room.recoveryPurchased[item.id],0,0,DARK_MARKET_ITEM_LIMIT);
 return state.secretRooms;
}

export function beginSecretRoomExpedition(state,random=Math.random){
 normalizeSecretRoomState(state);
 const seed=Math.max(1,Math.floor(Math.max(0,Math.min(.999999999,Number(random())||0))*0x7fffffff));
 state.secretRooms.run={id:uid("run"),seed,startedAt:Date.now()};
 state.secretRooms.activeRoom=null;
 return state.secretRooms.run;
}

export function ensureSecretRoomExpedition(state,random=Math.random){
 normalizeSecretRoomState(state);
 return state.secretRooms.run??beginSecretRoomExpedition(state,random);
}

export function secretRoomPlan(state,floor){
 const run=ensureSecretRoomExpedition(state),safeFloor=safeInteger(floor,1,1,10000),random=seeded(mixSeed(run.seed,safeFloor));
 return{id:`${run.id}:${safeFloor}`,appears:safeFloor%10!==0&&random()<SECRET_ROOM_CHANCE,positionRoll:random()};
}

export function enterSecretRoom(state,roomId,floor,random=Math.random){
 normalizeSecretRoomState(state);
 if(state.secretRooms.activeRoom?.id!==String(roomId))state.secretRooms.activeRoom=createRoom(roomId,floor,random);
 return state.secretRooms.activeRoom;
}

export function activeSecretRoom(state){
 normalizeSecretRoomState(state);
 return state.secretRooms.activeRoom;
}

export function spinSecretRoomCasino(state,bet,random=Math.random){
 const room=activeSecretRoom(state);
 if(!room)return{ok:false,message:"カジノが見つかりません。"};
 const gold=safeInteger(state.player?.gold,0),amount=safeInteger(bet,0);
 if(amount<1)return{ok:false,message:"賭け金は1G以上にしてください。"};
 if(amount>gold)return{ok:false,message:`GOLDが足りません。所持 ${gold.toLocaleString()}G`};
 state.player.gold=gold-amount;
 const roll=Math.max(0,Math.min(.999999,Number(random())||0)),won=roll<CASINO_WIN_RATE,payout=won?Math.min(MAX_GOLD,amount*CASINO_PAYOUT_MULTIPLIER):0;
 if(won)state.player.gold=Math.min(MAX_GOLD,state.player.gold+payout);
 const net=won?payout-amount:-amount;
 room.casino.spins++;if(won)room.casino.wins++;room.casino.netGold=Math.max(-MAX_GOLD,Math.min(MAX_GOLD,room.casino.netGold+net));
 room.casino.lastResult={won,bet:amount,payout,net,at:new Date().toISOString()};
 return{ok:true,won,bet:amount,payout,net,gold:state.player.gold,roll};
}

export function useSecretRoomInn(state){
 const room=activeSecretRoom(state);
 if(!room)return{ok:false,message:"宿が見つかりません。"};
 if(room.rested)return{ok:false,message:"この宿はすでに利用済みです。"};
 let hp=0,mp=0,ailments=0;
 for(const id of state.party??[]){
  const monster=state.monsters?.find(entry=>entry.id===id);if(!monster)continue;
  const stats=calculatedStats(monster),mpMax=maxMp(monster);
  hp+=Math.max(0,stats.hp-(monster.currentHp??stats.hp));mp+=Math.max(0,mpMax-(monster.currentMp??mpMax));
  ailments+=(monster.statuses?.length??0)+(monster.ailments?.length??0)+(monster.status?1:0);
  monster.currentHp=stats.hp;monster.currentMp=mpMax;monster.statuses=[];monster.status=null;monster.ailments=[];
 }
 room.rested=true;
 return{ok:true,hp,mp,ailments,total:hp+mp,message:`HP ${hp.toLocaleString()}・MP ${mp.toLocaleString()}を回復`};
}

export function buyDarkMarketOffer(state,offerId){
 const room=activeSecretRoom(state),offer=room?.offers?.find(entry=>entry.id===offerId);
 if(!offer)return{ok:false,message:"商品が見つかりません。"};
 if(offer.sold)return{ok:false,message:"この商品は売り切れです。"};
 if((state.player?.gold??0)<offer.price)return{ok:false,message:`GOLDが足りません。必要 ${offer.price.toLocaleString()}G`};
 if(offer.kind==="monster"&&(state.monsters?.length??0)>=500)return{ok:false,message:"モンスター所持数が500体で満杯です。"};
 if(offer.kind==="equipment"&&(state.equipment?.length??0)>=EQUIPMENT_LIMIT&&(state.reserveEquipment?.length??0)>=RESERVE_LIMIT)return{ok:false,message:"装備所持品と予備BOXが満杯です。先に整理してください。"};
 const payload=offer.payload;if(!payload)return{ok:false,message:"商品のデータが壊れています。"};
 state.player.gold-=offer.price;state.records??={};state.records.purchases=(state.records.purchases??0)+1;
 let receipt=null;
 if(offer.kind==="monster"){
  state.monsters.push(payload);state.codex??={};state.codex.captures??={};state.codex.encounters??={};
  state.codex.captures[payload.speciesId]=(state.codex.captures[payload.speciesId]??0)+1;
  state.codex.encounters[payload.speciesId]=(state.codex.encounters[payload.speciesId]??0)+1;
 }else{
  receipt=receiveEquipment(state,payload);state.codex??={};state.codex.equipment??={};
  state.codex.equipment[payload.name]=(state.codex.equipment[payload.name]??0)+1;
 }
 offer.sold=true;offer.payload=null;offer.purchasedAt=new Date().toISOString();
 return{ok:true,offer,item:payload,receipt,message:offer.kind==="monster"?`${offer.name}が仲間になりました！`:receipt?.message??`${offer.name}を購入しました。`};
}

export function buyDarkMarketRecovery(state,itemId){
 const room=activeSecretRoom(state),definition=SECRET_ROOM_RECOVERY_ITEMS.find(item=>item.id===itemId);
 if(!room||!definition)return{ok:false,message:"商品が見つかりません。"};
 const purchased=safeInteger(room.recoveryPurchased[itemId],0,0,DARK_MARKET_ITEM_LIMIT);
 if(purchased>=DARK_MARKET_ITEM_LIMIT)return{ok:false,message:"この商品の購入上限10個に達しました。"};
 if((state.player?.gold??0)<definition.price)return{ok:false,message:`GOLDが足りません。必要 ${definition.price.toLocaleString()}G`};
 state.player.gold-=definition.price;state.inventory??={};state.inventory[itemId]=(state.inventory[itemId]??0)+1;
 room.recoveryPurchased[itemId]=purchased+1;state.records??={};state.records.purchases=(state.records.purchases??0)+1;
 return{ok:true,item:definition,purchased:purchased+1,remaining:DARK_MARKET_ITEM_LIMIT-purchased-1,message:`${definition.name}を購入（${purchased+1}/${DARK_MARKET_ITEM_LIMIT}）`};
}
