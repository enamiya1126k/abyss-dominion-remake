// Shared deterministic rules. The coordinator is the only score authority.
export const CABBAGE484=Object.freeze({version:2,duration:45000,countdown:3500,warning:700,grace:180,minTap:20,maxAge:1000,points:10,penalty:80,repair:950,comboGap:900,maxSequence:4500,maxBatch:32,maxQueue:256});
const rng=g=>{let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return g.seed/4294967296};
export function makeCabbage484({id,code,partyId,hostId,members,now=0,seed=1}){return{id,code,game:'cabbage',partyId462:partyId,hostId,phase:'lobby',createdAt:now,updatedAt:now,revision:0,seed:seed||1,members:members.map(m=>({...m,choice:m.choice??null})),players:[],windows:[]}}
export function startCabbage484(g,now){
 if(g.phase!=='lobby'||!g.members.length||g.members.some(m=>!m.choice))throw Error('全員の魔物を選んでください');
 g.phase='countdown';g.startAt=now+CABBAGE484.countdown;g.endAt=g.startAt+CABBAGE484.duration;g.updatedAt=now;
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false}));
 const bots=[['おっとり料理長','slime'],['せっかち見習い','goblin'],['職人オオカミ','wolf']];
 while(g.players.length<4){const i=g.players.length- g.members.length,[name,speciesId]=bots[i];g.players.push({playerId:`AI-${g.id}-${i}`,name,choice:{id:`ai-${i}`,speciesId},seat:g.players.length,ai:true,botInterval:220-i*24,botSeed:Math.floor(rng(g)*1000),nextBotAt:g.startAt+200})}
 for(const p of g.players)Object.assign(p,{score:0,cuts:0,combo:0,maxCombo:0,breaks:0,lastSide:null,lastSeq:0,lastInputAt:-1,lastLeftAt:-1,lastRightAt:-1,lastCutAt:-1,lockedUntil:0,brokenWindow:-1,boardDamage:0,boardWindow:-1,lastEvent:null});
 let at=g.startAt,index=0;g.windows=[];
 while(at<g.endAt){const cut=Math.min(g.endAt,at+4500+Math.floor(rng(g)*2100));g.windows.push({kind:'cut',at,until:cut,index:index++});at=cut;if(at>=g.endAt)break;const warn=Math.min(g.endAt,at+CABBAGE484.warning);g.windows.push({kind:'warning',at,until:warn,index:index++});at=warn;if(at>=g.endAt)break;const stop=Math.min(g.endAt,at+1700+Math.floor(rng(g)*850));g.windows.push({kind:'stop',at,until:stop,index:index++});at=stop;}
 g.revision++;return g;
}
export function window484(g,at){if(at<g.startAt)return{kind:'countdown',at:g.startAt-CABBAGE484.countdown,until:g.startAt,index:-1};return g.windows.find(w=>at>=w.at&&at<w.until)??{kind:'finish',at:g.endAt,until:g.endAt,index:999}}
function event(p,kind,at,extra={}){p.lastEvent={kind,at,...extra};return kind}
export function tap484(g,p,{seq,side,at},received){
 if(!Number.isSafeInteger(seq)||seq<=p.lastSeq||seq>CABBAGE484.maxSequence||!['left','right'].includes(side))return'duplicate';
 p.lastSeq=seq;
 if(!['countdown','playing'].includes(g.phase)||!Number.isFinite(at)||at<received-CABBAGE484.maxAge||at>received+100||at<g.startAt||at>=g.endAt)return'late';
 // Two thumbs can land together. Debounce each side independently, never the opposite hand.
 at=Math.min(at,received);const key=side==='left'?'lastLeftAt':'lastRightAt',previous=p[key];
 if(at<p.lastInputAt||(Number.isFinite(previous)&&at-previous<CABBAGE484.minTap))return'rate';p.lastInputAt=at;p[key]=at;
 const w=window484(g,at);
 if(w.kind==='stop'){
  if(at<w.at+CABBAGE484.grace)return'grace';
  if(p.boardWindow!==w.index){p.boardWindow=w.index;p.boardDamage=0}
  p.boardDamage=(p.boardDamage??0)+1;p.lockedUntil=w.until;p.combo=0;p.lastSide=null;
  // Every wrong tap damages the board; keep the existing one -80 penalty per stop signal.
  if(p.brokenWindow===w.index)return event(p,'damage',at,{damage:p.boardDamage,seq});
  p.score=Math.max(0,p.score-CABBAGE484.penalty);p.breaks++;p.brokenWindow=w.index;return event(p,'break',at,{delta:-CABBAGE484.penalty,damage:p.boardDamage,seq});
 }
 if(!['cut','warning'].includes(w.kind))return'late';
 p.boardDamage=0;p.boardWindow=-1;p.lockedUntil=0;
 if(side===p.lastSide){p.combo=0;return event(p,'same',at,{seq})}
 if(at-p.lastCutAt>CABBAGE484.comboGap)p.combo=0;
 p.lastSide=side;p.lastCutAt=at;p.combo++;p.maxCombo=Math.max(p.maxCombo,p.combo);p.cuts++;const delta=CABBAGE484.points+(p.combo%10===0?5:0);p.score+=delta;return event(p,'cut',at,{side,delta,seq});
}
export function ranking484(g){const rows=[...g.players].sort((a,b)=>b.score-a.score||a.seat-b.seat);return rows.map((p,i)=>({...p,rank:rows.findIndex(x=>x.score===p.score)+1}))}
export function advanceCabbage484(g,now){
 if(!['countdown','playing'].includes(g.phase))return;
 if(now>=g.startAt)g.phase='playing';
 const end=Math.min(now,g.endAt-1);
 for(const p of g.players.filter(p=>p.ai)){
  let guard=0;while(p.nextBotAt<=end&&guard++<400){const at=p.nextBotAt,w=window484(g,at);p.nextBotAt+=p.botInterval+((p.lastSeq*47+p.botSeed)%71);
   if(w.kind==='stop'&&(w.index+p.botSeed)%4!==0)continue;
   tap484(g,p,{seq:p.lastSeq+1,side:p.lastSide==='left'?'right':'left',at},at);
  }
 }
 if(now>=g.endAt+CABBAGE484.maxAge){g.phase='result';g.finishedAt=g.endAt;}
 g.updatedAt=now;g.revision++;
}
export function publicCabbage484(g,selfId,now,connected=()=>true){
 const members=g.members.map(m=>({playerId:m.playerId,name:m.name,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null,connected:!!connected(m.playerId)}));
 const players=g.players.map(p=>{const {playerId,name,choice,seat,ai,score,cuts,combo,maxCombo,breaks,lastSide,lastSeq,lockedUntil,lastEvent,boardDamage,boardWindow}=p;return{playerId,name,choice,seat,ai,score,cuts,combo,maxCombo,breaks,lastSide,lastSeq:playerId===selfId?lastSeq:undefined,lockedUntil,lastEvent,boardDamage:boardDamage??0,boardWindow:boardWindow??-1,...(playerId===selfId?{lastInputAt:p.lastInputAt,lastCutAt:p.lastCutAt,lastLeftAt:p.lastLeftAt,lastRightAt:p.lastRightAt,brokenWindow:p.brokenWindow}:{}),connected:ai||!!connected(playerId)}});
 return{id:g.id,code:g.code,inputVersion486:CABBAGE484.version,phase:g.phase,hostId:g.hostId,revision:g.revision,startAt:g.startAt,endAt:g.endAt,finishedAt:g.finishedAt,members,players,windows:g.windows.filter(w=>w.until>now-1000&&w.at<=now+2200),results:g.phase==='result'?ranking484(g).map(({playerId,rank})=>({playerId,rank})):null};
}
