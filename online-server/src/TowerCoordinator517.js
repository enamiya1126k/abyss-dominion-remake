import {randomBytes} from 'node:crypto';
import {makeTower517,startTower517,aim517,drop517,advanceTower517,publicTower517} from '../../src/tower/Rules517.js';
export const towerFor517=(c,id)=>Object.values(c.data.towerRooms517??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
const runtimes=c=>c.towerRuntime517??=new Map();
export const liveTower517=(c,g)=>runtimes(c).get(g?.id)?.g??g;
export const towerView517=(c,g)=>publicTower517(liveTower517(c,g),id=>c.sessions.get(id)?.connected);
export function createTower517(c,p,members){return makeTower517({id:`t517-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
function runtime(c,g){let rt=runtimes(c).get(g.id);if(!rt){rt={g:structuredClone(g),inputs:new Map(),lastSave:c.now(),lastSend:0,phase:g.phase};runtimes(c).set(g.id,rt)}return rt}
export function handleTower517(c,session,m){if(m.op!=='tower517')return false;const g=towerFor517(c,session.playerId),p=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);if(!g||!p||!me||g.id!==m.gameId)throw Error('ゲームが切り替わりました');if(m.towerVersion517!==2)throw Error('本体をBuild518へ更新してください');if(g.phase!=='lobby'){if(m.kind==='start')return true;throw Error('開始前に設定してください')}
 if(m.kind==='select'){const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している魔物を選んでね');me.choice={...choice};p.members.find(x=>x.playerId===me.playerId).ready=false}
 else if(m.kind==='preference'){if(!['drop','run','random'].includes(m.preference))throw Error('役割を選んでね');me.preference=m.preference;for(const pm of p.members)pm.ready=false}
 else if(m.kind==='roles'){if(p.hostId!==session.playerId)throw Error('部屋主が設定できます');if(!['preference','random',...(g.members.length<4?['ai']:[]),...g.members.map(x=>x.playerId)].includes(m.roleMode))throw Error('参加中のプレイヤーを選んでね');g.roleMode=m.roleMode;for(const pm of p.members)pm.ready=false}
 else if(m.kind==='start'){if(p.hostId!==session.playerId)throw Error('部屋主が開始できます');if(p.members.some(x=>x.towerVersion517!==2))throw Error('全員がBuild518へ更新してください');if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が魔物を選んで「準備OK」を押してください');if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');g.aiColors500={...(p.aiColors500??{})};startTower517(g,c.now(),randomBytes(4).readUInt32LE());runtimes(c).delete(g.id)}
 else throw Error('未対応の操作です');g.updatedAt=c.now();g.revision++;return true}
// High-frequency controls never rewrite the persistent account store.
export function queueTower517(c,session,m){const saved=towerFor517(c,session.playerId);if(!saved||saved.id!==m.gameId||m.towerVersion517!==2)return false;const rt=runtime(c,saved),g=rt.g,p=g.players.find(p=>p.playerId===session.playerId);if(g.phase!=='play'||!p||!p.alive||p.ai||!Number.isSafeInteger(m.seq)||m.seq<=p.lastSeq||m.seq>1e9)return false;
 const at=c.now(),previous=rt.inputs.get(p.playerId);if(p.role==='drop'&&previous&&at-previous.receivedAt<20&&!m.drop)return false;
 if(p.role==='run'&&m.kind==='move'){if(!Number.isFinite(m.axis)||Math.abs(m.axis)>1)return false;rt.inputs.set(p.playerId,{axis:m.axis,jump:previous?.jump||m.jump===true,dash:previous?.dash||m.dash===true,receivedAt:at})}
 else if(p.role==='drop'&&m.kind==='aim'){if(!aim517(g,m.slot,m.rotation,m.x))return false;rt.inputs.set(p.playerId,{receivedAt:at});if(m.drop===true&&m.dropSerial===g.dropSerial)drop517(g)}else return false;p.lastSeq=m.seq;return true}
export function advanceTowers517(c){const now=c.now();for(const saved of Object.values(c.data.towerRooms517??{})){
 if(['lobby','result'].includes(saved.phase)){if(now-saved.updatedAt>86400000&&!saved.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete c.data.towerRooms517[saved.code];const p=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false)}});runtimes(c).delete(saved.id);c.broadcast()}continue}
 const rt=runtime(c,saved),g=rt.g,party=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462),auto=new Set();g.hostId=saved.hostId;
 for(const p of g.players){if(!p.ai&&(!c.sessions.get(p.playerId)?.connected||party?.members.find(m=>m.playerId===p.playerId)?.atHome))auto.add(p.playerId);const input=rt.inputs.get(p.playerId);if(input&&now-input.receivedAt>350){input.axis=0;input.jump=false;input.dash=false}}
 advanceTower517(g,now,rt.inputs,auto);
 const changed=rt.phase!==g.phase;if(changed||now-rt.lastSave>=2000){c.transaction(()=>{c.data.towerRooms517[g.code]=structuredClone(g)});rt.lastSave=now;rt.phase=g.phase}
 if(changed){for(const m of party?.members??[])c.push(c.sessions.get(m.playerId))}
 if(now-rt.lastSend>=100){rt.lastSend=now;const frame=publicTower517(g,id=>c.sessions.get(id)?.connected);for(const m of party?.members??[]){const s=c.sessions.get(m.playerId);if(s?.connected&&c.subscribers.has(m.playerId))c.send(m.playerId,{type:'towerFrame517',selfId:m.playerId,serverNow:now,tower:frame})}}
 }
 for(const[id]of runtimes(c))if(!Object.values(c.data.towerRooms517??{}).some(g=>g.id===id))runtimes(c).delete(id)
}
