import {randomBytes,randomInt} from 'node:crypto';
import {makeLuck508,startLuck508,drawPlan508,chooseLuck508,advanceLuck508} from '../../src/luck/Rules508.js';
import {advanceLuck507} from '../../src/luck/Rules507.js';
import {luckFor507,handleLuck507} from './LuckCoordinator507.js';
export {luckFor507};
export function createLuck508(c,p,members){return makeLuck508({id:`lk508-${++c.data.serial}-${randomBytes(4).toString('hex')}`,code:p.code,partyId:p.id,hostId:p.hostId,now:c.now(),members:members.map(m=>({...m,choice:m.owned.find(x=>x.id===p.members.find(pm=>pm.playerId===m.playerId)?.slotOne476)??m.owned[0]}))})}
export function handleLuck508(c,session,m){
 if(m.op!=='luck507'&&m.op!=='luck508')return false;
 const g=luckFor507(c,session.playerId);
 if(g?.rules508!==1)return handleLuck507(c,session,m);
 const p=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462),me=g.members.find(x=>x.playerId===session.playerId&&!x.departed);
 if(!p||!me||m.gameId!==g.id)throw Error('ゲームが切り替わりました');
 if(m.luckVersion508!==1)throw Error('運だけ大運動会には本体のBuild508更新が必要です');
 if(m.kind==='select'){
  if(g.phase!=='lobby')throw Error('開始後は魔物を変更できません');
  const choice=me.owned.find(x=>x.id===m.monsterId);if(!choice)throw Error('所持している魔物を選んでね');
  me.choice={...choice};p.members.find(x=>x.playerId===session.playerId).ready=false;g.updatedAt=c.now();g.revision++;
 }else if(m.kind==='start'){
  if(p.hostId!==session.playerId)throw Error('部屋主が開始できます');if(g.phase!=='lobby')return true;
  if(p.members.some(x=>x.luckVersion508!==1))throw Error('全員がBuild508へ更新してから開始してください');
  if(p.members.some(x=>!x.ready||x.atHome||!c.sessions.get(x.playerId)?.connected)||g.members.some(x=>!x.choice))throw Error('全員が魔物を選んで「準備OK」を押してください');
  if(p.members.some(x=>c.isBusy(c.sessions.get(x.playerId))))throw Error('ほかの対戦の終了を待っています');
  g.aiColors500={...(p.aiColors500??{})};startLuck508(g,c.now(),drawPlan508(randomInt));
 }else if(m.kind==='chest'||m.kind==='hand')chooseLuck508(g,session.playerId,m.kind,m.index,m.round,c.now());
 else throw Error('未対応の操作です');return true;
}
export function advanceLucks508(c){const at=c.now();for(const g of Object.values(c.data.luckRooms507??{})){
 if(!['lobby','result'].includes(g.phase)&&Number.isFinite(g.nextAt)&&at>=g.nextAt){c.transaction(()=>(g.rules508===1?advanceLuck508:advanceLuck507)(g,at));c.broadcast()}
 else if(['lobby','result'].includes(g.phase)&&at-g.updatedAt>86400000&&!g.members.some(m=>c.sessions.get(m.playerId)?.connected)){
  c.transaction(()=>{delete c.data.luckRooms507[g.code];const p=Object.values(c.data.parties462??{}).find(p=>p.id===g.partyId462);if(p){p.game=null;p.raceCode=null;p.members.forEach(m=>m.ready=false)}});c.broadcast();
 }
}}
