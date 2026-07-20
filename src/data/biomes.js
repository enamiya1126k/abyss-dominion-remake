import{SPECIES}from"./species.js";
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
export function biomeProgress(state,biome){
 const visited=new Set((state.player.visitedFloors??[]).map(Number));const floors=[];for(let f=biome.from;f<=biome.to;f++)floors.push(f);const floorScore=floors.length?Math.round(floors.filter(f=>visited.has(f)).length/floors.length*60):0;
 const regional=Object.values(SPECIES).filter(sp=>(sp.minFloor??1)>=biome.from&&(sp.minFloor??1)<=biome.to);const seen=state.codex?.encounters??{};const encounterScore=regional.length?Math.round(regional.filter(sp=>(seen[sp.id]??0)>0).length/regional.length*20):0;
 const chestCount=Object.entries(state.player.openedChests??{}).filter(([floor])=>Number(floor)>=biome.from&&Number(floor)<=biome.to).reduce((n,[,ids])=>n+(ids?.length??0),0);const eventScore=Math.min(10,chestCount*2);
 const bossFloor=biome.to;const bossScore=(state.player.bossKills?.[bossFloor]??0)>0?10:0;
 return Math.min(100,floorScore+encounterScore+eventScore+bossScore);
}
