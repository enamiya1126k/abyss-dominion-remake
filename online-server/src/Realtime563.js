import {randomBytes} from 'node:crypto';
// Shared room plumbing; each game's validation and simulation remain authoritative.
export function realtime563(cfg){
 const rooms=c=>c.data[cfg.rooms]??={},runtimes=c=>c[cfg.runtime]??=new Map();
 const find=(c,id)=>Object.values(rooms(c)).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
 const party=(c,g)=>Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462);
 const runtime=(c,g)=>{let r=runtimes(c).get(g.id);if(!r){r={g:structuredClone(g),inputs:cfg.array?[]:new Map(),seq:new Map(),lastSave:c.now(),lastSend:0,phase:g.phase,lastEvent:0};runtimes(c).set(g.id,r);}return r;};
 const live=(c,g)=>runtimes(c).get(g?.id)?.g??g;
 const snapshot=(c,g,id)=>cfg.public(live(c,g),id);
 const create=(c,p,members)=>cfg.make({id:`${cfg.prefix}-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(q=>q.playerId===m.playerId)?.slotOne476)??m.owned[0]}))});
 const handle=(c,session,m)=>{
  if(m.op!==cfg.op)return false;const g=find(c,session.playerId),p=party(c,g),me=g?.members.find(q=>q.playerId===session.playerId&&!q.departed);
  if(!g||!p||!me||m.gameId!==g.id)throw Error('ゲームが切り替わりました');
  if(m[cfg.versionKey]!==cfg.version)throw Error('本体をBuild563へ更新してください');
  if(g.phase!=='lobby'){if(m.kind==='start'&&p.hostId===session.playerId)return true;throw Error('開始前に設定してください');}
  if(m.kind==='select'){const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している相棒を選んでね');me.choice={...choice};p.members.find(x=>x.playerId===me.playerId).ready=false;}
  else if(m.kind==='duration'&&cfg.array){if(p.hostId!==session.playerId)throw Error('部屋主が設定できます');if(![90,150].includes(m.seconds))throw Error('90秒か150秒を選んでね');g.duration555=m.seconds*1000;p.members.forEach(x=>x.ready=false);}
  else if(m.kind==='start'){if(p.hostId!==session.playerId)throw Error('部屋主が開始できます');if(p.members.some(x=>x[cfg.versionKey]!==cfg.version))throw Error('全員がBuild563へ更新してから開始してください');if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が相棒を選んで準備OKを押してください');if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');g.aiColors500={...(p.aiColors500??{})};cfg.start(g,c.now(),randomBytes(4).readUInt32LE());runtimes(c).delete(g.id);}
  else throw Error('未対応の操作です');g.updatedAt=c.now();g.revision++;return true;
 };
 const queue=(c,session,m)=>{
  const saved=find(c,session.playerId);if(!session.connected||!saved||m.gameId!==saved.id||m[cfg.versionKey]!==cfg.version||!Number.isSafeInteger(m.seq)||m.seq<1||m.seq>1e9||saved[cfg.rulesKey]!==cfg.version)return false;
  const r=runtime(c,saved),g=r.g,p=g.players.find(x=>x.playerId===session.playerId),room=party(c,g),member=room?.members.find(x=>x.playerId===p?.playerId);
  if(!p||p.ai||!member||member.atHome||g.phase!=='play'||m.round!==g.round||m.seq<=Math.max(p.lastSeq??0,p.inputSeq563??0,r.seq.get(p.playerId)??0)||!cfg.valid(g,p,m,c.now()))return false;
  const list=cfg.array?r.inputs:r.inputs.get(p.playerId)??[];if(list.filter(x=>x.playerId===p.playerId).length>=12)return false;
  const input={playerId:p.playerId,seq:m.seq,round:m.round,action:m.action,angle:m.angle,power:m.power,shot:m.shot,target:m.target,bombId:m.bombId,at:c.now()};
  if(input.action==='pull'&&list.at(-1)?.playerId===p.playerId&&list.at(-1)?.action==='pull')list.pop();list.push(input);if(!cfg.array)r.inputs.set(p.playerId,list);r.seq.set(p.playerId,m.seq);p.inputSeq563=m.seq;return true;
 };
 const advance=c=>{const now=c.now();for(const saved of Object.values(rooms(c))){
  if(saved.game==='junkgp'){c.transaction(()=>{delete rooms(c)[saved.code];const p=party(c,saved);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false);}});runtimes(c).delete(saved.id);c.broadcast();continue;}
  if(saved[cfg.rulesKey]!==cfg.version){c.transaction(()=>{const fresh=cfg.make({id:saved.id,code:saved.code,partyId:saved.partyId462,hostId:saved.hostId,now,members:saved.members});if(cfg.array)fresh.duration555=saved.duration555===150000?150000:90000;fresh.migrationNote='遊び方を更新しました。相棒を選んで準備OK！';rooms(c)[saved.code]=fresh;party(c,saved)?.members.forEach(m=>m.ready=false);});runtimes(c).delete(saved.id);c.broadcast();continue;}
  if(['lobby','result'].includes(saved.phase)){if(now-saved.updatedAt>86400000&&!saved.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete rooms(c)[saved.code];const p=party(c,saved);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false);}});runtimes(c).delete(saved.id);c.broadcast();}continue;}
  const r=runtime(c,saved),g=r.g,p=party(c,g),auto=new Set();g.hostId=saved.hostId;g.members=structuredClone(saved.members);
  for(const player of g.players)if(!player.ai&&(!p?.members.some(m=>m.playerId===player.playerId)||!c.sessions.get(player.playerId)?.connected||p?.members.find(m=>m.playerId===player.playerId)?.atHome)){auto.add(player.playerId);if(cfg.array)r.inputs=r.inputs.filter(i=>i.playerId!==player.playerId);else r.inputs.delete(player.playerId);}
  cfg.advance(g,now,r.inputs,auto);const changed=r.phase!==g.phase,critical=g.events?.filter(e=>['goal','finish','pass','blast','start','roundEnd'].includes(e.type)).at(-1)?.id??0;
  if(changed||critical!==r.lastEvent||now-r.lastSave>=1000){c.transaction(()=>{rooms(c)[g.code]=structuredClone(g);});r.lastSave=now;r.lastEvent=critical;r.phase=g.phase;}
  if(changed)for(const m of p?.members??[])c.push(c.sessions.get(m.playerId));
  if(now-r.lastSend>=cfg.frameMs){r.lastSend=now;for(const m of p?.members??[])if(c.sessions.get(m.playerId)?.connected&&c.subscribers.has(m.playerId))c.send(m.playerId,{type:cfg.frame,selfId:m.playerId,serverNow:now,[cfg.state]:cfg.public(g,m.playerId,{frame:true})});}
 }for(const [id]of runtimes(c))if(!Object.values(rooms(c)).some(g=>g.id===id))runtimes(c).delete(id);};
 return{find,live,snapshot,create,handle,queue,advance};
}
