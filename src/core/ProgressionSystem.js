import{PUBLIC_MAX_LEVEL,TRUE_MAX_LEVEL,ABYSS_UNLOCK_FLOOR}from"./config.js?v=2.11.24-build188";
export function visibleLevelCap(state){return state?.flags?.abyssUnlocked?TRUE_MAX_LEVEL:PUBLIC_MAX_LEVEL}
export function canUnlockAbyss(state){return(state?.player?.maxFloor??1)>=ABYSS_UNLOCK_FLOOR}
export function normalizeProgressionFlags(state){state.flags??={};state.flags.abyssUnlocked??=false;state.flags.trueLevelCapRevealed??=false;state.flags.deepAbyssUnlocked??=false;return state.flags}

// build164 balance axis
// 1Fにつき50体を倒す標準進行で、Nランク4体が1000F付近で
// Lv.1000へ到達するよう、必要EXPと敵EXPを同じ正本から算出する。
// Lv.1000以降は二次式をそのまま伸ばさず、Lv.10000まで約1階層
// 1レベルの手応えを維持する線形成長へ滑らかに接続する。
export function baseExperienceNeedForLevel(level){
 const value=Math.max(1,Math.min(TRUE_MAX_LEVEL,Math.floor(Number(level)||1)));
 if(value<=1000)return Math.max(25,Math.floor(50+value*18+value*value*.30));
 const at1000=50+1000*18+1000*1000*.30;
 return Math.max(25,Math.floor(at1000+(value-1000)*240));
}

export function enemyExperienceReward(level,{boss=false,firstBoss=true,rare=false}={}){
 const value=Math.max(1,Math.floor(Number(level)||1));
 const ordinary=Math.max(6,Math.round(12+value*4.25+value*value*.00013));
 if(rare)return Math.max(ordinary*8,Math.round(200+value*18));
 if(!boss)return ordinary;
 return Math.max(ordinary,Math.round(ordinary*(firstBoss?8:2.5)));
}

export function expectedNaturalExperienceAtFloor(floor,{encountersPerFloor=50}={}){
 const target=Math.max(1,Math.min(10000,Math.floor(Number(floor)||1)));
 const count=Math.max(1,Math.floor(Number(encountersPerFloor)||50));
 let total=0;
 for(let current=1;current<=target;current++){
  total+=enemyExperienceReward(current)*count;
  if(current%10===0)total+=enemyExperienceReward(current,{boss:true,firstBoss:true});
 }
 return total;
}
