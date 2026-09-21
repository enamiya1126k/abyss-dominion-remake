import{freezeColors501}from'../party/GameColors501.js';
export const LUCK507=Object.freeze({rounds:8,boxes:3,countdownMs:3500,chooseMs:12000,minChooseMs:2000,revealMs:1800,runMs:3800,settleMs:1400});
export const ITEMS507=Object.freeze([
 {id:'walk',name:'おさんぽ',weight:20,delta:12,tile:7},
 {id:'dash',name:'ダッシュ',weight:22,delta:26,tile:7},
 {id:'spring',name:'ばねジャンプ',weight:18,delta:42,tile:6},
 {id:'rocket',name:'ロケット',weight:14,delta:65,tile:3},
 {id:'banana',name:'バナナ',weight:14,delta:-16,tile:4},
 {id:'pit',name:'落とし穴',weight:8,delta:0,tile:5},
 {id:'meteor',name:'流星ロケット',weight:4,delta:100,tile:8}
].map(Object.freeze));
const fail=s=>{throw Error(s)};
const copy=x=>JSON.parse(JSON.stringify(x));
export function item507(roll){if(!Number.isInteger(roll)||roll<0||roll>99)fail('抽選情報が不正です');let n=roll;return ITEMS507.find(x=>(n-=x.weight)<0)}
// Server supplies a cryptographic randomInt. The complete sealed draw survives restarts.
export function drawPlan507(randomInt){return Array.from({length:8},()=>Array.from({length:4},()=>({boxes:Array.from({length:3},()=>randomInt(100)),auto:randomInt(3),wait:1300+randomInt(1801)})))}
export function makeLuck507({id,code,partyId,hostId,members,now=0}){return{id,code,game:'luck',rules507:1,partyId462:partyId,hostId,phase:'lobby',phaseAt:now,createdAt:now,updatedAt:now,revision:0,members:members.map(m=>({...m,choice:m.choice??null})),players:[],round:0,scaleMax:80,event:null,history:[],results:null,nextAt:null}}
export function startLuck507(g,at,plan){
 if(g.phase!=='lobby'||!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))fail('全員の魔物を選んでください');
 if(!Number.isFinite(at)||!Array.isArray(plan)||plan.length!==8||plan.some(r=>!Array.isArray(r)||r.length!==4||r.some(p=>!Array.isArray(p.boxes)||p.boxes.length!==3||p.boxes.some(n=>!Number.isInteger(n)||n<0||n>=100)||!Number.isInteger(p.auto)||p.auto<0||p.auto>2||!Number.isInteger(p.wait)||p.wait<1300||p.wait>3100)))fail('抽選情報が不正です');
 g.plan507=copy(plan);g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false,distance:0,autoRounds:0}));
 const bots=[['ころころスライム','slime'],['一発屋ゴブリン','goblin'],['追い風オオカミ','wolf'],['骨までラッキー','skeleton']];
 while(g.players.length<4){const seat=g.players.length,[name,speciesId]=bots[seat];g.players.push({playerId:`AI-${g.id}-${seat}`,name,choice:{id:'ai-'+seat,speciesId},seat,ai:true,distance:0,autoRounds:0})}
 freezeColors501(g.players,g.members,g.aiColors500);g.phase='countdown';g.phaseAt=at;g.startAt=at+LUCK507.countdownMs;g.nextAt=g.startAt;g.round=1;g.choices507=[null,null,null,null];g.updatedAt=at;g.revision++;return g;
}
function schedule(g){const ai=g.players.filter(p=>p.ai&&g.choices507[p.seat]===null).map(p=>g.phaseAt+g.plan507[g.round-1][p.seat].wait);g.nextAt=g.choices507.every(x=>x!==null)?Math.max(g.phaseAt+LUCK507.minChooseMs,g.lastChoiceAt??g.phaseAt):Math.min(g.deadline,...ai)}
function choosePhase(g,at){g.phase='choose';g.phaseAt=at;g.deadline=at+LUCK507.chooseMs;g.choices507=[null,null,null,null];g.auto507=[false,false,false,false];g.lastChoiceAt=at;g.event=null;schedule(g)}
export function chooseLuck507(g,id,box,round,at){
 if(!Number.isInteger(box)||box<0||box>2||!Number.isInteger(round)||round<1||round>8||!Number.isFinite(at))fail('箱を1つ選んでください');
 const p=g.players.find(p=>p.playerId===id&&!p.ai);if(!p)fail('このレースには観戦で参加しています');
 // Retries can acknowledge an accepted choice, but can never change or reroll it.
 const prior=g.history.find(e=>e.round===round)?.rows.find(r=>r.playerId===id);
 if(prior?.box===box)return false;
 if(g.round===round&&g.choices507?.[p.seat]===box)return false;
 if(g.phase!=='choose'||round!==g.round||at<g.phaseAt||at>=g.deadline)fail('このラウンドの受付は終了しました');
 if(g.choices507[p.seat]!==null)fail('選んだ箱は変更できません');
 g.choices507[p.seat]=box;g.lastChoiceAt=at;schedule(g);g.updatedAt=at;g.revision++;return true;
}
export function ranks507(players){return players.map(p=>({playerId:p.playerId,distance:p.distance,rank:1+players.filter(o=>o.distance>p.distance).length})).sort((a,b)=>a.rank-b.rank)}
function reveal(g,at){
 const leader=Math.max(...g.players.map(p=>p.distance)),before=ranks507(g.players);
 const rows=g.players.map(p=>{const box=g.choices507[p.seat],item=item507(g.plan507[g.round-1][p.seat].boxes[box]),gap=leader-p.distance,bonus=item.id==='rocket'?Math.min(45,Math.floor(gap*.6)):item.id==='meteor'?Math.min(60,Math.floor(gap*.8)):0,to=Math.max(0,p.distance+item.delta+bonus);return{playerId:p.playerId,seat:p.seat,box,item:item.id,from:p.distance,to,delta:to-p.distance,automatic:g.auto507[p.seat],beforeRank:before.find(x=>x.playerId===p.playerId).rank}});
 const after=ranks507(rows.map(r=>({playerId:r.playerId,distance:r.to})));for(const r of rows)r.afterRank=after.find(x=>x.playerId===r.playerId).rank;
 g.event={round:g.round,at,fromMax:g.scaleMax,toMax:Math.max(80,Math.ceil((Math.max(...rows.map(r=>r.to))+20)/20)*20),rows};g.history.push(copy(g.event));g.phase='reveal';g.phaseAt=at;g.nextAt=at+LUCK507.revealMs;
}
export function advanceLuck507(g,now){if(!Number.isFinite(now))return false;let changed=false;
 for(let n=0;n<96&&!['lobby','result'].includes(g.phase)&&Number.isFinite(g.nextAt)&&now>=g.nextAt;n++){
  const at=g.nextAt;
  if(g.phase==='countdown')choosePhase(g,at);
  else if(g.phase==='choose'){
   for(const p of g.players)if(g.choices507[p.seat]===null&&(at>=g.deadline||p.ai&&at>=g.phaseAt+g.plan507[g.round-1][p.seat].wait)){g.choices507[p.seat]=g.plan507[g.round-1][p.seat].auto;g.auto507[p.seat]=true;p.autoRounds++;g.lastChoiceAt=at}
   if(g.choices507.every(x=>x!==null)&&at>=g.phaseAt+LUCK507.minChooseMs)reveal(g,at);else schedule(g);
  }else if(g.phase==='reveal'){g.phase='run';g.phaseAt=at;g.nextAt=at+LUCK507.runMs}
  else if(g.phase==='run'){for(const p of g.players)p.distance=g.event.rows.find(r=>r.playerId===p.playerId).to;g.scaleMax=g.event.toMax;g.phase='settle';g.phaseAt=at;g.nextAt=at+LUCK507.settleMs}
  else if(g.phase==='settle'){if(g.round===8){g.phase='result';g.phaseAt=at;g.nextAt=null;g.results=ranks507(g.players);g.resultAt=at}else{g.round++;choosePhase(g,at)}}
  else break;
  g.updatedAt=at;g.revision++;changed=true;
 }return changed;
}
export function publicLuck507(g,selfId,connected=()=>true){return{id:g.id,code:g.code,game:'luck',rules507:1,hostId:g.hostId,phase:g.phase,phaseAt:g.phaseAt,revision:g.revision,round:g.round,rounds:8,scaleMax:g.scaleMax,startAt:g.startAt??null,deadline:g.phase==='choose'?g.deadline:null,members:g.members.map(m=>({playerId:m.playerId,name:m.name,color499:m.color499,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null})),players:g.players.map(p=>({playerId:p.playerId,name:p.name,choice:{...p.choice},seat:p.seat,ai:p.ai,color499:p.color499,distance:p.distance,connected:p.ai||!!connected(p.playerId),locked:g.phase==='choose'?g.choices507[p.seat]!==null:false})),ownBox:g.phase==='choose'?g.choices507[g.players.find(p=>p.playerId===selfId)?.seat]??null:null,event:g.event?copy(g.event):null,history:copy(g.history),results:g.results?copy(g.results):null}}
