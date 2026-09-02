import{createEquipment,equipmentPower}from"../models/Equipment.js?v=2.11.0-build164";
import{createMonster,calculatedStats,displayName}from"../models/Monster.js?v=3.0.1-build301";
import{allLearnedSkills,maxMp,recommendedSkills,skillMasteryNeedForLevel}from"../battle/SkillSystem.js?v=2.11.83-build259";
import{SPECIES}from"../data/species.js?v=2.11.82-build258";
import{receiveEquipment,EQUIPMENT_LIMIT,RESERVE_LIMIT,slotLabel}from"../services/EquipmentStorage.js?v=3.0.1-build301";
import{equipmentStatLabel}from"../data/equipment.js?v=2.11.0-build164";
import{AFFIX_DEFINITIONS,formatAffix}from"../data/equipmentAffixes.js?v=2.11.0-build164";
import{goldForClearedFloor}from"./GoldEconomySystem.js?v=2.11.0-build164";
import{MONSTER_STORAGE_CAP,premiumCrystalCost}from"./config.js?v=3.0.1-build301";
import{campaignFloorToLegacyFloor}from"./Campaign100System.js?v=3.0.1-build301";

export const SECRET_ROOM_CHANCE=.09;
export const CASINO_CRYSTAL_COST=premiumCrystalCost(10);
export const CASINO_MULTIPLIER_RATES=Object.freeze([
 {min:0,max:0,rate:.50,label:"0倍"},
 {min:1,max:1,rate:.30,label:"1倍"},
 {min:2,max:2,rate:.13,label:"2倍"},
 {min:3,max:3,rate:.045,label:"3倍"},
 {min:5,max:5,rate:.018,label:"5倍"},
 {min:10,max:10,rate:.005,label:"10倍"},
 {min:50,max:50,rate:.0018,label:"50倍"},
 {min:100,max:100,rate:.00019,label:"100倍"},
 {min:999,max:999,rate:.00001,label:"999倍"}
]);
export const DARK_MARKET_ITEM_LIMIT=10;
const CASINO_HISTORY_LIMIT=20;
const CASINO_PROCESSED_ID_LIMIT=24;

export const SECRET_ROOM_RECOVERY_ITEMS=Object.freeze([
 {id:"highPotions",icon:"🧪",name:"ハイポーション",description:"単体HPを大回復",price:90},
 {id:"partyPotions",icon:"💚",name:"全体回復薬",description:"生存者全員のHPを回復",price:120},
 {id:"highManaPotions",icon:"🔷",name:"ハイマナポーション",description:"単体MPを大回復",price:130},
 {id:"partyManaPotions",icon:"🌊",name:"全体マナポーション",description:"生存者全員のMPを回復",price:180},
 {id:"fullHeals",icon:"✨",name:"完全回復薬・単体",description:"単体のHP・MP・異常を全回復",price:280},
 {id:"partyFullHeals",icon:"🌟",name:"完全回復薬・全体",description:"全員のHP・MP・異常を全回復",price:780}
]);

const MARKET_RARITIES=[
 {id:"SR",threshold:.50,equipmentRate:10,monsterRate:16},
 {id:"SSR",threshold:.76,equipmentRate:24,monsterRate:38},
 {id:"UR",threshold:.94,equipmentRate:50,monsterRate:78},
 {id:"LR",threshold:.995,equipmentRate:110,monsterRate:170},
 {id:"神話",threshold:1,equipmentRate:260,monsterRate:400}
];

const MAX_GOLD=Number.MAX_SAFE_INTEGER;

