import{rewardMode474,validFee474,ECONOMY474}from'../../src/sugoroku/Rewards474.js';
const issue=(c,id,entry)=>{const a=c.data.accounts[id];if(!a)throw Error('💎の受取先がありません');a.sgDeliveries474??=[];if(!a.sgDeliveries474.some(e=>e.id===entry.id))a.sgDeliveries474.push(entry)};
export function refundEntry474(c,g,id,reason='開始前のキャンセル'){
 const entry=g.economy474?.entries?.[id];if(!entry)return;const a=c.data.accounts[id];a.sgDecisions474[entry.requestId].status='refunded';issue(c,id,{id:`sg474:${entry.requestId}`,kind:'refund',gameId:g.id,playerId:id,requestId:entry.requestId,fee:entry.amount,crystals:entry.amount,reason});delete g.economy474.entries[id];
}
export function cancelEntries474(c,g){if(!g?.economy474||g.economy474.settled)return;for(const id of Object.keys(g.economy474.entries??{}))refundEntry474(c,g,id,'ゲームの中止・期限切れ');g.economy474.settled=true}
export function settleCrystals474(c,g){if(!rewardMode474(g)||g.phase!=='result'||g.economy474.settled)return;for(const p of g.players.filter(p=>!p.ai)){const entry=g.economy474.entries[p.playerId],r=g.results.find(r=>r.playerId===p.playerId)?.crystals474;if(!entry||!r)throw Error('報酬戦の参加記録がありません');issue(c,p.playerId,{id:`sg474:${entry.requestId}`,kind:'result',gameId:g.id,playerId:p.playerId,requestId:entry.requestId,fee:entry.amount,place:g.results.find(r=>r.playerId===p.playerId).place,tied:g.results.filter(r=>r.place===g.results.find(r=>r.playerId===p.playerId).place).length,prize:r.prize,journey:r.journey,crystals:r.total});c.data.accounts[p.playerId].sgDecisions474[entry.requestId].status='settled'}g.economy474.settled=true}
export function handleCrystal474(c,session,m){
 if(m.op==='sgAck474'){const pm=Object.values(c.data.parties462??{}).flatMap(p=>p.members).find(x=>x.playerId===session.playerId),balance=crystalBalance474(m.crystals474);if(pm&&balance!==null)pm.crystals474=balance;const a=c.data.accounts[session.playerId],ids=new Set((Array.isArray(m.ids)?m.ids:[]).filter(x=>typeof x==='string').slice(0,24));a.sgDeliveries474=(a.sgDeliveries474??[]).filter(e=>!ids.has(e.id));return true}
 if(m.op!=='sgEntry474')return false;
 if(Number(m.rulesVersion)<14||!validFee474(m.amount)||!/^sg463-\d+-[a-f0-9]{8}$/.test(m.gameId)||!/^[\w-]{8,100}$/.test(m.requestId))throw Error('参加情報を確認してください');
 const a=c.data.accounts[session.playerId];a.sgDecisions474??={};const previous=a.sgDecisions474[m.requestId];if(previous){if(previous.gameId!==m.gameId||previous.amount!==m.amount)throw Error('参加番号が一致しません');return true}
 const g=Object.values(c.data.boardRooms463??{}).find(g=>g.id===m.gameId),p=Object.values(c.data.parties462??{}).find(p=>p.id===g?.partyId462),member=g?.members.find(m=>m.playerId===session.playerId),pm=p?.members.find(m=>m.playerId===session.playerId);
 const valid=g?.economy474?.fee===m.amount&&(g.economy474.epoch??0)===m.epoch&&g?.phase==='lobby'&&rewardMode474(g)&&member?.choice&&pm&&!pm.atHome&&!g.economy474.entries[session.playerId]&&!Object.values(c.data.boardRooms463??{}).some(x=>x!==g&&x.economy474?.entries?.[session.playerId]&&!x.economy474.settled)&&!(a.sgDeliveries474?.length)&&!c.isBusy(session);
 a.sgDecisions474[m.requestId]={requestId:m.requestId,gameId:m.gameId,amount:m.amount,status:valid?'accepted':'refunded'};
 if(!valid){issue(c,session.playerId,{id:`sg474:${m.requestId}`,kind:'refund',gameId:m.gameId,playerId:session.playerId,requestId:m.requestId,fee:m.amount,crystals:m.amount,reason:'受付できなかったため返金'});return true}
 g.economy474.entries[session.playerId]={requestId:m.requestId,amount:m.amount};pm.ready=true;g.revision++;g.updatedAt=c.now();return true;
}

export const crystalBalance474=n=>Number.isSafeInteger(n)&&n>=0?n:null;
export function minimumFee474(p){return Math.min(ECONOMY474.maxFee,...p.members.map(m=>crystalBalance474(m.crystals474)??0))}
