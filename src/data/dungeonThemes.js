import{biomeForFloor}from"./biomes.js?v=2.10.0";

const ASSET_VERSION="2.10.0-build143";
const atlas=id=>`assets/ui/explore/biomes/${id}-atlas.png?v=${ASSET_VERSION}`;

export const DUNGEON_THEMES=Object.freeze({
 ruins:Object.freeze({
  id:"ruins",name:"黒鉄遺跡",accent:"#d6b56f",floor:"#725a3630",wall:"#1513134d",line:"#c7a86a66",light:"#f1c777",dark:"rgba(3,4,7,.40)",
  floorAsset:`assets/ui/explore/dungeon-floor.png?v=${ASSET_VERSION}`,wallAsset:`assets/ui/explore/dungeon-wall.png?v=${ASSET_VERSION}`,atlasSplit:false,architecture:true,particle:"dust",minimapFloor:"#7e6748",minimapWall:"#29231f",
  variants:["古びた入口","苔むす石路","崩落回廊","封印区画","最奥祭壇"]
 }),
 jungle:Object.freeze({
  id:"jungle",name:"翠根密林",accent:"#73e09a",floor:"#244e3430",wall:"#07160e4d",line:"#72d58d66",light:"#7af2b2",dark:"rgba(1,8,5,.43)",
  floorAsset:atlas("jungle"),wallAsset:atlas("jungle"),atlasSplit:true,architecture:false,particle:"firefly",minimapFloor:"#3c7551",minimapWall:"#10291a",
  variants:["芽吹きの径","絡根地帯","燐光樹海","古樹中枢","緑王の深庭"]
 }),
 magma:Object.freeze({
  id:"magma",name:"灼熱溶岩洞",accent:"#ff7348",floor:"#4b180d24",wall:"#1703004f",line:"#ff6b3d70",light:"#ff8a4d",dark:"rgba(12,2,0,.40)",
  floorAsset:atlas("magma"),wallAsset:atlas("magma"),atlasSplit:true,architecture:false,particle:"ember",minimapFloor:"#783423",minimapWall:"#2d0e0a",
  variants:["冷却玄武岩","赤熱亀裂帯","火脈回廊","熔融心域","噴火口深部"]
 }),
 ice:Object.freeze({
  id:"ice",name:"蒼氷晶洞",accent:"#78dbff",floor:"#17496b24",wall:"#03111f4d",line:"#8ae4ff70",light:"#a6edff",dark:"rgba(0,5,13,.43)",
  floorAsset:atlas("ice"),wallAsset:atlas("ice"),atlasSplit:true,architecture:false,particle:"snow",minimapFloor:"#3a7391",minimapWall:"#102b3f",
  variants:["薄氷回廊","霜紋地帯","氷柱迷宮","凍結心域","永久氷核"]
 }),
 sacred:Object.freeze({
  id:"sacred",name:"星金聖域",accent:"#ffe09a",floor:"#8a74321f",wall:"#18130d45",line:"#ffe09a73",light:"#fff0bb",dark:"rgba(5,4,2,.34)",
  floorAsset:atlas("sacred"),wallAsset:atlas("sacred"),atlasSplit:true,architecture:false,particle:"mote",minimapFloor:"#9c8b68",minimapWall:"#3a3328",
  variants:["巡礼石路","星刻回廊","黄金礼拝区","天光中枢","神座前庭"]
 }),
 void:Object.freeze({
  id:"void",name:"虚無断界",accent:"#d06bff",floor:"#481c6426",wall:"#10041c55",line:"#d76fff70",light:"#df8cff",dark:"rgba(2,0,9,.53)",
  floorAsset:atlas("void"),wallAsset:atlas("void"),atlasSplit:true,architecture:false,particle:"star",minimapFloor:"#58336e",minimapWall:"#1b0d29",
  variants:["境界亀裂","星屑断層","重力歪曲域","虚空深部","無明特異点"]
 }),
 poison:Object.freeze({
  id:"poison",name:"瘴毒菌窟",accent:"#b7e84f",floor:"#3c52201f",wall:"#11081b52",line:"#bded566b",light:"#c8ff66",dark:"rgba(5,1,9,.48)",
  floorAsset:atlas("poison"),wallAsset:atlas("poison"),atlasSplit:true,architecture:false,particle:"spore",minimapFloor:"#615b35",minimapWall:"#21152a",
  variants:["湿潤胞子床","菌糸回廊","猛毒繁殖区","瘴気心域","腐王の菌床"]
 }),
 storm:Object.freeze({
  id:"storm",name:"雷晶断層",accent:"#9e8cff",floor:"#26327726",wall:"#09071f50",line:"#8f9bff73",light:"#91d8ff",dark:"rgba(1,2,12,.47)",
  floorAsset:atlas("storm"),wallAsset:atlas("storm"),atlasSplit:true,architecture:false,particle:"spark",minimapFloor:"#4a548f",minimapWall:"#181a39",
  variants:["帯電石路","紫電亀裂帯","雷晶群生区","轟雷中枢","天雷核"]
 }),
 deepsea:Object.freeze({
  id:"deepsea",name:"深海沈殿宮",accent:"#52e1dc",floor:"#124a5124",wall:"#03171c50",line:"#58ddd66b",light:"#6af1e9",dark:"rgba(0,6,10,.47)",
  floorAsset:atlas("deepsea"),wallAsset:atlas("deepsea"),atlasSplit:true,architecture:false,particle:"bubble",minimapFloor:"#31777b",minimapWall:"#0d2c33",
  variants:["浅水回廊","藻生石路","水圧沈殿区","深海神殿","海淵最奥"]
 })
});

