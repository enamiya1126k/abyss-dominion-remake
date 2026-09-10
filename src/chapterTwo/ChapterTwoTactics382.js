import {endgameCharacter} from '../data/endgameCharacters.js';
import {CHAPTER_TWO_ELITE_TIERS393,chapterTwoEliteTier393} from './ChapterTwoElite393.js?v=3.1.73-build393';
import {CHAPTER_TWO_SPECIES392} from '../data/chapterTwoSpecies392.js?v=3.1.72-build392';
import {CHAPTER_TWO_SPECIES391} from '../data/chapterTwoSpecies391.js?v=3.1.71-build391';
import {CHAPTER_TWO_SPECIES390} from '../data/chapterTwoSpecies390.js?v=3.1.70-build390';
import {CHAPTER_TWO_SPECIES389} from '../data/chapterTwoSpecies389.js?v=3.1.69-build389';
import {CHAPTER_TWO_SPECIES388} from '../data/chapterTwoSpecies388.js?v=3.1.68-build388';
import {CHAPTER_TWO_SPECIES387} from '../data/chapterTwoSpecies387.js?v=3.1.67-build387';
import {CHAPTER_TWO_SPECIES386} from '../data/chapterTwoSpecies386.js?v=3.1.66-build386';
import {CHAPTER_TWO_SPECIES385} from '../data/chapterTwoSpecies385.js?v=3.1.65-build385';
import {CHAPTER_TWO_SPECIES384} from '../data/chapterTwoSpecies384.js?v=3.1.70-build390';
import {CHAPTER_TWO_SPECIES383} from '../data/chapterTwoSpecies383.js?v=3.1.72-build392';
import {MAGIC_CIRCLES} from '../core/MagicCircleSystem.js?v=3.1.78-build398';
import {EQUIPMENT_BASES} from '../data/equipment.js?v=3.1.55-build375';
import {createEquipment,equipmentStatMultiplier} from '../models/Equipment.js?v=3.1.55-build375';

// Authored encounters use the same real equipment and circle definitions as
// the player. Their difficulty is fixed by area, never by the player's roster.
export const CHAPTER_TWO_TACTIC_VERSION=382;
const RANK_ORDER=["N","R","SR","SSR","UR","LR","神話"];
export const CHAPTER_TWO_ACTIONS=Object.freeze({
 'ch2:rally':{label:'連携号令',pattern:'self',utility:true,multiplier:0,mp:42,cooldown:3,effects:[{kind:'atkUp',value:.18,turns:3,allies:true},{kind:'spdUp',value:.08,turns:3,allies:true}]},
 'ch2:bulwark':{label:'護衛結界',pattern:'self',utility:true,multiplier:0,mp:54,cooldown:3,partyShieldRate:.10,effects:[{kind:'defUp',value:.22,turns:2,allies:true}]},
 'ch2:mend':{label:'再生の祈り',pattern:'self',utility:true,multiplier:0,mp:65,cooldown:2,target:'味方全体',heal:.18},
 'ch2:cleanse':{label:'浄化の息吹',pattern:'self',utility:true,multiplier:0,mp:58,cooldown:3,target:'味方全体',heal:.08,cleanse:true},
 'ch2:revive':{label:'一度きりの再構成',pattern:'self',utility:true,multiplier:0,mp:100,cooldown:8,revive:.28,reviveMp:.15},
 'ch2:dispel':{label:'加護剥離',pattern:'all',multiplier:.5,damageClass:'magic',dispel:true,mp:52,cooldown:2},
 'ch2:breach':{label:'破陣の一撃',pattern:'singleStrong',multiplier:.95,damageClass:'physical',mp:38,cooldown:2,effects:[{kind:'defDown',value:.22,turns:2,enemy:true},{kind:'vulnerable',value:.12,turns:2,enemy:true}]},
 'ch2:finish':{label:'連携追討',pattern:'singleWeak',multiplier:1.4,damageClass:'physical',mp:48,cooldown:1,bonusVsEffect:{kind:'vulnerable',multiplier:1.3}},
 'ch2:toxin':{label:'黒根の胞子',pattern:'all',multiplier:.7,element:'earth',damageClass:'magic',mp:48,cooldown:2,status:{id:'poison',name:'毒',chance:.6,turns:3,power:.025}},
 'ch2:harvest':{label:'蝕根の刈取り',pattern:'singleWeak',multiplier:1.25,element:'earth',damageClass:'physical',mp:44,cooldown:1,drain:.12,bonusVsStatus:{id:'poison',multiplier:1.4}},
 'ch2:burn':{label:'侵食の火種',pattern:'all',multiplier:.75,element:'fire',damageClass:'magic',mp:50,cooldown:2,status:{id:'burn',name:'火傷',chance:.6,turns:3,power:.025}},
 'ch2:flare':{label:'灰燼の追撃',pattern:'singleWeak',multiplier:1.3,element:'fire',damageClass:'magic',mp:48,cooldown:1,bonusVsStatus:{id:'burn',multiplier:1.4}},
 'ch2:drain':{label:'忘却の吸魔',pattern:'all',multiplier:.55,element:'dark',damageClass:'magic',mp:30,cooldown:3,mpDrain:.10},
 'ch2:light':{label:'天律の光刃',pattern:'singleWeak',multiplier:1.35,element:'light',damageClass:'magic',mp:46,cooldown:1,bonusVsEffect:{kind:'vulnerable',multiplier:1.3}},
 'ch2:recharge':{label:'魔力を練り直す',pattern:'self',utility:true,multiplier:0,mp:0,cooldown:4,selfMpHealRate:.24}
});

