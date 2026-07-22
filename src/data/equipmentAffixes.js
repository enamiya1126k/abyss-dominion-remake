export const AFFIX_QUALITY={
 normal:{id:"normal",name:"通常",color:"#e8e8ec",min:.00,max:.34},
 good:{id:"good",name:"良質",color:"#69dc86",min:.34,max:.56},
 rare:{id:"rare",name:"希少",color:"#64b5ff",min:.56,max:.76},
 epic:{id:"epic",name:"英雄",color:"#c98cff",min:.76,max:.92},
 legendary:{id:"legendary",name:"伝説",color:"#ffd45d",min:.92,max:1.01}
};

export const AFFIX_DEFINITIONS=[
 {id:"hpPct",label:"HP",suffix:"%",min:3,max:18,slots:["weapon","armor","accessory"]},
 {id:"mpPct",label:"MP",suffix:"%",min:3,max:18,slots:["weapon","armor","accessory"]},
 {id:"atkPct",label:"ATK",suffix:"%",min:2,max:15,slots:["weapon","armor","accessory"]},
 {id:"defPct",label:"DEF",suffix:"%",min:2,max:15,slots:["weapon","armor","accessory"]},
 {id:"spdPct",label:"SPD",suffix:"%",min:2,max:14,slots:["weapon","armor","accessory"]},
 {id:"critRate",label:"クリティカル率",suffix:"%",min:1,max:9,slots:["weapon","accessory"]},
 {id:"critDamage",label:"クリティカルダメージ",suffix:"%",min:5,max:35,slots:["weapon","accessory"]},
 {id:"evasion",label:"回避率",suffix:"%",min:1,max:8,slots:["armor","accessory"]},
 {id:"damageReduction",label:"被ダメージ",prefix:"−",suffix:"%",min:1,max:10,slots:["armor","accessory"]},
 {id:"bossDamage",label:"ボスダメージ",suffix:"%",min:3,max:18,slots:["weapon","accessory"]},
 {id:"normalDamage",label:"通常敵ダメージ",suffix:"%",min:3,max:18,slots:["weapon","accessory"]},
 {id:"healPower",label:"回復量",suffix:"%",min:3,max:20,slots:["weapon","armor","accessory"]},
 {id:"mpCostReduction",label:"MP消費",prefix:"−",suffix:"%",min:2,max:12,slots:["weapon","armor","accessory"]},
 {id:"statusChance",label:"状態異常成功率",suffix:"%",min:3,max:20,slots:["weapon","accessory"]},
 {id:"dotDamage",label:"継続ダメージ",suffix:"%",min:4,max:24,slots:["weapon","accessory"]},
 {id:"counterDamage",label:"反撃ダメージ",suffix:"%",min:5,max:30,slots:["weapon","armor"]},
 {id:"guardPower",label:"防御効果",suffix:"%",min:3,max:18,slots:["armor","accessory"]},
 {id:"fireDamage",label:"炎属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"fire"},
 {id:"waterDamage",label:"水属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"water"},
 {id:"iceDamage",label:"氷属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"ice"},
 {id:"thunderDamage",label:"雷属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"thunder"},
 {id:"windDamage",label:"風属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"wind"},
 {id:"earthDamage",label:"土属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"earth"},
 {id:"lightDamage",label:"光属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"light"},
 {id:"darkDamage",label:"闇属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"dark"},
 {id:"poisonDamage",label:"毒属性威力",suffix:"%",min:3,max:20,slots:["weapon","accessory"],element:"poison"},
 {id:"expGain",label:"獲得EXP",suffix:"%",min:3,max:18,slots:["armor","accessory"]},
 {id:"goldGain",label:"獲得ゴールド",suffix:"%",min:3,max:22,slots:["armor","accessory"]},
 {id:"dropRate",label:"装備ドロップ率",suffix:"%",min:2,max:14,slots:["accessory"]},
 {id:"skillMasteryGain",label:"スキル熟練EXP",suffix:"%",min:4,max:24,slots:["weapon","accessory"]},
 {id:"captureRate",label:"捕獲成功率",suffix:"%",min:2,max:12,slots:["accessory"]},
 {id:"startMp",label:"戦闘開始時MP",suffix:"%",min:3,max:18,slots:["armor","accessory"]},
 {id:"lowHpDamage",label:"瀕死時ダメージ",suffix:"%",min:5,max:30,slots:["weapon","armor"]},
 {id:"fullHpDamage",label:"HP最大時ダメージ",suffix:"%",min:4,max:24,slots:["weapon","accessory"]},
 {id:"lifeSteal",label:"与ダメージ吸収",suffix:"%",min:1,max:8,slots:["weapon","accessory"]},
 {id:"regen",label:"ターンHP再生",suffix:"%",min:1,max:6,slots:["armor","accessory"]}
];

const COUNT_RANGES={N:[0,1],R:[1,1],SR:[1,2],SSR:[2,3],LR:[3,4]};
const RARITY_LUCK={N:0,R:.05,SR:.12,SSR:.22,LR:.34};
const byId=new Map(AFFIX_DEFINITIONS.map(x=>[x.id,x]));

function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function qualityForRoll(roll){return Object.values(AFFIX_QUALITY).find(q=>roll>=q.min&&roll<q.max)??AFFIX_QUALITY.normal}
export function affixDefinition(id){return byId.get(id)??null}
export function rollEquipmentAffixes(slot,rarity="N"){
 const [minCount,maxCount]=COUNT_RANGES[rarity]??[0,1],count=randomInt(minCount,maxCount),pool=AFFIX_DEFINITIONS.filter(x=>x.slots.includes(slot)),chosen=[];
 while(chosen.length<count&&pool.length){const index=Math.floor(Math.random()*pool.length),def=pool.splice(index,1)[0],roll=Math.min(.999,Math.random()+RARITY_LUCK[rarity]*(.35+Math.random()*.65)),quality=qualityForRoll(roll),value=Math.max(def.min,Math.min(def.max,Math.round(def.min+(def.max-def.min)*roll)));chosen.push({id:def.id,value,quality:quality.id})}
 return chosen;
}
export function ensureEquipmentAffixes(item){if(!Array.isArray(item.affixes))item.affixes=rollEquipmentAffixes(item.slot,item.rarity);return item.affixes}
export function affixQuality(affix){return AFFIX_QUALITY[affix?.quality]??AFFIX_QUALITY.normal}
export function formatAffix(affix){const def=affixDefinition(affix.id);if(!def)return affix.id;return `${def.label} ${def.prefix??"+"}${affix.value}${def.suffix??""}`}
export function aggregateAffixes(items=[]){const result={};for(const item of items)for(const affix of ensureEquipmentAffixes(item)){result[affix.id]=(result[affix.id]??0)+Number(affix.value??0)}return result}
export function equipmentAffixPower(item){return ensureEquipmentAffixes(item).reduce((sum,a)=>sum+(a.value??0)*(1+Object.keys(AFFIX_QUALITY).indexOf(a.quality)*.18),0)}
