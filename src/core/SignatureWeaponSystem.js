import{SPECIES}from"../data/species.js?v=2.10.0-build161";
import{ENDGAME_CHARACTERS}from"../data/endgameCharacters.js?v=2.10.0-build161";
import{RARITY_ORDER}from"../data/equipment.js?v=2.10.0-build161";
import{createEquipment}from"../models/Equipment.js?v=2.10.0-build161";

const MYTHIC=Object.freeze({
 myth_enami:Object.freeze({id:"enami-multitask",ownerId:"myth_enami",ownerName:"えなみ",name:"多動共鳴",description:"創作衝動が加速し、スキル後に追加行動を狙う。",extraActionChance:.35,theme:"連続行動"}),
 myth_yori:Object.freeze({id:"yori-chain",ownerId:"myth_yori",ownerName:"より",name:"照準連鎖",description:"同じ敵を狙い続けるほど与ダメージと会心率が上昇。",damagePerStack:.1,critPerStack:.05,maxStacks:4,theme:"集中射撃"}),
 myth_rion:Object.freeze({id:"rion-care",ownerId:"myth_rion",ownerName:"りおん",name:"支援共鳴",description:"回復・蘇生が味方全体の盾とMP回復へ連鎖する。",shieldRate:.12,mpRate:.08,theme:"全体支援"}),
 myth_hide:Object.freeze({id:"hide-guardian",ownerId:"myth_hide",ownerName:"ひで",name:"守護反撃",description:"瀕死の味方をかばい、軽減した一撃へ反撃する。",lowHpThreshold:.35,damageReduction:.4,counterPower:.75,theme:"かばう反撃"})
});

const MYTHIC_GEAR=Object.freeze({
 myth_enami:{asset:"enami",names:["創世のゲームパッド","スパイシールーレット","星海山空のオレンジコート","多動の冒険靴","ゲームマスターの鍵","万象創作のダイス"]},
 myth_rion:{asset:"rion",names:["話術","万能の段取り帳","主人公のグリーンコート","フッ軽スニーカー","理学療法士","マダムキラーの微笑み"]},
 myth_yori:{asset:"yori",names:["ライフル","剛腕の素手","ヘルメット","迷彩服","アルコール","テトラポット"]},
 myth_hide:{asset:"hide",names:["ザリガニの左腕","ザリガニの右腕","ザリガニの甲冑","ピンクタイツ","狩猟免許","修士号"]}
});
const MYTHIC_GEAR_STATS=Object.freeze([{atk:280,matk:210,spd:28,crit:14},{atk:220,matk:270,spd:32,crit:10},{hp:720,def:245,mdef:195},{hp:520,def:190,mdef:180,spd:20},{hp:260,atk:90,matk:90,spd:30},{def:80,mdef:80,crit:16,evasion:14}]);

const SLOT_PLAN=Object.freeze([
 {slot:"weapon",subslot:"weaponRight",suffix:"右武"},{slot:"weapon",subslot:"weaponLeft",suffix:"左武"},
 {slot:"armor",subslot:"armorBody",suffix:"主装"},{slot:"armor",subslot:"armorSupport",suffix:"副装"},
 {slot:"accessory",subslot:"accessoryNeck",suffix:"首飾"},{slot:"accessory",subslot:"accessoryFinger",suffix:"指環"}
]);
const GENERIC_CACHE=new Map();
const cleanName=value=>String(value??"").replace(/^深淵[ⅠⅡⅢⅣⅤⅥⅦ]\s*|^十神[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]\s*/,"").trim();
function hash(value){let result=2166136261;for(const char of String(value)){result^=char.codePointAt(0);result=Math.imul(result,16777619)}return result>>>0}
function monsterOwnerId(monster){return String(monster?.endgameBossId??monster?.speciesId??"")||null}
function ownerRecord(ownerId){return ENDGAME_CHARACTERS[ownerId]??SPECIES[ownerId]??null}
function generatedDefinition(ownerId){
 if(GENERIC_CACHE.has(ownerId))return GENERIC_CACHE.get(ownerId);
 const source=ownerRecord(ownerId);if(!source)return null;
 const ownerName=cleanName(source.shortName??source.name??ownerId),seed=hash(ownerId),styles=["追撃","再生","防壁","会心","加速","反撃"],style=styles[seed%styles.length];
 const endgame=ENDGAME_CHARACTERS[ownerId],signature=endgame?.signatureName??endgame?.signature??`${ownerName}覚醒`;
 const definition=Object.freeze({id:`signature-${ownerId}`,ownerId,ownerName,name:endgame?signature:`${ownerName}共鳴`,theme:endgame?.role??style,description:endgame?.awakening??`${ownerName}だけが引き出せる${style}の権能。6点で専用奥義が覚醒する。`,damageMultiplier:1.04+(seed%4)*.01,damageReductionRate:.04+((seed>>>3)%3)*.01,critBonus:.02+((seed>>>5)%3)*.01,awakenedText:endgame?.setText?.[6]??`${signature}が覚醒し、戦闘開始時に専用権能を展開。`});
 GENERIC_CACHE.set(ownerId,definition);return definition;
}

