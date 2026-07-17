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
function randomIV(){
  return Math.floor(50+Math.random()*51);
}
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
  const levelGrowth=1+(monster.level-1)*.055;
  const plusBonus=monster.plus*.012;

  const calc=(key)=>{
    const base=species.baseStats[key];
    const iv=monster.ivs[key]??75;
    const ivMultiplier=.75+iv/400;
    const personalityMultiplier=personality.modifiers[key]??1;
    return Math.floor(base*rankMultiplier*starMultiplier*levelGrowth*ivMultiplier*personalityMultiplier*(1+plusBonus));
  };

  return{
    hp:calc("hp"),
    atk:calc("atk"),
    def:calc("def"),
    spd:calc("spd"),
    crit:Math.floor(species.baseStats.crit*(personality.modifiers.crit??1)),
    evasion:Math.floor(species.baseStats.evasion*(personality.modifiers.evasion??1))
  };
}
export function unlockedSkills(monster){
  return SPECIES[monster.speciesId].skills.map(skill=>{
    const unlocked=skill.unlock.type==="level"
      ? monster.level>=skill.unlock.value
      : monster.rank>=skill.unlock.value;
    return{...skill,unlocked};
  });
}
