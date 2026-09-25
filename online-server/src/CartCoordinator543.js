import {randomBytes} from 'node:crypto';
import {CART543 as C,makeCart543,startCart543,advanceCart543,publicCart543} from '../../src/cart/Rules543.js';
export const cartFor543=(c,id)=>Object.values(c.data.cartRooms543??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
const runtimes=c=>c.cartRuntime543??=new Map();
export const liveCart543=(c,g)=>runtimes(c).get(g?.id)?.g??g;
export const cartSnapshot543=(c,g,id)=>publicCart543(liveCart543(c,g),id);
export function createCart543(c,p,members){return makeCart543({id:`c543-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
function runtime(c,g){let r=runtimes(c).get(g.id);if(!r){r={g:structuredClone(g),inputs:new Map(),lastSave:c.now(),lastSend:0,phase:g.phase};runtimes(c).set(g.id,r)}return r}
export function handleCart543(c,session,m){if(m.op!=='cart543')return false;const g=cartFor543(c,session.playerId),party=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);
 if(!g||!party||!me||g.id!==m.gameId)throw Error('ゲームが切り替わりました');if(m.cartVersion543!==4)throw Error('本体をBuild547へ更新してください');if(g.phase!=='lobby')throw Error('開始前に設定してください');
 if(m.kind==='select'){const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している相棒を選んでね');me.choice={...choice};party.members.find(x=>x.playerId===me.playerId).ready=false}
 else if(m.kind==='start'){if(party.hostId!==session.playerId)throw Error('部屋主が開始できます');if(party.members.some(x=>x.cartVersion543!==4))throw Error('全員がBuild547へ更新してください');if(party.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が相棒を選んで準備OKを押してください');if(party.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');g.aiColors500={...(party.aiColors500??{})};startCart543(g,c.now(),randomBytes(4).readUInt32LE());runtimes(c).delete(g.id)}
 else throw Error('未対応の操作です');g.updatedAt=c.now();g.revision++;return true;
}
export function queueCart543(c,session,m){
 const saved=cartFor543(c,session.playerId);
 if(!session.connected||!saved||saved.id!==m.gameId||m.cartVersion543!==4||!Number.isSafeInteger(m.seq)||m.seq<1||m.seq>1e9||!['pull','shoot','cancel'].includes(m.action))return false;
 if(m.action!=='cancel'&&(!Number.isFinite(m.angle)||Math.abs(m.angle)>C.maxAngle||!Number.isFinite(m.power)||m.power>1||m.power<(m.action==='shoot'?.08:0)))return false;
 const r=runtime(c,saved),g=r.g,p=g.players.find(p=>p.playerId===session.playerId),party=Object.values(c.data.parties462??{}).find(x=>x.id===g.partyId462);
 if(g.phase!=='play'||!p||p.ai||p.launched||m.round!==g.round||m.seq<=p.lastSeq||c.now()>=g.roundAt+C.launchWindow||party?.members.find(x=>x.playerId===p.playerId)?.atHome)return false;
 const actions=r.inputs.get(p.playerId)??[];if(actions.length>=16)return false;
 const input={action:m.action,angle:m.angle,power:m.power,at:c.now()};if(m.action==='pull'&&actions.at(-1)?.action==='pull')actions[actions.length-1]=input;else actions.push(input);r.inputs.set(p.playerId,actions);p.lastSeq=m.seq;return true;
}
export function advanceCarts543(c){const now=c.now();for(const saved of Object.values(c.data.cartRooms543??{})){
 if(saved.rules543!==4&&['countdown','play','intermission'].includes(saved.phase)){c.transaction(()=>{const fresh=makeCart543({id:saved.id,code:saved.code,partyId:saved.partyId462,hostId:saved.hostId,members:saved.members,now});c.data.cartRooms543[saved.code]=fresh;const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);party?.members.forEach(m=>m.ready=false)});runtimes(c).delete(saved.id);c.broadcast();continue}
 if(['lobby','result'].includes(saved.phase)){if(now-saved.updatedAt>86400000&&!saved.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete c.data.cartRooms543[saved.code];const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);if(party){party.game=null;party.raceCode=null;party.members.forEach(m=>m.ready=false)}});runtimes(c).delete(saved.id);c.broadcast()}continue}
 const r=runtime(c,saved),g=r.g,party=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462),auto=new Set();g.hostId=saved.hostId;g.members=structuredClone(saved.members);
 for(const p of g.players)if(!p.ai&&(!party?.members.some(m=>m.playerId===p.playerId)||!c.sessions.get(p.playerId)?.connected||party?.members.find(m=>m.playerId===p.playerId)?.atHome)){auto.add(p.playerId);r.inputs.delete(p.playerId)}
 advanceCart543(g,now,r.inputs,auto);const changed=r.phase!==g.phase;
 if(changed||now-r.lastSave>=2000){c.transaction(()=>{c.data.cartRooms543[g.code]=structuredClone(g)});r.lastSave=now;r.phase=g.phase}
 if(changed)for(const m of party?.members??[])c.push(c.sessions.get(m.playerId));
 if(now-r.lastSend>=100){r.lastSend=now;for(const m of party?.members??[])if(c.sessions.get(m.playerId)?.connected&&c.subscribers.has(m.playerId))c.send(m.playerId,{type:'cartFrame543',selfId:m.playerId,serverNow:now,cart:publicCart543(g,m.playerId,{frame:true})})}
 }for(const[id]of runtimes(c))if(!Object.values(c.data.cartRooms543??{}).some(g=>g.id===id))runtimes(c).delete(id);
}
