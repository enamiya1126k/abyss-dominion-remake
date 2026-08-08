export const BIOMES=[
 {id:"origin_cave",name:"始まりの洞窟",icon:"🟢",from:1,to:10,theme:"cave",accent:"#7bcf8b",description:"湿った岩肌と淡い魔力が満ちる入口。",elements:["water","earth","dark"]},
 {id:"forgotten_forest",name:"忘れられた森",icon:"🌲",from:11,to:20,theme:"forest",accent:"#75c96b",description:"地下に根を張った古い森。",elements:["nature","wind","light"]},
 {id:"lava_fields",name:"溶岩地帯",icon:"🔥",from:21,to:30,theme:"lava",accent:"#ff805c",description:"熱風と溶岩脈が走る灼熱域。",elements:["fire","earth"]},
 {id:"frozen_corridor",name:"氷結回廊",icon:"❄️",from:31,to:40,theme:"ice",accent:"#77cfff",description:"音さえ凍る青白い回廊。",elements:["water","wind"]},
 {id:"ancient_temple",name:"古代神殿",icon:"🏛️",from:41,to:50,theme:"temple",accent:"#e7ce83",description:"失われた祭祀の痕跡が眠る。",elements:["light","earth","dark"]},
 {id:"abyss_gate",name:"深淵入口",icon:"🌌",from:51,to:60,theme:"abyss",accent:"#9d7cff",description:"ここから先は光が届かない。",elements:["dark","poison","light"]},
 {id:"nether",name:"奈落",icon:"☠️",from:61,to:100,theme:"nether",accent:"#c56cff",description:"深淵種が徘徊する底なしの領域。",elements:["dark","poison","fire"]},
];
const DEEP_BIOME_CYCLE=Object.freeze([
 {name:"煉獄火層",theme:"fire",accent:"#ff6548",description:"灼けた床と火口が続く炎の五十階層。",elements:["fire"]},
 {name:"永久氷層",theme:"ice",accent:"#6ed6ff",description:"氷晶と凍気に閉ざされた氷の五十階層。",elements:["ice","water"]},
 {name:"瘴毒菌層",theme:"poison",accent:"#9bdd55",description:"猛毒の胞子が漂う毒の五十階層。",elements:["poison","nature"]},
 {name:"雷鳴天層",theme:"lightning",accent:"#d7b8ff",description:"絶え間なく雷が走る雷の五十階層。",elements:["lightning","thunder","wind"]},
 {name:"巨岩地層",theme:"earth",accent:"#c69a5a",description:"大地の圧力が凝固した土の五十階層。",elements:["earth"]},
 {name:"暴風空層",theme:"wind",accent:"#8de6c5",description:"地下に生まれた嵐が渦巻く風の五十階層。",elements:["wind"]},
 {name:"白光聖層",theme:"light",accent:"#ffe9a5",description:"浄化の光が影を焼く光の五十階層。",elements:["light"]},
 {name:"無明闇層",theme:"dark",accent:"#b36cff",description:"灯りを呑む静寂に満ちた闇の五十階層。",elements:["dark"]},
 {name:"深海水層",theme:"water",accent:"#4da9ff",description:"水圧と濁流に支配された水の五十階層。",elements:["water","ice"]},
 {name:"混沌境層",theme:"chaos",accent:"#ff6cae",description:"複数の法則が衝突する混沌の五十階層。",elements:["fire","water","light","dark","poison"]}
]);
export function biomeForFloor(floor){
 const f=Math.max(1,Number(floor)||1);
 const fixed=BIOMES.find(b=>f>=b.from&&f<=b.to);if(fixed)return fixed;
 const band=Math.max(0,Math.floor((f-101)/50)),template=DEEP_BIOME_CYCLE[band%DEEP_BIOME_CYCLE.length],from=101+band*50;
 return{...template,id:`deep_${band+1}_${template.theme}`,name:`${template.name} ${band+1}`,icon:"",from,to:from+49};
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
