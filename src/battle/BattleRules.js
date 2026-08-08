import{isPersistentStatus,normalizePersistentAilments}from"../data/statusEffects.js?v=1.8.0-gdd-v1";
import{endgameCharacter}from"../data/endgameCharacters.js?v=2.0.0-release";

const CONTROL_STATUS_IDS=new Set(["sleep","paralysis","freeze","charm","confusion","fear"]);
function statusProfileFor(target){return target?.statusProfile??endgameCharacter(target?.endgameBossId)?.statusProfile??null}
function statusResistance(target,statusId,base=0){const profile=statusProfileFor(target);if(profile?.immune?.includes(statusId))return 1;let value=Math.max(0,Number(base)||0);if(profile?.resistant?.includes(statusId))value+=.55;if(profile?.weak?.includes(statusId))value-=.3;if(profile?.variable)value+=(Math.sin((Number(target?.level)||1)+String(statusId).length)+1)*.15;return Math.max(0,Math.min(.95,value))}
function upsertControlSkip(battle,targetId,statusId,turns,targetType){if(!CONTROL_STATUS_IDS.has(statusId))return;const list=targetType==="enemy"?enemyEffectsFor(battle,targetId):allyEffectsFor(battle,targetId),existing=list.find(effect=>effect.kind==="stun"&&effect.sourceStatusId===statusId);if(existing)existing.turns=Math.max(existing.turns,turns??1);else list.push({kind:"stun",statusId,sourceStatusId:statusId,turns:turns??1})}