function safeInteger(value,fallback=0,min=0,max=MAX_GOLD){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback;
}
function safeSignedInteger(value,fallback=0){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(-MAX_GOLD,Math.min(MAX_GOLD,Math.trunc(number))):fallback;
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
function economicDepth(floor){return campaignFloorToLegacyFloor(safeInteger(floor,1,1,100))}
function rarityProfile(random=Math.random){
 const roll=Math.max(0,Math.min(.999999,Number(random())||0));
 return MARKET_RARITIES.find(entry=>roll<entry.threshold)??MARKET_RARITIES[0];
}
function marketPrice(referenceValue,random=Math.random){
 const roll=Math.max(0,Math.min(.999999,Number(random())||0));
 let min,max,label,tone;
 if(roll<.03){min=1;max=999;label="商人の気まぐれ";tone="bargain"}
 else if(roll<.20){min=1000;max=99_999;label="値札が壊れている";tone="fair"}
 else if(roll<.55){min=100_000;max=9_999_999;label="裏街価格";tone="fair"}
 else if(roll<.86){min=10_000_000;max=999_999_999;label="手が届くかは別";tone="high"}
 else{min=1_000_000_000;max=99_999_999_999;label="法外・返品不可";tone="extreme"}
 const value=min+Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*(max-min+1));
 const reference=Math.max(1,Number(referenceValue)||1);
 return{price:roundedPrice(value),referencePrice:roundedPrice(reference),priceLabel:label,priceTone:tone};
}
function equipmentDescription(item){
 const stats=Object.entries(item.stats??{}).map(([key,value])=>`${equipmentStatLabel(key)}+${value}`).join(" / ");
 const affixes=(item.affixes??[]).slice(0,2).map(formatAffix).join("・");
 return`${slotLabel(item.slot)}・Lv.${item.level}${stats?` / ${stats}`:""}${affixes?` / ${affixes}`:""}`;
}
function monsterDescription(monster){
 const species=SPECIES[monster.speciesId]??{};
 const element={neutral:"無",fire:"火",water:"水",ice:"氷",wind:"風",earth:"土",lightning:"雷",thunder:"雷",light:"光",dark:"闇",poison:"毒",nature:"自然"}[species.element]??species.element??"無";
 return`${element}属性・Lv.${monster.level}・+${monster.plus??0}`;
}
function marketPowerProfile(floor,random=Math.random,forMonster=false){
 const roll=random();
 if(roll<.04)return{id:"jackpot",label:"測定不能",level:random()<.35?99_999:999+Math.floor(random()*99_001),monsterLevel:forMonster?(random()<.05?9999:1000+Math.floor(Math.pow(random(),1.8)*9000)):999,plus:30+Math.floor(random()*70),priceRate:1};
 if(roll<.22)return{id:"surge",label:"危険な上振れ",level:100+Math.floor(random()*9_900),monsterLevel:forMonster?100+Math.floor(Math.pow(random(),2.4)*9900):100+Math.floor(random()*900),plus:1+Math.floor(random()*30),priceRate:1};
 if(roll<.78)return{id:"standard",label:"出所不明",level:1+Math.floor(random()*999),monsterLevel:1+Math.floor(random()*999),plus:Math.floor(random()*11),priceRate:1};
 return{id:"rough",label:"何かがおかしい",level:1+Math.floor(random()*30),monsterLevel:1+Math.floor(random()*30),plus:Math.floor(random()*4),priceRate:1};
}

function serialExclusiveAcquisition(acquisition){
 const values=Array.isArray(acquisition)?acquisition:[acquisition];
 return values.filter(Boolean).some(value=>/(?:専用シリアル(?:コード)?限定|シリアル(?:コード)?限定|シリアル専用)/.test(String(value)));
}

