import {createMonster,calculatedStats} from '../models/Monster.js?v=3.1.46-build366';
import {endgameCharacter} from '../data/endgameCharacters.js';
import {createSignatureEquipment,signatureStatBonuses,signatureSetState,signatureWeaponGrantedSkill} from './SignatureWeaponSystem.js?v=3.1.41-build361';
import {equipmentStatMultiplier,equipmentRequiredMonsterLevel} from '../models/Equipment.js?v=3.1.41-build361';
import {aggregateSeriesEffects} from '../data/equipmentSeries.js';
import {equipmentAffixesWithSeries} from './EquipmentAffixSystem.js';
import {maxMp,skillMasteryNeedForLevel} from '../battle/SkillSystem.js?v=3.1.39-build359';
import {MONSTER_STORAGE_CAP} from './config.js?v=3.1.46-build366';
import {EQUIPMENT_LIMIT} from '../services/EquipmentStorage.js?v=3.1.41-build361';

// A fixed, reproducible 100F reference party, independent of earlier GM claims.
export const GM_FINALE_PACK=Object.freeze({
 monsterLevel:1500,monsterPlus:10,equipmentLevel:3000,equipmentPlus:10,
 gold:100000000,crystals:30000,captureCrystals:1000,
 members:Object.freeze([
  Object.freeze({id:'ten_time',keys:Object.freeze(['eternity','acceleration','rewind','finalHour'])}),
  Object.freeze({id:'ten_life',keys:Object.freeze(['worldTree','rebirth','lifeBlessing','allRebirth'])}),
  Object.freeze({id:'abyss_gluttony',keys:Object.freeze(['allFeast','roar','manaFeast','allDevour'])}),
  Object.freeze({id:'abyss_wrath',keys:Object.freeze(['rageRelease','rageBlow','berserker','undyingRage'])})
 ])
});

export function validateGmFinalePack(state){
 if(state.gameMaster?.finalePack359?.claimedAt)return{ok:false,message:'GM最終決戦パックはこのセーブで受取済みです。'};
 if((state.monsters?.length??0)>MONSTER_STORAGE_CAP-4)return{ok:false,message:'十神2体・深淵2体分のモンスター所持枠を空けてください。'};
 if((state.equipment?.length??0)>EQUIPMENT_LIMIT-24)return{ok:false,message:'専用装備24点分の通常所持枠を空けてください。'};
 return{ok:true};
}

// The same derived equipment values that normal equipment loading computes.
export function prepareGmFinaleEquipment(state,monster){
 const items=(state.equipment??[]).filter(item=>Object.values(monster.equipment??{}).includes(item.id)),stats={},counts={};
 for(const item of items){for(const[key,value]of Object.entries(item.stats??{}))stats[key]=(stats[key]??0)+Math.round(value*equipmentStatMultiplier(item));if(item.series)counts[item.series]=(counts[item.series]??0)+1;}
 monster._equipmentStats=stats;monster._seriesCounts=counts;monster._seriesEffects=aggregateSeriesEffects(counts);
 monster._equipmentAffixes=equipmentAffixesWithSeries(items,monster._seriesEffects);monster._signatureBonuses=signatureStatBonuses(state,monster);
 Object.defineProperty(monster,'_equipmentSkills',{value:items.map(signatureWeaponGrantedSkill).filter(Boolean).map(skill=>({...skill,equipmentGranted:true})),writable:true,configurable:true,enumerable:false});
 const signature=signatureSetState(state,monster);
 return{stats:calculatedStats(monster),maxMp:maxMp(monster),signature:signature?.active?signature.definition:null};
}

