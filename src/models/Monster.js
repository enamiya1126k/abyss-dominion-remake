import{SPECIES}from"../data/species.js?v=2.10.0-build159";
import{PERSONALITIES}from"../data/personalities.js?v=2.10.0-build159";
import{MONSTER_COLORS}from"../data/colors.js?v=2.10.0-build159";
import{normalizedResistances}from"../data/attributes.js?v=2.10.0-build159";
import{activeSeriesBonuses}from"../data/equipmentSeries.js?v=2.10.0-build159";
import{normalizePersistentAilments}from"../data/statusEffects.js?v=2.10.0-build159";
import{TRUE_MAX_LEVEL,ENDGAME_MAX_LEVEL,MONSTER_STAR_MAX}from"../core/config.js?v=2.10.0-build159";

function uid(){
  return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function randomKey(object){
  const keys=Object.keys(object);
  return keys[Math.floor(Math.random()*keys.length)];
}
function randomIV(){return Math.floor(70+Math.random()*31)}
const INNATE_STAR_WEIGHTS=Object.freeze([28,22,17,12,8,5,3.5,2.2,1.5,.8]);
export function rollInnateStars(random=Math.random){
  const total=INNATE_STAR_WEIGHTS.reduce((sum,value)=>sum+value,0),roll=Math.max(0,Math.min(.999999,Number(random())||0))*total;
  let cursor=0;
  for(let index=0;index<INNATE_STAR_WEIGHTS.length;index++){cursor+=INNATE_STAR_WEIGHTS[index];if(roll<cursor)return index+1}
  return MONSTER_STAR_MAX;
}
export const TRAITS={
 sturdy:{name:"頑丈",description:"HP+8%",mods:{hp:1.08}},
 fierce:{name:"猛攻",description:"ATK+9% / DEF-4%",mods:{atk:1.09,def:.96}},
 swift:{name:"俊敏",description:"SPD+10%",mods:{spd:1.10}},
 guarded:{name:"守護",description:"DEF+9%",mods:{def:1.09}},
 arcane:{name:"魔力体",description:"MP+12%",mods:{}},
 lucky:{name:"幸運",description:"会心率+5%",mods:{crit:5}},
 steady:{name:"安定",description:"能力の偏りが少ない",mods:{}}
};

const RACE_EXP_RATE={
 slime:.68,beast:.82,flying:.80,insect:.78,goblin:.90,plant:.88,
 undead:1.00,demon:1.22,elemental:1.18,golem:1.35,dragon:1.95,
 spirit:1.08,construct:1.30,reptile:1.12
};
const RACE_GROWTH_RATE={
 slime:{hp:.82,atk:.72,def:.82,spd:.92},
 beast:{hp:.94,atk:1.04,def:.88,spd:1.12},
 flying:{hp:.78,atk:.96,def:.72,spd:1.20},
 insect:{hp:.96,atk:.94,def:1.02,spd:.92},
 goblin:{hp:.96,atk:1.00,def:.94,spd:1.02},
 plant:{hp:1.08,atk:.84,def:1.05,spd:.72},
 undead:{hp:1.10,atk:.98,def:1.05,spd:.78},
 demon:{hp:1.12,atk:1.16,def:1.02,spd:.86},
 elemental:{hp:.88,atk:1.12,def:.90,spd:1.06},
 golem:{hp:1.28,atk:1.04,def:1.32,spd:.55},
 dragon:{hp:1.34,atk:1.32,def:1.16,spd:.64},
 spirit:{hp:.86,atk:1.08,def:.88,spd:1.12},
 construct:{hp:1.18,atk:1.05,def:1.22,spd:.72},
 reptile:{hp:1.08,atk:1.04,def:1.10,spd:.86}
};
export function expNeedFor(monster){
  const species=SPECIES[monster.speciesId];
  const rate=species.expRate??RACE_EXP_RATE[species.race]??1;
  const base=40+monster.level*25+Math.floor(monster.level*monster.level*.55);
  const endgameRate=monster?.endgameBossId||monster?.isContractedEndgame||["abyss","tenGod"].includes(monster?.endgameFaction)?5:1;
 return Math.max(25,Math.floor(base*rate*endgameRate));
}

export function experienceBeforeLevel(monster,level){
 const target=Math.max(1,Math.min(TRUE_MAX_LEVEL,Math.floor(Number(level)||1)));
 let total=0;
 for(let current=1;current<target;current++)total+=expNeedFor({...monster,level:current});
 return total;
}
// もっとも育成が重い通常種族（dragon）のLv.10000到達量を1000分割する。
// 旧EXP結晶の1/20へ抑え、経験値パックを頻繁に入手して少しずつ育てる。
// 深淵・十神は expNeedFor 側の5倍補正をそのまま負担する。
const NORMAL_CRYSTAL_EXP_RATE=Math.max(...Object.values(RACE_EXP_RATE));
const EXPERIENCE_CRYSTAL_VALUE=(()=>{
 let targetTotal=0;
 for(let level=1;level<TRUE_MAX_LEVEL;level++){
  const base=40+level*25+Math.floor(level*level*.55);
  targetTotal+=Math.max(25,Math.floor(base*NORMAL_CRYSTAL_EXP_RATE));
 }
 return Math.max(1,Math.ceil(targetTotal/1000));
})();
export function experienceCrystalValue(monster){
 // 対象ごとに逆算しない。深淵・十神だけ結晶価値まで5倍になる事故を防ぐ。
 return EXPERIENCE_CRYSTAL_VALUE;
}
export function totalExperience(monster){
 const stored=Number(monster?.totalExp);
 if(Number.isFinite(stored)&&stored>=0)return Math.floor(stored);
 return experienceBeforeLevel(monster,monster?.level)+Math.max(0,Math.floor(Number(monster?.exp)||0));
}
export function applyTotalExperience(monster,total){
 const canonical=Math.max(0,Math.floor(Number(total)||0));
 monster.totalExp=canonical;
 monster.level=1;
 monster.exp=canonical;
 while(monster.level<TRUE_MAX_LEVEL){
  const need=expNeedFor(monster);
  if(monster.exp<need)break;
  monster.exp-=need;
  monster.level++;
 }
 if(monster.level>=TRUE_MAX_LEVEL)monster.exp=0;
 return monster;
}

function randomTrait(){const keys=Object.keys(TRAITS);return keys[Math.floor(Math.random()*keys.length)]}
export function createMonster(speciesId,options={}){
  const species=SPECIES[speciesId];
  if(!species)throw new Error(`Unknown species: ${speciesId}`);
  const personalityId=options.personalityId??randomKey(PERSONALITIES);
  const colorId=options.colorId??MONSTER_COLORS[Math.floor(Math.random()*MONSTER_COLORS.length)].id;
  const authoredEndgame=Boolean(options.allowEndgameLevel||options.isContractedEndgame||options.endgameBossId);
  const levelCap=authoredEndgame?ENDGAME_MAX_LEVEL:TRUE_MAX_LEVEL;
  const level=Math.max(1,Math.min(levelCap,Math.floor(Number(options.level)||1)));
  const monster={
    id:uid(),
    speciesId,
    nickname:options.nickname??species.name,
    colorId,
    personalityId,
    traitId:options.traitId??randomTrait(),
    ivs:options.ivs??{hp:randomIV(),atk:randomIV(),def:randomIV(),spd:randomIV()},
    level,
    exp:Math.max(0,Math.floor(Number(options.exp)||0)),
    // Stars are an immutable innate aptitude rolled per individual. They are
    // deliberately independent from species and race.
    stars:Math.max(1,Math.min(MONSTER_STAR_MAX,Math.floor(Number(options.stars??options.talent??rollInnateStars())||1))),
    rank:options.rank??1,
    plus:options.plus??0,
    affection:Math.max(0,Math.min(1000,options.affection??options.bond??0)),
    bond:Math.max(0,Math.min(1000,options.affection??options.bond??0)),
    title:options.title??null,
    favorite:options.favorite??false,
    locked:options.locked??false,
    attribute:options.attribute??species.element??"neutral",
    resistances:normalizedResistances(options.resistances??species.resistances),
    tags:options.tags??[species.race,species.role],
    isBoss:options.isBoss??false,
    sealedPower:options.sealedPower??null,
    equipment:{weaponRight:null,weaponLeft:null,armorBody:null,armorSupport:null,accessoryNeck:null,accessoryFinger:null,...(options.equipment??{})},
    capturedAt:options.capturedAt??new Date().toISOString(),
    obtainedAt:options.obtainedAt??options.capturedAt??new Date().toISOString(),
    obtainedFloor:options.obtainedFloor??1,
    obtainedMethod:options.obtainedMethod??"capture",
    endgameBossId:options.endgameBossId??null,
    endgameFaction:options.endgameFaction??null,
    isContractedEndgame:Boolean(options.isContractedEndgame),
    history:{adventures:0,battles:options.battles??0,victories:0,defeats:options.defeats??0,bossDefeats:0,kills:0,mvp:0,highestFloor:options.obtainedFloor??1,...(options.history??{})},
    battles:options.battles??0,
    defeats:options.defeats??0,
    currentHp:options.currentHp??null,
    currentMp:options.currentMp??null,
    ailments:normalizePersistentAilments(options.ailments),
    equippedSkills:Array.isArray(options.equippedSkills)?[...options.equippedSkills]:[]
  };
  if(options.totalExp!=null)applyTotalExperience(monster,options.totalExp);
  else monster.totalExp=experienceBeforeLevel(monster,monster.level)+monster.exp;
  return monster;
}
export function displayName(monster){
  const species=SPECIES[monster.speciesId];
  const nickname=String(monster.nickname??"").trim();
  if(!nickname||nickname===species.legacyName)return species.name;
  return nickname;
}
export function rankName(monster){
  const species=SPECIES[monster.speciesId];
  return species.rankNames[Math.min(monster.rank-1,species.rankNames.length-1)];
}
export function colorValue(monster){
  return MONSTER_COLORS.find(c=>c.id===monster.colorId)?.value??MONSTER_COLORS[0].value;
}

export function limitBreakGrowth(speciesId){
  const base=SPECIES[speciesId]?.baseStats??{};
  return{
    hp:Math.max(1,Math.round((base.hp??1)*.025)),
    atk:Math.max(0,Math.round((base.atk??0)*.025)),
    def:Math.max(0,Math.round((base.def??0)*.025)),
    spd:Math.max(0,Math.round((base.spd??0)*.025))
  };
}
export function affectionBonuses(value){
  const a=Math.max(0,Math.min(1000,Number(value)||0)),b={hp:0,atk:0,def:0,spd:0};
  if(a>=100)b.hp+=.01;if(a>=200)b.atk+=.01;if(a>=300)b.def+=.01;if(a>=400)b.spd+=.01;
  if(a>=500)b.hp+=.02;if(a>=600)b.atk+=.02;if(a>=700)b.def+=.02;if(a>=800)b.spd+=.02;
  if(a>=900)for(const k of Object.keys(b))b[k]+=.03;
  if(a>=1000)for(const k of Object.keys(b))b[k]+=.05;
  return b;
}

export function calculatedStats(monster){
  const species=SPECIES[monster.speciesId];
  const personality=PERSONALITIES[monster.personalityId]??PERSONALITIES.bold??Object.values(PERSONALITIES)[0];
  const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const rank=Math.max(1,finite(monster.rank,1)),level=Math.max(1,finite(monster.level,1));
  const rankMultiplier=1+(rank-1)*.5;
  const talent=Math.max(1,Math.min(MONSTER_STAR_MAX,finite(monster.stars,1)));
  const talentMultiplier=1+(talent-1)*.08;
  const growth=species.growth??{};
  const raceGrowth=RACE_GROWTH_RATE[species.race]??{};
  const levelGrowthFor=key=>1+(level-1)*.055*(growth[key]??1)*(raceGrowth[key]??1);
  const limitGrowth=limitBreakGrowth(monster.speciesId);
  const affection=affectionBonuses(monster.affection??monster.bond??0);

  const calc=(key)=>{
    const base=finite(species.baseStats[key])+(limitGrowth[key]??0)*Math.max(0,finite(monster.plus));
    const iv=Math.max(0,Math.min(100,finite(monster.ivs?.[key],75)));
    const ivMultiplier=.75+iv/400;
    const personalityMultiplier=finite(personality?.modifiers?.[key],1);
    return Math.floor(base*rankMultiplier*talentMultiplier*levelGrowthFor(key)*ivMultiplier*personalityMultiplier*(1+(affection[key]??0)));
  };

  const trait=TRAITS[monster.traitId]??TRAITS.steady;
  const gear=monster._equipmentStats??{},affix=monster._equipmentAffixes??{};
  const syn=monster._synergy??{};
  const role=String(species.role??"");
  const magicalRole=["magic","support","healer","controller","debuffer","poison","burner"].some(value=>role.includes(value));
  const baseAtk=calc("atk"),baseDef=calc("def");
  const result={
    hp:calc("hp")+finite(gear.hp),
    atk:baseAtk+finite(gear.atk),
    matk:Math.max(1,Math.floor(baseAtk*(magicalRole?1.08:.72)))+finite(gear.matk),
    def:baseDef+finite(gear.def),
    mdef:Math.max(1,Math.floor(baseDef*(magicalRole?1.08:.82)))+finite(gear.mdef),
    spd:calc("spd")+finite(gear.spd),
    crit:Math.floor(finite(species.baseStats.crit)*finite(personality?.modifiers?.crit,1))+finite(gear.crit),
    evasion:Math.floor(finite(species.baseStats.evasion)*finite(personality?.modifiers?.evasion,1))+finite(gear.evasion)
  };
  // Contracted endgame characters retain their actual character-class base
  // power in every mode. Deep Abyss is x10; Ten Gods are x10 above that.
  const endgameBase=monster.isContractedEndgame||monster.endgameBossId
    ?monster.endgameFaction==="tenGod"?100:monster.endgameFaction==="abyss"?10:1
    :1;
  if(endgameBase!==1)for(const key of["hp","atk","matk","def","mdef","spd"])result[key]=Math.max(1,Math.floor(result[key]*endgameBase));
  for(const key of["hp","atk","matk","def","mdef","spd"]){
    const traitKey=key==="matk"?"atk":key==="mdef"?"def":key;
    if(trait.mods[traitKey])result[key]=Math.floor(result[key]*trait.mods[traitKey]);
    const pct=finite(affix[`${key}Pct`]??(key==="matk"?affix.atkPct:key==="mdef"?affix.defPct:0));
    if(pct)result[key]=Math.floor(result[key]*(1+pct/100));
  }
  result.crit+=finite(affix.critRate);result.evasion+=finite(affix.evasion);result._affixes=affix;
  if(trait.mods.crit)result.crit+=trait.mods.crit;
  if(syn.atk){result.atk=Math.floor(result.atk*(1+syn.atk));result.matk=Math.floor(result.matk*(1+syn.atk))}
  if(syn.def){result.def=Math.floor(result.def*(1+syn.def));result.mdef=Math.floor(result.mdef*(1+syn.def))}
  if(syn.hp)result.hp=Math.floor(result.hp*(1+syn.hp));
  if(syn.spd)result.spd=Math.floor(result.spd*(1+syn.spd));
  if(syn.crit)result.crit+=syn.crit;
  if(syn.evasion)result.evasion+=syn.evasion;
  for(const bonus of activeSeriesBonuses(monster._seriesCounts)){if(bonus.effect.atk){result.atk=Math.floor(result.atk*(1+bonus.effect.atk));result.matk=Math.floor(result.matk*(1+bonus.effect.atk))}if(bonus.effect.def){result.def=Math.floor(result.def*(1+bonus.effect.def));result.mdef=Math.floor(result.mdef*(1+bonus.effect.def))}if(bonus.effect.hp)result.hp=Math.floor(result.hp*(1+bonus.effect.hp));if(bonus.effect.spd)result.spd=Math.floor(result.spd*(1+bonus.effect.spd));if(bonus.effect.crit)result.crit+=bonus.effect.crit;if(bonus.effect.evasion)result.evasion+=bonus.effect.evasion;}
  const mastery=monster._seriesMasteryBonus??{};if(mastery.hp)result.hp=Math.floor(result.hp*(1+mastery.hp));if(mastery.atk){result.atk=Math.floor(result.atk*(1+mastery.atk));result.matk=Math.floor(result.matk*(1+mastery.atk))}if(mastery.def){result.def=Math.floor(result.def*(1+mastery.def));result.mdef=Math.floor(result.mdef*(1+mastery.def))}if(mastery.spd)result.spd=Math.floor(result.spd*(1+mastery.spd));if(mastery.crit)result.crit+=mastery.crit;
  const abyss=monster._abyssSkillEffects??{};
  for(const[key,effectKey]of[["hp","partyHpRate"],["atk","partyAtkRate"],["def","partyDefRate"],["spd","partySpdRate"]]){
    const rate=Number(abyss[effectKey])||0;
    if(rate){
      result[key]=Math.max(1,Math.floor(result[key]*(1+rate)));
      if(key==="atk")result.matk=Math.max(1,Math.floor(result.matk*(1+rate)));
      if(key==="def")result.mdef=Math.max(1,Math.floor(result.mdef*(1+rate)));
    }
  }
  const signature=monster._signatureBonuses??{};
  if(signature.hp)result.hp=Math.floor(result.hp*(1+signature.hp));
  if(signature.atk){result.atk=Math.floor(result.atk*(1+signature.atk));result.matk=Math.floor(result.matk*(1+signature.atk))}
  if(signature.def){result.def=Math.floor(result.def*(1+signature.def));result.mdef=Math.floor(result.mdef*(1+signature.def))}
  if(signature.spd)result.spd=Math.floor(result.spd*(1+signature.spd));
  if(signature.crit)result.crit+=signature.crit;
  return result;
}
export function unlockedSkills(monster){
  return SPECIES[monster.speciesId].skills.map(skill=>{
    const unlocked=skill.unlock.type==="level"
      ? monster.level>=skill.unlock.value
      : monster.rank>=skill.unlock.value;
    return{...skill,unlocked};
  });
}

export function calculateDangerRank(monster){const s=calculatedStats(monster),attack=Math.max(s.atk,s.matk??0),defense=Math.max(s.def,s.mdef??0);const gear=Object.values(monster.equipment??{}).filter(Boolean).length;const boss=monster.isBoss?2.5:1;const seal=monster.sealedPower?.ratio??1;return Math.max(1,Math.round((s.hp*.18+attack*2.8+defense*2.2+s.spd*1.8+s.crit+s.evasion+gear*12)*boss*seal))}
