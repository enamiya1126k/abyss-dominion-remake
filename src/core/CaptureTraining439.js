import {allLearnedSkills,canonicalSkillId,skillProgressFor,skillMasteryNeedForLevel,SKILL_MASTERY_MAX_LEVEL} from '../battle/SkillSystem.js';
const held=state=>Math.max(0,Math.floor(Number(state.inventory?.captureCrystals)||0));
export function captureTrainingOffer439(state,monsterId,kind,skillId){
 const monster=state.monsters?.find(m=>m.id===monsterId);if(!monster)return {ok:false,message:'仲間が見つかりません。'};
 if(state.activeBattle||state.player?.inRun)return {ok:false,message:'探索・戦闘を終えてから育成できます。'};
 let amount,cost,progress,id;
 if(kind==='affection'){
  amount=Math.min(20,1000-Math.min(1000,Math.max(0,Number(monster.affection??monster.bond)||0)));cost=Math.ceil(amount*5);
 }else if(kind==='skill'){
  id=canonicalSkillId(skillId);const copy=structuredClone(monster);for(const key of Object.getOwnPropertyNames(monster)){const d=Object.getOwnPropertyDescriptor(monster,key);if(!d.enumerable&&'value' in d&&d.value!==undefined&&typeof d.value!=='function')copy[key]=structuredClone(d.value);}
  if(!allLearnedSkills(copy).some(s=>s.id===id))return {ok:false,message:'習得済みのスキルを選んでください。'};
  progress=skillProgressFor(copy,id);let remaining=-progress.exp;
  for(let level=progress.level;level<SKILL_MASTERY_MAX_LEVEL;level++)remaining+=skillMasteryNeedForLevel(level);
  amount=progress.level>=SKILL_MASTERY_MAX_LEVEL?0:Math.min(20,Math.max(0,remaining));cost=Math.ceil(amount*5);
 }else return {ok:false,message:'育成対象が見つかりません。'};
 if(amount<=0)return {ok:false,complete:true,amount:0,cost:0,message:'育成上限に達しています。'};
 return {ok:held(state)>=cost,amount,cost,kind,skillId:id,progress,available:held(state),message:held(state)<cost?`捕獲結晶が不足しています（${held(state)}/${cost}）`:null};
}
export function trainWithCapture439(state,monsterId,kind,skillId){
 const offer=captureTrainingOffer439(state,monsterId,kind,skillId);if(!offer.ok)return offer;
 const monster=state.monsters.find(m=>m.id===monsterId);
 if(kind==='affection'){monster.affection=Math.min(1000,Math.max(0,Number(monster.affection??monster.bond)||0)+offer.amount);monster.bond=monster.affection;}
 else{
  const p=skillProgressFor(monster,offer.skillId);p.exp+=offer.amount;
  while(p.level<SKILL_MASTERY_MAX_LEVEL&&p.exp>=skillMasteryNeedForLevel(p.level)){p.exp-=skillMasteryNeedForLevel(p.level);p.level++;}
  p.exp=p.level>=SKILL_MASTERY_MAX_LEVEL?0:Math.round(p.exp*100)/100;p.need=skillMasteryNeedForLevel(p.level);
 }
 state.inventory.captureCrystals=held(state)-offer.cost;return {...offer,ok:true};
}
