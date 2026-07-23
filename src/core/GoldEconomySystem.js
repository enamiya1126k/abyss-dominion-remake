const MAX_FLOOR=10000;

export const GOLD_ECONOMY_RATES=Object.freeze({
 battleNormal:.03,
 battleBossFirst:.15,
 battleBossRepeat:.06,
 chest:.10,
 elite:.14,
 eventBreak:.15,
 eventSeal:.10,
 abyssKey:.04,
 teamBattleBase:.08,
 teamBattleStage:.008,
 teamBattleMax:.20,
 emergencyBattleBase:.22,
 emergencyBattlePower:.0018,
 emergencyBattleMax:.40
});

function safeFloor(value){
 return Math.max(1,Math.min(MAX_FLOOR,Math.floor(Number(value)||1)));
}

function roundedGold(value){
 const amount=Math.max(1,Math.min(Number.MAX_SAFE_INTEGER,Number(value)||1));
 const unit=amount>=1000000000?1000000:amount>=1000000?10000:amount>=10000?100:amount>=1000?10:1;
 return Math.max(unit,Math.round(amount/unit)*unit);
}

export function goldForClearedFloor(floor){
 const f=safeFloor(floor);
 const base=32+f*3;
 const depth=Math.pow(1+f/120,1.42);
 const milestone=1+Math.floor((f-1)/100)*.18;
 return Math.max(20,Math.round(base*depth*milestone));
}

export function battleGoldBase(floor,defeated,{firstBoss=false}={}){
 const enemies=(Array.isArray(defeated)?defeated:[defeated]).filter(Boolean);
 if(!enemies.length)return 0;
 const legacyMultiplier=enemies.some(enemy=>enemy.elite)?1.65:1;
 const legacy=Math.round(enemies.reduce((sum,enemy)=>{const level=Math.max(1,Number(enemy.level)||1);return sum+(enemy.boss?(firstBoss?80+level*14:28+level*7):16+level*5)},0)*legacyMultiplier);
 const rate=Math.min(.30,enemies.reduce((sum,enemy)=>sum+(enemy.boss?(firstBoss?GOLD_ECONOMY_RATES.battleBossFirst:GOLD_ECONOMY_RATES.battleBossRepeat):GOLD_ECONOMY_RATES.battleNormal),0));
 return Math.max(legacy,roundedGold(goldForClearedFloor(floor)*rate));
}

export function chestGoldBase(floor){
 const f=safeFloor(floor);
 return Math.max(80+f*12,roundedGold(goldForClearedFloor(f)*GOLD_ECONOMY_RATES.chest));
}

export function eliteGoldBase(floor,enemyLevel=1){
 const f=safeFloor(floor),depth=Math.max(1,Math.floor((f-1000)/100));
 const legacy=450+depth*80+Math.max(1,Number(enemyLevel)||1)*6;
 return Math.max(legacy,roundedGold(goldForClearedFloor(f)*GOLD_ECONOMY_RATES.elite));
}

export function secondWorldEventGoldBase(floor,type){
 const f=safeFloor(floor);
 const legacy=type==="seal"?900+Math.floor((f-1000)*1.2):650+Math.floor((f-1000)*1.5);
 const rate=type==="seal"?GOLD_ECONOMY_RATES.eventSeal:GOLD_ECONOMY_RATES.eventBreak;
 return Math.max(legacy,roundedGold(goldForClearedFloor(f)*rate));
}

export function abyssKeyGoldCost(floor){
 const f=Math.max(1001,safeFloor(floor));
 const legacy=Math.min(12000,1200+Math.floor((f-1000)*1.8));
 return Math.max(legacy,roundedGold(goldForClearedFloor(f)*GOLD_ECONOMY_RATES.abyssKey));
}

export function specialBattleGoldBase(floor,{type,won,stage=1,powerPercent=0}={}){
 if(!won)return 0;
 let rate=0;
 if(type==="team"){
  rate=Math.min(GOLD_ECONOMY_RATES.teamBattleMax,GOLD_ECONOMY_RATES.teamBattleBase+Math.max(1,Number(stage)||1)*GOLD_ECONOMY_RATES.teamBattleStage);
 }else if(type==="emergency"){
  rate=Math.min(GOLD_ECONOMY_RATES.emergencyBattleMax,GOLD_ECONOMY_RATES.emergencyBattleBase+Math.max(0,Math.min(100,Number(powerPercent)||0))*GOLD_ECONOMY_RATES.emergencyBattlePower);
 }
 return rate?roundedGold(goldForClearedFloor(floor)*rate):0;
}
