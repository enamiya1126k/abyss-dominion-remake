import {canShoot555} from '../../src/ricochet550/Arena555.js';
import {canBurst553} from '../../src/ricochet550/Rush553.js';
import {randomBytes} from 'node:crypto';
import {make550,start550,advance550,public550,RICOCHET550 as C} from '../../src/ricochet550/Rules550.js';
export const ricochetFor550=(c,id)=>Object.values(c.data.ricochetRooms550??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
const runtimes=c=>c.ricochetRuntime550??=new Map();
export const liveRicochet550=(c,g)=>runtimes(c).get(g?.id)?.g??g;
export const ricochetSnapshot550=(c,g,id)=>g?.game==='pinball'&&g.rules550===6?public550(liveRicochet550(c,g),id):null;
export function createRicochet550(c,p,members,mode){return make550({id:`rc550-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),mode,members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
function runtime(c,g){let r=runtimes(c).get(g.id);if(!r){r={g:structuredClone(g),inputs:[],sequences:new Map(),lastSave:c.now(),lastSend:0,phase:g.phase,round:g.round};runtimes(c).set(g.id,r)}return r}
export function handleRicochet550(c,session,m){if(m.op!=='ricochet550')return false;const g=ricochetFor550(c,session.playerId),party=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(p=>p.playerId===session.playerId&&!p.departed);
 if(!g||!party||!me||m.gameId!==g.id)throw Error('ゲームが切り替わりました');if(m.ricochetVersion550!==6)throw Error('本体をBuild555へ更新してください');if(g.phase!=='lobby')throw Error('準備画面で設定してください');
 if(m.kind==='select'){const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している相棒を選んでね');me.choice={...choice};party.members.find(x=>x.playerId===me.playerId).ready=false}
 else if(m.kind==='duration'){if(party.hostId!==session.playerId)throw Error('部屋主が設定できます');if(![90,150].includes(m.seconds))throw Error('90秒か150秒を選んでね');g.duration555=m.seconds*1000;party.members.forEach(x=>x.ready=false)}
 else if(m.kind==='start'){if(party.hostId!==session.playerId)throw Error('部屋主が開始できます');if(party.members.some(p=>p.ricochetVersion550!==6))throw Error('全員がBuild555へ更新してください');if(party.members.some(p=>!p.ready||p.atHome||!c.sessions.get(p.playerId)?.connected)||g.members.some(p=>!p.choice))throw Error('全員の相棒と準備OKを確認してください');if(party.members.some(p=>c.isBusy(c.sessions.get(p.playerId))))throw Error('ほかの対戦の終了を待っています');g.aiColors500={...(party.aiColors500??{})};start550(g,c.now(),randomBytes(4).readUInt32LE());runtimes(c).delete(g.id)}else throw Error('未対応の操作です');
 g.updatedAt=c.now();g.revision++;return true;
}
export function queueRicochet550(c,session,m){const saved=ricochetFor550(c,session.playerId);if(!session?.connected||!saved||m.gameId!==saved.id||m.ricochetVersion550!==6||!Number.isSafeInteger(m.seq)||m.seq<1||m.seq>1e9)return false;
 const r=runtime(c,saved),g=r.g,p=g.players.find(x=>x.playerId===session.playerId),party=Object.values(c.data.parties462??{}).find(x=>x.id===g.partyId462);
 if(!p||p.ai||m.round!==g.round||m.seq<=Math.max(p.lastSeq,r.sequences.get(p.playerId)??0)||party?.members.find(x=>x.playerId===p.playerId)?.atHome||!['pick','pull','shoot','cancel','burstPull','burstShoot','burstCancel'].includes(m.action))return false;
 if(m.action==='pick'){if(g.phase!=='play'||m.offerId!==p.offerId555||!p.offers.includes(m.item)||c.now()>p.offerUntil555)return false}
 else{const burst=m.action.startsWith('burst'),cancel=['cancel','burstCancel'].includes(m.action),shoot=['shoot','burstShoot'].includes(m.action);if(m.shot!==(burst?p.bursts553:p.shots555)||(burst?!canBurst553(g,p,c.now()):!canShoot555(g,p,c.now())))return false;if(!cancel&&(!Number.isFinite(m.angle)||Math.abs(m.angle)>Math.PI||!Number.isFinite(m.power)||m.power>1||m.power<(shoot?.08:0)))return false}
 if(r.inputs.filter(i=>i.playerId===p.playerId).length>=16)return false;
 const input={playerId:p.playerId,seq:m.seq,round:m.round,action:m.action,angle:m.angle,power:m.power,item:m.item,offerId:m.offerId,shot:m.shot,at:c.now()};if(['pull','burstPull'].includes(m.action)){const previous=r.inputs.at(-1);if(previous?.playerId===p.playerId&&previous.action===m.action)r.inputs.pop()}r.inputs.push(input);r.sequences.set(p.playerId,m.seq);return true;
}
export function advanceRicochets550(c){const now=c.now();for(const saved of Object.values(c.data.ricochetRooms550??{})){
 if(saved.game==='junkgp'){c.transaction(()=>{delete c.data.ricochetRooms550[saved.code];const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);if(party){party.game=null;party.raceCode=null;party.members.forEach(m=>m.ready=false);}});runtimes(c).delete(saved.id);c.broadcast();continue;}
 if(saved.rules550!==6){c.transaction(()=>{saved.rules550=6;saved.phase='lobby';saved.players=[];saved.history=[];saved.results=[];saved.round=1;saved.rounds=1;saved.duration555=90000;saved.updatedAt=now;saved.notice551='90秒の１試合に更新しました。準備OKから始めよう！';const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);party?.members.forEach(m=>m.ready=false)});runtimes(c).delete(saved.id);c.broadcast();continue}
 if(['lobby','result'].includes(saved.phase)){if(now-saved.updatedAt>86400000&&!saved.members.some(m=>c.sessions.get(m.playerId)?.connected)){c.transaction(()=>{delete c.data.ricochetRooms550[saved.code];const party=Object.values(c.data.parties462??{}).find(p=>p.id===saved.partyId462);if(party){party.game=null;party.raceCode=null;party.members.forEach(m=>m.ready=false)}});runtimes(c).delete(saved.id);c.broadcast()}continue}
 const r=runtime(c,saved),g=r.g,party=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462),auto=new Set();g.hostId=saved.hostId;g.members=structuredClone(saved.members);
 for(const p of g.players)if(!p.ai&&(!party?.members.some(m=>m.playerId===p.playerId)||!c.sessions.get(p.playerId)?.connected||party?.members.find(m=>m.playerId===p.playerId)?.atHome)){auto.add(p.playerId);r.inputs=r.inputs.filter(i=>i.playerId!==p.playerId)}
 advance550(g,now,r.inputs,auto);const changed=r.phase!==g.phase,critical=g.events.filter(e=>['launch','burst','jackpotSpin','jackpot','lane','spinner','pick','supply'].includes(e.type)).at(-1)?.id??0;
 if(changed||r.round!==g.round||critical!==(r.critical??0)||now-r.lastSave>=2000){c.transaction(()=>{c.data.ricochetRooms550[g.code]=structuredClone(g)});r.lastSave=now;r.critical=critical;r.phase=g.phase;r.round=g.round}
 if(changed)for(const m of party?.members??[])c.push(c.sessions.get(m.playerId));
 if(now-r.lastSend>=50){r.lastSend=now;for(const m of party?.members??[])if(c.sessions.get(m.playerId)?.connected&&c.subscribers.has(m.playerId))c.send(m.playerId,{type:'ricochetFrame550',selfId:m.playerId,serverNow:now,ricochet:public550(g,m.playerId,{frame:true})})}
 }for(const[id]of runtimes(c))if(!Object.values(c.data.ricochetRooms550??{}).some(g=>g.id===id))runtimes(c).delete(id);
}
