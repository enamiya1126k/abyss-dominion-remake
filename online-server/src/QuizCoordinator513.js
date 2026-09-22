import {randomBytes,randomInt} from 'node:crypto';
import {makeQuiz513,startQuiz513,chooseQuiz513,moveQuiz514,advanceQuiz513} from '../../src/quiz/Rules513.js';
import {drawQuestions516,RECENT_QUESTION_LIMIT516} from './quiz/Questions516.js';
export const quizFor513=(c,id)=>Object.values(c.data.quizRooms513??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
export function createQuiz513(c,p,members){return makeQuiz513({id:`q513-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
export function handleQuiz513(c,session,m){
 if(m.op!=='quiz513')return false;const g=quizFor513(c,session.playerId),p=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);
 if(!g||!p||!me||m.gameId!==g.id)throw Error('ゲームが切り替わりました');
 if(m.quizVersion514!==1)throw Error('〇×サバイバルには本体のBuild514更新が必要です');
 if(m.kind==='select'){
  if(g.phase!=='lobby')throw Error('開始後は魔物を変更できません');const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している魔物を選んでね');me.choice={...choice};p.members.find(x=>x.playerId===session.playerId).ready=false;g.updatedAt=c.now();g.revision++;
 }else if(m.kind==='start'){
  if(p.hostId!==session.playerId)throw Error('部屋主が開始できます');if(g.phase!=='lobby')return true;
  if(p.members.some(x=>x.quizVersion514!==1))throw Error('全員がBuild514へ更新してから開始してください');
  if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が魔物を選んで「準備OK」を押してください');
  if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');
  g.aiColors500={...(p.aiColors500??{})};startQuiz513(g,c.now(),drawQuestions516(randomInt,p.recentQuestionIds513??[]),randomInt);
 }else if(m.kind==='move')moveQuiz514(g,session.playerId,m.target,m.round,m.seq,c.now());
 else if(m.kind==='answer')chooseQuiz513(g,session.playerId,m.side,m.round,m.seq,c.now());
 else throw Error('未対応の操作です');return true;
}
export function advanceQuizzes513(c){const at=c.now();for(const g of Object.values(c.data.quizRooms513??{})){
 if(g.rules514!==1){c.transaction(()=>{g.rules514=1;if(g.phase!=='result'){g.phase='lobby';g.players=[];g.round=0;g.nextAt=null;g.deadline=null;g.history=[];g.results=null;g.reveal=null;delete g.deck513;delete g.botPlan513;const p=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462);p?.members.forEach(m=>m.ready=false)}g.updatedAt=at;g.revision++});c.broadcast();continue}
 if(!['lobby','result'].includes(g.phase)&&Number.isFinite(g.nextAt)&&at>=g.nextAt){c.transaction(()=>{advanceQuiz513(g,at);if(g.phase==='reveal'){const p=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462);if(p)p.recentQuestionIds513=[...(p.recentQuestionIds513??[]).filter(id=>id!==g.reveal.id),g.reveal.id].slice(-RECENT_QUESTION_LIMIT516)}});c.broadcast()}
 else if(['lobby','result'].includes(g.phase)&&at-g.updatedAt>86400000&&!g.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete c.data.quizRooms513[g.code];const p=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false)}});c.broadcast()}
}}
