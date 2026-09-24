import {randomBytes} from 'node:crypto';
import {makeSumo523,startSumo523,advanceSumo523,publicSumo523,migrateSumo527} from '../../src/sumo/Rules523.js';
export const sumoFor523=(c,id)=>Object.values(c.data.sumoRooms523??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
const runtimes=c=>c.sumoRuntime523??=new Map();
export const liveSumo523=(c,g)=>runtimes(c).get(g?.id)?.g??g;
export const sumoView523=(c,g)=>publicSumo523(liveSumo523(c,g));
export function createSumo523(c,p,members){return makeSumo523({id:`s523-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
function runtime(c,g){let r=runtimes(c).get(g.id);if(!r){r={g:structuredClone(g),inputs:new Map(),lastSave:c.now(),lastSend:0,phase:g.phase};migrateSumo527(r.g);runtimes(c).set(g.id,r)}return r}
export function handleSumo523(c,session,m){if(m.op!=='sumo523')return false;const g=sumoFor523(c,session.playerId),p=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);if(!g||!p||!me||g.id!==m.gameId)throw Error('ゲームが切り替わりました');if(m.sumoVersion523!==2)throw Error('本体をBuild527へ更新してください');if(g.phase!=='lobby'){if(m.kind==='start')return true;throw Error('開始前に設定してください')}
 if(m.kind==='select'){const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している魔物を選んでね');me.choice={...choice};p.members.find(x=>x.playerId===me.playerId).ready=false}
 else if(m.kind==='start'){if(p.hostId!==session.playerId)throw Error('部屋主が開始できます');if(p.members.some(x=>x.sumoVersion523!==2))throw Error('全員がBuild527へ更新してください');if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が相棒を選んで準備OKを押してください');if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');g.aiColors500={...(p.aiColors500??{})};startSumo523(g,c.now(),randomBytes(4).readUInt32LE());runtimes(c).delete(g.id)}else throw Error('未対応の操作です');g.updatedAt=c.now();g.revision++;return true;
}
export function queueSumo523(c,session,m){const saved=sumoFor523(c,session.playerId);if(!saved||saved.id!==m.gameId||m.sumoVersion523!==2)return false;const r=runtime(c,saved),g=r.g,p=g.players.find(p=>p.playerId===session.playerId);if(g.phase!=='play'||!p?.alive||p.ai||!Number.isSafeInteger(m.seq)||m.seq<=p.lastSeq||m.seq>1e9)return false;
 if(m.mode!==undefined&&!['vector','target'].includes(m.mode))return false;if(m.mode==='target'&&(!Number.isFinite(m.tx)||!Number.isFinite(m.ty)||Math.hypot(m.tx,m.ty)>10))return false;
 if(m.kind!=='move'||!Number.isFinite(m.x)||!Number.isFinite(m.y)||Math.abs(m.x)>1||Math.abs(m.y)>1)return false;const old=r.inputs.get(p.playerId);r.inputs.set(p.playerId,{x:m.x,y:m.y,mode:m.mode==='target'?'target':'vector',tx:m.mode==='target'?m.tx:null,ty:m.mode==='target'?m.ty:null,press:m.cancel?false:old?.press||m.press===true,release:m.cancel?false:old?.release||m.release===true,cancel:m.cancel===true,receivedAt:c.now()});p.lastSeq=m.seq;return true;
}
export function advanceSumos523(c){const now=c.now();for(const saved of Object.values(c.data.sumoRooms523??{})){
 if(['lobby','result'].includes(saved.phase)){if(now-saved.updatedAt>86400000&&!saved.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete c.data.sumoRooms523[saved.code];const p=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false)}});runtimes(c).delete(saved.id);c.broadcast()}continue}
 const r=runtime(c,saved),g=r.g,party=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462),auto=new Set();g.hostId=saved.hostId;
 for(const p of g.players){if(!p.ai&&(!c.sessions.get(p.playerId)?.connected||party?.members.find(m=>m.playerId===p.playerId)?.atHome))auto.add(p.playerId);const input=r.inputs.get(p.playerId);if(input&&now-input.receivedAt>350){input.x=0;input.y=0;input.mode='vector';input.tx=input.ty=null;input.press=false;input.release=false;input.cancel=true}}
 advanceSumo523(g,now,r.inputs,auto);const changed=r.phase!==g.phase;
 if(changed||now-r.lastSave>=2000){c.transaction(()=>{c.data.sumoRooms523[g.code]=structuredClone(g)});r.lastSave=now;r.phase=g.phase}
 if(changed)for(const m of party?.members??[])c.push(c.sessions.get(m.playerId));
 if(now-r.lastSend>=80){r.lastSend=now;const frame=publicSumo523(g);for(const m of party?.members??[])if(c.sessions.get(m.playerId)?.connected&&c.subscribers.has(m.playerId))c.send(m.playerId,{type:'sumoFrame523',selfId:m.playerId,serverNow:now,sumo:frame})}
 }
 for(const[id]of runtimes(c))if(!Object.values(c.data.sumoRooms523??{}).some(g=>g.id===id))runtimes(c).delete(id);
}
