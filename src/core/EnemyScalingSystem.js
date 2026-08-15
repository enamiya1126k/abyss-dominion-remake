// Enemy progression is intentionally separate from player progression.
// Levels remain readable, while hidden equipment/mastery prevents a captured
// high-level enemy from carrying its dungeon-only power into the party.
export const ENEMY_LEVEL_CAP=Number.MAX_SAFE_INTEGER;

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
const safeFloor=value=>Math.max(1,Math.floor(Number(value)||1));

export function baseEnemyLevelForFloor(floor){
 const f=safeFloor(floor);
 if(f<=1000)return f;
 if(f<=1500)return Math.round(lerp(1000,5000,(f-1000)/500));
 if(f<=2000)return Math.round(lerp(5000,10000,(f-1500)/500));
 // No hard ceiling after 2000F. Every 100 floors adds roughly 1000 levels.
 return Math.min(ENEMY_LEVEL_CAP,Math.round(10000+(f-2000)*10));
}

export function enemyLevelForFloor(floor,roll=Math.random()){
 const base=baseEnemyLevelForFloor(floor),variance=.96+clamp(Number(roll)||0,0,1)*.08;
 return Math.max(1,Math.min(ENEMY_LEVEL_CAP,Math.round(base*variance)));
}

export function enemyRankRatesForFloor(floor){
 const f=safeFloor(floor);
 if(f<=1000)return{N:29.8,R:28,SR:22,SSR:15,LR:5,abyss:.1,tenGod:.1};
 if(f<5000){const t=(f-1000)/4000;return{normal:lerp(94,1,t),abyss:lerp(5,90,t),tenGod:lerp(1,9,t)}}
 if(f<9000){const t=(f-5000)/4000;return{normal:lerp(1,0,t),abyss:lerp(90,10,t),tenGod:lerp(9,90,t)}}
 return{normal:0,abyss:0,tenGod:100};
}

