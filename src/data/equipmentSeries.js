import{ENDGAME_SERIES}from"./endgameCharacters.js?v=2.10.0-build161";

export const EQUIPMENT_SERIES={
 flame:{name:"炎帝",theme:"火力・炎上",bonuses:{2:{atk:.03},3:{fireDamage:.08},4:{crit:5},5:{fireRes:.15},6:{fireDamage:.24,burnChance:.20}}},
 guardian:{name:"守護者",theme:"防御・生存",bonuses:{2:{def:.04},3:{statusRes:.08},4:{hp:.10},5:{guardPower:.15},6:{lastStand:1}}},
 traveler:{name:"旅人",theme:"速度・回避",bonuses:{2:{spd:.04},3:{evasion:4},4:{spd:.08},5:{evasion:8},6:{firstStrike:1}}},
 capturer:{name:"捕獲師",theme:"捕獲・探索",bonuses:{2:{capture:.06},3:{capture:.10},4:{dropRate:.08},5:{capture:.16},6:{rareEncounter:.10}}},
 sacredTree:{name:"聖樹",theme:"HP再生",bonuses:{2:{hpRegen:.02},3:{healPower:.08},4:{hp:.10},5:{lowHpRegen:.04},6:{partyHpRegen:.015}}},
 deepSea:{name:"深海",theme:"MP循環",bonuses:{2:{mpRegen:2},3:{mp:.08},4:{mpCost:-.05},5:{skillPower:.08},6:{freeSkillChance:.12}}},
 thunder:{name:"雷神",theme:"会心・追撃",bonuses:{2:{crit:3},3:{critDamage:.10},4:{spd:.06},5:{chainChance:.12},6:{critDamage:.25}}},
 royal:{name:"王覇",theme:"万能・最終強化",bonuses:{2:{atk:.04},3:{def:.05},4:{hp:.08},5:{crit:6},6:{skillPower:.18}}},
 void:{name:"虚星",theme:"魔攻・回避",bonuses:{2:{mp:.05},3:{evasion:4},4:{atk:.06},5:{crit:6},6:{skillPower:.20}}},
 abyssGluttony:{name:"暴食",theme:"吸収・暴力",bonuses:{2:{atk:.12},3:{hp:.18},4:{healPower:.20},5:{critDamage:.30},6:{skillPower:.45}}},
 abyssExtinction:{name:"死滅",theme:"呪い・終焉",bonuses:{2:{crit:8},3:{statusRes:.20},4:{atk:.18},5:{evasion:12},6:{skillPower:.50}}},
 godIgnis:{name:"炎神",theme:"神炎・殲滅",bonuses:{2:{atk:.18},3:{fireDamage:.30},4:{crit:12},5:{fireRes:.40},6:{skillPower:.65}}},
 godVajra:{name:"雷神・天威",theme:"天雷・超速",bonuses:{2:{spd:.18},3:{crit:14},4:{critDamage:.35},5:{chainChance:.30},6:{skillPower:.70}}},
 "signature-myth_enami":{name:"えなみ専用",theme:"創作・多動",bonuses:{2:{atk:.04},4:{spd:.07,def:.05},6:{hp:.10,skillPower:.18}}},
 "signature-myth_rion":{name:"りおん専用",theme:"自然・支援",bonuses:{2:{def:.05},4:{hp:.09,healPower:.10},6:{spd:.08,skillPower:.18}}},
 "signature-myth_yori":{name:"より専用",theme:"蒼晶・照準",bonuses:{2:{atk:.05},4:{crit:6,spd:.06},6:{skillPower:.20}}},
 "signature-myth_hide":{name:"ひで専用",theme:"守護・反撃",bonuses:{2:{def:.06},4:{hp:.10,guardPower:.10},6:{atk:.08,skillPower:.18}}},
 ...ENDGAME_SERIES
};
const LABELS={atk:"ATK",def:"DEF",hp:"HP",spd:"SPD",mp:"最大MP",crit:"会心率",evasion:"回避率",fireDamage:"炎属性ダメージ",fireRes:"炎耐性",burnChance:"炎上付与率",statusRes:"状態異常耐性",guardPower:"ガード効果",lastStand:"致死ダメージ耐久",firstStrike:"開幕先制",capture:"捕獲率",dropRate:"ドロップ率",rareEncounter:"レア遭遇率",hpRegen:"毎ターンHP回復",healPower:"回復量",lowHpRegen:"瀕死時HP回復",partyHpRegen:"味方全体HP回復",mpRegen:"毎ターンMP回復",mpCost:"消費MP",skillPower:"スキル威力",freeSkillChance:"MP消費無効率",critDamage:"会心ダメージ",chainChance:"追撃率",execution:"処刑威力"};
const GENERIC_SIGNATURE_SERIES={name:"専用共鳴",theme:"専用・共鳴",bonuses:{2:{atk:.03,def:.03},4:{hp:.06,spd:.04},6:{skillPower:.15}}};
export function equipmentSeriesDefinition(seriesId){
 const id=String(seriesId??"");
 return EQUIPMENT_SERIES[id]??(id.startsWith("signature-")?GENERIC_SIGNATURE_SERIES:null)
}
export function describeSeriesEffect(effect={}){return Object.entries(effect).map(([key,value])=>{if(key==="specialText")return String(value);const label=LABELS[key]??key;if(key==="lastStand")return`${label}：戦闘中1回`;if(key==="firstStrike")return`${label}`;if(key==="mpRegen")return`${label} +${value}`;const pct=Math.round(Math.abs(value)*100);const sign=value>=0?"+":"-";return`${label} ${sign}${pct}%`}).join(" / ")}
export function activeSeriesBonuses(counts={}){const active=[];for(const[id,count]of Object.entries(counts)){const series=equipmentSeriesDefinition(id);if(!series)continue;for(const[pieces,effect]of Object.entries(series.bonuses))if(count>=Number(pieces))active.push({seriesId:id,pieces:Number(pieces),effect})}return active}
export function aggregateSeriesEffects(counts={}){
 const result={};
 for(const bonus of activeSeriesBonuses(counts)){
  for(const[key,value]of Object.entries(bonus.effect??{})){
   if(typeof value!=="number"||!Number.isFinite(value))continue;
   result[key]=(result[key]??0)+value;
  }
 }
 return result;
}