export function isDarkMarketMonsterAllowed(speciesOrMonster,offer=null){
 const monster=speciesOrMonster?.speciesId?speciesOrMonster:offer?.payload?.speciesId?offer.payload:null;
 const species=monster?SPECIES[monster.speciesId]:speciesOrMonster?.id?speciesOrMonster:null;
 if(!species)return false;
 const tags=[...(Array.isArray(species.tags)?species.tags:[]),...(Array.isArray(monster?.tags)?monster.tags:[]),...(Array.isArray(offer?.tags)?offer.tags:[])].map(tag=>String(tag).toLowerCase());
 const rarity=String(offer?.rarity??monster?.summonTier??monster?.summonRarity??species.rarity??"");
 if(["深淵","十神"].includes(rarity)||species.isAbyss||species.isTenGod||monster?.isAbyss||monster?.isTenGod)return false;
 if(tags.some(tag=>["abyss","tengod","ten_god","serialonly","contractedendgame"].includes(tag)))return false;
 if(species.serialOnly||species.gachaExcluded||monster?.serialOnly||monster?.gachaExcluded)return false;
 if(species.id==="dev_familiar_chappy")return false;
 if(monster?.endgameFaction||monster?.endgameBossId||monster?.isContractedEndgame||offer?.endgameFaction||offer?.endgameBossId||offer?.isContractedEndgame)return false;
 if(serialExclusiveAcquisition(species.acquisition)||serialExclusiveAcquisition(monster?.acquisition)||serialExclusiveAcquisition(offer?.acquisition))return false;
 return true;
}

const MARKET_RARITY_MONSTER_RATE=Object.freeze(Object.fromEntries(MARKET_RARITIES.map(entry=>[entry.id,entry.monsterRate])));
const MARKET_GRADE_PRICE_RATE=Object.freeze({rough:1,standard:1,surge:1.15,jackpot:1.35});

export function darkMarketMonsterPriceFloor(floor,monsterOrLevel,rarity="SR",powerGrade="standard"){
 const monster=monsterOrLevel&&typeof monsterOrLevel==="object"?monsterOrLevel:null;
 const level=safeInteger(monster?.level??monsterOrLevel,1,1,9999);
 const safeBand=Math.max(3,economicDepth(floor)*3);
 const numericReference=typeof rarity==="number"?safeInteger(rarity,0):0;
 if(level<=safeBand)return numericReference;
 const rarityId=typeof rarity==="string"?rarity:String(monster?.summonTier??monster?.summonRarity??SPECIES[monster?.speciesId]?.rarity??"SR");
 const rarityRate=MARKET_RARITY_MONSTER_RATE[rarityId]??MARKET_RARITY_MONSTER_RATE.SR;
 // The first three floor-equivalents stay in the old random-price lottery.
 // Beyond that point the logarithmic curve rises sharply enough that a
 // several-hundred-level monster cannot remain a casual bargain, while even
 // Lv.9999 still fits inside the game's safe integer economy.
 const ratio=level/safeBand,overlevelRate=1+8*Math.pow(Math.max(0,Math.log2(ratio)),2.4);
 const plusRate=1+safeInteger(monster?.plus,0,0,999)*.025,gradeRate=MARKET_GRADE_PRICE_RATE[powerGrade]??1;
 const species=SPECIES[monster?.speciesId],base=species?.baseStats??{},baseScore=(Number(base.hp)||40)*.1+(Number(base.atk)||8)+(Number(base.def)||5)+(Number(base.spd)||8);
 const speciesRate=species?Math.max(.8,Math.min(1.8,baseScore/26)):1;
 const minimum=goldForClearedFloor(level)*rarityRate*1.5*overlevelRate*plusRate*gradeRate*speciesRate;
 return Math.max(numericReference,roundedPrice(minimum));
}

