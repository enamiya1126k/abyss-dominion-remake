import{SPECIES}from"../data/species.js";
import{PERSONALITIES}from"../data/personalities.js";
import{MONSTER_COLORS}from"../data/colors.js";
import{normalizedResistances}from"../data/attributes.js";
import{activeSeriesBonuses}from"../data/equipmentSeries.js";

function uid(){
  return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function randomKey(object){
  const keys=Object.keys(object);
  return keys[Math.floor(Math.random()*keys.length)];
}
function randomIV(){return Math.floor(70+Math.random()*31)}
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
 undead:1.00,demon:1.22,elemental:1.18,golem:1.35,dragon:1.95
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
 dragon:{hp:1.34,atk:1.32,def:1.16,spd:.64}
};
export function expNeedFor(monster){
  const species=SPECIES[monster.speciesId];
  const rate=species.expRate??RACE_EXP_RATE[species.race]??1;
  const base=40+monster.level*25+Math.floor(monster.level*monster.level*.55);
  return Math.max(25,Math.floor(base*rate));
}

function randomTrait(){const keys=Object.keys(TRAITS);return keys[Math.floor(Math.random()*keys.length)]}
export function createMonster(speciesId,options={}){
  const species=SPECIES[speciesId];
  if(!species)throw new Error(`Unknown species: ${speciesId}`);
  const personalityId=options.personalityId??randomKey(PERSONALITIES);
  const colorId=options.colorId??MONSTER_COLORS[Math.floor(Math.random()*MONSTER_COLORS.length)].id;
  const level=options.level??1;
  return{
    id:uid(),
    speciesId,
    nickname:options.nickname??species.name,
    colorId,
    personalityId,
    traitId:options.traitId??randomTrait(),
    ivs:options.ivs??{hp:randomIV(),atk:randomIV(),def:randomIV(),spd:randomIV()},
    level,
    exp:options.exp??0,
    stars:options.stars??1,
    rank:options.rank??1,
    plus:options.plus??0,
    bond:options.bond??0,
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
    battles:options.battles??0,
    defeats:options.defeats??0,
    currentHp:options.currentHp??null,
    currentMp:options.currentMp??null
  };
}
export function displayName(monster){
  const species=SPECIES[monster.speciesId];
  return monster.nickname||species.name;
}
export function rankName(monster){
  const species=SPECIES[monster.speciesId];
  return species.rankNames[Math.min(monster.rank-1,species.rankNames.length-1)];
}
export function colorValue(monster){
  return MONSTER_COLORS.find(c=>c.id===monster.colorId)?.value??MONSTER_COLORS[0].value;
}
export function calculatedStats(monster){
  const species=SPECIES[monster.speciesId];
  const personality=PERSONALITIES[monster.personalityId];
  const rankMultiplier=1+(monster.rank-1)*.5;
  const starMultiplier=1+(monster.stars-1)*.08;
  const growth=species.growth??{};
  const raceGrowth=RACE_GROWTH_RATE[species.race]??{};
  const levelGrowthFor=key=>1+(monster.level-1)*.055*(growth[key]??1)*(raceGrowth[key]??1);
  const plusBonus=monster.plus*.012;

  const calc=(key)=>{
    const base=species.baseStats[key];
    const iv=monster.ivs[key]??75;
    const ivMultiplier=.75+iv/400;
    const personalityMultiplier=personality.modifiers[key]??1;
    return Math.floor(base*rankMultiplier*starMultiplier*levelGrowthFor(key)*ivMultiplier*personalityMultiplier*(1+plusBonus));
  };

  const trait=TRAITS[monster.traitId]??TRAITS.steady;
  const gear=monster._equipmentStats??{};
  const syn=monster._synergy??{};
  const result={
    hp:calc("hp")+(gear.hp??0),
    atk:calc("atk")+(gear.atk??0),
    def:calc("def")+(gear.def??0),
    spd:calc("spd")+(gear.spd??0),
    crit:Math.floor(species.baseStats.crit*(personality.modifiers.crit??1))+(gear.crit??0),
    evasion:Math.floor(species.baseStats.evasion*(personality.modifiers.evasion??1))+(gear.evasion??0)
  };
  for(const key of["hp","atk","def","spd"]){if(trait.mods[key])result[key]=Math.floor(result[key]*trait.mods[key])}
  if(trait.mods.crit)result.crit+=trait.mods.crit;
  if(syn.atk)result.atk=Math.floor(result.atk*(1+syn.atk));
  if(syn.def)result.def=Math.floor(result.def*(1+syn.def));
  if(syn.spd)result.spd=Math.floor(result.spd*(1+syn.spd));
  if(syn.crit)result.crit+=syn.crit;
  for(const bonus of activeSeriesBonuses(monster._seriesCounts)){if(bonus.effect.atk)result.atk=Math.floor(result.atk*(1+bonus.effect.atk));if(bonus.effect.def)result.def=Math.floor(result.def*(1+bonus.effect.def));if(bonus.effect.hp)result.hp=Math.floor(result.hp*(1+bonus.effect.hp));if(bonus.effect.spd)result.spd=Math.floor(result.spd*(1+bonus.effect.spd));if(bonus.effect.crit)result.crit+=bonus.effect.crit;if(bonus.effect.evasion)result.evasion+=bonus.effect.evasion;}
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

export function calculateDangerRank(monster){const s=calculatedStats(monster);const gear=Object.values(monster.equipment??{}).filter(Boolean).length;const boss=monster.isBoss?2.5:1;const seal=monster.sealedPower?.ratio??1;return Math.max(1,Math.round((s.hp*.18+s.atk*2.8+s.def*2.2+s.spd*1.8+s.crit+s.evasion+gear*12)*boss*seal))}
