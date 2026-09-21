import{freezeColors501}from'../party/GameColors501.js';
export const GORILLA502=Object.freeze({hairs:6,countdown:1500,turnMs:1500,reactionMs:400,blastMs:2900});
const fail=s=>{throw Error(s)};
// Private random stream is used only by timeout/AI selections, never exposed to clients.
function random(g,n){let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return g.seed%n}
export function makeGorilla502({id,code,partyId,hostId,members,now=0,seed=1}){return{id,code,partyId462:partyId,game:'gorilla',hostId,phase:'lobby',revision:0,createdAt:now,updatedAt:now,seed:seed||1,members:members.map(m=>({...m,choice:m.choice??null})),players:[],picked:[],events:[],turn:0,results:null}}
export function startGorilla502(g,now,{badHair,firstSeat}){
 if(g.phase!=='lobby'||!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))fail('全員の魔物を選んでください');
 if(!Number.isInteger(badHair)||badHair<0||badHair>=6||!Number.isInteger(firstSeat)||firstSeat<0||firstSeat>3)fail('抽選情報が不正です');
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false,pulls:0,safePulls:0,autoPulls:0}));
 const bots=[['おすましスライム','slime'],['強がりゴブリン','goblin'],['びびりオオカミ','wolf'],['骨までドキドキ','skeleton']];
 while(g.players.length<4){const seat=g.players.length,[name,speciesId]=bots[seat];g.players.push({playerId:`AI-${g.id}-${seat}`,name,choice:{id:'ai-'+seat,speciesId},seat,ai:true,pulls:0,safePulls:0,autoPulls:0})}
 freezeColors501(g.players,g.members,g.aiColors500);
 g.badHair=badHair;g.firstSeat=firstSeat;g.turnSeat=firstSeat;g.turn=0;g.phase='countdown';g.startAt=now+GORILLA502.countdown;g.nextAt=g.startAt;g.loserId=null;g.picked=[];g.events=[];g.results=null;g.updatedAt=now;g.revision++;return g;
}
function begin(g,at){g.phase='playing';g.turnStartedAt=at;g.deadline=at+GORILLA502.turnMs;g.nextAt=g.players[g.turnSeat].ai?at+700+random(g,201):g.deadline}
export function pullGorilla502(g,id,hair,turn,at,automatic=false){
 if(!Number.isInteger(hair)||hair<0||hair>=6||!Number.isInteger(turn)||turn<0)fail('残っている胸毛を1本選んでください');
 if(g.events.some(e=>e.turn===turn&&e.playerId===id&&e.hair===hair))return false;
 if(g.phase!=='playing'||turn!==g.turn||g.players[g.turnSeat]?.playerId!==id)fail('いまはあなたの順番ではありません');
 if(!Number.isFinite(at)||at<g.turnStartedAt||(!automatic&&at>=g.deadline))fail('選ぶ時間が終了しました');
 if(g.picked.includes(hair))fail('その胸毛はもう抜けています');
 const p=g.players[g.turnSeat],bad=hair===g.badHair;p.pulls++;if(automatic)p.autoPulls++;if(!bad)p.safePulls++;
 g.picked.push(hair);g.events.push({turn:g.turn,playerId:id,seat:p.seat,hair,at,kind:bad?'rage':'safe',automatic:!!automatic});
 if(bad){g.phase='blast';g.loserId=id;g.blastAt=at;g.nextAt=at+GORILLA502.blastMs}else{g.phase='reaction';g.nextAt=at+GORILLA502.reactionMs}
 g.updatedAt=at;g.revision++;return true;
}
export function advanceGorilla502(g,now){let changed=false;
 // At most six pulls, so delayed ticks/restarts can deterministically catch up in one bounded pass.
 for(let step=0;step<24&&!['lobby','result'].includes(g.phase)&&now>=g.nextAt;step++){
  const at=g.nextAt;
  if(g.phase==='countdown')begin(g,at);
  else if(g.phase==='playing'){const left=Array.from({length:6},(_,i)=>i).filter(i=>!g.picked.includes(i));pullGorilla502(g,g.players[g.turnSeat].playerId,left[random(g,left.length)],g.turn,at,true)}
  else if(g.phase==='reaction'){g.turn++;g.turnSeat=(g.firstSeat+g.turn)%4;begin(g,at)}
  else if(g.phase==='blast'){g.phase='result';g.resultAt=at;g.nextAt=null;g.results=g.players.map(p=>({playerId:p.playerId,blownFar:p.playerId===g.loserId,pulls:p.pulls,safePulls:p.safePulls,autoPulls:p.autoPulls}));}
  g.updatedAt=at;g.revision++;changed=true;
 }
 return changed;
}
export function publicGorilla502(g,connected=()=>true){return{id:g.id,code:g.code,game:g.game,hostId:g.hostId,phase:g.phase,revision:g.revision,members:g.members.map(m=>({playerId:m.playerId,name:m.name,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null})),players:g.players.map(p=>({...p,connected:p.ai||!!connected(p.playerId)})),startAt:g.startAt??null,turn:g.turn,turnSeat:g.turnSeat??null,turnStartedAt:g.turnStartedAt??null,deadline:g.deadline??null,picked:[...g.picked],events:g.events.map(e=>({...e})),loserId:g.loserId??null,blastAt:g.blastAt??null,resultAt:g.resultAt??null,results:g.results?.map(r=>({...r}))??null}}
