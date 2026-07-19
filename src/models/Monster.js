import{SPECIES}from"../data/species.js";
import{PERSONALITIES}from"../data/personalities.js";
import{MONSTER_COLORS}from"../data/colors.js";

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
    equipment:{weapon:null,armor:null,accessory:null,...(options.equipment??{})},
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
  const levelGrowthFor=key=>1+(monster.level-1)*.055*(growth[key]??1);
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
  if(monster._seriesCounts?.guardian>=2)result.def=Math.floor(result.def*1.15);
  if(monster._seriesCounts?.traveler>=2)result.spd=Math.floor(result.spd*1.10);
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
