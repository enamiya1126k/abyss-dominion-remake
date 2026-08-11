export const ENEMY_LEVEL_CAP=99999;

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);

export function baseEnemyLevelForFloor(floor){
 const f=clamp(Math.floor(Number(floor)||1),1,10000);
 if(f<=1000)return f;
 if(f<=5000)return Math.round(lerp(10000,90000,(f-1000)/4000));
 if(f<9000)return Math.round(lerp(90000,ENEMY_LEVEL_CAP,(f-5000)/4000));
 return ENEMY_LEVEL_CAP;
}

export function enemyLevelForFloor(floor,roll=Math.random()){
 const base=baseEnemyLevelForFloor(floor);
 if(base>=ENEMY_LEVEL_CAP)return ENEMY_LEVEL_CAP;
 const variance=.96+clamp(Number(roll)||0,0,1)*.08;
 return clamp(Math.round(base*variance),1,ENEMY_LEVEL_CAP);
}

export function enemyRankRatesForFloor(floor){
 const f=clamp(Math.floor(Number(floor)||1),1,10000);
 if(f<=1000)return{N:29.8,R:28,SR:22,SSR:15,LR:5,abyss:.1,tenGod:.1};
 if(f<5000){
  const t=(f-1000)/4000;
  return{normal:lerp(94,1,t),abyss:lerp(5,90,t),tenGod:lerp(1,9,t)};
 }
 if(f<9000){
  const t=(f-5000)/4000;
  return{normal:lerp(1,0,t),abyss:lerp(90,10,t),tenGod:lerp(9,90,t)};
 }
 return{normal:0,abyss:0,tenGod:100};
}

function weightedPick(entries,roll=Math.random()){
 const total=entries.reduce((sum,[,weight])=>sum+Math.max(0,weight),0);
 let cursor=clamp(Number(roll)||0,0,.999999)*total;
 for(const[value,weight]of entries){cursor-=Math.max(0,weight);if(cursor<0)return value}
 return entries.at(-1)?.[0];
}

export function rollEnemyRank(floor,roll=Math.random()){
 const rates=enemyRankRatesForFloor(floor);
 if(Number(floor)<=1000)return weightedPick(Object.entries(rates),roll);
 const faction=weightedPick([["normal",rates.normal],["abyss",rates.abyss],["tenGod",rates.tenGod]],roll);
 if(faction!=="normal")return faction;
 return weightedPick([["N",29.8],["R",28],["SR",22],["SSR",15],["LR",5]],Math.random());
}

export function visibleEnemyRank(rank,floor){
 return Number(floor)<1000&&(rank==="abyss"||rank==="tenGod")?"？？？":({abyss:"深淵",tenGod:"十神"}[rank]??rank);
}

export function enemyRankStatMultiplier(rank){
 return({N:1,R:1.08,SR:1.18,SSR:1.32,LR:1.5,abyss:1.85,tenGod:2.25})[rank]??1;
}

export function equipmentHolderRateForFloor(floor){
 const f=clamp(Number(floor)||1,1,10000);
 if(f<=1000)return .5;
 if(f<5000)return lerp(.5,1,(f-1000)/4000);
 return 1;
}

export function equipmentSlotsForFloor(floor,roll=Math.random()){
 const f=clamp(Number(floor)||1,1,10000);
 if(f>=9000)return 6;
 if(f>=8000)return weightedPick([[5,.35],[6,.65]],roll);
 if(f>=7000)return weightedPick([[4,.35],[5,.65]],roll);
 if(f>=6000)return weightedPick([[3,.3],[4,.7]],roll);
 if(f>=5000)return weightedPick([[3,.55],[4,.45]],roll);
 if(f>1000){const expected=lerp(1.5,3.5,(f-1000)/4000);return clamp(Math.round(expected+(roll-.5)),1,4)}
 return weightedPick([[1,.72],[2,.23],[3,.05]],roll);
}

export function rollEnemyEquipmentRarity(floor,rank,roll=Math.random()){
 const f=Number(floor)||1;
 if(f>=9000)return roll<.65?"SSR":"LR";
 if(rank==="tenGod")return roll<.35?"SSR":"LR";
 if(rank==="abyss")return roll<.2?"SSR":"LR";
 if(f>1000&&roll<.05)return"ABYSS";
 return weightedPick([["N",.2],["R",.28],["SR",.25],["SSR",.17],["LR",.1]],roll);
}


export function post9000DepthProfile(floor){
 const f=clamp(Math.floor(Number(floor)||1),1,10000);
 if(f<9000)return{active:false,step:0,label:null,hp:1,atk:1,def:1,spd:1,statusResist:0};
 // Lv.9999到達後も100階ごとに神域圧が上昇し、9000Fと10000Fを別物にする。
 const step=clamp(Math.floor((f-9000)/100),0,10);
 const t=step/10;
 return{
  active:true,
  step,
  label:step>=10?"最終神域":`第${step+1}神域`,
  hp:lerp(1,1.85,t),
  atk:lerp(1,1.48,t),
  def:lerp(1,1.36,t),
  spd:lerp(1,1.18,t),
  statusResist:lerp(0,.28,t)
 };
}

export function bossProfileForFloor(floor){
 const f=Math.max(1,Math.floor(Number(floor)||1));
 // 10階ごとの支配者は編成・属性・状態異常対策を要求する本格戦。
 if(f%1000===0)return{tier:"超ボス",hp:22,atk:4.1,def:3.2,spd:1.55,statusResist:.82,healRate:.28,powerMultiplier:5.2};
 if(f%100===0)return{tier:"大ボス",hp:15,atk:3.15,def:2.5,spd:1.38,statusResist:.68,healRate:.24,powerMultiplier:4.4};
 if(f%50===0)return{tier:"属性覇者",hp:10.5,atk:2.65,def:2.05,spd:1.28,statusResist:.54,healRate:.21,powerMultiplier:3.75};
 return{tier:"階層ボス",hp:7.2,atk:2.15,def:1.72,spd:1.18,statusResist:.4,healRate:.19,powerMultiplier:3.35};
}

export function bossLevelForFloor(floor){
 return Math.min(ENEMY_LEVEL_CAP,Math.round(baseEnemyLevelForFloor(floor)*1.65));
}
