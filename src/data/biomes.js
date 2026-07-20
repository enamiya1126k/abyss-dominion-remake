export const BIOMES=[
 {id:"origin_cave",name:"始まりの洞窟",icon:"🟢",from:1,to:10,theme:"cave",accent:"#7bcf8b",description:"湿った岩肌と淡い魔力が満ちる入口。",elements:["water","earth","dark"]},
 {id:"forgotten_forest",name:"忘れられた森",icon:"🌲",from:11,to:20,theme:"forest",accent:"#75c96b",description:"地下に根を張った古い森。",elements:["nature","wind","light"]},
 {id:"lava_fields",name:"溶岩地帯",icon:"🔥",from:21,to:30,theme:"lava",accent:"#ff805c",description:"熱風と溶岩脈が走る灼熱域。",elements:["fire","earth"]},
 {id:"frozen_corridor",name:"氷結回廊",icon:"❄️",from:31,to:40,theme:"ice",accent:"#77cfff",description:"音さえ凍る青白い回廊。",elements:["water","wind"]},
 {id:"ancient_temple",name:"古代神殿",icon:"🏛️",from:41,to:50,theme:"temple",accent:"#e7ce83",description:"失われた祭祀の痕跡が眠る。",elements:["light","earth","dark"]},
 {id:"abyss_gate",name:"深淵入口",icon:"🌌",from:51,to:60,theme:"abyss",accent:"#9d7cff",description:"ここから先は光が届かない。",elements:["dark","poison","light"]},
 {id:"nether",name:"奈落",icon:"☠️",from:61,to:100,theme:"nether",accent:"#c56cff",description:"深淵種が徘徊する底なしの領域。",elements:["dark","poison","fire"]},
];
export function biomeForFloor(floor){
 const f=Math.max(1,Number(floor)||1);
 return BIOMES.find(b=>f>=b.from&&f<=b.to)??{id:`deep_${Math.floor((f-1)/50)}`,name:`深層域 ${Math.floor((f-1)/50)+1}`,icon:"🌑",from:Math.floor((f-1)/50)*50+1,to:Math.floor((f-1)/50)*50+50,theme:"deep",accent:"#8e73c9",description:"未踏の深層域。",elements:["dark"]};
}
export function ensureBiomeProgress(state,biome){
 state.biomeProgress??={};
 const data=state.biomeProgress[biome.id]??={};
 data.visitedFloors=Array.isArray(data.visitedFloors)?data.visitedFloors:[];
 data.encounters=data.encounters&&typeof data.encounters==="object"?data.encounters:{};
 data.openedChests=Array.isArray(data.openedChests)?data.openedChests:[];
 data.events=Array.isArray(data.events)?data.events:[];
 data.bossDefeated=Boolean(data.bossDefeated);
 state.biomeProgress[biome.id]=data;
 return data;
}
export function recordBiomeFloor(state,floor){
 const biome=biomeForFloor(floor),data=ensureBiomeProgress(state,biome),value=Math.max(biome.from,Math.min(biome.to,Number(floor)||biome.from));
 if(!data.visitedFloors.includes(value))data.visitedFloors.push(value);
 return data;
}
export function recordBiomeEncounter(state,floor,speciesId){
 const biome=biomeForFloor(floor),data=ensureBiomeProgress(state,biome);
 if(speciesId)data.encounters[speciesId]=(data.encounters[speciesId]??0)+1;
 return data;
}
export function recordBiomeChest(state,floor,chestId){
 const biome=biomeForFloor(floor),data=ensureBiomeProgress(state,biome),id=String(chestId??`${floor}-chest`);
 if(!data.openedChests.includes(id))data.openedChests.push(id);
 return data;
}
export function recordBiomeBoss(state,floor){
 const biome=biomeForFloor(floor),data=ensureBiomeProgress(state,biome);data.bossDefeated=true;return data;
}
export function biomeProgress(state,biome){
 const data=ensureBiomeProgress(state,biome);
 const floorCount=Math.max(1,biome.to-biome.from+1);
 const validFloors=new Set(data.visitedFloors.filter(f=>f>=biome.from&&f<=biome.to));
 const floorScore=Math.round(Math.min(1,validFloors.size/floorCount)*60);
 const encounterKinds=Object.values(data.encounters).filter(n=>Number(n)>0).length;
 const encounterTarget=Math.max(4,Math.min(10,Math.ceil(floorCount*.6)));
 const encounterScore=Math.round(Math.min(1,encounterKinds/encounterTarget)*20);
 const chestScore=Math.round(Math.min(1,data.openedChests.length/5)*10);
 const bossFromSave=Object.entries(state.player?.bossKills??{}).some(([floor,k])=>Number(floor)>=biome.from&&Number(floor)<=biome.to&&Number(k)>0);
 const bossScore=(data.bossDefeated||bossFromSave)?10:0;
 return Math.min(100,floorScore+encounterScore+chestScore+bossScore);
}
