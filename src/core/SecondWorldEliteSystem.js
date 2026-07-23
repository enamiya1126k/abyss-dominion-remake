import{eliteGoldBase}from"./GoldEconomySystem.js?v=1.1.0";

const ELITE_AFFIXES=[
 {id:"colossal",name:"巨大化",icon:"🜲",description:"最大HPが大幅に上昇",hp:2,atk:1.08,def:1.12,spd:.88},
 {id:"ferocious",name:"狂暴",icon:"🩸",description:"攻撃力が大幅に上昇",hp:1.2,atk:1.55,def:.95,spd:1.08},
 {id:"swift",name:"高速",icon:"⚡",description:"速度と回避性能が上昇",hp:1.12,atk:1.15,def:.95,spd:1.65},
 {id:"regenerator",name:"再生",icon:"♻️",description:"ラウンド終了時にHPを回復",hp:1.45,atk:1.12,def:1.18,spd:1,regen:.06},
 {id:"overload",name:"魔力暴走",icon:"🔮",description:"全能力が上昇する不安定な個体",hp:1.35,atk:1.35,def:1.25,spd:1.22}
];

function floorHash(floor,salt=0){let n=((Number(floor)||0)+salt*374761393)>>>0;n=Math.imul(n^(n>>>13),1274126177)>>>0;return(n^(n>>>16))>>>0}
export function eliteAffixForFloor(floor,salt=0){return ELITE_AFFIXES[floorHash(floor,salt)%ELITE_AFFIXES.length]}
export function shouldSpawnSecondWorldElite(floor,roll=Math.random()){
 const f=Number(floor)||0;if(f<1001||f%10===0)return false;
 const chance=Math.min(.11,.035+Math.floor((f-1000)/1000)*.008);return roll<chance;
}
export function createEliteEncounter(base,floor,{forced=false}={}){
 const affix=eliteAffixForFloor(floor,forced?7:0);
 return{...base,elite:true,eliteAffixId:affix.id,eliteAffixName:affix.name,eliteAffixIcon:affix.icon,eliteDescription:affix.description,eliteModifiers:{hp:affix.hp,atk:affix.atk,def:affix.def,spd:affix.spd,regen:affix.regen??0},uncapturable:true,equipped:true};
}
export function applyEliteModifiers(enemy,source={}){
 if(!source.elite)return enemy;const mod=source.eliteModifiers??{};
 enemy.elite=true;enemy.eliteAffixId=source.eliteAffixId??"overload";enemy.eliteAffixName=source.eliteAffixName??"魔力暴走";enemy.eliteAffixIcon=source.eliteAffixIcon??"🔮";enemy.eliteDescription=source.eliteDescription??"第二世界で変異した強敵";enemy.eliteRegen=Math.max(0,Number(mod.regen)||0);
 enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*(Number(mod.hp)||1)));enemy.hp=enemy.maxHp;enemy.atk=Math.max(1,Math.round(enemy.atk*(Number(mod.atk)||1)));enemy.def=Math.max(0,Math.round(enemy.def*(Number(mod.def)||1)));enemy.spd=Math.max(1,Math.round(enemy.spd*(Number(mod.spd)||1)));enemy.name=`${enemy.eliteAffixIcon} 深淵${enemy.name}`;enemy.uncapturable=true;return enemy;
}
export function normalizeEliteRecords(state){
 state.secondWorld??={};state.secondWorld.elites??={};const e=state.secondWorld.elites;e.defeated=Math.max(0,Number(e.defeated)||0);e.encountered=Math.max(0,Number(e.encountered)||0);e.byAffix=e.byAffix&&typeof e.byAffix==="object"?e.byAffix:{};e.bySpecies=e.bySpecies&&typeof e.bySpecies==="object"?e.bySpecies:{};return e;
}
export function recordEliteEncounter(state,enemy){const records=normalizeEliteRecords(state);records.encountered++;records.lastEncounter={floor:state.player?.currentFloor??0,speciesId:enemy.speciesId,affixId:enemy.eliteAffixId,at:new Date().toISOString()};return records}
export function recordEliteDefeat(state,enemy){const records=normalizeEliteRecords(state);records.defeated++;records.byAffix[enemy.eliteAffixId]=(records.byAffix[enemy.eliteAffixId]??0)+1;records.bySpecies[enemy.speciesId]=(records.bySpecies[enemy.speciesId]??0)+1;records.lastDefeat={floor:state.player?.currentFloor??0,speciesId:enemy.speciesId,affixId:enemy.eliteAffixId,at:new Date().toISOString()};return records}
export function eliteRewards(enemy,floor){
 const depth=Math.max(1,Math.floor((Number(floor)-1000)/100));return{gold:eliteGoldBase(floor,enemy.level),crystals:2+Math.floor(depth/5),keyChance:.12,rarity:depth>=25?"LR":"SSR"};
}