const THEME_BY_BIOME=Object.freeze({
 cave:"ruins",forest:"jungle",lava:"magma",ice:"ice",temple:"sacred",abyss:"void",
 fire:"magma",poison:"poison",lightning:"storm",earth:"ruins",wind:"jungle",light:"sacred",dark:"void",water:"deepsea"
});
const NETHER_SEQUENCE=Object.freeze(["poison","void","magma","poison"]);
const CHAOS_SEQUENCE=Object.freeze(["void","storm","magma","ice","poison"]);

function variantForFloor(floor,biome){
 const local=Math.max(0,Math.floor(Number(floor)||1)-Math.max(1,Number(biome?.from)||1));
 return Math.min(4,Math.floor(local/10));
}
function themeIdForFloor(floor,biome,variant){
 if(biome?.theme==="nether")return NETHER_SEQUENCE[Math.min(NETHER_SEQUENCE.length-1,variant)];
 if(biome?.theme==="chaos")return CHAOS_SEQUENCE[variant%CHAOS_SEQUENCE.length];
 return THEME_BY_BIOME[biome?.theme]??"ruins";
}
function ambienceSeed(id,variant,floor){
 const text=`${id}:${variant}:${Math.floor((Math.max(1,Number(floor)||1)-1)/10)}`;
 let seed=17;for(const char of text)seed=(seed*31+char.charCodeAt(0))%104729;return seed;
}

export function dungeonThemeForFloor(floor){
 const value=Math.max(1,Math.floor(Number(floor)||1)),biome=biomeForFloor(value),variant=variantForFloor(value,biome),id=themeIdForFloor(value,biome,variant),base=DUNGEON_THEMES[id]??DUNGEON_THEMES.ruins;
 return{...base,variant,variantName:base.variants[variant]??base.variants.at(-1),biomeId:biome.id,biomeName:biome.name,bandFrom:biome.from,bandTo:biome.to,ambienceSeed:ambienceSeed(id,variant,value),cropOffsetX:variant*137,cropOffsetY:variant*191};
}

export function dungeonThemeAssetPaths(){
 return[...new Set(Object.values(DUNGEON_THEMES).flatMap(theme=>[theme.floorAsset,theme.wallAsset]).map(value=>String(value).split("?")[0]))];
}