export const CHAPTER_TWO_DOCTRINES=Object.freeze([
 {name:'封樹の護衛隊',hint:'胞子で毒にしてから刈取りで追撃。毒を治し、回復役から崩そう。',setup:'ch2:toxin',strike:'ch2:harvest'},
 {name:'黒根の追撃隊',hint:'火傷を起点に灰燼の追撃が強化。火傷の浄化と攻撃役の足止めが有効。',setup:'ch2:burn',strike:'ch2:flare'},
 {name:'忘却の封鎖隊',hint:'吸魔と加護剥離で長期戦を狙う。支援役を止め、魔力を温存しよう。',setup:'ch2:drain',strike:'ch2:finish'},
 {name:'天律の聖衛隊',hint:'号令・護衛結界・再生を重ねる。強化解除と回復役への集中攻撃が有効。',setup:'ch2:breach',strike:'ch2:light'},
 {name:'中枢の連携機構',hint:'破陣で防御を崩して連携追討。弱体を浄化し、妨害役から機構を止めよう。',setup:'ch2:breach',strike:'ch2:finish'}
]);
const ROLE_STATS={
 striker:{hp:1,atk:1.12,matk:.85,def:1,mdef:.9,spd:1},
 leader:{hp:1.15,atk:1.06,matk:1.06,def:1.08,mdef:1.08,spd:.98},
 guardian:{hp:1.3,atk:.75,matk:.65,def:1.3,mdef:1.22,spd:.88},
 support:{hp:.74,atk:.6,matk:.9,def:.76,mdef:.95,spd:1.04},
 disruptor:{hp:.88,atk:.88,matk:1,def:.86,mdef:.9,spd:1.14}
};
const GEAR_WEIGHTS={striker:{atk:4,crit:3,spd:2,hp:.025},leader:{atk:2,matk:2,def:1,mdef:1,hp:.04},guardian:{hp:.12,def:4,mdef:3},support:{matk:3,mp:3,mdef:2,spd:2,hp:.05},disruptor:{spd:4,matk:3,accuracy:2,mp:1}};
const CIRCLES={striker:['weak_critical','crimson_threshold','blood_acceleration'],leader:['sole_survivor','opening_rite','crimson_threshold'],guardian:['aegis','inheritance','last_life'],support:['last_life','aegis','inheritance'],disruptor:['opening_rite','death_drain','deep_silence']};
export function chapterTwoAreaId382(id,encounter){
 if(Number.isInteger(encounter?.area))return encounter.area;
 const match=/^(?:a|vault|roam)(\d)/.exec(id);return match?Math.min(4,Number(match[1])):0;
}
export function chapterTwoRoles382(id,encounter){
 const n=encounter.species.length;
 if(n===1)return ['leader'];
 if(n===2)return encounter.boss||encounter.seal||encounter.vault?['guardian','support']:['striker','disruptor'];
 if(n===3)return encounter.boss||encounter.seal||encounter.vault?['striker','support','guardian']:['striker','disruptor','support'];
 return ['leader','disruptor','guardian','support'];
}
export function chapterTwoLoadouts382(id,encounter,run){
 const elite393=encounter.elite393?CHAPTER_TWO_ELITE_TIERS393[chapterTwoEliteTier393(run)||1]:null;
 const area=chapterTwoAreaId382(id,encounter),elite=Boolean(encounter.boss||encounter.seal||encounter.vault||elite393),tier=elite393?0:Math.max(0,Math.min(5,Number(run?.challengeTier)||0));
 const level=Math.round(encounter.level*(elite393?elite393.level:elite?.92:.72)*(1+tier*.12)),plus=Math.min(30,elite393?elite393.plus+area*2:4+area*3+(elite?5:0)+(encounter.vault?3:0)+tier*2);
 const rarity=elite393?RANK_ORDER[Math.min(6,3+Math.floor(area/2)+(chapterTwoEliteTier393(run)||1)-1)]:elite?['SSR','UR','LR','神話','神話'][area]:['SR','SSR','UR','LR','LR'][area];
 const used=new Set(),doctrine=CHAPTER_TWO_DOCTRINES[area];
 return chapterTwoRoles382(id,encounter).map((defaultRole,index)=>{
  const native=CHAPTER_TWO_SPECIES383[encounter.species[index]]??CHAPTER_TWO_SPECIES384[encounter.species[index]]??CHAPTER_TWO_SPECIES385[encounter.species[index]]??CHAPTER_TWO_SPECIES386[encounter.species[index]]??CHAPTER_TWO_SPECIES387[encounter.species[index]]??CHAPTER_TWO_SPECIES388[encounter.species[index]]??CHAPTER_TWO_SPECIES389[encounter.species[index]]??CHAPTER_TWO_SPECIES390[encounter.species[index]]??CHAPTER_TWO_SPECIES391[encounter.species[index]]??CHAPTER_TWO_SPECIES392[encounter.species[index]],commander=encounter.roster397?endgameCharacter(encounter.authorities?.[index]):null,role=encounter.roles?.[index]??native?.tacticRole383??defaultRole;
  const nativeMagic384=(native?.chapterTwoSet384||native?.chapterTwoSet385||native?.chapterTwoSet386||native?.chapterTwoSet387||native?.chapterTwoSet388||native?.chapterTwoSet389||native?.chapterTwoSet390||native?.chapterTwoSet391||native?.chapterTwoSet392)&&native.authoredSkills.filter(k=>k.power>0).every(k=>k.damageClass==='magic');
  const weights=commander?{...GEAR_WEIGHTS[role],atk:commander.skills.filter(s=>s.power>0).every(s=>s.damageClass==='magic')?0:4,matk:commander.skills.filter(s=>s.power>0).every(s=>s.damageClass==='magic')?4:0}:(native?.chapterTwoSet384||native?.chapterTwoSet385||native?.chapterTwoSet386||native?.chapterTwoSet387||native?.chapterTwoSet388||native?.chapterTwoSet389||native?.chapterTwoSet390||native?.chapterTwoSet391||native?.chapterTwoSet392)?{...GEAR_WEIGHTS[role],atk:nativeMagic384?0:4,matk:nativeMagic384?4:0}:role==='striker'&&(native?native.authoredSkills.filter(k=>k.type==='attack').every(k=>k.damageClass==='magic'):CHAPTER_TWO_ACTIONS[doctrine.strike].damageClass==='magic')?{matk:4,spd:2,mp:1,hp:.025}:GEAR_WEIGHTS[role],gear=['weapon','weapon','armor','armor','accessory','accessory'].map((slot,i)=>{
   const pool=EQUIPMENT_BASES[slot].filter(base=>!base.nativeRarity||RANK_ORDER.includes(base.nativeRarity)&&RANK_ORDER.indexOf(base.nativeRarity)<=RANK_ORDER.indexOf(rarity));
   const score=base=>Object.entries(base.stats??{}).reduce((sum,[k,v])=>sum+(weights[k]??0)*Number(v||0),0);
   const ranked=[...pool].sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name,'ja'));
   const base=ranked[i%2]??ranked[0];
   const item=createEquipment(slot,{rarity,base,affixes:[]});
   Object.assign(item,{id:`ch2-382:${id}:${index}:${i}`,level,plus,enemyOnly:true,enemySubslot:['weaponRight','weaponLeft','armorBody','armorSupport','accessoryNeck','accessoryFinger'][i],chapterTwoRole382:role});
   return item;
  });
  const circleId=encounter.roster397||elite393?encounter.circles[index]:CIRCLES[role].find(key=>!used.has(key))??CIRCLES[role][0];used.add(circleId);
  const definition=MAGIC_CIRCLES.find(c=>c.id===circleId),circle={...definition,level:Math.min(85,elite393?elite393.circleLevel+area*7:8+area*11+(elite?10:0)+(encounter.vault?8:0)+tier*4),enemyOnly:true,chance:1};
  const actions=role==='support'?['ch2:mend','ch2:cleanse',...(elite?['ch2:revive']:[]),'ch2:rally','ch2:recharge']:role==='guardian'?['ch2:bulwark','ch2:breach','ch2:recharge']:role==='disruptor'?['ch2:dispel',doctrine.setup,'ch2:recharge']:role==='leader'?['ch2:rally',doctrine.strike,'ch2:recharge']:[doctrine.strike,'ch2:recharge'];
  return {chapterTwoTactics382:{version:382,area,role,...(encounter.roster397?{roster397:true}:{}),...(commander?{commander397:true}:{}),doctrine:doctrine.name,hint:encounter.roster397||encounter.elite393?encounter.hint:native?.counter383??doctrine.hint,actions:[...new Set(actions)],elite},teamBattle:true,teamBattleRole:role,role:role==='support'?'healer':role==='guardian'?'tank':role==='disruptor'?'controller':'attacker',equipped:true,enemyGear:gear,gear:gear[0],enemyEquipmentSlots:6,enemyEquipmentLevel:level,enemyEquipmentRarity:rarity,enemyMagicCircle:circle};
 });
}
export function applyChapterTwoGear382(enemy){
 const role=enemy.chapterTwoTactics382?.role;if(!role)return;
 const rates={...ROLE_STATS[role]};const native=CHAPTER_TWO_SPECIES383[enemy.speciesId]??CHAPTER_TWO_SPECIES384[enemy.speciesId]??CHAPTER_TWO_SPECIES385[enemy.speciesId]??CHAPTER_TWO_SPECIES386[enemy.speciesId]??CHAPTER_TWO_SPECIES387[enemy.speciesId]??CHAPTER_TWO_SPECIES388[enemy.speciesId]??CHAPTER_TWO_SPECIES389[enemy.speciesId]??CHAPTER_TWO_SPECIES390[enemy.speciesId]??CHAPTER_TWO_SPECIES391[enemy.speciesId]??CHAPTER_TWO_SPECIES392[enemy.speciesId];if(role==='striker'&&(native?native.authoredSkills.filter(k=>k.type==='attack').every(k=>k.damageClass==='magic'):CHAPTER_TWO_ACTIONS[CHAPTER_TWO_DOCTRINES[enemy.chapterTwoTactics382.area].strike].damageClass==='magic')){rates.atk=.85;rates.matk=1.12;}
 if((native?.chapterTwoSet384||native?.chapterTwoSet385||native?.chapterTwoSet386||native?.chapterTwoSet387||native?.chapterTwoSet388||native?.chapterTwoSet389||native?.chapterTwoSet390||native?.chapterTwoSet391||native?.chapterTwoSet392)&&role==='disruptor'&&native.authoredSkills.filter(k=>k.power>0).every(k=>k.damageClass==='physical'))[rates.atk,rates.matk]=[rates.matk,rates.atk];
 for(const [key,rate] of Object.entries(rates)){const stat=key==='hp'?'maxHp':key;enemy[stat]=Math.max(1,Math.round(enemy[stat]*rate));}
 enemy.maxMp=420+enemy.chapterTwoTactics382.area*100;
 for(const gear of enemy.enemyGear??[]){const factor=equipmentStatMultiplier(gear);for(const stat of ['hp','mp','atk','matk','def','mdef','spd']){const key=stat==='hp'?'maxHp':stat==='mp'?'maxMp':stat;enemy[key]+=Math.round((Number(gear.stats?.[stat])||0)*factor);}}
 enemy.hp=enemy.maxHp;enemy.currentMp=enemy.maxMp;
 enemy.hiddenDamageTaken=1;enemy.hiddenStatusResist=0;enemy.hiddenProfile={active:false};
}