function weightedPick(entries,roll=Math.random()){
 const total=entries.reduce((sum,[,weight])=>sum+Math.max(0,weight),0);let cursor=clamp(Number(roll)||0,0,.999999)*total;
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

export function visibleEnemyRank(rank,floor){return Number(floor)<1000&&(rank==="abyss"||rank==="tenGod")?"？？？":({abyss:"深淵",tenGod:"十神"}[rank]??rank)}
export function enemyRankStatMultiplier(rank){return({N:1,R:1.08,SR:1.18,SSR:1.32,LR:1.5,abyss:2.5,tenGod:3.15})[rank]??1}

// Enemy equipment is rolled independently from the monster's visible rarity.
// Shallow floors deliberately remain mixed; from 50F a full six-slot loadout is
// the norm, not the exception.
export function equipmentHolderRateForFloor(floor){
 const f=safeFloor(floor);
 if(f<6)return 0;
 if(f<20)return lerp(.14,.32,(f-6)/14);
 if(f<50)return lerp(.35,.78,(f-20)/30);
 if(f<100)return .96;
 return .99;
}
export function equipmentSlotsForFloor(floor){
 const f=safeFloor(floor);
 if(f<6)return 0;
 if(f<20)return 1;
 if(f<35)return 2;
 if(f<50)return 3;
 return 6;
}

export function rollEnemyEquipmentRarity(floor,rank,roll=Math.random()){
 const f=safeFloor(floor);
 // 50F以降の敵装備6枠は、ランク帯に関係なくすべてLR相当。
 if(f>=50)return"LR";
 if(f>=9000)return roll<.65?"SSR":"LR";
 if(rank==="tenGod")return roll<.25?"SSR":"LR";
 if(rank==="abyss")return roll<.42?"SSR":"LR";
 if(f>=2000)return weightedPick([["SR",.18],["SSR",.52],["LR",.3]],roll);
 if(f>=500)return weightedPick([["R",.12],["SR",.42],["SSR",.36],["LR",.1]],roll);
 return weightedPick([["N",.32],["R",.38],["SR",.22],["SSR",.07],["LR",.01]],roll);
}

// Enemy loadouts follow the equipment power a player can realistically build,
// rather than the old floor x2 rule. 300F is the first major wall: even an
// ordinary enemy carries roughly Lv.2000 gear, while bosses and high rarities
// push well beyond it. The curve keeps accelerating after 500F.
export function enemyEquipmentLevelForFloor(floor,{rank="N",boss=false}={}){
 const f=safeFloor(floor);
 let base;
 if(f<20)base=f*2;
 else if(f<50)base=40+(f-20)*3;
 else if(f<100)base=200+(f-50)*4;
 else if(f<200)base=500+(f-100)*7;
 else if(f<500)base=1200+(f-200)*8;
 else{
  const depth=f-500;
  base=3600+depth*(9+Math.min(31,Math.log2(1+depth/250)*3.5));
 }
 const rankMultiplier=({N:1,R:1.06,SR:1.12,SSR:1.22,UR:1.28,LR:1.35,"神話":1.48,abyss:1.7,tenGod:2.1,"深淵":1.7,"十神":2.1})[String(rank)]??1;
 return Math.max(1,Math.min(Number.MAX_SAFE_INTEGER,Math.round(base*rankMultiplier*(boss?1.55:1))));
}

// Dungeon-only six-slot loadout. This object is never copied to a captured
// monster. It represents enhancement levels, sockets, affixes and mastery.
export function enemyHiddenProfileForFloor(floor,{rank="N",faction=null,boss=false,equipped=false,slots=null,gearLevel=null,rarity=null,roll=Math.random()}={}){
 const f=safeFloor(floor);
 const slotCount=Math.max(0,Math.min(6,Math.floor(Number(slots??equipmentSlotsForFloor(f))||0)));
 const hasLoadout=Boolean(equipped||boss&&f>=50);
 if(!hasLoadout)return{active:false,floor:f,slots:0,gearLevel:0,rarity:null,socketGrade:null,hp:1,atk:1,def:1,spd:1,damageTaken:1,crit:.04,mastery:0,ai:0};
 const depth=Math.max(0,(f-100)/500),rankId=faction??rank;
 const factionMult=rankId==="tenGod"?2.15:rankId==="abyss"?1.72:1;
 const bossMult=boss?1.48:1;
 const mastery=Math.floor(20+f*1.35+Math.pow(depth+1,.82)*44+(rankId==="tenGod"?260:rankId==="abyss"?160:0));
 const resolvedGearLevel=Math.max(1,Math.floor(Number(gearLevel)||enemyEquipmentLevelForFloor(f,{rank:rankId,boss})));
 const slotPower=Math.max(.16,slotCount/6),fullLoadout=f>=50&&slotCount>=6;
 const base=fullLoadout?2.35+Math.min(2.8,Math.log2(depth+2)*.34):1+.2*slotCount+Math.min(.8,f/160);
 const legacyBaseline=Math.max(1,f*2),gearRatio=Math.max(1,resolvedGearLevel/legacyBaseline);
 const gearOverdrive=1+Math.min(3.5,Math.log2(gearRatio)*.72);
 return{
  active:true,floor:f,slots:slotCount,gearLevel:resolvedGearLevel,mastery,
  rarity:rarity??rollEnemyEquipmentRarity(f,rankId,roll),socketGrade:fullLoadout?"LR":Math.min(10,1+Math.floor(f/24)),socketRarity:fullLoadout?"LR":null,
  affixGrade:Math.min(12,1+Math.floor(f/180)),ai:Math.min(100,18+Math.floor(f/80)+(rankId==="tenGod"?22:rankId==="abyss"?14:0)),
  hp:base*Math.pow(gearOverdrive,.78)*factionMult*bossMult,
  atk:(fullLoadout?2.12+Math.min(2.4,Math.log2(depth+2)*.28):1+.18*slotCount+slotPower*.2)*gearOverdrive*factionMult*bossMult,
  def:(fullLoadout?2.38+Math.min(2.7,Math.log2(depth+2)*.3):1+.2*slotCount+slotPower*.22)*Math.pow(gearOverdrive,.9)*factionMult*bossMult,
  spd:(fullLoadout?1.42:1+.08*slotCount)*(1+Math.min(2.6,Math.log2(depth+2)*.12))*(rankId==="tenGod"?1.22:rankId==="abyss"?1.13:1),
  damageTaken:Math.max(.08,1-Math.min(.88,(fullLoadout?.18:.025*slotCount)+Math.log2(depth+2)*.075+Math.max(0,gearOverdrive-1)*.08+(rankId==="tenGod"?.16:rankId==="abyss"?.1:0))),
  crit:Math.min(.72,.06+Math.log2(depth+2)*.04+(rankId==="tenGod"?.18:rankId==="abyss"?.1:0)),
  statusResist:Math.min(.92,.08+Math.log2(depth+2)*.075+(rankId==="tenGod"?.2:rankId==="abyss"?.12:0)),
  capturePressure:1+Math.pow(depth+1,.55)*.55
 };
}

export function post9000DepthProfile(floor){
 const f=safeFloor(floor);if(f<9000)return{active:false,step:0,label:null,hp:1,atk:1,def:1,spd:1,statusResist:0};
 const step=Math.floor((f-9000)/100),t=Math.min(1,step/10);
 return{active:true,step,label:step>=10?"最終神域":`第${step+1}神域`,hp:lerp(1,1.85,t),atk:lerp(1,1.48,t),def:lerp(1,1.36,t),spd:lerp(1,1.18,t),statusResist:lerp(0,.28,t)};
}

export function bossProfileForFloor(floor){
 const f=safeFloor(floor);
 if(f%1000===0)return{tier:"超ボス",hp:22,atk:4.1,def:3.2,spd:1.55,statusResist:.82,healRate:.28,powerMultiplier:5.2};
 if(f%100===0)return{tier:"大ボス",hp:15,atk:3.15,def:2.5,spd:1.38,statusResist:.68,healRate:.24,powerMultiplier:4.4};
 if(f%50===0)return{tier:"属性覇者",hp:10.5,atk:2.65,def:2.05,spd:1.28,statusResist:.54,healRate:.21,powerMultiplier:3.75};
 return{tier:"階層ボス",hp:7.2,atk:2.15,def:1.72,spd:1.18,statusResist:.4,healRate:.19,powerMultiplier:3.35};
}

export function bossLevelForFloor(floor){return Math.max(1,Math.round(baseEnemyLevelForFloor(floor)*1.65))}
