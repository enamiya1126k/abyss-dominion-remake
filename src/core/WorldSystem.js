import{WORLD_MAX_FLOOR}from"./EndgameSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";

export const WORLD_PRESENTATIONS={
 normal:{id:"normal",phase:0,name:"通常領域",subtitle:"地下世界",accent:"#b875d1",wall:"#21182a",floor:"#6a4a7f",background:"#120c18",musicProfile:"underworld"},
 unknown:{id:"unknown",phase:1,name:"未知領域",subtitle:"第二世界",accent:"#9f73ff",wall:"#160d23",floor:"#3b2754",background:"#07030d",musicProfile:"second-world"},
 abyss:{id:"abyss",phase:1,name:"深淵領域",subtitle:"第二世界",accent:"#8f4cff",wall:"#100817",floor:"#29143d",background:"#040107",musicProfile:"deep-abyss"},
 divine:{id:"divine",phase:1,name:"神域",subtitle:"第二世界",accent:"#e2c8ff",wall:"#171221",floor:"#514268",background:"#08060c",musicProfile:"divine"}
};

export function worldIdForFloor(floor){
 const f=Math.max(1,Math.min(WORLD_MAX_FLOOR,Number(floor)||1));
 if(f>=7001)return"divine";
 if(f>=3001)return"abyss";
 if(f>=1001)return"unknown";
 return"normal";
}
export function worldPresentationForFloor(floor){return WORLD_PRESENTATIONS[worldIdForFloor(floor)]}
export function shouldPlaySecondWorldIntro(state){return Number(state?.player?.currentFloor)>=1001&&!state?.flags?.secondWorldEntered}
export function markSecondWorldEntered(state){state.flags??={};state.flags.secondWorldEntered=true;state.flags.deepAbyssUnlocked=true;state.worldPhase=1;return state}
