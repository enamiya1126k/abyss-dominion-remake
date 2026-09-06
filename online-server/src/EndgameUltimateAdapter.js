import {endgameCharacter} from '../../src/data/endgameCharacters.js';
import {ENDGAME_ULTIMATES,isEndgameUltimate,prepareUltimateBattle,beginUltimateAction,finishUltimateAction,chooseEndgameUltimate,castEndgameUltimate,beforeUltimateAction,afterUltimateOrdinary,endUltimateRound,cleanupUltimateBattle,drainUltimateEvents,ultimateExtraBlocked,ultimateBasicOnly,ultimateIsolated,ultimateUnits,ultimateUnitId,ultimateAvailability} from '../../src/core/EndgameUltimateSystem.js';
export {ultimateExtraBlocked,ultimateBasicOnly,ultimateIsolated,isEndgameUltimate,cleanupUltimateBattle,beginUltimateAction,finishUltimateAction};
export function prepareOnlineUltimates(b){
 for(const u of ultimateUnits(b)){const owner=u.endgameBossId??(ENDGAME_ULTIMATES[u.visualSpeciesId]?u.visualSpeciesId:null);if(owner)u.endgameBossId=owner;}
 if(!ultimateUnits(b).some(u=>ENDGAME_ULTIMATES[u.endgameBossId]))return b;
 return prepareUltimateBattle(b,{stats:u=>({...u.stats??u,hp:u.maxHp,mp:u.maxMp}),mp:u=>u.maxMp,skills:u=>u.skills??endgameCharacter(u.endgameBossId)?.skills??[],statusProfile:u=>u.statusProfile??endgameCharacter(u.endgameBossId)?.statusProfile});
}
export function flushOnlineUltimates(b,events){
 finishUltimateAction(b);
 for(const e of drainUltimateEvents(b)){
  const source=ultimateUnits(b).find(u=>ultimateUnitId(u)===e.actorId),target=ultimateUnits(b).find(u=>ultimateUnitId(u)===e.targetId);
  e.actorOwnerId=source?.ownerPlayerId??source?.playerId;e.targetKind=target?.playerId?'player':b.boss?(target===b.boss?'boss':'minion'):'enemy';
  if(e.kind==='damage'||e.kind==='ultimateDeath'){
   if(source?.metrics)source.metrics.damage=(source.metrics.damage??0)+e.value;
   if(target?.metrics)target.metrics.damageTaken=(target.metrics.damageTaken??0)+e.value;
   const contribution=b.contribution?.[e.actorOwnerId];if(contribution)contribution.damage=(contribution.damage??0)+e.value;
   if(target===b.boss&&b.progress){b.progress.hp=target.hp;b.progress.totalDamage=Math.min(b.progress.maxHp,(b.progress.totalDamage??0)+e.value)}
  }
  if(['heal','revive'].includes(e.kind)){if(source?.metrics)source.metrics.healing=(source.metrics.healing??0)+e.value;const contribution=b.contribution?.[e.actorOwnerId];if(contribution){contribution.healing=(contribution.healing??0)+e.value;if(e.kind==='revive')contribution.revives=(contribution.revives??0)+1}}
  events.push(e);
 }
}
export function onlineUltimateAuto(b,u,now){prepareOnlineUltimates(b);const skill=chooseEndgameUltimate(b,u,u.skills);return skill?{actorId:ultimateUnitId(u),kind:'skill',skillId:skill.id,auto:true,submittedAt:now}:null}
export function validateOnlineUltimate(b,u,id){prepareOnlineUltimates(b);if(!isEndgameUltimate(id))return null;const result=ultimateAvailability(b,u,id);return result.ok?null:{ok:false,code:'ULTIMATE_UNAVAILABLE',message:result.reason}}
export function resolveOnlineUltimateAction(b,u,action,events,run,{random=Math.random,extra=false}={}){
 if(!action||!u||Number(u.hp)<=0)return;prepareOnlineUltimates(b);
 if(isEndgameUltimate(action.skillId)&&(u.effects??[]).some(e=>(e.turns??1)>0&&['stun','status:stun','status:freeze','status:sleep','status:paralysis','status:charm','status:confusion'].includes(e.kind))){events.push({kind:'statusBlock',targetId:ultimateUnitId(u),label:'状態異常で行動できない'});return}
 if(extra&&ultimateExtraBlocked(b,u))return;
 if(!extra&&beforeUltimateAction(b,u,{random})){action.heroResolved348=true;flushOnlineUltimates(b,events);return}
 if(ultimateBasicOnly(b,u)){action={...action,kind:'attack',skillId:null}}
 if(ultimateIsolated(b,ultimateUnits(b).find(x=>ultimateUnitId(x)===(action.targetId??action.enemyTargetId)))){action={...action,targetId:null,enemyTargetId:null}}
 const skill=action.kind==='skill'?(u.skills??[]).find(s=>s.id===action.skillId):null;
 if(isEndgameUltimate(action.skillId)&&action.kind==='skill'){
  action.heroResolved348=true;if(!skill){events.push({kind:'statusBlock',targetId:ultimateUnitId(u),label:'未習得の切り札'});return}
  const result=castEndgameUltimate(b,u,action.skillId,{targetId:action.enemyTargetId??action.targetId,random});if(!result.ok)events.push({kind:'statusBlock',targetId:ultimateUnitId(u),label:result.reason});flushOnlineUltimates(b,events);return;
 }
 beginUltimateAction(b,u,skill);const result=run(action);
 if(!extra&&skill&&!action.heroResolved348)afterUltimateOrdinary(b,u,skill,{targetId:action.enemyTargetId??action.targetId,random});flushOnlineUltimates(b,events);return result;
}
export function resolveOnlineEnemyUltimate(b,u,events,random=Math.random){
 prepareOnlineUltimates(b);if((u.effects??[]).some(e=>(e.turns??1)>0&&['stun','status:stun','status:freeze','status:sleep','status:paralysis','status:charm','status:confusion'].includes(e.kind)))return false;if(beforeUltimateAction(b,u,{random})){flushOnlineUltimates(b,events);return true}
 const skill=chooseEndgameUltimate(b,u);if(skill){castEndgameUltimate(b,u,skill.id,{random});flushOnlineUltimates(b,events);return true}
 beginUltimateAction(b,u);return false;
}
export function endOnlineUltimateRound(b,events){prepareOnlineUltimates(b);finishUltimateAction(b);endUltimateRound(b);flushOnlineUltimates(b,events)}
export function onlineUltimateState(b){return{ultimates358:b.ultimates358??null,ultimateProfiles358:Object.fromEntries(ultimateUnits(b).map(u=>[ultimateUnitId(u),{stats:{hp:u.maxHp},maxMp:u.maxMp}]))}}

export function recordOnlineEnemyOrdinary(b,u,skill,events,random=Math.random){if(skill)afterUltimateOrdinary(b,u,skill,{random});flushOnlineUltimates(b,events)}
