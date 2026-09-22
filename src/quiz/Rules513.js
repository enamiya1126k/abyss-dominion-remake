import {freezeColors501,gameColors501} from '../party/GameColors501.js';
export const QUIZ513=Object.freeze({rounds:10,countdownMs:3000,questionMs:12000,lockMs:650,revealMs:4800,moveMs:280});
const copy=x=>JSON.parse(JSON.stringify(x));
const fail=s=>{throw Error(s)};
export const symbol513=side=>side==='o'?'〇':side==='x'?'×':'—';
export function seatPoint513(side,seat){return side==='o'?{x:17+(seat%2)*15,y:65+Math.floor(seat/2)*9}:side==='x'?{x:68+(seat%2)*15,y:65+Math.floor(seat/2)*9}:{x:20+seat*20,y:88}}
export function position513(p,at){const target=seatPoint513(p.side,p.seat),origin=p.origin??target,t=Math.max(0,Math.min(1,(at-(p.movedAt??0))/QUIZ513.moveMs)),f=1-(1-t)**3;return{x:origin.x+(target.x-origin.x)*f,y:origin.y+(target.y-origin.y)*f}}
function move(p,side,at){p.origin=position513(p,at);p.side=side;p.movedAt=at}
export function makeQuiz513({id,code,partyId,hostId,members,now=0}){return{id,code,partyId462:partyId,hostId,game:'quiz',rules513:1,phase:'lobby',phaseAt:now,createdAt:now,updatedAt:now,revision:0,members:members.map(m=>({...m,choice:m.choice??null})),players:[],round:0,history:[],results:null,nextAt:null}}
export function validDeck513(deck){return Array.isArray(deck)&&deck.length===10&&new Set(deck.map(q=>q.id)).size===10&&deck.every(q=>typeof q.id==='string'&&typeof q.text==='string'&&q.text.length>0&&q.text.length<=100&&typeof q.category==='string'&&typeof q.explanation==='string'&&typeof q.answer==='boolean'&&Number.isInteger(q.difficulty)&&q.difficulty>=1&&q.difficulty<=3)}
export function startQuiz513(g,at,deck,randomInt){
 if(g.phase!=='lobby'||!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))fail('全員の魔物を選んでね');
 if(!Number.isFinite(at)||!validDeck513(deck)||typeof randomInt!=='function')fail('問題の準備に失敗しました');
 g.deck513=copy(deck);g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false,alive:true,side:null,seq:0,correct:0,eliminatedRound:null}));
 const bots=[['ひらめきスライム','slime'],['直感ゴブリン','goblin'],['慎重オオカミ','wolf'],['迷い骨','skeleton']];
 while(g.players.length<4){const seat=g.players.length,[name,speciesId]=bots[seat];g.players.push({playerId:`AI-${g.id}-${seat}`,name,choice:{id:'ai-'+seat,speciesId},seat,ai:true,alive:true,side:null,seq:0,correct:0,eliminatedRound:null})}
 freezeColors501(g.players,g.members,g.aiColors500);
 // Private, precommitted AI knowledge/hesitation. Bots never adapt to a human's answer.
 g.botPlan513=deck.map(q=>g.players.map(p=>{const final=randomInt(100)<[0,85,73,61][q.difficulty]?q.answer:!q.answer,hesitate=randomInt(100)<32;return[{ms:2200+randomInt(4301),side:(hesitate?!final:final)?'o':'x'},...(hesitate?[{ms:8500+randomInt(2201),side:final?'o':'x'}]:[])]}));
 g.phase='countdown';g.phaseAt=at;g.deadline=at+QUIZ513.countdownMs;g.nextAt=g.deadline;g.updatedAt=at;g.revision++;return g;
}
function schedule(g){g.nextAt=Math.min(g.deadline,...g.players.filter(p=>p.ai&&p.alive).flatMap(p=>(g.botPlan513[g.round-1][p.seat]??[]).filter((_,i)=>i>=(p.botStep??0)).map(m=>g.phaseAt+m.ms)))}
function question(g,at){g.round++;g.phase='question';g.phaseAt=at;g.deadline=at+QUIZ513.questionMs;g.reveal=null;for(const p of g.players){if(p.alive)move(p,null,at);p.seq=0;p.botStep=0;p.lastInputAt=null}schedule(g)}
export function chooseQuiz513(g,id,side,round,seq,at){
 if(!['o','x'].includes(side)||!Number.isInteger(seq)||seq<1||seq>2048||!Number.isInteger(round)||!Number.isFinite(at))fail('〇か×を選んでね');
 const p=g.players.find(p=>p.playerId===id&&!p.ai);if(!p)fail('観戦中です');
 if(!p.alive)fail('脱落後は観戦になります');
 if(g.phase!=='question'||g.round!==round||at<g.phaseAt||at>=g.deadline)return false;
 if(seq<=p.seq||p.lastInputAt!=null&&at-p.lastInputAt<75)return false;
 p.seq=seq;p.lastInputAt=at;if(p.side!==side)move(p,side,at);g.updatedAt=at;g.revision++;return true;
}
function reveal(g,at){const q=g.deck513[g.round-1],answer=q.answer?'o':'x';g.phase='reveal';g.phaseAt=at;g.deadline=at+QUIZ513.revealMs;g.nextAt=g.deadline;const rows=g.players.map(p=>{const wasAlive=p.alive,correct=wasAlive&&p.side===answer;if(wasAlive){if(correct)p.correct++;else{p.alive=false;p.eliminatedRound=g.round}}return{playerId:p.playerId,seat:p.seat,side:p.side,wasAlive,correct}});g.reveal={round:g.round,id:q.id,category:q.category,text:q.text,answer,explanation:q.explanation,source:q.source??null,rows};g.history.push(copy(g.reveal))}
function finish(g,at){const alive=g.players.filter(p=>p.alive);g.phase='result';g.phaseAt=at;g.deadline=null;g.nextAt=null;g.outcome=alive.length===0?'all-out':alive.length===1?'last':'survived';g.results=g.players.map(p=>({playerId:p.playerId,seat:p.seat,rank:1+g.players.filter(o=>(o.alive?11:o.eliminatedRound)>(p.alive?11:p.eliminatedRound)).length,winner:p.alive,correct:p.correct,eliminatedRound:p.eliminatedRound})).sort((a,b)=>a.rank-b.rank);delete g.botPlan513;delete g.deck513}
export function advanceQuiz513(g,at){
 if(!Number.isFinite(at)||g.nextAt==null||at<g.nextAt)return false;
 // Advance from the actual server time: a resumed server still grants a full question.
 if(g.phase==='countdown')question(g,at);
 else if(g.phase==='question'){
  if(at>=g.deadline){g.phase='lock';g.phaseAt=at;g.deadline=at+QUIZ513.lockMs;g.nextAt=g.deadline}
  else{for(const p of g.players.filter(p=>p.ai&&p.alive)){const plan=g.botPlan513[g.round-1][p.seat];while((p.botStep??0)<plan.length&&g.phaseAt+plan[p.botStep??0].ms<=at){const choice=plan[p.botStep??0];move(p,choice.side,at);p.botStep=(p.botStep??0)+1}}schedule(g)}
 }else if(g.phase==='lock')reveal(g,at);
 else if(g.phase==='reveal'){if(g.players.filter(p=>p.alive).length<=1||g.round>=QUIZ513.rounds)finish(g,at);else question(g,at)}
 else return false;g.updatedAt=at;g.revision++;return true;
}
export function publicQuiz513(g,selfId,connected=()=>false){
 const q=g.phase==='question'||g.phase==='lock'?g.deck513?.[g.round-1]:null,colors=gameColors501(g.members,g.members);
 // Explicit allowlist: answers, future questions, bot knowledge, rosters stay on server.
 return{id:g.id,code:g.code,game:'quiz',rules513:1,partyId462:g.partyId462,hostId:g.hostId,phase:g.phase,phaseAt:g.phaseAt,deadline:g.deadline??null,revision:g.revision,round:g.round,outcome:g.outcome??null,members:g.members.map((m,i)=>({playerId:m.playerId,name:m.name,color499:colors[i].color499,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null,departed:!!m.departed,connected:!!connected(m.playerId)})),players:g.players.map(p=>({playerId:p.playerId,name:p.name,choice:{...p.choice},seat:p.seat,ai:p.ai,alive:p.alive,side:p.side,color499:p.color499,origin:p.origin?{...p.origin}:null,movedAt:p.movedAt??0,seq:p.playerId===selfId?p.seq:undefined,correct:p.correct,eliminatedRound:p.eliminatedRound,connected:p.ai||!!connected(p.playerId)})),question:q?{id:q.id,text:q.text,category:q.category}:null,reveal:g.phase==='reveal'?copy(g.reveal):null,history:g.phase==='result'?copy(g.history):[],results:g.phase==='result'?copy(g.results):null};
}
