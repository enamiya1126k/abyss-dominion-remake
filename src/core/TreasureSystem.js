const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const safeFloor=value=>clamp(Math.floor(Number(value)||1),1,10000);
const safeRandom=random=>typeof random==="function"?random:Math.random;
const roll=(random,min,max)=>min+Math.floor(safeRandom(random)()*(max-min+1));
const EQUIPMENT_SLOTS=Object.freeze(["weapon","armor","accessory"]);
const equipmentSlot=random=>EQUIPMENT_SLOTS[Math.floor(safeRandom(random)()*EQUIPMENT_SLOTS.length)]??EQUIPMENT_SLOTS[0];

export const TREASURE_BALANCE_VERSION=200;
export const TREASURE_ROOM_MIMIC_RATE=.15;
export const TREASURE_ROOM_MIMIC_MAX=2;

/** Rare enough to feel special: 0.5% at the start, at most 1% in the abyss. */
export function treasureRoomRateForFloor(floor){
 const depth=safeFloor(floor);
 return Math.min(.01,.005+Math.floor(depth/100)*.0005)
}

export function treasureRoomChestCount(random=Math.random){return 6+Math.floor(safeRandom(random)()*3)}

export function shouldPlaceTreasureMimic({treasureRoom=false,mimicsPlaced=0,random=Math.random}={}){
 return Boolean(treasureRoom)&&Math.max(0,Math.floor(Number(mimicsPlaced)||0))<TREASURE_ROOM_MIMIC_MAX&&safeRandom(random)()<TREASURE_ROOM_MIMIC_RATE
}

function rarityRoll(kind,locked,luck,random){
 if(locked)return"神話";
 const bonus=clamp(Math.floor(Number(luck)||0),0,20),value=safeRandom(random)();
 if(kind==="radiant")return value<Math.min(.08,.03+bonus*.0025)?"神話":value<Math.min(.50,.34+bonus*.008)?"LR":"UR";
 if(kind==="cabinet")return value<Math.min(.06,.015+bonus*.002)?"LR":value<Math.min(.34,.22+bonus*.006)?"UR":value<Math.min(.80,.68+bonus*.006)?"SSR":"SR";
 return value<.0005?"神話":value<.006?"LR":value<.03?"UR":value<.13?"SSR":value<.38?"SR":value<.72?"R":"N"
}

export function treasureEquipmentLevel(floor,{kind="box",locked=false,random=Math.random}={}){
 const depth=safeFloor(floor),rng=safeRandom(random),range=locked?[1.8,2.4]:kind==="radiant"?[1.35,1.75]:kind==="cabinet"?[1.12,1.48]:[.9,1.25],factor=range[0]+rng()*(range[1]-range[0]);
 return clamp(Math.round(depth*factor),1,100000)
}

/**
 * Produces a transport-safe reward contract used by solo and online chests.
 * Every ordinary chest now gives a useful guaranteed reward; equipment is an
 * additional roll except for cabinet/radiant/locked chests where it is certain.
 */
export function rollTreasureChestReward({floor=1,kind="box",locked=false,treasureRoom=false,luck=0,random=Math.random,baseGold=1}={}){
 const depth=safeFloor(floor),rng=safeRandom(random),chestKind=["apple","box","cabinet","radiant"].includes(kind)?kind:"box",base=Math.max(1,Math.floor(Number(baseGold)||1)),reward={gold:0,potions:0,crystals:0,equipment:null};
 if(chestKind==="apple"){
  reward.potions=2;reward.gold=Math.max(1,Math.round(base*1.5));
 }else if(chestKind==="box"&&!locked){
  reward.gold=Math.max(1,Math.round(base*(treasureRoom?4:3)));
  if(rng()<.6)reward.equipment={rarity:rarityRoll(chestKind,false,luck,rng),slot:equipmentSlot(rng),level:treasureEquipmentLevel(depth,{kind:chestKind,random:rng}),plus:roll(rng,0,Math.min(8,1+Math.floor(depth/250)))};
 }else{
  reward.gold=Math.max(1,Math.round(base*(locked?8:chestKind==="radiant"?4:2)));
  reward.crystals=locked?roll(rng,12,20):chestKind==="radiant"?roll(rng,4,8):0;
  reward.equipment={rarity:rarityRoll(chestKind,locked,luck,rng),slot:equipmentSlot(rng),level:treasureEquipmentLevel(depth,{kind:chestKind,locked,random:rng}),plus:locked?roll(rng,12,30):chestKind==="radiant"?roll(rng,5,16):roll(rng,2,10)}
 }
 return reward
}

export function mimicVictoryGold(floor,baseGold){
 const depth=safeFloor(floor),base=Math.max(1,Math.floor(Number(baseGold)||1));
 return Math.max(depth*25,Math.round(base*12))
}

export function mimicExperienceMultiplier(){return 8}

export function mimicVictoryCrystals(floor,random=Math.random){
 return 12+Math.min(18,Math.floor(safeFloor(floor)/500))+Math.floor(safeRandom(random)()*7)
}
