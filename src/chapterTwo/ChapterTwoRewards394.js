import {normalizeChapterTwoCollection395} from './ChapterTwoCollection395.js?v=3.1.75-build395';
import {relicForEncounter394,relicItemText394,CHAPTER_TWO_CIRCLES394} from '../data/chapterTwoRelics394.js?v=3.1.74-build394';
import {createEquipment} from '../models/Equipment.js';
import {receiveEquipment} from '../services/EquipmentStorage.js?v=3.1.78-build398';
import {createMagicCircleInstance,normalizeMagicCircleState} from '../core/MagicCircleSystem.js?v=3.1.78-build398';
import {CHAPTER_TWO_ELITE_TIERS393} from './ChapterTwoElite393.js';
export function createChapterTwoRelic394(def,areaLevel,tier=1){
 const t=CHAPTER_TWO_ELITE_TIERS393[tier];if(!def||!t)return null;
 const item=createEquipment(def.slot,{base:def,rarity:tier===1?'LR':'神話',weaponType:def.weaponType,ruleOverrides:def.subslot?{subslot:def.subslot}:{}});
 item.chapterTwoRelic394=def.id;item.level=Math.round(areaLevel*t.level);item.plus=t.plus;item.series=null;item.fixedEffects={...def.fixedEffects};
 item.fixedEffectText=relicItemText394(item);
 item.obtainedMethod='chapterTwoElite394';item.locked=true;return item;
}
// Called only after the existing room/visit/token victory gate, in its save transaction.
export function grantChapterTwoSpoils394(state,encounter,areaLevel,tier,completed){
 const def=relicForEncounter394(encounter);if(!def)return null;
 const item=createChapterTwoRelic394(def,areaLevel,tier);if(!item)return null;
 const receipt=receiveEquipment(state,item,{bossReward:true});
 const result={relic:{id:item.id,definition:def.id,name:item.name,rarity:item.rarity,level:item.level,plus:item.plus,slot:item.slot,effect:item.fixedEffectText,receipt:receipt.message},circle:null};
 if(completed){const circle=CHAPTER_TWO_CIRCLES394[def.area];normalizeMagicCircleState(state);state.magicCircles.unlocked[circle.id]=true;const instance=createMagicCircleInstance(state,circle.id,{level:[0,5,15,30][tier],source:'chapterTwoElite394',locked:true});result.circle={id:circle.id,name:circle.name,instanceId:instance.instanceId,level:instance.level};}
 normalizeChapterTwoCollection395(state);return result;
}
