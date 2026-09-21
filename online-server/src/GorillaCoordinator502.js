import{randomBytes,randomInt}from'node:crypto';
import{makeGorilla502,startGorilla502,pullGorilla502,advanceGorilla502}from'../../src/gorilla/Rules502.js';
export const gorillaFor502=(c,id)=>Object.values(c.data.gorillaRooms502??{}).find(g=>g.members.some(m=>m.playerId===id&&!m.departed))??null;
export function createGorilla502(c,p,members){return makeGorilla502({id:`gg502-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]})),now:c.now(),seed:randomBytes(4).readUInt32LE()})}
export function handleGorilla502(c,session,m){
 if(m.op!=='gorilla502')return false;
 const g=gorillaFor502(c,session.playerId),p=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),me=g?.members.find(x=>x.playerId===session.playerId&&!x.departed);
 if(!g||!p||!me||m.gameId!==g.id)throw Error('ゲームが切り替わりました');
 if(m.gorillaVersion502!==1)throw Error('胸毛抜きには本体のBuild502更新が必要です');
 if(m.kind==='select'){
  if(g.phase!=='lobby')throw Error('開始後は魔物を変更できません');
  const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している魔物を選んでね');me.choice={...choice};p.members.find(x=>x.playerId===session.playerId).ready=false;g.updatedAt=c.now();g.revision++;
 }else if(m.kind==='start'){
  if(p.hostId!==session.playerId)throw Error('部屋主が開始できます');if(g.phase!=='lobby')return true;
  if(p.members.some(x=>x.gorillaVersion502!==1))throw Error('全員がBuild502へ更新してから開始してください');
  if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が魔物を選んで「準備OK」を押してください');
  if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');
  g.aiColors500={...(p.aiColors500??{})};startGorilla502(g,c.now(),{badHair:randomInt(6),firstSeat:randomInt(4)});
 }else if(m.kind==='pull')pullGorilla502(g,session.playerId,m.hair,m.turn,c.now());
 else throw Error('未対応の操作です');return true;
}
export function advanceGorillas502(c){
 const at=c.now();for(const g of Object.values(c.data.gorillaRooms502??{})){
  if(!['lobby','result'].includes(g.phase)&&at>=g.nextAt){c.transaction(()=>advanceGorilla502(g,at));c.broadcast()}
  else if(['lobby','result'].includes(g.phase)&&at-g.updatedAt>86400000&&!g.members.some(m=>c.sessions.get(m.playerId)?.connected)){
   c.transaction(()=>{delete c.data.gorillaRooms502[g.code];const p=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false)}});c.broadcast();
  }
 }
}
