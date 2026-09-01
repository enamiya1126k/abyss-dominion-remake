import{SPECIES}from"../data/species.js?v=2.11.82-build258";
import{PERSONALITIES}from"../data/personalities.js?v=2.11.0-build164";
import{MONSTER_COLORS}from"../data/colors.js?v=2.11.0-build164";
import{normalizedResistances}from"../data/attributes.js?v=2.11.0-build164";
import{activeSeriesBonuses}from"../data/equipmentSeries.js?v=2.11.0-build164";
import{normalizePersistentAilments}from"../data/statusEffects.js?v=2.11.0-build164";
import{TRUE_MAX_LEVEL,ENDGAME_MAX_LEVEL,MONSTER_STAR_MAX}from"../core/config.js?v=2.11.82-build258";
import{baseExperienceNeedForLevel}from"../core/ProgressionSystem.js?v=2.11.0-build164";

function uid(){
  return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function randomKey(object){
  const keys=Object.keys(object);
  return keys[Math.floor(Math.random()*keys.length)];
}
// 旧セーブ互換のため ivs / stars フィールド自体は残すが、build164以降は
// 能力計算へ一切使用しない。新規個体は全員同じ中立値で生成する。
function randomIV(){return 100}
const INNATE_STAR_WEIGHTS=Object.freeze([28,22,17,12,8,5,3.5,2.2,1.5,.8]);
export function rollInnateStars(random=Math.random){
  void random;
  return 1;
}
export const TRAITS={
 sturdy:{name:"頑丈",description:"粘り強く前へ出る気質（能力補正なし）",mods:{}},
 fierce:{name:"猛攻",description:"攻めを好む気質（能力補正なし）",mods:{}},
 swift:{name:"俊敏",description:"素早い判断を好む気質（能力補正なし）",mods:{}},
 guarded:{name:"守護",description:"仲間を守ろうとする気質（能力補正なし）",mods:{}},
 arcane:{name:"魔力体",description:"術式へ強い関心を持つ気質（能力補正なし）",mods:{}},
 lucky:{name:"幸運",description:"好機を楽しむ気質（能力補正なし）",mods:{}},
 steady:{name:"安定",description:"落ち着いた気質（能力補正なし）",mods:{}}
};

const RACE_EXP_RATE={
 slime:.97,beast:1,flying:.99,insect:1,goblin:.98,plant:1.02,
 undead:1.03,demon:1.04,elemental:1.03,golem:1.05,dragon:1.06,
 spirit:1.02,construct:1.04,reptile:1.02,human:1.01
};
const RARITY_EXP_RATE=Object.freeze({N:1,R:1.02,SR:1.04,SSR:1.07,UR:1.10,LR:1.13,"神話":1.17,"深淵":1.25,"十神":1.35});
const EMPTY_MONSTER_STATS=Object.freeze({hp:1,atk:1,matk:1,def:0,mdef:0,spd:1,crit:0,evasion:0,accuracy:100});
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
 reptile:{hp:1.08,atk:1.04,def:1.10,spd:.86},
 human:{hp:.96,atk:1.02,def:.96,spd:1.06}
};
export function expNeedFor(monster){
  if(!monster||typeof monster!=="object")return Math.max(25,Math.floor(baseExperienceNeedForLevel(1)));
  const species=SPECIES[monster.speciesId];
  const rarity=monster?.endgameFaction==="tenGod"?"十神":monster?.endgameFaction==="abyss"?"深淵":monster?.summonRarity??species?.rarity??"N";
  const raceRate=species?.expRate??RACE_EXP_RATE[species?.race]??1,rarityRate=RARITY_EXP_RATE[rarity]??1;
 return Math.max(25,Math.floor(baseExperienceNeedForLevel(monster.level)*raceRate*rarityRate));
}

