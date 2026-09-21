import{randomBytes}from'node:crypto';
import{CANAL489,makeCanal489,startCanal489,inputCanal489,advanceCanal489}from'../../src/canal/Rules489.js';
export const canalFor489=(c,id)=>Object.values(c.data.canalRooms489??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
export function createCanal489(c,p,members){return {...makeCanal489({id:`cn489-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,members,now:c.now(),seed:randomBytes(4).readUInt32LE()}),rules492:1,netEnergy:0,netUntil:0,megaCount:0,teamCatches:0,bySpecies:[0,0,0,0]}}
const party=(c,g)=>Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462);
const present=(c,g,id)=>!!c.sessions.get(id)?.connected&&!party(c,g)?.members.find(m=>m.playerId===id)?.atHome;
export function queueCanal489(c,session,m){
 const g=canalFor489(c,session.playerId),p=g?.players.find(p=>!p.ai&&p.playerId===session.playerId);
 if(!g||!p||m.gameId!==g.id||m.canalVersion489!==1||(g.rules492===1&&m.canalRules492!==1)||!['countdown','playing'].includes(g.phase)||!Array.isArray(m.inputs)||m.inputs.length>24)return;
 const key=g.id+':'+p.playerId;c.canalQueue489??=new Map();const queue=c.canalQueue489.get(key)??[];
 for(const x of m.inputs){if(queue.length>=CANAL489.maxQueue)break;if(!x||!Number.isSafeInteger(x.seq)||x.seq<=p.lastSeq||x.seq>CANAL489.maxSequence||queue.some(y=>y.seq===x.seq)||!Number.isInteger(x.lane)||x.lane<0||x.lane>3||typeof x.held!=='boolean'||typeof x.pulse!=='boolean'||typeof x.burst!=='boolean'||(x.targetId!=null&&(!Number.isSafeInteger(x.targetId)||x.targetId<1)))continue;queue.push({seq:x.seq,lane:x.lane,held:x.held,pulse:x.pulse,burst:x.burst,...(g.rules492===1&&x.targetId!=null?{targetId:x.targetId}:{}),receivedAt:c.now()})}
 if(queue.length)c.canalQueue489.set(key,queue);
}
export function handleCanal489(c,session,m){
 if(m.op!=='canal489')return false;
 const g=canalFor489(c,session.playerId),p=g&&party(c,g),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);
 if(!g||!me||g.id!==m.gameId)throw Error('この用水路には参加していません');
 if(m.canalVersion489!==1)throw Error('本体をBuild489へ更新してください');
 if(m.kind==='select'){
  if(g.phase!=='lobby')throw Error('魔物選択は締め切りました');
  if(m.roster)me.owned=c.roster(m.roster);const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持する魔物を選んでください');me.choice=choice;
  const pm=p?.members.find(x=>x.playerId===session.playerId);if(pm){pm.owned=me.owned;pm.ready=false;pm.canalVersion489=1}
 }else if(m.kind==='start'){
  if(g.hostId!==session.playerId)throw Error('部屋主が開始できます');if(g.phase!=='lobby')return true;
  if(!p||p.members.some(x=>!x.ready||!present(c,g,x.playerId)))throw Error('全員が準備画面で「準備OK」を押すと開始できます');
  if(m.canalRules492!==1||p.members.some(x=>x.canalVersion489!==1||x.canalRules492!==1))throw Error('全員の本体をBuild492へ更新してください');
  if(g.members.some(x=>!x.choice))throw Error('全員の魔物を選んでください');
  if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかのオンラインコンテンツの終了を待っています');
  g.rules492=1;startCanal489(g,c.now());
 }else throw Error('未対応の用水路操作です');
 g.revision++;g.updatedAt=c.now();return true;
}
export function advanceCanals489(c){
 const at=c.now(),rooms=Object.values(c.data.canalRooms489??{}),active=rooms.filter(g=>['countdown','playing'].includes(g.phase)&&at-g.updatedAt>=200),expired=rooms.filter(g=>['lobby','result'].includes(g.phase)&&at-g.updatedAt>86400000&&!g.members.some(m=>c.sessions.get(m.playerId)?.connected));
 if(!active.length&&!expired.length)return;
 const consumed=[];
 c.transaction(()=>{
  for(const g of active){
   const inputs=[];for(const p of g.players.filter(p=>!p.ai)){const key=g.id+':'+p.playerId;for(const x of c.canalQueue489?.get(key)??[])inputs.push({key,playerId:p.playerId,...x})}
   inputs.sort((a,b)=>a.receivedAt-b.receivedAt||a.seq-b.seq||a.playerId.localeCompare(b.playerId));
   for(const x of inputs){const stamp=Math.max(g.simAt??g.startAt-100,Math.min(at,x.receivedAt));advanceCanal489(g,stamp,id=>present(c,g,id));inputCanal489(g,g.players.find(p=>p.playerId===x.playerId),x,stamp);consumed.push([x.key,x.seq])}
   advanceCanal489(g,at,id=>present(c,g,id));g.updatedAt=at;g.revision++;
  }
  for(const g of expired){delete c.data.canalRooms489[g.code];const p=party(c,g);if(p){p.game=null;p.raceCode=null;for(const m of p.members)m.ready=false}}
 });
 for(const[key,seq]of consumed){const q=c.canalQueue489?.get(key);if(q)c.canalQueue489.set(key,q.filter(x=>x.seq!==seq))}
 const activeIds=new Set(Object.values(c.data.canalRooms489??{}).filter(g=>['countdown','playing'].includes(g.phase)).map(g=>g.id));for(const[key,q]of c.canalQueue489??[])if(!q.length||!activeIds.has(key.split(':')[0]))c.canalQueue489.delete(key);
 for(const g of [...active,...expired])for(const m of party(c,g)?.members??g.members)c.push(c.sessions.get(m.playerId));
}
