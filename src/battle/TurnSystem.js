import{calculatedStats,displayName}from"../models/Monster.js?v=1.6.0";

export function aliveEnemies(battle){return (battle.enemies??[battle.enemy]).filter(Boolean).filter(enemy=>enemy.hp>0)}
export function selectedEnemy(battle){const alive=aliveEnemies(battle);let target=alive.find(e=>e.id===battle.targetEnemyId);if(!target){target=alive[0]??null;battle.targetEnemyId=target?.id??null}return target}
function effectsFor(battle,type,id){return(type==="enemy"?battle.enemyEffects:battle.allyEffects)?.[id]??[]}
function effectAmount(battle,type,id,kind){return effectsFor(battle,type,id).filter(effect=>effect.kind===kind).reduce((value,effect)=>Math.max(value,Number(effect.value??1)||0),0)}
function stunned(battle,type,id){return effectsFor(battle,type,id).some(effect=>effect.kind==="stun")}
export function buildTurnQueue(battle){
 const entries=battle.party.filter(monster=>monster.currentHp>0&&!stunned(battle,"ally",monster.id)).map(monster=>{const base=calculatedStats(monster).spd??0,rate=Math.max(.2,1+effectAmount(battle,"ally",monster.id,"spdUp")-effectAmount(battle,"ally",monster.id,"spdDown")),priority=battle.turn<=1&&Number(monster._seriesEffects?.firstStrike)>0?1:0;return{type:"ally",id:monster.id,name:displayName(monster),spd:Math.max(0,base*rate),priority,tie:Math.random()}});
 aliveEnemies(battle).filter(enemy=>!stunned(battle,"enemy",enemy.id)).forEach(enemy=>{const rate=Math.max(.2,1-effectAmount(battle,"enemy",enemy.id,"spdDown"));entries.push({type:"enemy",id:enemy.id,name:enemy.name,spd:Math.max(0,(enemy.spd??0)*rate),priority:0,tie:Math.random()})});
 entries.sort((a,b)=>(b.priority??0)-(a.priority??0)||b.spd-a.spd||b.tie-a.tie);battle.turnQueue=entries;battle.queueIndex=0;return entries
}
export function currentTurnEntry(battle){return battle.turnQueue?.[battle.queueIndex]??null}
export function currentAlly(battle){const entry=currentTurnEntry(battle);if(entry?.type!=="ally")return null;return battle.party.find(monster=>monster.id===entry.id&&monster.currentHp>0)??null}
export function currentEnemy(battle){const entry=currentTurnEntry(battle);if(entry?.type!=="enemy")return null;return aliveEnemies(battle).find(enemy=>enemy.id===entry.id)??null}
export function skipInvalidEntries(battle){while(battle.queueIndex<(battle.turnQueue?.length??0)){const entry=currentTurnEntry(battle);if(entry?.type==="enemy"&&aliveEnemies(battle).some(e=>e.id===entry.id)&&!stunned(battle,"enemy",entry.id))return entry;if(entry?.type==="ally"&&battle.party.some(m=>m.id===entry.id&&m.currentHp>0)&&!stunned(battle,"ally",entry.id))return entry;battle.queueIndex++}return null}
export function advanceQueue(battle){battle.queueIndex++;return skipInvalidEntries(battle)}
export function queueFinished(battle){return battle.queueIndex>=(battle.turnQueue?.length??0)}
