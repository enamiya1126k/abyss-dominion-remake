export const EQUIPMENT_SERIES={
 flame:{name:"炎帝",theme:"火力・炎上",bonuses:{2:{atk:.03},3:{fireDamage:.08},4:{crit:5},5:{fireRes:.15},6:{fireDamage:.24,burnChance:.20}}},
 guardian:{name:"守護者",theme:"防御・生存",bonuses:{2:{def:.04},3:{statusRes:.08},4:{hp:.10},5:{guardPower:.15},6:{lastStand:1}}},
 traveler:{name:"旅人",theme:"速度・回避",bonuses:{2:{spd:.04},3:{evasion:4},4:{spd:.08},5:{evasion:8},6:{firstStrike:1}}},
 capturer:{name:"捕獲師",theme:"捕獲・探索",bonuses:{2:{capture:.06},3:{capture:.10},4:{dropRate:.08},5:{capture:.16},6:{rareEncounter:.10}}},
 sacredTree:{name:"聖樹",theme:"HP再生",bonuses:{2:{hpRegen:.02},3:{healPower:.08},4:{hp:.10},5:{lowHpRegen:.04},6:{partyHpRegen:.015}}},
 deepSea:{name:"深海",theme:"MP循環",bonuses:{2:{mpRegen:2},3:{mp:.08},4:{mpCost:-.05},5:{skillPower:.08},6:{freeSkillChance:.12}}},
 thunder:{name:"雷神",theme:"会心・追撃",bonuses:{2:{crit:3},3:{critDamage:.10},4:{spd:.06},5:{chainChance:.12},6:{critDamage:.25}}}
};
const LABELS={atk:"ATK",def:"DEF",hp:"HP",spd:"SPD",mp:"最大MP",crit:"会心率",evasion:"回避率",fireDamage:"炎属性ダメージ",fireRes:"炎耐性",burnChance:"炎上付与率",statusRes:"状態異常耐性",guardPower:"ガード効果",lastStand:"致死ダメージ耐久",firstStrike:"開幕先制",capture:"捕獲率",dropRate:"ドロップ率",rareEncounter:"レア遭遇率",hpRegen:"毎ターンHP回復",healPower:"回復量",lowHpRegen:"瀕死時HP回復",partyHpRegen:"味方全体HP回復",mpRegen:"毎ターンMP回復",mpCost:"消費MP",skillPower:"スキル威力",freeSkillChance:"MP消費無効率",critDamage:"会心ダメージ",chainChance:"追撃率"};
export function describeSeriesEffect(effect={}){return Object.entries(effect).map(([key,value])=>{const label=LABELS[key]??key;if(key==="lastStand")return`${label}：戦闘中1回`;if(key==="firstStrike")return`${label}`;if(key==="mpRegen")return`${label} +${value}`;const pct=Math.round(Math.abs(value)*100);const sign=value>=0?"+":"-";return`${label} ${sign}${pct}%`}).join(" / ")}
export function activeSeriesBonuses(counts={}){const active=[];for(const[id,count]of Object.entries(counts)){const series=EQUIPMENT_SERIES[id];if(!series)continue;for(const[pieces,effect]of Object.entries(series.bonuses))if(count>=Number(pieces))active.push({seriesId:id,pieces:Number(pieces),effect})}return active}