const EXPERIENCE_PREFIX_CACHE=new Map();
function experienceProfileKey(monster){
 const species=SPECIES[monster?.speciesId],rarity=monster?.endgameFaction==="tenGod"?"十神":monster?.endgameFaction==="abyss"?"深淵":monster?.summonRarity??species?.rarity??"N",raceRate=species?.expRate??RACE_EXP_RATE[species?.race]??1;
 return`${monster?.speciesId??"unknown"}|${rarity}|${raceRate}`;
}
function experiencePrefix(monster,level){
 const target=Math.max(1,Math.min(TRUE_MAX_LEVEL,Math.floor(Number(level)||1))),key=experienceProfileKey(monster),prefix=EXPERIENCE_PREFIX_CACHE.get(key)??[0,0];
 while(prefix.length<=target){const current=prefix.length-1;prefix.push(prefix[current]+expNeedFor({...monster,level:current}))}
 EXPERIENCE_PREFIX_CACHE.set(key,prefix);return prefix;
}
export function experienceBeforeLevel(monster,level){
 const target=Math.max(1,Math.min(TRUE_MAX_LEVEL,Math.floor(Number(level)||1)));
 return experiencePrefix(monster,target)[target];
}
const EXPERIENCE_PACK_LEVELS=Object.freeze({small:1,medium:3,large:6,ultra:10});
export function experienceCrystalValue(monster,tier="small"){
 const span=EXPERIENCE_PACK_LEVELS[tier]??EXPERIENCE_PACK_LEVELS.small,start=Math.max(1,Math.min(TRUE_MAX_LEVEL,Math.floor(Number(monster?.level)||1)));
 let value=0;
 for(let offset=0;offset<span&&start+offset<TRUE_MAX_LEVEL;offset++)value+=baseExperienceNeedForLevel(start+offset);
 return Math.max(1,Math.floor(value));
}
export function totalExperience(monster){
 const stored=Number(monster?.totalExp);
 if(Number.isFinite(stored)&&stored>=0)return Math.floor(stored);
 return experienceBeforeLevel(monster,monster?.level)+Math.max(0,Math.floor(Number(monster?.exp)||0));
}
export function applyTotalExperience(monster,total){
 const canonical=Math.max(0,Math.floor(Number(total)||0));
 monster.totalExp=canonical;
 const prefix=experiencePrefix(monster,TRUE_MAX_LEVEL),maximum=prefix[TRUE_MAX_LEVEL];
 if(canonical>=maximum){monster.level=TRUE_MAX_LEVEL;monster.exp=0;monster.totalExp=maximum;return monster}
 let low=1,high=TRUE_MAX_LEVEL;
 while(low<high){const middle=Math.ceil((low+high)/2);if(prefix[middle]<=canonical)low=middle;else high=middle-1}
 monster.level=low;monster.exp=Math.max(0,canonical-prefix[low]);
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
    // Legacy display record only. New individuals no longer roll aptitude.
    stars:1,
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
    floorBossCatalogId:options.floorBossCatalogId??options.floorBossId??null,
    floorBossStatProfile:options.floorBossStatProfile&&typeof options.floorBossStatProfile==="object"?{...options.floorBossStatProfile}:null,
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
    equippedSkills:Array.isArray(options.equippedSkills)?[...options.equippedSkills]:[],
    skillLoadoutInitialized:Boolean(options.skillLoadoutInitialized)
  };
  if(options.totalExp!=null)applyTotalExperience(monster,options.totalExp);
  else monster.totalExp=experienceBeforeLevel(monster,monster.level)+monster.exp;
  return monster;
}
export function displayName(monster){
  if(!monster||typeof monster!=="object")return"不明な魔物";
  const species=SPECIES[monster.speciesId];
  const nickname=String(monster.nickname??"").trim();
  if(!species)return nickname||"不明な魔物";
  if(!nickname||nickname===species.legacyName)return species.name;
  return nickname;
}
export function rankName(monster){
  const species=SPECIES[monster?.speciesId];
  if(!species?.rankNames?.length)return"不明";
  return species.rankNames[Math.min(Math.max(0,(Number(monster?.rank)||1)-1),species.rankNames.length-1)];
}
export function colorValue(monster){
  return MONSTER_COLORS.find(c=>c.id===monster?.colorId)?.value??MONSTER_COLORS[0].value;
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

export function levelGrowthMultiplier(level,key,growth=1,raceGrowth=1){
  const safeLevel=Math.max(1,Number(level)||1),rawProgress=safeLevel-1,rate=key==="spd"?.045:.072;
  // Lv.1～500は成長をはっきり実感できる。以降は緩やかに逓減させ、
  // Lv.9000台でも基礎値が無制限に暴走しない曲線にする。
  const effectiveProgress=Math.min(rawProgress,500)
   +Math.min(Math.max(0,rawProgress-500),1500)*.55
   +Math.max(0,rawProgress-2000)*.22;
  // 50Lvごとの小節目、100Lvごとの追加節目。SPDは影響を半分に抑える。
  const fiftySteps=Math.floor(rawProgress/50),hundredSteps=Math.floor(rawProgress/100);
  const milestoneBase=fiftySteps*.0015+hundredSteps*.0015;
  const milestone=Math.min(key==="spd"?.12:.30,milestoneBase*(key==="spd"?.5:1));
  return(1+effectiveProgress*rate*(Number(growth)||1)*(Number(raceGrowth)||1)*(1+milestone));
}

const RARITY_STAT_MULTIPLIER=Object.freeze({N:1,R:1.015,SR:1.03,SSR:1.05,UR:1.08,LR:1.12,"神話":1.17,"深淵":1.45,"十神":1.80,SECRET:1.05});
function resolvedCombatRarity(source,species){
 if(source?.endgameFaction==="tenGod")return"十神";
 if(source?.endgameFaction==="abyss")return"深淵";
 return source?.summonRarity??source?.summonTier??species?.rarity??"N";
}
export function speciesLevelStats(speciesOrId,level,{rarity=null,rank=1,plus=0}={}){
 const species=typeof speciesOrId==="string"?SPECIES[speciesOrId]:speciesOrId;
 if(!species)return{hp:1,atk:1,matk:1,def:0,mdef:0,spd:1,crit:0,evasion:0,accuracy:100};
 const safeLevel=Math.max(1,Math.floor(Number(level)||1)),growth=species.growth??{},raceGrowth=RACE_GROWTH_RATE[species.race]??{},limitGrowth=limitBreakGrowth(species.id),rankMultiplier=1+(Math.max(1,Number(rank)||1)-1)*.15,rarityMultiplier=RARITY_STAT_MULTIPLIER[rarity??species.rarity??"N"]??1;
 const calc=key=>{
  const base=Math.max(0,Number(species.baseStats?.[key])||0)+(limitGrowth[key]??0)*Math.max(0,Number(plus)||0);
  return Math.max(key==="hp"||key==="atk"||key==="spd"?1:0,Math.floor(base*rankMultiplier*rarityMultiplier*levelGrowthMultiplier(safeLevel,key,growth[key]??1,raceGrowth[key]??1)));
 };
 const role=String(species.role??""),magicalRole=["magic","support","healer","controller","debuffer","poison","burner"].some(value=>role.includes(value)),atk=calc("atk"),def=calc("def");
 return{hp:calc("hp"),atk,matk:Math.max(1,Math.floor(atk*(magicalRole?1.08:.72))),def,mdef:Math.max(1,Math.floor(def*(magicalRole?1.08:.82))),spd:calc("spd"),crit:Math.max(0,Number(species.baseStats?.crit)||0),evasion:Math.max(0,Number(species.baseStats?.evasion)||0),accuracy:Math.max(20,Math.min(180,Number(species.baseStats?.accuracy)||100))};
}

export function calculatedStats(monster){
  const species=SPECIES[monster?.speciesId];
  if(!monster||typeof monster!=="object"||!species)return{...EMPTY_MONSTER_STATS};
  const personality=PERSONALITIES[monster.personalityId]??PERSONALITIES.bold??Object.values(PERSONALITIES)[0];
  const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const rank=Math.max(1,finite(monster.rank,1)),level=Math.max(1,finite(monster.level,1));
  const affection=affectionBonuses(monster.affection??monster.bond??0);
  // personality / trait / ★ / IV are flavour and collection history only.
  // Species, race, rarity and earned progression are the sole innate sources.
  const core=speciesLevelStats(species,level,{rarity:resolvedCombatRarity(monster,species),rank,plus:monster.plus});
  const calc=key=>Math.max(key==="hp"||key==="atk"||key==="spd"?1:0,Math.floor(finite(core[key])*(1+(affection[key]??0))));

  const trait=TRAITS[monster.traitId]??TRAITS.steady;
  const gear=monster._equipmentStats??{},affix=monster._equipmentAffixes??{};
  const syn=monster._synergy??{};
  const baseAtk=calc("atk"),baseDef=calc("def");
  const result={
    hp:calc("hp")+finite(gear.hp),
    atk:baseAtk+finite(gear.atk),
    matk:Math.max(1,Math.floor(finite(core.matk)*(1+(affection.atk??0))))+finite(gear.matk),
    def:baseDef+finite(gear.def),
    mdef:Math.max(1,Math.floor(finite(core.mdef)*(1+(affection.def??0))))+finite(gear.mdef),
    spd:calc("spd")+finite(gear.spd),
    crit:Math.floor(finite(core.crit))+finite(gear.crit),
    evasion:Math.floor(finite(core.evasion))+finite(gear.evasion),
    accuracy:Math.max(20,Math.min(180,finite(species.baseStats.accuracy,100)+finite(gear.accuracy)))
  };
  // Contracted floor bosses retain the authored identity of their dungeon
  // counterpart. These multipliers distinguish tanks, casters and speed types
  // without reviving the retired per-individual ★/IV stat lottery.
  const floorBossProfile=monster.floorBossStatProfile;
  if(floorBossProfile&&typeof floorBossProfile==="object"){
    for(const key of["hp","atk","matk","def","mdef","spd"]){
      const multiplier=Math.max(.45,Math.min(1.55,finite(floorBossProfile[key],1)));
      result[key]=Math.max(key==="hp"||key==="atk"||key==="matk"||key==="spd"?1:0,Math.floor(result[key]*multiplier));
    }
    result.crit+=finite(floorBossProfile.crit);
    result.evasion+=finite(floorBossProfile.evasion);
    result.accuracy=Math.max(20,Math.min(180,result.accuracy+finite(floorBossProfile.accuracy)));
  }
  for(const key of["hp","atk","matk","def","mdef","spd"]){
    const pct=finite(affix[`${key}Pct`]??(key==="matk"?affix.atkPct:key==="mdef"?affix.defPct:0));
    if(pct)result[key]=Math.floor(result[key]*(1+pct/100));
  }
  result.crit+=finite(affix.critRate);result.evasion+=finite(affix.evasion);result.accuracy=Math.max(20,Math.min(180,result.accuracy+finite(affix.accuracy)));result._affixes=affix;
  if(syn.atk){result.atk=Math.floor(result.atk*(1+syn.atk));result.matk=Math.floor(result.matk*(1+syn.atk))}
  if(syn.def){result.def=Math.floor(result.def*(1+syn.def));result.mdef=Math.floor(result.mdef*(1+syn.def))}
  if(syn.hp)result.hp=Math.floor(result.hp*(1+syn.hp));
  if(syn.spd)result.spd=Math.floor(result.spd*(1+syn.spd));
  if(syn.crit)result.crit+=syn.crit;
  if(syn.evasion)result.evasion+=syn.evasion;
  result.evasion=Math.min(75,Math.max(0,result.evasion));
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
  const skills=SPECIES[monster?.speciesId]?.skills;
  if(!Array.isArray(skills))return[];
  return skills.map(skill=>{
    const unlocked=skill.unlock.type==="level"
      ? monster.level>=skill.unlock.value
      : monster.rank>=skill.unlock.value;
    return{...skill,unlocked};
  });
}

export function calculateDangerRank(monster){const s=calculatedStats(monster),attack=Math.max(s.atk,s.matk??0),defense=Math.max(s.def,s.mdef??0);const gear=Object.values(monster.equipment??{}).filter(Boolean).length;const boss=monster.isBoss?2.5:1;const seal=monster.sealedPower?.ratio??1;return Math.max(1,Math.round((s.hp*.18+attack*2.8+defense*2.2+s.spd*1.8+s.crit+s.evasion+gear*12)*boss*seal))}
