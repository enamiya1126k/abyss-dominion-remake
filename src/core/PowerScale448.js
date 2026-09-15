import{SPECIES}from'../data/species.js';
import{calculatedStats}from'../models/Monster.js';
import{endgameCharacter}from'../data/endgameCharacters.js';
import{displayPower447}from'./PowerScale447.js';

export const POWER_RARITY448=Object.freeze({N:1,R:1.2,SR:1.5,SSR:1.8,UR:2.1,LR:2.5,'神話':3,'深淵':4,'十神':5.5,SECRET:1.8});
const baselines=new Map();
function legacyStatPower(stats){
 const highAttack=Math.max(stats.atk,stats.matk),lowAttack=Math.min(stats.atk,stats.matk);
 const highDefense=Math.max(stats.def,stats.mdef),lowDefense=Math.min(stats.def,stats.mdef);
 const raw=stats.hp*.35+(highAttack+lowAttack*.35)*4+(highDefense+lowDefense*.35)*3+stats.spd*2+stats.crit*12+stats.evasion*10;
 return Math.max(1,Math.round(Math.pow(Math.max(1,raw),.32)*90));
}
function identity(source){
 const species=Object.hasOwn(SPECIES,source?.speciesId)?SPECIES[source.speciesId]:null;if(!species)return null;
 const boss=endgameCharacter(source?.endgameBossId);
 const tier=boss&&boss.speciesId===species.id?(boss.faction==='tenGod'?'十神':'深淵'):(source?.summonTier??source?.summonRarity??source?.rarity??species.rarity??'N');
 const rarity=Object.hasOwn(POWER_RARITY448,tier)?tier:(Object.hasOwn(POWER_RARITY448,species.rarity)?species.rarity:'N');
 const input=Number(source?.level),level=Number.isFinite(input)?Math.max(1,Math.min(99_999_999,Math.floor(input))):1;
 return{speciesId:species.id,rarity,level};
}
export function displayPower448(legacyPower,source=null){
 const power=Number(legacyPower);if(!Number.isFinite(power)||power<=0)return 0;
 const info=identity(source);if(!info)return displayPower447(power,source);
 const{speciesId,rarity,level}=info,key=`${speciesId}|${rarity}`;
 let baseline=baselines.get(key);
 if(!baseline){
  const bare=level=>legacyStatPower(calculatedStats({speciesId,level,rank:1,plus:0,affection:0,summonRarity:rarity}));
  const first=bare(1)**2,span=Math.max(1,bare(1000)**2-first);
  baseline={first,span};
  if(baselines.size>=1024)baselines.delete(baselines.keys().next().value);
  baselines.set(key,baseline);
 }
 // Fixed species references avoid rating drops when a level-dependent divisor grows.
 // 10,000 growth points at bare Lv.1000; extra stats from gear/training add more.
 const levelScore=100*Math.pow(1+(level-1)/10,1.1);
 const growthScore=10000*Math.max(0,power*power-baseline.first)/baseline.span;
 const value=POWER_RARITY448[rarity]*(levelScore+growthScore);
 return Math.min(Number.MAX_SAFE_INTEGER,Math.max(1,Math.round(value)));
}
export function displayPartyPower448(party){
 return Math.min(Number.MAX_SAFE_INTEGER,(party??[]).reduce((sum,m)=>sum+displayPower448(m?.power,m),0));
}