export function chooseChapterTwoAction382(enemy,context={}){
 const profile=enemy?.chapterTwoTactics382;if(!profile)return null;
 enemy.chapterTwoFocus382=null;
 enemy.specialCooldown=Math.max(0,(Number(enemy.specialCooldown)||0)-1);
 if(enemy.specialCooldown>0){enemy.intent='再唱封印のため通常攻撃';return 'attack';}
 const turn=Math.max(1,Number(context.battle?.turn)||1),allies=(context.allies??[enemy]).filter(x=>x.hp>0),opponents=(context.opponents??[]).filter(x=>x.currentHp>0),effects=context.battle?.allyEffects??{},ailments=context.battle?.allyAilments??{};
 const cooldowns=enemy.chapterTwoCooldowns382??={},ready=key=>profile.actions.includes(key)&&(cooldowns[key]??0)<=turn&&(enemy.currentMp??0)>=CHAPTER_TWO_ACTIONS[key].mp;
 const choose=key=>{if(!ready(key))return null;cooldowns[key]=turn+CHAPTER_TWO_ACTIONS[key].cooldown+1;enemy.intent=CHAPTER_TWO_ACTIONS[key].label;return key;};
 const hasNegative=allies.some(x=>(context.battle?.enemyStatuses?.[x.id]??[]).length||(context.battle?.enemyEffects?.[x.id]??[]).some(e=>['defDown','atkDown','healDown','stun','vulnerable'].includes(e.kind)));
 const reviveTarget=(context.allies??[]).find(x=>x.hp<=0&&!(context.battle?.enemyEffects?.[x.id]??[]).some(e=>e.kind==='reviveSeal'));
 enemy.teamBattleTargetMode=profile.role==='disruptor'?'threat':'weak';
 if(profile.role==='support'){
  if(reviveTarget&&!enemy.chapterTwoRevived382&&(context.battle?.reviveCount??0)<99&&ready('ch2:revive')){enemy.chapterTwoRevived382=true;return choose('ch2:revive');}
  if(hasNegative&&ready('ch2:cleanse'))return choose('ch2:cleanse');
  if(allies.some(x=>x.hp/x.maxHp<.62)&&ready('ch2:mend'))return choose('ch2:mend');
 }
 if((enemy.currentMp??0)<Math.min(100,enemy.maxMp*.24)&&ready('ch2:recharge'))return choose('ch2:recharge');
 if(profile.role==='disruptor'&&opponents.some(x=>(effects[x.id]??[]).some(e=>['atkUp','defUp','spdUp','regen','guard','counter'].includes(e.kind)))&&ready('ch2:dispel'))return choose('ch2:dispel');
 if(profile.role==='guardian'&&allies.length>1&&ready('ch2:bulwark'))return choose('ch2:bulwark');
 if(['leader','support'].includes(profile.role)&&allies.length>1&&!allies.some(x=>(context.battle?.enemyEffects?.[x.id]??[]).some(e=>e.kind==='atkUp'&&e.turns>1))&&ready('ch2:rally'))return choose('ch2:rally');
 const offense=profile.actions.filter(key=>!CHAPTER_TWO_ACTIONS[key].utility&&key!=='ch2:dispel');
 const action=offense.find(ready);if(action){
  const info=CHAPTER_TWO_ACTIONS[action],marked=opponents.find(x=>info.bonusVsStatus&&(ailments[x.id]??x.ailments??[]).some(a=>a.id===info.bonusVsStatus.id)||info.bonusVsEffect&&(effects[x.id]??[]).some(e=>e.kind===info.bonusVsEffect.kind));
  enemy.chapterTwoFocus382=marked?.id??null;return choose(action);
 }
 enemy.chapterTwoFocus382=null;enemy.intent='再使用と魔力を見て通常攻撃';return 'attack';
}
export function chapterTwoTacticHint382(id,encounter){return CHAPTER_TWO_DOCTRINES[chapterTwoAreaId382(id,encounter)]?.hint??'';}
export function chapterTwoUltimateAllowed382(enemy,turn){
 return !enemy.chapterTwoTactics382||(enemy.chapterTwoTactics382.role==='leader'&&turn>=4&&!enemy.chapterTwoUltimateUsed382);
}
