import{calculatedStats,displayName}from"../models/Monster.js";

export function buildTurnQueue(battle){
 const entries=battle.party
  .filter(monster=>monster.currentHp>0)
  .map(monster=>({
   type:"ally",
   id:monster.id,
   name:displayName(monster),
   spd:calculatedStats(monster).spd??0,
   tie:Math.random()
  }));

 if(battle.enemy.hp>0){
  entries.push({
   type:"enemy",
   id:"enemy",
   name:battle.enemy.name,
   spd:battle.enemy.spd??0,
   tie:Math.random()
  });
 }

 entries.sort((a,b)=>b.spd-a.spd||b.tie-a.tie);
 battle.turnQueue=entries;
 battle.queueIndex=0;
 return entries;
}

export function currentTurnEntry(battle){
 return battle.turnQueue?.[battle.queueIndex]??null;
}

export function currentAlly(battle){
 const entry=currentTurnEntry(battle);
 if(entry?.type!=="ally")return null;
 return battle.party.find(monster=>monster.id===entry.id&&monster.currentHp>0)??null;
}

export function skipInvalidEntries(battle){
 while(battle.queueIndex<(battle.turnQueue?.length??0)){
  const entry=currentTurnEntry(battle);
  if(entry?.type==="enemy"&&battle.enemy.hp>0)return entry;
  if(entry?.type==="ally"&&battle.party.some(monster=>monster.id===entry.id&&monster.currentHp>0))return entry;
  battle.queueIndex++;
 }
 return null;
}

export function advanceQueue(battle){
 battle.queueIndex++;
 return skipInvalidEntries(battle);
}

export function queueFinished(battle){
 return battle.queueIndex>=(battle.turnQueue?.length??0);
}