function applyMonsterPriceFloor(quote,floor,monster,rarity,powerGrade){
 const minimum=darkMarketMonsterPriceFloor(floor,monster,rarity,powerGrade);
 if(!minimum||quote.price>=minimum)return quote;
 return{
  ...quote,
  price:minimum,
  referencePrice:Math.max(quote.referencePrice,minimum),
  priceLabel:minimum>=1_000_000_000?"禁忌級・能力査定":"超越個体・Lv差価格",
  priceTone:minimum>=1_000_000_000?"extreme":"high"
 };
}
function legendaryAffixes(slot,random=Math.random){
 const eligible=AFFIX_DEFINITIONS.filter(definition=>definition.slots.includes(slot)),legendary=eligible.filter(definition=>definition.legendaryOnly),normal=eligible.filter(definition=>!definition.legendaryOnly);
 const chosen=[];
 if(legendary.length)chosen.push(legendary[Math.floor(random()*legendary.length)]);
 while(chosen.length<4&&normal.length){
  const index=Math.floor(random()*normal.length),definition=normal.splice(index,1)[0];if(!chosen.some(entry=>entry.id===definition.id))chosen.push(definition);
 }
 return chosen.map(definition=>({id:definition.id,value:definition.max,quality:"legendary",locked:false}));
}
function applyMarketSkillPackage(monster,grade,random=Math.random){
 if(!["surge","jackpot"].includes(grade))return;
 const strongest=recommendedSkills(monster,4),minimum=grade==="jackpot"?10:5+Math.floor(random()*4);
 monster.equippedSkills=strongest.map(skill=>skill.id);while(monster.equippedSkills.length<4)monster.equippedSkills.push(null);monster.skillLoadoutInitialized=true;monster.skillRecommendationProfileVersion=199;monster.skillProgress={};
 for(const skill of strongest)monster.skillProgress[skill.id]={level:minimum,exp:0,uses:0,need:skillMasteryNeedForLevel(minimum)};
 monster.marketSkillGrade=grade==="jackpot"?"全スキル伝説級":"熟練スキル構成";
}
function maybeMysteryOffer(offer,random=Math.random){
 if(random()>=.04)return offer;
 return{...offer,mystery:true,revealed:false,actualName:offer.name,actualIcon:offer.icon,actualDescription:offer.description,name:offer.kind==="monster"?"封印された契約卵":"未鑑定の黒包み",icon:"❔",description:"中身は購入するまで分からない"};
}
function marketEquipmentOffer(floor,index,random){
 const profile=rarityProfile(random),powerProfile=marketPowerProfile(floor,random),slot=["weapon","armor","accessory"][Math.floor(random()*3)]??"weapon";
 const item=createEquipment(slot,{rarity:profile.id});
 item.level=powerProfile.level;item.plus=powerProfile.plus;
 if(powerProfile.id==="jackpot")item.affixes=legendaryAffixes(slot,random);
 else if(powerProfile.id==="surge")item.affixes=(item.affixes??[]).map(affix=>({...affix,quality:["epic","legendary"][Math.floor(random()*2)],value:Math.max(affix.value,Math.round(affix.value*(1.18+random()*.3)))}));
 item.marketGrade=powerProfile.id;item.marketGradeLabel=powerProfile.label;
 item.obtainedFloor=floor;item.obtainedMethod="darkMarket";
 const reference=Math.max(500,goldForClearedFloor(economicDepth(floor))*profile.equipmentRate+equipmentPower(item)*12),price=marketPrice(reference,random);
 return maybeMysteryOffer({id:`equipment-${index}`,kind:"equipment",rarity:profile.id,name:item.name,icon:{weapon:"⚔️",armor:"🛡️",accessory:"💍"}[slot],description:`${powerProfile.label}・${equipmentDescription(item)}`,powerGrade:powerProfile.id,powerLabel:powerProfile.label,sold:false,payload:item,...price},random);
}
function marketMonsterOffer(floor,index,random){
 const profile=rarityProfile(random),powerProfile=marketPowerProfile(floor,random,true);
 let pool=Object.values(SPECIES).filter(species=>species.rarity===profile.id&&isDarkMarketMonsterAllowed(species));
 if(!pool.length)pool=Object.values(SPECIES).filter(species=>isDarkMarketMonsterAllowed(species));
 const species=pool[Math.floor(random()*pool.length)]??SPECIES.slime;
 const level=powerProfile.monsterLevel;
 const plus=powerProfile.plus;
 const affection=powerProfile.id==="jackpot"?500+Math.floor(random()*501):powerProfile.id==="surge"?200+Math.floor(random()*401):0;
 const monster=createMonster(species.id,{nickname:species.name,level,plus,affection,obtainedFloor:floor,obtainedMethod:"darkMarket"});
 monster.summonRarity=profile.id;if(profile.id==="神話")monster.summonTier="神話";
 monster.marketGrade=powerProfile.id;monster.marketGradeLabel=powerProfile.label;applyMarketSkillPackage(monster,powerProfile.id,random);
 const reference=Math.max(800,goldForClearedFloor(economicDepth(floor))*profile.monsterRate*powerProfile.priceRate*(1+Math.min(300,level)*.012+plus*.05)),price=applyMonsterPriceFloor(marketPrice(reference,random),floor,monster,profile.id,powerProfile.id);
 return maybeMysteryOffer({id:`monster-${index}`,kind:"monster",rarity:profile.id,name:displayName(monster),icon:species.emoji??"👹",description:`${powerProfile.label}・${monsterDescription(monster)}${monster.marketSkillGrade?`・${monster.marketSkillGrade}`:""}`,powerGrade:powerProfile.id,powerLabel:powerProfile.label,sold:false,payload:monster,...price},random);
}
function createRoom(roomId,floor,random=Math.random){
 const offers=[
  marketEquipmentOffer(floor,1,random),
  marketEquipmentOffer(floor,2,random),
  marketEquipmentOffer(floor,3,random),
  marketMonsterOffer(floor,1,random),
  marketMonsterOffer(floor,2,random),
  marketMonsterOffer(floor,3,random)
 ];
 return{
  id:String(roomId),floor:safeInteger(floor,1,1,10000),createdAt:new Date().toISOString(),rested:false,
  casino:{used:false,entryPaid:false,spins:0,wins:0,totalBet:0,totalPayout:0,netGold:0,crystalsSpent:0,bestMultiplier:0,biggestPayout:0,lastBet:0,history:[],processedSpinIds:[],lastResult:null},
  offers,
  recoveryPurchased:Object.fromEntries(SECRET_ROOM_RECOVERY_ITEMS.map(item=>[item.id,0]))
 };
}

