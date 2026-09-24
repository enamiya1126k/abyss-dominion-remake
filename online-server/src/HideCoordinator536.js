import {randomBytes} from 'node:crypto';
import {makeHide536,startHide536,advanceHide536,publicHide536,HIDE536,PROPS536} from '../../src/hide/Rules536.js';
export const hideFor536=(c,id)=>Object.values(c.data.hideRooms536??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
const runtimes=c=>c.hideRuntime536??=new Map();
export const liveHide536=(c,g)=>runtimes(c).get(g?.id)?.g??g;
export const hideSnapshot536=(c,g,id)=>publicHide536(liveHide536(c,g),id);
export function createHide536(c,p,members){return makeHide536({id:`h536-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
function runtime(c,g){let r=runtimes(c).get(g.id);if(!r){r={g:structuredClone(g),inputs:new Map(),lastSave:c.now(),lastSend:0,phase:g.phase};runtimes(c).set(g.id,r)}return r}
export function handleHide536(c,session,m){if(m.op!=='hide536')return false;const g=hideFor536(c,session.playerId),party=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);
 if(!g||!party||!me||g.id!==m.gameId)throw Error('ゲームが切り替わりました');if(m.hideVersion536!==5)throw Error('本体をBuild541へ更新してください');if(g.phase!=='lobby')throw Error('開始前に設定してください');
 if(m.kind==='select'){const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している魔物を選んでね');me.choice={...choice};party.members.find(x=>x.playerId===me.playerId).ready=false}
 else if(m.kind==='role'){if(party.hostId!==session.playerId)throw Error('部屋主が役割を選べます');if(!['random','hunter','hider'].includes(m.role))throw Error('役割を選び直してください');g.role=m.role;party.members.forEach(p=>p.ready=false)}
 else if(m.kind==='start'){if(party.hostId!==session.playerId)throw Error('部屋主が開始できます');if(party.members.some(x=>x.hideVersion536!==5))throw Error('全員がBuild541へ更新してください');if(party.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が相棒を選んで準備OKを押してください');if(party.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');g.aiColors500={...(party.aiColors500??{})};startHide536(g,c.now(),randomBytes(4).readUInt32LE());runtimes(c).delete(g.id)}
 else throw Error('未対応の操作です');g.updatedAt=c.now();g.revision++;return true;
}
export function queueHide536(c,session,m){
 const saved=hideFor536(c,session.playerId);if(!saved||saved.id!==m.gameId||m.hideVersion536!==5||m.kind!=='input'||!Number.isSafeInteger(m.seq)||m.seq<1||m.seq>1e9)return false;
 if(m.target!=null&&(!Number.isFinite(m.target.x)||!Number.isFinite(m.target.y)||m.target.x<0||m.target.x>HIDE536.width||m.target.y<0||m.target.y>HIDE536.height))return false;
 if(m.steer!=null&&(!Number.isFinite(m.steer.x)||!Number.isFinite(m.steer.y)||Math.abs(m.steer.x)>1||Math.abs(m.steer.y)>1))return false;
 if(m.attack!=null&&(typeof m.attack!=='string'||m.attack.length>16))return false;if(m.prop!=null&&(!Number.isInteger(m.prop)||m.prop<0||m.prop>=PROPS536.length))return false;
 const r=runtime(c,saved),g=r.g,p=g.players.find(p=>p.playerId===session.playerId);if(!['hiding','play'].includes(g.phase)||!p||p.ai||m.seq<=p.lastSeq)return false;
 const old=r.inputs.get(p.playerId)??{};r.inputs.set(p.playerId,{steer:Object.hasOwn(m,'steer')?(m.steer?{...m.steer}:null):Object.hasOwn(m,'target')?null:old.steer,target:Object.hasOwn(m,'steer')?null:Object.hasOwn(m,'target')?(m.target?{...m.target}:null):old.target,ability541:m.ability541===true||old.ability541,attack:m.attack??old.attack,kind:m.prop??old.kind,receivedAt:c.now()});p.lastSeq=m.seq;return true;
}
export function advanceHides536(c){const now=c.now();for(const saved of Object.values(c.data.hideRooms536??{})){
 if(saved.rulesVersion!==5&&['hiding','play'].includes(saved.phase)){c.transaction(()=>{const fresh=makeHide536({id:saved.id,code:saved.code,partyId:saved.partyId462,hostId:saved.hostId,members:saved.members,now});fresh.role=saved.role;fresh.migrationNote='封印を解いて脱出する新ルールになりました。準備OKで始めよう';c.data.hideRooms536[saved.code]=fresh;const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);party?.members.forEach(m=>m.ready=false)});runtimes(c).delete(saved.id);c.broadcast();continue}
 if(['lobby','result'].includes(saved.phase)){if(now-saved.updatedAt>86400000&&!saved.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete c.data.hideRooms536[saved.code];const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);if(party){party.game=null;party.raceCode=null;party.members.forEach(m=>m.ready=false)}});runtimes(c).delete(saved.id);c.broadcast()}continue}
 const r=runtime(c,saved),g=r.g,party=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462),auto=new Set();g.hostId=saved.hostId;
 for(const p of g.players)if(!p.ai&&(!c.sessions.get(p.playerId)?.connected||party?.members.find(m=>m.playerId===p.playerId)?.atHome)){auto.add(p.playerId);r.inputs.delete(p.playerId)}
 advanceHide536(g,now,r.inputs,auto);const changed=r.phase!==g.phase;
 if(changed||now-r.lastSave>=2000){c.transaction(()=>{c.data.hideRooms536[g.code]=structuredClone(g)});r.lastSave=now;r.phase=g.phase}
 if(changed)for(const m of party?.members??[])c.push(c.sessions.get(m.playerId));
 if(now-r.lastSend>=100){r.lastSend=now;for(const m of party?.members??[])if(c.sessions.get(m.playerId)?.connected&&c.subscribers.has(m.playerId))c.send(m.playerId,{type:'hideFrame536',selfId:m.playerId,serverNow:now,hide:publicHide536(g,m.playerId,{frame:true})})}
 }
 for(const[id]of runtimes(c))if(!Object.values(c.data.hideRooms536??{}).some(g=>g.id===id))runtimes(c).delete(id);
}