export function createGmFinalePack(state={}){
 const pack=GM_FINALE_PACK,monsters=[],equipment=[];
 for(const member of pack.members){
  const boss=endgameCharacter(member.id);if(!boss)throw Error('GM配布キャラクターの定義がありません。');
  const tier=boss.faction==='tenGod'?'十神':'深淵',monster=createMonster(boss.speciesId,{nickname:boss.name,title:boss.title,level:pack.monsterLevel,plus:pack.monsterPlus,rank:4,stars:10,affection:500,favorite:true,locked:true,traitId:'steady',attribute:boss.element,endgameBossId:boss.id,endgameFaction:boss.faction,isContractedEndgame:true,allowEndgameLevel:true,obtainedMethod:'serialCode',obtainedFloor:Math.max(1,Number(state.player?.maxFloor)||1)});
  Object.assign(monster,{summonTier:tier,summonRarity:tier,visualSpeciesId:boss.id,contractSignature:boss.signature,contractSignatureName:boss.signatureName,contractSeriesId:boss.seriesId,contractProfileVersion:2});
  monster.equipment={};
  for(let index=0;index<6;index++){
   const item=createSignatureEquipment(boss.id,index);if(!item)throw Error('GM専用装備の定義がありません。');
   item.level=pack.equipmentLevel;item.plus=pack.equipmentPlus;item.affixes=[];item.equippedBy=monster.id;
   if(equipmentRequiredMonsterLevel(item)>monster.level)throw Error('GM専用装備の必要レベルを満たしていません。');
   monster.equipment[item.ruleOverrides.subslot]=item.id;equipment.push(item);
  }
  monster.equippedSkills=member.keys.map(key=>{const skill=boss.skills.find(s=>s.key===key);if(!skill)throw Error('GM配布スキルの定義がありません。');return skill.id;});
  monster.skillLoadoutInitialized=true;monster.skillRecommendationProfileVersion=199;
  monster.skillProgress=Object.fromEntries(monster.equippedSkills.map(id=>[id,{level:3,exp:0,uses:0,need:skillMasteryNeedForLevel(3)}]));
  const derived=prepareGmFinaleEquipment({equipment},monster);monster.currentHp=derived.stats.hp;monster.currentMp=derived.maxMp;
  monsters.push(monster);
 }
 return{monsters,equipment};
}

const add=(value,amount)=>Math.min(Number.MAX_SAFE_INTEGER,(Number.isFinite(Number(value))?Math.max(0,Math.floor(Number(value))):0)+amount);
export function applyGmFinalePack(state){
 const check=validateGmFinalePack(state);if(!check.ok)return check;
 // Stage the entire reward before modifying the save; full storage is a no-op.
 const {monsters,equipment}=createGmFinalePack(state),pack=GM_FINALE_PACK;
 // Reserve monsters cannot retain equipment in this game. Deliver loose sets;
 // formation and the existing auto-equip button remain the player's choice.
 for(const item of equipment)item.equippedBy=null;
 for(const monster of monsters){monster.equipment=Object.fromEntries(Object.keys(monster.equipment).map(slot=>[slot,null]));const base=prepareGmFinaleEquipment({equipment},monster);monster.currentHp=base.stats.hp;monster.currentMp=base.maxMp;}
 state.player??={};state.inventory??={};state.monsters??=[];state.equipment??=[];state.codex??={};state.codex.encounters??={};state.codex.captures??={};
 for(const key of ['gold','crystals'])state.player[key]=add(state.player[key],pack[key]);
 state.inventory.captureCrystals=add(state.inventory.captureCrystals,pack.captureCrystals);
 state.monsters.push(...monsters);state.equipment.push(...equipment);
 for(const monster of monsters){state.codex.encounters[monster.speciesId]=add(state.codex.encounters[monster.speciesId],1);state.codex.captures[monster.speciesId]=add(state.codex.captures[monster.speciesId],1);}
 state.gameMaster={...state.gameMaster,finalePack359:{claimedAt:new Date().toISOString(),monsterIds:monsters.map(m=>m.id),equipmentIds:equipment.map(e=>e.id)}};
 return{ok:true,kind:'finalePack359',monsters,equipment,message:'十神「時間・生命」＋深淵「暴食・憤怒」（全員Lv.1,500・+10）、専用装備24点（Lv.3,000・+10）、100,000,000G、魔晶石30,000個、捕獲結晶1,000個を受け取りました。4体は控え、専用装備は所持品に追加しています。編成後に装備画面の「全員を自動装備」を使ってください。'};
}
