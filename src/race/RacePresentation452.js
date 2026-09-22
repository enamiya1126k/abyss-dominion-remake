import{towerSignature517}from'../tower/Rules517.js';
import{quizSignature513}from'../quiz/Presentation513.js';
import{luckSignature507}from'../luck/Presentation507.js';
import{gorillaSignature506}from'../gorilla/Performance506.js';
import{canalSignature489}from'../canal/View489.js';
import{cabbageSignature484}from'../cabbage/View484.js';
import{frame456}from'./RaceVisual456.js';
import{raceProgress451,ticketWins451,RACE451}from'./RaceRules451.js';
export const CONDITIONS452=[
 {label:'落ち着かない',gesture:'そわそわ足踏み。周囲が気になるようだ。',motion:'restless',frameMs:160},
 {label:'やや重め',gesture:'体をゆっくり揺らしている。少し重そうだ。',motion:'heavy',frameMs:650},
 {label:'平常',gesture:'落ち着いた足取り。いつもどおりの様子。',motion:'calm',frameMs:340},
 {label:'好調',gesture:'軽やかな足取り。やる気が伝わってくる！',motion:'bright',frameMs:230},
 {label:'絶好調',gesture:'待ちきれずに跳ねている！気合い十分！',motion:'spark',frameMs:160}
];
export const LANE_COLORS452=['#f2e8cb','#a9a0c6','#ef8196','#7aaff5','#ecc358','#87d5a8','#dc9b62','#d995df'];
export const RESULT_TIMING452={podium:[0,450,850],rows:1400,rowGap:850,countMs:720,complete:4670};
export function condition452(n){return CONDITIONS452[Math.max(0,Math.min(4,Math.floor(Number(n)||0)))]}
export function paradeIndex452(room,at,pinned=null){return Number.isInteger(pinned)&&pinned>=0&&pinned<8?pinned:Math.floor(Math.max(0,at-room.phaseAt)/(room.rulesVersion>=4?8000:2000))%8}
export function raceFrame452(room,at){
 if(room.rulesVersion>=4)return frame456(room,at);
 const elapsed=Math.max(0,at-room.startAt),positions=(room.racers??[]).map((r,i)=>({i,p:raceProgress451(r,elapsed,room.finishMs?.[i]??Infinity),finished:elapsed>=(room.finishMs?.[i]??Infinity)})).sort((a,b)=>b.p-a.p||((room.finishMs?.[a.i]??Infinity)-(room.finishMs?.[b.i]??Infinity)||a.i-b.i));
 const finished=positions.filter(p=>p.finished),leader=positions[0],late=elapsed>=14500,close=late&&finished.length===0&&positions.length>1&&leader.p-positions[1].p<.04;
 return{elapsed,positions,finished,leader,late,close,allFinished:finished.length===8,section:finished.length===8?'finish':late?'spurt':elapsed<1400?'start':elapsed<7000?'opening':'middle'};
}
export function ticketState452(ticket,frame){if(!ticket)return{state:'pass',label:'応援中'};if(frame.finished.length===8)return{state:'pending',label:'確定待ち'};const provisional=ticketWins451(ticket,frame.positions.map(p=>p.i));return{state:provisional?'contender':'chasing',label:provisional?'予想圏内':'追い上げ待ち'}}
export function commentary452(room,frame,previousLead=null){if(frame.allFinished)return'全8匹がゴール！着順を確定しています';if(frame.finished.length)return`${frame.finished[0].i+1}番が先頭で入線！`;if(frame.elapsed<1400)return'ゲート開放！一斉にスタート！';if(frame.close)return'ゴール前、接戦！最後まで目が離せない！';const lead=frame.leader.i,r=room.racers[lead];if(previousLead!==null&&previousLead!==lead)return`${lead+1}番 ${r.name}、先頭に立った！`;if(frame.late){const p=frame.positions.find(x=>['差し','追込'].includes(room.racers[x.i].profile.style)&&!x.finished);return p?`${p.i+1}番 ${room.racers[p.i].name}、最後の追い込み！`:room.rulesVersion>=7&&room.track459?.shape==='oval'?'終盤戦！ゴールまで駆け抜けろ！':'最後の直線！ゴールまで駆け抜けろ！'}return`${lead+1}番 ${r.name}が先導。ここからどう動く？`}
export function resultElapsed452(room,at,presentation,reduced=false){if(reduced||presentation.skip)return RESULT_TIMING452.complete+1000;return Math.max(0,at-(presentation.replayAt??room.phaseAt))}
export function revealValue452(value,elapsed,index){const start=RESULT_TIMING452.rows+index*RESULT_TIMING452.rowGap,t=Math.max(0,Math.min(1,(elapsed-start)/RESULT_TIMING452.countMs));return Math.round(value*(1-(1-t)**3))||0}
export function raceDomSignature452(client){const source=client.state?.room,room=source?.rulesVersion>=4?{...source,live456:null,finishMs:source.phase==='result'?source.finishMs:null}:source;return JSON.stringify({room,tower:towerSignature517(client.state?.tower),quiz:quizSignature513(client.state?.quiz),luck:luckSignature507(client.state?.luck),gorilla:gorillaSignature506(client.state?.gorilla),canal:canalSignature489(client),cabbage:cabbageSignature484(client),sugoroku:client.state?.sugoroku,party:(client.state?.tower&&!['lobby','result'].includes(client.state.tower.phase)||client.state?.quiz&&!['lobby','result'].includes(client.state.quiz.phase)||client.state?.luck&&!['lobby','result'].includes(client.state.luck.phase))?{...client.state?.party,phase:'play'}:client.state?.party,available:client.state?.available,fatigue455:client.state?.fatigue455,rulesVersion:client.state?.rulesVersion,connected:client.connected(),gold:client.save.state.player.gold,crystals474:client.save.state.player.crystals,crystalPending474:client.key?.()?client.save.state.sugoroku474?.accounts?.[client.key()]?.pending:null,pending:client.bank()?.pending,resultPending490:client.resultPending490,dismissedResult490:client.dismissedResult490,error:client.error,rewardError:client.rewardError})}
export function presentation452(client){const id=client.state?.room?.id??'';if(client.presentation452?.id!==id)client.presentation452={id,seen:new Set(),lead:null,announcementAt:0,announcement:'',skip:false,replayAt:null,dom:null};return client.presentation452}
export function once452(p,key,callback){if(p.seen.has(key))return false;p.seen.add(key);callback();return true}
export function ownerName452(room,racer){if(!racer.ownerId)return'システム出走';return room.members.find(m=>m.playerId===racer.ownerId)?.name??'参加者'}