export function signatureEquipmentOwnerId(item){if(!item)return null;return String(item.ruleOverrides?.signatureOwnerId??item.ruleOverrides?.mythicOwner??item.signatureOwnerId??item.endgameBossId??"")||null}
export const signatureWeaponOwnerId=signatureEquipmentOwnerId;
export function signatureWeaponDefinition(ownerId){return MYTHIC[String(ownerId??"")]??generatedDefinition(String(ownerId??""))}
export function signatureEquipmentOwnerName(item){const id=signatureEquipmentOwnerId(item);return id?(item.ruleOverrides?.signatureOwnerName??signatureWeaponDefinition(id)?.ownerName??cleanName(ownerRecord(id)?.name??id)):null}
export function signatureEquipmentMatchesMonster(item,monster){const ownerId=signatureEquipmentOwnerId(item);return Boolean(ownerId&&ownerId===monsterOwnerId(monster))}

function equippedSignatureItems(state,monster,ownerId=monsterOwnerId(monster)){const byId=new Map((state?.equipment??[]).map(item=>[item.id,item]));return Object.entries(monster?.equipment??{}).map(([subslot,id])=>({subslot,item:byId.get(id)})).filter(entry=>entry.item&&signatureEquipmentOwnerId(entry.item)===ownerId)}
function milestoneFor(count){return count>=6?6:count>=4?4:count>=2?2:count>=1?1:0}
function nextMilestone(count){return[1,2,4,6].find(value=>value>count)??null}
function scaledDefinition(base,count){const milestone=milestoneFor(count),scale=milestone>=6?1.45:milestone>=4?1.15:milestone>=2?.82:.55;return{...base,pieces:count,milestone,awakened:milestone>=6,extraActionChance:Math.max((base.extraActionChance??0)*scale,milestone>=6?.12:0),damagePerStack:(base.damagePerStack??0)*scale,critPerStack:(base.critPerStack??0)*scale,maxStacks:base.maxStacks??4,shieldRate:(base.shieldRate??0)*scale,mpRate:(base.mpRate??0)*scale,lowHpThreshold:base.lowHpThreshold??.35,damageReduction:Math.min(.72,(base.damageReduction??base.damageReductionRate??0)*scale+(milestone>=4?.06:0)),counterPower:(base.counterPower??0)*scale,damageMultiplier:1+Math.max(0,(base.damageMultiplier??1)-1)*scale+(milestone>=4?.06:0)+(milestone>=6?.1:0),critBonus:(base.critBonus??0)*scale+(milestone>=2?.03:0)}}

export function signatureSetState(state,monster,item=null){const ownerId=item?signatureEquipmentOwnerId(item):monsterOwnerId(monster);if(!ownerId)return null;const base=signatureWeaponDefinition(ownerId);if(!base)return null;const active=ownerId===monsterOwnerId(monster),items=active?equippedSignatureItems(state,monster,ownerId):[],pieces=items.length,milestone=milestoneFor(pieces),next=nextMilestone(pieces);return{item:item??items[0]?.item??null,items,ownerId,definition:scaledDefinition(base,pieces),active:active&&pieces>0,pieces,milestone,next,status:active&&pieces?`専用共鳴 ${pieces}/6`:"専用効果 未発動",nextText:next?`あと${next-pieces}点で${next}点共鳴`:"6点・完全覚醒"}}
export const signatureWeaponState=signatureSetState;
export function signatureWeaponForMonster(state,monster){return signatureSetState(state,monster)}
export function signatureStatBonuses(state,monster){const pieces=signatureSetState(state,monster)?.pieces??0;if(!pieces)return{};return{hp:pieces>=6?.18:pieces>=2?.08:0,atk:pieces>=6?.2:pieces>=4?.12:0,def:pieces>=6?.2:pieces>=4?.12:0,spd:pieces>=6?.16:pieces>=2?.07:0,crit:pieces>=6?12:pieces>=4?6:0}}
export function activeSignatureResonances(state,party=[]){return party.map(monster=>({monster,...(signatureSetState(state,monster)??{})})).filter(entry=>entry.active&&entry.definition)}