function normalizeCasinoResult(result,fallbackId="legacy-spin"){
 if(!result||typeof result!=="object"||Array.isArray(result))return null;
 const bet=safeInteger(result.bet,0),payout=safeInteger(result.payout,0),multiplier=result.multiplier==null
  ?bet>0?Math.max(0,Math.min(999,Math.floor(payout/bet))):result.won?10:0
  :safeInteger(result.multiplier,0,0,999);
 return{
  ...result,
  spinId:String(result.spinId??fallbackId),
  won:multiplier>1,
  multiplier,
  digits:String(multiplier).padStart(3,"0").slice(-3).split(""),
  bet,
  payout,
  net:safeSignedInteger(result.net,payout-bet),
  crystalCost:safeInteger(result.crystalCost,0,0,CASINO_CRYSTAL_COST),
  at:String(result.at??new Date().toISOString())
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
 room.casino.entryPaid=Boolean(room.casino.entryPaid||room.casino.used||room.casino.spins>0);room.casino.used=room.casino.entryPaid;
 room.casino.lastResult=normalizeCasinoResult(room.casino.lastResult,`legacy-${room.id}-${Math.max(1,room.casino.spins)}`);
 room.casino.history=(Array.isArray(room.casino.history)?room.casino.history:[]).map((result,index)=>normalizeCasinoResult(result,`history-${room.id}-${index+1}`)).filter(Boolean).slice(-CASINO_HISTORY_LIMIT);
 if(room.casino.lastResult&&!room.casino.history.some(result=>result.spinId===room.casino.lastResult.spinId))room.casino.history.push(room.casino.lastResult);
 room.casino.history=room.casino.history.slice(-CASINO_HISTORY_LIMIT);
 room.casino.processedSpinIds=[...new Set((Array.isArray(room.casino.processedSpinIds)?room.casino.processedSpinIds:room.casino.history.map(result=>result.spinId)).map(String))].slice(-CASINO_PROCESSED_ID_LIMIT);
 const inferredTotalBet=room.casino.history.reduce((sum,result)=>Math.min(MAX_GOLD,sum+result.bet),0),inferredTotalPayout=room.casino.history.reduce((sum,result)=>Math.min(MAX_GOLD,sum+result.payout),0);
 room.casino.totalBet=safeInteger(room.casino.totalBet,inferredTotalBet);room.casino.totalPayout=safeInteger(room.casino.totalPayout,inferredTotalPayout);
 room.casino.crystalsSpent=safeInteger(room.casino.crystalsSpent,room.casino.history.reduce((sum,result)=>sum+result.crystalCost,0));room.casino.netGold=safeSignedInteger(room.casino.netGold,room.casino.totalPayout-room.casino.totalBet);
 room.casino.bestMultiplier=safeInteger(room.casino.bestMultiplier,Math.max(0,...room.casino.history.map(result=>result.multiplier)),0,999);room.casino.biggestPayout=safeInteger(room.casino.biggestPayout,Math.max(0,...room.casino.history.map(result=>result.payout)));
 room.casino.lastBet=safeInteger(room.casino.lastBet,room.casino.lastResult?.bet??0);
 room.offers=Array.isArray(room.offers)?room.offers
  .filter(offer=>offer&&typeof offer==="object"&&["equipment","monster"].includes(offer.kind)&&(offer.kind!=="monster"||offer.sold||isDarkMarketMonsterAllowed(offer.payload,offer)))
  .map((offer,index)=>{
   const normalized={
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
    priceTone:["bargain","fair","high","extreme"].includes(offer.priceTone)?offer.priceTone:"fair",
    powerGrade:String(offer.powerGrade??offer.payload?.marketGrade??"standard"),
    powerLabel:String(offer.powerLabel??offer.payload?.marketGradeLabel??"階層相応"),
    mystery:Boolean(offer.mystery),
    revealed:Boolean(offer.revealed),
    actualName:offer.actualName==null?null:String(offer.actualName),
    actualIcon:offer.actualIcon==null?null:String(offer.actualIcon),
    actualDescription:offer.actualDescription==null?null:String(offer.actualDescription)
   };
   if(normalized.kind==="monster"&&!normalized.sold&&normalized.payload)Object.assign(normalized,applyMonsterPriceFloor(normalized,room.floor,normalized.payload,normalized.rarity,normalized.powerGrade));
   return normalized;
  }):[];
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

// AUTOの回収優先で買ってよいのは、回復品ではなく一点物かつ
// 相場の8%以下まで値崩れした「異常特価」だけ。
export function isDarkMarketBargain(offer){
 if(!offer||offer.sold||!["monster","equipment"].includes(offer.kind))return false;
 const price=Math.max(1,Number(offer.price)||1),reference=Math.max(1,Number(offer.referencePrice)||price);
 return offer.priceTone==="bargain"&&price/reference<=.08;
}

function casinoMultiplier(random=Math.random){
 const roll=Math.max(0,Math.min(.999999999,Number(random())||0));let cursor=0;
 for(const bucket of CASINO_MULTIPLIER_RATES){
  cursor+=bucket.rate;
  if(roll<cursor)return{multiplier:bucket.min,roll,bucket};
 }
 return{multiplier:0,roll,bucket:CASINO_MULTIPLIER_RATES[0]};
}

export function casinoBetLimit(state){
 const room=activeSecretRoom(state);
 const gold=safeInteger(state.player?.gold,0),floor=room?.floor??safeInteger(state.player?.currentFloor,1,1,10000);
 return Math.min(gold,roundedPrice(Math.max(10_000,goldForClearedFloor(economicDepth(floor))*500)));
}

export function spinSecretRoomCasino(state,bet,randomOrOptions=Math.random){
 const room=activeSecretRoom(state);
 if(!room)return{ok:false,message:"カジノが見つかりません。"};
 const options=typeof randomOrOptions==="function"?{random:randomOrOptions}:randomOrOptions&&typeof randomOrOptions==="object"?randomOrOptions:{};
 const random=typeof options.random==="function"?options.random:Math.random,spinId=String(options.spinId??uid("casino-spin"));
 const duplicate=room.casino.history?.find(result=>result.spinId===spinId);
 if(duplicate)return{ok:true,duplicate:true,...duplicate,gold:safeInteger(state.player?.gold,0),crystals:safeInteger(state.player?.crystals,0),betLimit:casinoBetLimit(state)};
 if(room.casino.processedSpinIds?.includes(spinId))return{ok:false,duplicate:true,message:"この抽選はすでに決済済みです。"};
 const gold=safeInteger(state.player?.gold,0),amount=safeInteger(bet,0),limit=casinoBetLimit(state),crystals=safeInteger(state.player?.crystals,0),crystalCost=room.casino.entryPaid?0:CASINO_CRYSTAL_COST;
 if(amount<1)return{ok:false,message:"賭け金は1G以上にしてください。"};
 if(amount>gold)return{ok:false,message:`GOLDが足りません。所持 ${gold.toLocaleString()}G`};
 if(amount>limit)return{ok:false,message:`この階のBET上限は ${limit.toLocaleString()}Gです。`};
 if(crystals<crystalCost)return{ok:false,message:`初回入場料の魔晶石が足りません。必要 ${crystalCost}個`};
 const outcome=casinoMultiplier(random),multiplier=outcome.multiplier;
 state.player.gold=gold-amount;
 state.player.crystals=crystals-crystalCost;
 const advertisedPayout=multiplier&&amount>Math.floor(MAX_GOLD/multiplier)?MAX_GOLD:amount*multiplier,payout=Math.min(advertisedPayout,MAX_GOLD-state.player.gold);state.player.gold+=payout;
 const net=payout-amount,won=multiplier>1,digits=String(multiplier).padStart(3,"0").slice(-3).split(""),result={spinId,won,multiplier,digits,bet:amount,payout,net,crystalCost,at:new Date().toISOString()};
 room.casino.entryPaid=true;room.casino.used=true;room.casino.spins=safeInteger(room.casino.spins+1,1);room.casino.wins=safeInteger(room.casino.wins+(won?1:0),won?1:0);
 room.casino.crystalsSpent=safeInteger(room.casino.crystalsSpent+crystalCost,crystalCost);room.casino.totalBet=safeInteger(room.casino.totalBet+amount,amount);room.casino.totalPayout=safeInteger(room.casino.totalPayout+payout,payout);room.casino.netGold=safeSignedInteger(room.casino.netGold+net,net);
 room.casino.bestMultiplier=Math.max(room.casino.bestMultiplier??0,multiplier);room.casino.biggestPayout=Math.max(room.casino.biggestPayout??0,payout);room.casino.lastBet=amount;room.casino.lastResult=result;
 room.casino.history=[...(room.casino.history??[]),result].slice(-CASINO_HISTORY_LIMIT);room.casino.processedSpinIds=[...(room.casino.processedSpinIds??[]),spinId].slice(-CASINO_PROCESSED_ID_LIMIT);
 return{ok:true,...result,gold:state.player.gold,crystals:state.player.crystals,betLimit:casinoBetLimit(state),roll:outcome.roll,bucket:outcome.bucket};
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
 if(offer.kind==="monster"&&!isDarkMarketMonsterAllowed(offer.payload,offer))return{ok:false,message:"この契約は闇市場の取扱対象外です。"};
 if((state.player?.gold??0)<offer.price)return{ok:false,message:`GOLDが足りません。必要 ${offer.price.toLocaleString()}G`};
 if(offer.kind==="monster"&&(state.monsters?.length??0)>=MONSTER_STORAGE_CAP)return{ok:false,message:`モンスター所持数が${MONSTER_STORAGE_CAP}体で満杯です。`};
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
 const purchasedName=offer.kind==="monster"?displayName(payload):payload.name;
 offer.sold=true;offer.revealed=true;offer.name=offer.actualName??purchasedName;offer.icon=offer.actualIcon??offer.icon;offer.description=offer.actualDescription??offer.description;offer.payload=null;offer.purchasedAt=new Date().toISOString();
 return{ok:true,offer,item:payload,receipt,message:offer.kind==="monster"?`${purchasedName}が仲間になりました！`:receipt?.message??`${purchasedName}を購入しました。`};
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
