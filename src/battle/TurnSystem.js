import{calculatedStats,displayName}from"../models/Monster.js?v=0.9.2-alpha.2";

export function aliveEnemies(battle){return (battle.enemies??[battle.enemy]).filter(Boolean).filter(enemy=>enemy.hp>0)}
export function selectedEnemy(battle){const alive=aliveEnemies(battle);let target=alive.find(e=>e.id===battle.targetEnemyId);if(!target){target=alive[0]??null;battle.targetEnemyId=target?.id??null}return target}
export function buildTurnQueue(battle){
 const entries=battle.party.filter(monster=>monster.currentHp>0).map(monster=>({type:"ally",id:monster.id,name:displayName(monster),spd:calculatedStats(monster).spd??0,tie:Math.random()}));
 aliveEnemies(battle).forEach(enemy=>entries.push({type:"enemy",id:enemy.id,name:enemy.name,spd:enemy.spd??0,tie:Math.random()}));
 entries.sort((a,b)=>b.spd-a.spd||b.tie-a.tie);battle.turnQueue=entries;battle.queueIndex=0;return entries
}
export function currentTurnEntry(battle){return battle.turnQueue?.[battle.queueIndex]??null}
export function currentAlly(battle){const entry=currentTurnEntry(battle);if(entry?.type!=="ally")return null;return battle.party.find(monster=>monster.id===entry.id&&monster.currentHp>0)??null}
export function currentEnemy(battle){const entry=currentTurnEntry(battle);if(entry?.type!=="enemy")return null;return aliveEnemies(battle).find(enemy=>enemy.id===entry.id)??null}
export function skipInvalidEntries(battle){while(battle.queueIndex<(battle.turnQueue?.length??0)){const entry=currentTurnEntry(battle);if(entry?.type==="enemy"&&aliveEnemies(battle).some(e=>e.id===entry.id))return entry;if(entry?.type==="ally"&&battle.party.some(m=>m.id===entry.id&&m.currentHp>0))return entry;battle.queueIndex++}return null}
export function advanceQueue(battle){battle.queueIndex++;return skipInvalidEntries(battle)}
export function queueFinished(battle){return battle.queueIndex>=(battle.turnQueue?.length??0)}
