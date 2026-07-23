import{abyssKeyGoldCost}from"./GoldEconomySystem.js?v=1.0.0";

export const SECOND_WORLD_STORY_EVENTS=[
 {id:"arrival",floor:1001,title:"未知領域"},
 {id:"echo",floor:1010,title:"深淵の囁き"},
 {id:"rift",floor:1050,title:"空間の裂け目"}
];

const RANDOM_EVENTS=[
 {
  id:"abyss-altar",icon:"🜏",title:"深淵の祭壇",
  text:"黒紫の火を宿した祭壇が、脈打つように呼吸している。代償を捧げれば、力を返すらしい。",
  choices:[
   {id:"offer",label:"生命を捧げる",description:"生存中の仲間のHPを20%失い、魔晶石を得る"},
   {id:"pray",label:"静かに祈る",description:"パーティーのHP・MPを少し回復する"},
   {id:"leave",label:"触れずに去る",description:"何も起こらない"}
  ]
 },
 {
  id:"lost-merchant",icon:"👤",title:"顔のない商人",
  text:"外套の奥に顔はない。差し出された掌には、地上では見たことのない鍵が置かれている。",
  choices:[
   {id:"buy-key",label:"深淵の鍵を買う",description:"ゴールドを支払い、深淵の鍵を1個得る"},
   {id:"buy-rest",label:"黒い香を買う",description:"魔晶石を支払い、パーティーを完全回復する"},
   {id:"leave",label:"立ち去る",description:"取引しない"}
  ]
 },
 {
  id:"abyss-crystal",icon:"💠",title:"深淵結晶の群生",
  text:"岩壁を割って、紫紺の結晶が育っている。強い魔力を感じるが、周囲の空気は不自然に冷たい。",
  choices:[
   {id:"harvest",label:"慎重に採取する",description:"魔晶石を獲得する"},
   {id:"break",label:"まとめて砕く",description:"大量のゴールドを得るが、次の遭遇が早まる"},
   {id:"leave",label:"そのままにする",description:"何も起こらない"}
  ]
 },
 {
  id:"warped-rift",icon:"🌀",title:"歪んだ裂け目",
  text:"空間の裂け目から、こちらを見つめる気配がある。踏み込めば強敵と戦うことになる。",
  choices:[
   {id:"challenge",label:"裂け目へ踏み込む",description:"第二世界のエリート敵と戦う"},
   {id:"seal",label:"魔晶石で封じる",description:"魔晶石を消費し、ゴールドと深淵の鍵を得る"},
   {id:"leave",label:"距離を取る",description:"戦わずに去る"}
  ]
 }
];

function hashFloor(floor){let n=(Number(floor)||0)>>>0;n=Math.imul(n^0x9e3779b9,2654435761)>>>0;n^=n>>>16;return n>>>0}
export function eventsForFloor(floor){return SECOND_WORLD_STORY_EVENTS.filter(event=>event.floor===Number(floor))}
export function normalizeSecondWorldEvents(state){
 state.secondWorld??={};
 state.secondWorld.randomEvents??={};
 state.secondWorld.randomEvents.resolvedFloors=Array.isArray(state.secondWorld.randomEvents.resolvedFloors)?state.secondWorld.randomEvents.resolvedFloors:[];
 state.secondWorld.randomEvents.counts=state.secondWorld.randomEvents.counts&&typeof state.secondWorld.randomEvents.counts==="object"?state.secondWorld.randomEvents.counts:{};
 return state.secondWorld.randomEvents;
}
export function randomEventForFloor(state,floor){
 const f=Number(floor)||0,store=normalizeSecondWorldEvents(state);
 if(f<1002||f%10===0||store.resolvedFloors.includes(f))return null;
 const hash=hashFloor(f);
 if(hash%100>=28)return null;
 return{...RANDOM_EVENTS[hash%RANDOM_EVENTS.length],floor:f};
}
export function markRandomEventResolved(state,floor,eventId){
 const store=normalizeSecondWorldEvents(state),f=Number(floor)||0;
 if(!store.resolvedFloors.includes(f))store.resolvedFloors.push(f);
 store.counts[eventId]=(store.counts[eventId]??0)+1;
 store.lastResolved={floor:f,eventId,at:new Date().toISOString()};
 return store;
}
export function randomEventCosts(event,floor){
 const f=Math.max(1001,Number(floor)||1001);
 if(event.id==="lost-merchant")return{keyGold:abyssKeyGoldCost(f),restCrystals:5};
 if(event.id==="warped-rift")return{sealCrystals:3};
 return{};
}
