import {randomBytes} from 'node:crypto';
import {makeTetra539,startTetra539,advanceTetra539,publicTetra539} from '../../src/tetra/Rules539.js';
export const tetraFor539=(c,id)=>Object.values(c.data.tetraRooms539??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
const runtimes=c=>c.tetraRuntime539??=new Map();
export const liveTetra539=(c,g)=>runtimes(c).get(g?.id)?.g??g;
export const tetraSnapshot539=(c,g,id)=>publicTetra539(liveTetra539(c,g),id);
export function createTetra539(c,p,members){return makeTetra539({id:`t539-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
function runtime(c,g){let r=runtimes(c).get(g.id);if(!r){r={g:structuredClone(g),inputs:new Map(),lastSave:c.now(),lastSend:0,phase:g.phase};runtimes(c).set(g.id,r)}return r}
export function handleTetra539(c,session,m){if(m.op!=='tetra539')return false;const g=tetraFor539(c,session.playerId),party=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);
 if(!g||!party||!me||g.id!==m.gameId)throw Error('ゲームが切り替わりました');if(m.tetraVersion539!==4)throw Error('本体をBuild563へ更新してください');if(g.phase!=='lobby')throw Error('開始前に設定してください');
 if(m.kind==='select'){const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している相棒を選んでね');me.choice={...choice};party.members.find(x=>x.playerId===me.playerId).ready=false}
 else if(m.kind==='start'){if(party.hostId!==session.playerId)throw Error('部屋主が開始できます');if(party.members.some(x=>x.tetraVersion539!==4))throw Error('全員がBuild563へ更新してください');if(party.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が相棒を選んで準備OKを押してください');if(party.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');g.aiColors500={...(party.aiColors500??{})};startTetra539(g,c.now(),randomBytes(4).readUInt32LE());runtimes(c).delete(g.id)}
 else throw Error('未対応の操作です');g.updatedAt=c.now();g.revision++;return true;
}
export function queueTetra539(c,session,m){const saved=tetraFor539(c,session.playerId);if(!session.connected||!saved||saved.id!==m.gameId||m.tetraVersion539!==4||!Number.isSafeInteger(m.seq)||m.seq<1||m.seq>1e9||!['begin','aim','release','cancel'].includes(m.action)||!Number.isFinite(m.angle)||Math.abs(m.angle)>Math.PI||!Number.isFinite(m.power)||m.power<0||m.power>1)return false;
 const r=runtime(c,saved),g=r.g,p=g.players.find(p=>p.playerId===session.playerId),party=Object.values(c.data.parties462??{}).find(x=>x.id===g.partyId462);if(g.phase!=='play'||!p||p.ai||p.finishedAt!=null||p.fallAt!=null||p.flight||m.seq<=p.lastSeq||party?.members.find(x=>x.playerId===p.playerId)?.atHome)return false;
 const actions=r.inputs.get(p.playerId)??[];if(actions.length>=12)return false;const a={action:m.action,angle:m.angle,power:m.power,at:c.now()-g.startAt};if(a.action==='aim'&&actions.at(-1)?.action==='aim')actions[actions.length-1]=a;else actions.push(a);r.inputs.set(p.playerId,actions);p.lastSeq=m.seq;return true;
}
export function advanceTetras539(c){const now=c.now();for(const saved of Object.values(c.data.tetraRooms539??{})){
 if(saved.rulesVersion!==4&&['countdown','play'].includes(saved.phase)){c.transaction(()=>{const fresh=makeTetra539({id:saved.id,code:saved.code,partyId:saved.partyId462,hostId:saved.hostId,members:saved.members,now});c.data.tetraRooms539[saved.code]=fresh;const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);party?.members.forEach(m=>m.ready=false)});runtimes(c).delete(saved.id);c.broadcast();continue}
 if(['lobby','result'].includes(saved.phase)){if(now-saved.updatedAt>86400000&&!saved.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete c.data.tetraRooms539[saved.code];const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);if(party){party.game=null;party.raceCode=null;party.members.forEach(m=>m.ready=false)}});runtimes(c).delete(saved.id);c.broadcast()}continue}
 const r=runtime(c,saved),g=r.g,party=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462),auto=new Set();g.hostId=saved.hostId;
 for(const p of g.players)if(!p.ai&&(!c.sessions.get(p.playerId)?.connected||party?.members.find(m=>m.playerId===p.playerId)?.atHome)){auto.add(p.playerId);r.inputs.delete(p.playerId)}
 advanceTetra539(g,now,r.inputs,auto);const changed=r.phase!==g.phase;
 if(changed||now-r.lastSave>=2000){c.transaction(()=>{c.data.tetraRooms539[g.code]=structuredClone(g)});r.lastSave=now;r.phase=g.phase}
 if(changed)for(const m of party?.members??[])c.push(c.sessions.get(m.playerId));
 if(now-r.lastSend>=100){r.lastSend=now;for(const m of party?.members??[])if(c.sessions.get(m.playerId)?.connected&&c.subscribers.has(m.playerId))c.send(m.playerId,{type:'tetraFrame539',selfId:m.playerId,serverNow:now,tetra:publicTetra539(g,m.playerId,{frame:true})})}
 }for(const[id]of runtimes(c))if(!Object.values(c.data.tetraRooms539??{}).some(g=>g.id===id))runtimes(c).delete(id);
}
