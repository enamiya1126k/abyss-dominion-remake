import{randomBytes}from'node:crypto';
import{CABBAGE484 as RULES,makeCabbage484,startCabbage484,tap484,advanceCabbage484}from'../../src/cabbage/Rules484.js';
export const cabbageFor484=(c,id)=>Object.values(c.data.cabbageRooms484??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
export function createCabbage484(c,p,members){return makeCabbage484({id:`cb484-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,members,now:c.now(),seed:randomBytes(4).readUInt32LE()})}
export function queueCabbage484(c,session,m){
 const g=cabbageFor484(c,session.playerId),p=g?.players.find(p=>p.playerId===session.playerId&&!p.ai);
 if(!g||!p||m.gameId!==g.id||!['countdown','playing'].includes(g.phase))return;
 if(!Array.isArray(m.taps)||m.taps.length>RULES.maxBatch)return;
 c.cabbageQueue484??=new Map();const key=g.id+':'+p.playerId,list=c.cabbageQueue484.get(key)??[];
 for(const t of m.taps){if(list.length>=RULES.maxQueue)break;if(!t||!Number.isSafeInteger(t.seq)||t.seq<=p.lastSeq||t.seq>RULES.maxSequence||!['left','right'].includes(t.side)||!Number.isFinite(t.at)||list.some(x=>x.seq===t.seq))continue;list.push({seq:t.seq,side:t.side,at:t.at,received:c.now()})}
 if(list.length)c.cabbageQueue484.set(key,list);
}
export function handleCabbage484(c,session,m){
 if(m.op!=='cabbage484')return false;
 const g=cabbageFor484(c,session.playerId),p=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId);
 if(!g||!p||!me||m.gameId!==g.id)throw Error('ゲームが切り替わりました');
 if(m.cabbageVersion484!==1)throw Error('本体をBuild484へ更新してください');
 if(m.kind==='select'){
  if(g.phase!=='lobby')throw Error('開始後は魔物を変更できません');
  if(m.roster)me.owned=c.roster(m.roster);const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している魔物を選んでね');me.choice=choice;p.members.find(x=>x.playerId===session.playerId).owned=me.owned;p.members.find(x=>x.playerId===session.playerId).ready=false;
 }else if(m.kind==='start'){
  if(g.hostId!==session.playerId)throw Error('部屋主が開始できます');if(g.phase!=='lobby')return true;
  if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が魔物を選んで「準備OK」を押してください');
  if(m.cabbageScoring491!==1||p.members.some(x=>x.cabbageVersion484!==1||x.cabbageScoring491!==1))throw Error('全員がBuild491へ更新してから開始してください');
  if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');
  g.aiColors500={...(p.aiColors500??{})};startCabbage484(g,c.now());
 }else throw Error('未対応の操作です');
 g.updatedAt=c.now();g.revision++;return true;
}
// Inputs are batched into one durable transaction per server tick, not one disk write per cut.
export function advanceCabbages484(c){
 const now=c.now(),games=Object.values(c.data.cabbageRooms484??{}),active=games.filter(g=>['countdown','playing'].includes(g.phase)&&now-(g.updatedAt??0)>=200),expired=games.filter(g=>['lobby','result'].includes(g.phase)&&now-g.updatedAt>86400000&&!g.members.some(m=>c.sessions.get(m.playerId)?.connected));
 if(!active.length&&!expired.length)return;
 const consumed=[];
 c.transaction(()=>{
  for(const g of active){for(const p of g.players.filter(x=>!x.ai)){const key=g.id+':'+p.playerId,list=c.cabbageQueue484?.get(key)??[];for(const t of list.sort((a,b)=>a.seq-b.seq))tap484(g,p,t,t.received);consumed.push(key)}advanceCabbage484(g,now)}
  for(const g of expired){delete c.data.cabbageRooms484[g.code];const p=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false)}}
 });
 for(const key of consumed)c.cabbageQueue484?.delete(key);
 for(const [key]of c.cabbageQueue484??[])if(!Object.values(c.data.cabbageRooms484??{}).some(g=>key.startsWith(g.id+':')&&g.phase!=='result'))c.cabbageQueue484.delete(key);
 const parties=new Set([...active,...expired].map(g=>g.partyId462));for(const p of Object.values(c.data.parties462??{}))if(parties.has(p.id))for(const m of p.members)c.push(c.sessions.get(m.playerId));
}
