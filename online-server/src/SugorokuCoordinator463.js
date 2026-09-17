import{randomBytes}from'node:crypto';
import{makeLobby463,start463,action463,botAction463,current463,log463,automaticAction464}from'../../src/sugoroku/Engine463.js';
export const boardFor463=(c,id)=>Object.values(c.data.boardRooms463??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
export function createBoard463(c,p,people){return makeLobby463({id:`sg463-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,members:people,now:c.now(),seed:randomBytes(4).readUInt32LE()})}
function mark(g,now){g.revision++;g.updatedAt=now;g.deadline=now+75000;g.nextAutoAt=now+Math.min(18000,Math.max(1800,(g.presentation464??[]).filter(e=>e.at===now).reduce((ms,e)=>ms+({card:2200,dice:1800,effect:850,move:600}[e.kind]??0),0)))}
export function handleSugoroku463(c,session,m){
 if(m.op!=='sg463')return false;
 const g=boardFor463(c,session.playerId),p=Object.values(c.data.parties462??{}).find(x=>x.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId);
 if(!g||!p||!me)throw Error('カードすごろくの参加者ではありません');
 if(Number(m.rulesVersion)<9)throw Error('本体をBuild463に更新してください');
 if(m.gameId!==g.id)throw Error('ゲームが切り替わりました');
 const requestId=String(m.requestId??'');if(!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId))throw Error('操作情報を再送してください');
 if(g.seen[session.playerId]?.includes(requestId))return true;
 if(m.revision!==g.revision)throw Error('盤面が更新されました。もう一度操作してください');
 if(m.kind==='select'){
  if(g.phase!=='lobby')throw Error('開始後はコマを変更できません');
  if(m.roster)me.owned=c.roster(m.roster);const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('手持ちの魔物を選んでください');me.choice=choice;const pm=p.members.find(x=>x.playerId===session.playerId);pm.owned=me.owned;pm.ready=false;
 }else if(m.kind==='start'){
  if(p.hostId!==session.playerId||g.phase!=='lobby')throw Error('部屋主が準備画面で開始できます');
  if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員がコマを選んで「準備OK」を押してください');
  if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('全員のオンラインコンテンツ終了を待っています');start463(g,c.now());
 }else{
  if(m.kind==='choice'&&m.choiceId!==g.pending?.id)throw Error('この選択は終了しています');
  action463(g,session.playerId,m,c.now());
 }
 g.seen[session.playerId]=[...(g.seen[session.playerId]??[]),requestId].slice(-32);mark(g,c.now());return true;
}
export function advanceSugoroku463(c){
 for(const g of Object.values(c.data.boardRooms463??{})){
  const now=c.now(),online=g.members.some(m=>c.sessions.get(m.playerId)?.connected);
  if(!online){if(now-g.updatedAt>24*60*60*1000){c.transaction(()=>{delete c.data.boardRooms463[g.code];const p=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false)}});c.broadcast()}continue}
  if(g.phase!=='playing')continue;
  const id=g.pending?.playerId??current463(g)?.playerId,player=g.players.find(p=>p.playerId===id);if(!player)continue;
  const connected=c.sessions.get(id)?.connected,emptyDecision=connected&&now>=g.nextAutoAt?automaticAction464(g):null,auto=!!emptyDecision||(player.ai?now>=g.nextAutoAt:now>=g.deadline||!connected&&now>=g.updatedAt+30000);
  if(!auto)continue;
  c.transaction(()=>{const command=emptyDecision??botAction463(g,id);if(command){if(!player.ai&&!emptyDecision)log463(g,`${player.name}の操作を一時的にAIが代行`);action463(g,id,command,now);mark(g,now)}});c.broadcast();
 }
}
