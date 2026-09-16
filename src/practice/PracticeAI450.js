import {isEndgameUltimate} from '../data/endgameUltimates.js';
const actions=new Map();
export function registerDuelSkills450(enemy){for(const s of enemy.duel450.skills){const key=`practice450:${enemy.id}:${s.id}`;const heal=['selfHeal','allHeal'].includes(s.type),utility=heal||['buff','revive','cleanse','mpHeal'].includes(s.type);actions.set(key,{...s,label:s.name,multiplier:s.power??1,utility,heal:heal?(s.heal??s.power??.25):s.heal,revive:s.type==='revive'?(s.revive??s.power??.3):s.revive,pattern:s.allEnemies?'all':utility?'self':'singleWeak'});}}
export const duelActionInfo450=action=>actions.get(action)??null;
export function chooseDuelAction450(enemy,{allies=[],opponents=[],battle={}}={}){
 enemy.guard=false;
 const turn=battle.turn??1;enemy.duelReadyTurns450??={};const living=allies.filter(x=>x.hp>0),fallen=allies.some(x=>x.hp<=0),missing=Math.max(0,...living.map(x=>1-x.hp/x.maxHp));
 const candidates=enemy.duel450.skills.map(s=>{const action=`practice450:${enemy.id}:${s.id}`,info=actions.get(action);if(isEndgameUltimate(s)||!info||(enemy.duelReadyTurns450[s.id]??0)>turn||Number(s.mp??0)>enemy.currentMp)return null;
 let score=Number(s.power??1)*Math.max(1,Number(s.hits??1))*(s.allEnemies?opponents.filter(x=>x.currentHp>0).length:1);
 if(s.type==='revive')score=fallen?1000:-1;
 else if(['selfHeal','allHeal'].includes(s.type)){const hurt=s.type==='selfHeal'?1-enemy.hp/enemy.maxHp:missing;score=hurt>=.25?200+hurt*100:-1;}
 else if(s.type==='buff')score=(s.effects??[]).some(e=>!(battle.enemyEffects?.[enemy.id]??[]).some(v=>v.kind===e.kind&&v.turns>0))?70:-1;
 else if(s.type==='cleanse')score=(battle.enemyStatuses?.[enemy.id]??[]).length?100:-1;
 else if(s.type==='mpHeal')score=enemy.currentMp/enemy.maxMp<.4?90:-1;
 return{action,info,score};}).filter(x=>x&&x.score>=0).sort((a,b)=>b.score-a.score);
 const choice=candidates[0];if(!choice){enemy.intent=enemy.hp/enemy.maxHp<.25&&enemy.currentMp<enemy.maxMp*.15?'守りを固める':'弱点を狙う';return enemy.intent==='守りを固める'?'guard':'attack';}
 enemy.intent=choice.info.label;return choice.action;
}
export function commitDuelAction450(enemy,action,turn){const s=actions.get(action);if(s)enemy.duelReadyTurns450[s.id]=turn+Math.max(0,Number(s.cooldown)||0)+1;}
