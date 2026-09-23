import {randomBytes} from 'node:crypto';
import {makeFishing524,startFishing524,advanceFishing524,publicFishing524} from '../../src/fishing/Rules524.js';
export const fishingFor524=(c,id)=>Object.values(c.data.fishingRooms524??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
const runtimes=c=>c.fishingRuntime524??=new Map();
export const liveFishing524=(c,g)=>runtimes(c).get(g?.id)?.g??g;
export const fishingSnapshot524=(c,g)=>publicFishing524(liveFishing524(c,g));
export function createFishing524(c,p,members){return makeFishing524({id:`f524-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
function runtime(c,g){let r=runtimes(c).get(g.id);if(!r){r={g:structuredClone(g),inputs:new Map(),lastSave:c.now(),lastSend:0,phase:g.phase};runtimes(c).set(g.id,r)}return r}
export function handleFishing524(c,session,m){if(m.op!=='fishing524')return false;const g=fishingFor524(c,session.playerId),p=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);if(!g||!p||!me||g.id!==m.gameId)throw Error('ゲームが切り替わりました');if(m.fishingVersion524!==1)throw Error('本体をBuild524へ更新してください');if(g.phase!=='lobby')throw Error('開始前に設定してください');
 if(m.kind==='select'){const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している魔物を選んでね');me.choice={...choice};p.members.find(x=>x.playerId===me.playerId).ready=false}
 else if(m.kind==='start'){if(p.hostId!==session.playerId)throw Error('部屋主が開始できます');if(p.members.some(x=>x.fishingVersion524!==1))throw Error('全員がBuild524へ更新してください');if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が相棒を選んで準備OKを押してください');if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');g.aiColors500={...(p.aiColors500??{})};startFishing524(g,c.now(),randomBytes(4).readUInt32LE());runtimes(c).delete(g.id)}else throw Error('未対応の操作です');g.updatedAt=c.now();g.revision++;return true;
}
export function queueFishing524(c,session,m){const saved=fishingFor524(c,session.playerId);if(!saved||saved.id!==m.gameId||m.fishingVersion524!==1||m.kind!=='input'||!Number.isSafeInteger(m.seq)||m.seq>1e9)return false;const r=runtime(c,saved),g=r.g,p=g.players.find(p=>p.playerId===session.playerId);if(g.phase!=='play'||!p||p.ai||m.seq<=p.lastSeq)return false;
 if(typeof m.reel!=='boolean'||m.cast&&(!Number.isFinite(m.cast.x)||!Number.isFinite(m.cast.y)||m.cast.x<0||m.cast.x>1||m.cast.y<0||m.cast.y>1)||m.choice&&!['keep','bait'].includes(m.choice))return false;
 const old=r.inputs.get(p.playerId);r.inputs.set(p.playerId,{reel:m.reel,cast:m.cast?{x:m.cast.x,y:m.cast.y,bait:m.cast.bait===true}:old?.cast,choice:m.choice??old?.choice,receivedAt:c.now()});p.lastSeq=m.seq;return true;
}
export function advanceFishings524(c){const now=c.now();for(const saved of Object.values(c.data.fishingRooms524??{})){
 if(['lobby','result'].includes(saved.phase)){if(now-saved.updatedAt>86400000&&!saved.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete c.data.fishingRooms524[saved.code];const p=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false)}});runtimes(c).delete(saved.id);c.broadcast()}continue}
 const r=runtime(c,saved),g=r.g,party=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462),auto=new Set();g.hostId=saved.hostId;
 for(const p of g.players){if(!p.ai&&(!c.sessions.get(p.playerId)?.connected||party?.members.find(m=>m.playerId===p.playerId)?.atHome))auto.add(p.playerId);const input=r.inputs.get(p.playerId);if(input&&now-input.receivedAt>450){input.reel=false;delete input.cast;delete input.choice}}
 advanceFishing524(g,now,r.inputs,auto);const changed=r.phase!==g.phase;
 if(changed||now-r.lastSave>=2000){c.transaction(()=>{c.data.fishingRooms524[g.code]=structuredClone(g)});r.lastSave=now;r.phase=g.phase}
 if(changed)for(const m of party?.members??[])c.push(c.sessions.get(m.playerId));
 if(now-r.lastSend>=100){r.lastSend=now;const frame=publicFishing524(g);for(const m of party?.members??[])if(c.sessions.get(m.playerId)?.connected&&c.subscribers.has(m.playerId))c.send(m.playerId,{type:'fishingFrame524',selfId:m.playerId,serverNow:now,fishing:frame})}
 }
 for(const[id]of runtimes(c))if(!Object.values(c.data.fishingRooms524??{}).some(g=>g.id===id))runtimes(c).delete(id);
}