export function createBattleRulesState(party){
 return{
  cooldowns:Object.fromEntries(party.map(m=>[m.id,{}])),
  enemyStatuses:{},
  allyAilments:Object.fromEntries(party.map(m=>[m.id,normalizePersistentAilments(m.ailments)])),
  allyEffects:{},enemyEffects:{},log:["戦闘開始"],lastStatusTurn:0
 }
}
export function cooldownRemaining(battle,monsterId,skillId){return battle.cooldowns?.[monsterId]?.[skillId]??0}
export function setSkillCooldown(battle,monsterId,skill){if(!skill?.cooldown)return;battle.cooldowns[monsterId]??={};battle.cooldowns[monsterId][skill.id]=skill.cooldown+1}
export function tickCooldowns(battle){Object.values(battle.cooldowns??{}).forEach(map=>Object.keys(map).forEach(id=>{map[id]=Math.max(0,map[id]-1);if(map[id]===0)delete map[id]}))}
export function addBattleLog(battle,text){battle.log??=[];battle.log.unshift(text);battle.log=battle.log.slice(0,6)}
export function enemyStatusesFor(battle,enemyId){battle.enemyStatuses??={};if(Array.isArray(battle.enemyStatuses))battle.enemyStatuses={};battle.enemyStatuses[enemyId]??=[];return battle.enemyStatuses[enemyId]}
export function applyEnemyStatus(battle,status,enemyId=battle.targetEnemyId){if(!status||!enemyId)return false;const enemy=(battle.enemies??[battle.enemy]).filter(Boolean).find(entry=>entry.id===enemyId),resistance=statusResistance(enemy,status.id,enemy?.bossStatusResist);if(resistance>=1||resistance&&Math.random()<resistance)return false;const statuses=enemyStatusesFor(battle,enemyId),existing=statuses.find(s=>s.id===status.id);if(existing){existing.turns=Math.max(existing.turns,status.turns);existing.power=Math.max(existing.power,status.power)}else statuses.push({...status});upsertControlSkip(battle,enemyId,status.id,status.turns,"enemy");return true}
export function processEnemyStatuses(battle){const results=[];(battle.enemies??[battle.enemy]).filter(Boolean).forEach(enemy=>{const statuses=enemyStatusesFor(battle,enemy.id);battle.enemyStatuses[enemy.id]=statuses.filter(status=>{let damage=0;if(["poison","burn","bleed"].includes(status.id))damage=Math.max(1,Math.floor(enemy.maxHp*status.power));if(damage){const beforeHp=enemy.hp;enemy.hp=Math.max(0,enemy.hp-damage);results.push({enemy,id:status.id,name:status.name,damage,beforeHp,sourceMonsterId:status.sourceMonsterId??null})}status.turns--;return status.turns>0&&enemy.hp>0})});return results}
export function statusLabel(status){const turns=Math.max(0,Number(status?.turns)||0);return turns?`${status.name} ${turns}T`:String(status?.name??status?.id??"")}
function effectMap(battle,key,id){battle[key]??={};battle[key][id]??=[];return battle[key][id]}
export function allyEffectsFor(battle,id){return effectMap(battle,"allyEffects",id)}
export function allyAilmentsFor(battle,id){battle.allyAilments??={};battle.allyAilments[id]=normalizePersistentAilments(battle.allyAilments[id]);return battle.allyAilments[id]}
export function enemyEffectsFor(battle,id){return effectMap(battle,"enemyEffects",id)}
export function applyPersistentAilment(battle,targetId,ailment){
 const target=(battle.party??[]).find(entry=>entry.id===targetId),id=ailment?.id??ailment?.kind;
 if(!target||!isPersistentStatus(id))return false;
 const resistance=statusResistance(target,id,(Number(target?._equipmentAffixes?.statusResistance)||0)/100),chance=ailment.chance==null?1:Math.max(0,Math.min(1,Number(ailment.chance)||0));
 if(Math.random()>=chance*(1-resistance))return false;
 const list=allyAilmentsFor(battle,targetId),normalized=normalizePersistentAilments({...ailment,id})[0];if(!normalized)return false;
 const existing=list.find(entry=>entry.id===normalized.id);
 if(existing){existing.power=Math.max(Number(existing.power)||0,Number(normalized.power)||0)||undefined;existing.captureBonus=Math.max(Number(existing.captureBonus)||0,Number(normalized.captureBonus)||0)||undefined}
 else list.push(normalized);
 upsertControlSkip(battle,targetId,id,ailment.turns,"ally");
 syncPersistentAilments(battle,targetId);return true
}
export function syncPersistentAilments(battle,targetId=null){
 for(const monster of battle?.party??[]){
  if(targetId&&monster.id!==targetId)continue;
  monster.ailments=normalizePersistentAilments(battle.allyAilments?.[monster.id]??monster.ailments);
  monster.statuses=[];monster.status=null;
 }
}
export function clearPersistentAilments(battle,targetId){battle.allyAilments??={};battle.allyAilments[targetId]=[];battle.allyEffects??={};battle.allyEffects[targetId]=(battle.allyEffects[targetId]??[]).filter(effect=>!effect.sourceStatusId);syncPersistentAilments(battle,targetId)}
export function applyBattleEffect(battle,targetId,effect,targetType="ally"){
 if(!effect||!targetId)return false;
 const persistentId=effect.id??effect.kind;
 if(targetType==="ally"&&isPersistentStatus(persistentId))return applyPersistentAilment(battle,targetId,{...effect,id:persistentId});
 const target=targetType==="enemy"?(battle.enemies??[battle.enemy]).filter(Boolean).find(entry=>entry.id===targetId):(battle.party??[]).find(entry=>entry.id===targetId);
 const statusId=effect.statusId??effect.id??effect.kind,resistance=targetType==="enemy"?statusResistance(target,statusId,target?.bossStatusResist):statusResistance(target,statusId,(Number(target?._equipmentAffixes?.statusResistance)||0)/100);
 const chance=effect.chance==null?1:Math.max(0,Math.min(1,Number(effect.chance)||0));
 if((effect.chance!=null||["stun","spdDown","atkDown","defDown"].includes(effect.kind))&&Math.random()>=chance*(1-resistance))return false;
 const list=targetType==="enemy"?enemyEffectsFor(battle,targetId):allyEffectsFor(battle,targetId),existing=list.find(e=>e.kind===effect.kind);if(existing){existing.turns=Math.max(existing.turns,effect.turns??1);existing.value=Math.max(existing.value??0,effect.value??0)}else list.push({...effect,turns:effect.turns??1});return true
}
export function effectValue(battle,targetId,kind,targetType="ally"){const list=targetType==="enemy"?enemyEffectsFor(battle,targetId):allyEffectsFor(battle,targetId);return list.filter(e=>e.kind===kind).reduce((m,e)=>Math.max(m,e.value??1),0)}
export function hasEffect(battle,targetId,kind,targetType="ally"){const effects=targetType==="enemy"?enemyEffectsFor(battle,targetId):allyEffectsFor(battle,targetId);return effects.some(e=>e.kind===kind)||(targetType==="ally"&&allyAilmentsFor(battle,targetId).some(e=>e.id===kind||e.kind===kind))}
export function clearNegativeAllyEffects(battle,id){battle.allyEffects??={};battle.allyEffects[id]=(battle.allyEffects[id]??[]).filter(e=>!["atkDown","defDown","spdDown","poison","burn","stun","vulnerable"].includes(e.kind))}
export function tickBattleEffects(battle){for(const key of["allyEffects","enemyEffects"]){for(const[id,list]of Object.entries(battle[key]??{}))battle[key][id]=list.filter(e=>{e.turns--;return e.turns>0})}}
export function processAllyEffects(battle,statsFor){const results=[];for(const m of battle.party??[]){if(m.currentHp<=0)continue;const effects=allyEffectsFor(battle,m.id),ailments=allyAilmentsFor(battle,m.id),max=statsFor(m).hp;for(const e of effects){if(e.kind==="regen"){const amount=Math.max(1,Math.floor(max*(e.value??.1))),before=m.currentHp;m.currentHp=Math.min(max,m.currentHp+amount);results.push({monster:m,kind:"heal",amount:m.currentHp-before})}}for(const e of ailments){if(!["poison","burn","bleed"].includes(e.id)||!(Number(e.power)>0))continue;const abyssTaken=Math.max(0,1+(Number(m._abyssSkillEffects?.partyDamageTakenRate)||0)),equipmentTaken=1-Math.max(0,Math.min(.75,(Number(m._equipmentAffixes?.damageReduction)||0)/100)),amount=Math.max(1,Math.floor(max*Number(e.power)*abyssTaken*equipmentTaken));m.currentHp=Math.max(0,m.currentHp-amount);results.push({monster:m,kind:e.id,amount})}}syncPersistentAilments(battle);return results}
