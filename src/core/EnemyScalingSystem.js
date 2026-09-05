// build164: 敵の強さは階層だけで決まる。同じ階層なら端末・所持仲間・
// 装備状況にかかわらず同じ基準となり、周回や編成研究の成果はそのまま
// プレイヤー側の優位として残る。
export const ENEMY_LEVEL_CAP=10000;

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
const safeFloor=value=>Math.max(1,Math.floor(Number(value)||1));

export function baseEnemyLevelForFloor(floor){return Math.min(ENEMY_LEVEL_CAP,safeFloor(floor))}
export function enemyLevelForFloor(floor){return baseEnemyLevelForFloor(floor)}

export function enemyRankRatesForFloor(floor){
 const f=Math.min(10000,safeFloor(floor)),t=Math.pow((f-1)/9999,.48);
 return{N:lerp(50,8,t),R:lerp(31,19,t),SR:lerp(14,25,t),SSR:lerp(4,25,t),UR:lerp(.8,17,t),LR:lerp(.2,6,t)};
}
function weightedPick(entries,roll=Math.random()){
 const total=entries.reduce((sum,[,weight])=>sum+Math.max(0,weight),0);let cursor=clamp(Number(roll)||0,0,.999999)*total;
 for(const[value,weight]of entries){cursor-=Math.max(0,weight);if(cursor<0)return value}
 return entries[entries.length-1]?.[0];
}
export function rollEnemyRank(floor,roll=Math.random()){return weightedPick(Object.entries(enemyRankRatesForFloor(floor)),roll)}
export function visibleEnemyRank(rank){return String(rank??"N")}
export function enemyRankStatMultiplier(rank){return({N:1,R:1.015,SR:1.03,SSR:1.05,UR:1.08,LR:1.12})[rank]??1}

// 装備はプレイヤーが自然入手を始める時期に合わせて徐々に解禁する。
// 装備を持たない敵も最後まで残るため、すべてが六部位LRになることはない。
export function equipmentHolderRateForFloor(floor){
 const f=safeFloor(floor);
 if(f<20)return 0;if(f<50)return .04;if(f<100)return .12;if(f<200)return .22;if(f<500)return .36;
 if(f<1000)return .50;if(f<2000)return .64;if(f<5000)return .76;return .84;
}
export function equipmentSlotsForFloor(floor){
 const f=safeFloor(floor);
 if(f<20)return 0;if(f<50)return 1;if(f<100)return 1;if(f<200)return 2;if(f<500)return 3;if(f<1000)return 4;if(f<2000)return 5;return 6;
}
export function rollEnemyEquipmentRarity(floor,rank="N",roll=Math.random()){
 const f=safeFloor(floor),bonus=({N:0,R:.03,SR:.07,SSR:.12,UR:.18,LR:.25})[rank]??0,t=Math.min(.78,Math.pow(f/10000,.42)+bonus),r=clamp(Number(roll)||0,0,.999999);
 if(r<.46*(1-t))return"N";if(r<.78-.30*t)return"R";if(r<.93-.18*t)return"SR";if(r<.985-.08*t)return"SSR";if(r<.998-.02*t)return"UR";return"LR";
}
export function enemyEquipmentLevelForFloor(floor,{rank="N",boss=false}={}){
 const f=safeFloor(floor),rankRate=({N:.82,R:.85,SR:.88,SSR:.91,UR:.94,LR:.97})[rank]??.86;
 return Math.max(1,Math.min(ENEMY_LEVEL_CAP,Math.round(f*rankRate*(boss?1.08:1))));
}

// 旧版の「表示されない数倍補正」は廃止。装備枠と階層に沿った小さな補正だけを
// 残し、表示レベルと実際の強さが大きく食い違わないようにする。
export function enemyHiddenProfileForFloor(floor,{rank="N",faction=null,boss=false,equipped=false,slots=null,gearLevel=null,rarity=null,roll=Math.random()}={}){
 const f=safeFloor(floor),slotCount=Math.max(0,Math.min(6,Math.floor(Number(slots??equipmentSlotsForFloor(f))||0))),hasLoadout=Boolean(equipped&&slotCount>0);
 if(!hasLoadout)return{active:false,floor:f,slots:0,gearLevel:0,rarity:null,socketGrade:null,hp:1,atk:1,def:1,spd:1,damageTaken:1,crit:.04,mastery:0,ai:0,statusResist:0,capturePressure:1};
 const resolvedRank=faction??rank,resolvedLevel=Math.max(1,Math.floor(Number(gearLevel)||enemyEquipmentLevelForFloor(f,{rank:resolvedRank,boss}))),depth=Math.min(1,f/10000),slotRate=slotCount/6,bossRate=boss?.035:0,factionRate=resolvedRank==="tenGod"?.16:resolvedRank==="abyss"?.10:0;
 return{
  active:true,floor:f,slots:slotCount,gearLevel:resolvedLevel,rarity:rarity??rollEnemyEquipmentRarity(f,rank,roll),socketGrade:1+Math.floor(depth*9),socketRarity:null,affixGrade:1+Math.floor(depth*7),mastery:Math.floor(f*.08),ai:Math.round(18+depth*62),
  hp:1+slotRate*.14+depth*.05+bossRate+factionRate,atk:1+slotRate*.12+depth*.05+bossRate+factionRate,def:1+slotRate*.15+depth*.06+bossRate+factionRate,spd:1+slotRate*.035+depth*.025,
  damageTaken:Math.max(.84,1-slotRate*.07-depth*.04-factionRate*.18),crit:Math.min(.24,.04+slotRate*.035+depth*.035+factionRate*.08),statusResist:Math.min(.42,slotRate*.06+depth*.12+factionRate*.25),capturePressure:1+depth*.18
 };
}

export function post9000DepthProfile(floor){
 const f=safeFloor(floor);if(f<9000)return{active:false,step:0,label:null,hp:1,atk:1,def:1,spd:1,statusResist:0};
 const step=Math.floor((f-9000)/100),t=Math.min(1,(f-9000)/1000);
 return{active:true,step,label:step>=10?"最終神域":`第${step+1}神域`,hp:lerp(1,1.12,t),atk:lerp(1,1.08,t),def:lerp(1,1.08,t),spd:lerp(1,1.04,t),statusResist:lerp(0,.08,t)};
}

export function bossProfileForFloor(floor){
 const f=safeFloor(floor);
 if(f%1000===0)return{tier:"十神顕現",hp:8.2,atk:1.72,def:1.48,spd:1.18,statusResist:.62,healRate:.20,powerMultiplier:2.45};
 if(f%100===0)return{tier:"深淵顕現",hp:6.4,atk:1.56,def:1.36,spd:1.13,statusResist:.50,healRate:.18,powerMultiplier:2.18};
 if(f%50===0)return{tier:"階層覇者",hp:4.2,atk:1.36,def:1.24,spd:1.08,statusResist:.34,healRate:.16,powerMultiplier:1.92};
 return{tier:"階層ボス",hp:3.2,atk:1.25,def:1.16,spd:1.05,statusResist:.24,healRate:.14,powerMultiplier:1.72};
}
export function bossLevelForFloor(floor){return Math.max(1,Math.min(ENEMY_LEVEL_CAP,Math.round(baseEnemyLevelForFloor(floor)*1.03)))}