export function signatureEligibleOwners(state){const seen=new Set(),owners=[];for(const monster of state?.monsters??[]){const ownerId=monsterOwnerId(monster);if(!ownerId||seen.has(ownerId))continue;const rarity=monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N";if(!ENDGAME_CHARACTERS[ownerId]&&(RARITY_ORDER[rarity]??0)<(RARITY_ORDER.LR??6))continue;seen.add(ownerId);owners.push({ownerId,ownerName:signatureWeaponDefinition(ownerId)?.ownerName??ownerId,monster})}return owners}
export const PERMANENT_SIGNATURE_RATE=.001;
const PERMANENT_SIGNATURE_EXCLUSIONS=new Set(["myth_enami","myth_yori","myth_rion","myth_hide"]);
export function permanentSignatureOwners(){return Object.values(SPECIES).filter(species=>{
 const rarity=species.rarity??"N";
 return(RARITY_ORDER[rarity]??0)>=(RARITY_ORDER.SSR??3)
  &&!PERMANENT_SIGNATURE_EXCLUSIONS.has(species.id)
  &&!species.serialOnly
  &&!species.isAbyss&&!species.tags?.includes?.("abyss")
  &&!species.isTenGod&&!species.tags?.includes?.("tenGod")
  &&!ENDGAME_CHARACTERS[species.id];
}).map(species=>({ownerId:species.id,ownerName:signatureWeaponDefinition(species.id)?.ownerName??cleanName(species.name),rarity:species.rarity})).sort((a,b)=>(RARITY_ORDER[b.rarity]??0)-(RARITY_ORDER[a.rarity]??0)||a.ownerName.localeCompare(b.ownerName,"ja"))}
export function rollPermanentSignatureHit(random=Math.random){return Math.max(0,Math.min(.999999,Number(random?.())||0))<PERMANENT_SIGNATURE_RATE}
export function createSignatureEquipment(ownerId,pieceIndex=Math.floor(Math.random()*6)){pieceIndex=Math.max(0,Math.min(5,Math.floor(Number(pieceIndex)||0)));const definition=signatureWeaponDefinition(ownerId),plan=SLOT_PLAN[pieceIndex];if(!definition||!plan)return null;const endgame=ENDGAME_CHARACTERS[ownerId],mythicGear=MYTHIC_GEAR[ownerId],rarity=endgame?.faction==="tenGod"?"十神":endgame?.faction==="abyss"?"深淵":SPECIES[ownerId]?.rarity==="神話"?"神話":"LR";const item=createEquipment(plan.slot,{rarity,handedness:plan.slot==="weapon"?(plan.subslot==="weaponRight"?"right":"left"):null,ruleOverrides:{signatureOwnerId:ownerId,signatureOwnerName:definition.ownerName,signaturePieceIndex:pieceIndex,subslot:plan.subslot,signature:true}});item.name=endgame?.gear?.[pieceIndex]?.name??mythicGear?.names?.[pieceIndex]??`${definition.ownerName}専用・${plan.suffix}`;item.series=endgame?.seriesId??`signature-${ownerId}`;item.seriesName=`${definition.ownerName}専用`;item.favorite=true;item.fixedEffectText=endgame?.gear?.[pieceIndex]?.effectText??`${pieceIndex+1}点目の専用共鳴。2・4・6点で権能が段階覚醒する。`;item.signatureSkill=definition.name;if(mythicGear){item.visualAsset=`./assets/ui/equipment/mythic/${mythicGear.asset}-${["weapon-1","weapon-2","armor-1","armor-2","accessory-1","accessory-2"][pieceIndex]}.png`;item.stats={...MYTHIC_GEAR_STATS[pieceIndex]}}return item}

export const SIGNATURE_WEAPON_RESONANCES=MYTHIC;
