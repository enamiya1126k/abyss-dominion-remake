import{cancelEntries474,refundEntry474,crystalBalance474,minimumFee474}from'./SugorokuRewards474.js';
import{createBoard463}from'./SugorokuCoordinator463.js';
import{randomBytes}from'node:crypto';
import{PARTY_GAMES462}from'../../src/party/PartyGames462.js';
const fail=s=>{throw Error(s)};
const clean=(s,n=16)=>String(s??'').replace(/[<>\u0000-\u001f]/g,'').slice(0,n);
export const partyFor462=(c,id)=>Object.values(c.data.parties462??{}).find(p=>p.members.some(m=>m.playerId===id))??null;
export const partyRace462=(c,p)=>p?.raceCode?(p.game==='sugoroku'?c.data.boardRooms463?.[p.raceCode]:c.data.rooms[p.raceCode])??null:null;
export function partyView462(c,session){const p=partyFor462(c,session.playerId);if(!p)return null;const r=partyRace462(c,p);return{minimumCrystals474:minimumFee474(p),id:p.id,code:p.code,hostId:p.hostId,game:p.game,phase:r?.phase??'lounge',raceId:r?.id??null,members:p.members.map(m=>({playerId:m.playerId,name:m.name,connected:!!c.sessions.get(m.playerId)?.connected,atHome:!!m.atHome,ready:!!m.ready,spectating:!!r&&!r.members.some(x=>x.playerId===m.playerId&&!x.departed)}))}}
export function clearReady462(c,r){const p=Object.values(c.data.parties462??{}).find(p=>p.id===r?.partyId462);if(p)for(const m of p.members)m.ready=false}
function deleteGame463(c,r){if(r?.game==='sugoroku'){cancelEntries474(c,r);delete c.data.boardRooms463[r.code]}else if(r)delete c.data.rooms[r.code]}
export function openGame462(c,p,game){if(!PARTY_GAMES462.some(g=>g.id===game))fail('このゲームはまだ遊べません');const old=partyRace462(c,p);if(old&&!['lobby','result'].includes(old.phase))fail('今のゲームが終わってから切り替えられます');if(p.members.some(m=>c.sessions.get(m.playerId)&&c.isBusy(c.sessions.get(m.playerId))))fail('ほかのオンラインコンテンツの終了を待っています');if(old)deleteGame463(c,old);const people=p.members.map(m=>({playerId:m.playerId,name:m.name,owned:m.owned,choice:null,ai:false}));const r=game==='sugoroku'?createBoard463(c,p,people):c.makeRoom(p.code,people,8);r.hostId=p.hostId;r.partyId462=p.id;if(game==='sugoroku'&&old?.economy474){const fee=Math.min(old.economy474.fee,minimumFee474(p));r.economy474={mode:old.economy474.mode==='crystal'&&fee>0?'crystal':'practice',fee:fee||500,epoch:0,entries:{}}}if(old?.game!=='sugoroku'&&old&&game==='race'){r.track459=old.track459;r.course=old.course==='芝'?'砂':'芝';r.aiFatigue455=old.aiFatigue455??{}}if(game==='sugoroku'){c.data.boardRooms463??={};c.data.boardRooms463[p.code]=r}else c.data.rooms[p.code]=r;p.raceCode=p.code;p.game=game;for(const m of p.members)m.ready=false}
export function handleParty462(c,session,m){
 const id=session.playerId;let p=partyFor462(c,id),r=partyRace462(c,p),me=p?.members.find(x=>x.playerId===id);
 if(!String(m.op).startsWith('party'))return false;
 if(Number(m.rulesVersion)<8)fail('ゲームをBuild462へ更新してください');
 if(m.op==='partyCreate462'||m.op==='partyJoin462'){
  if(p)return true;if(c.roomFor(id)||c.isBusy(session))fail('参加中のコンテンツを終了してから集合してください');
  const person={playerId:id,name:clean(m.displayName??session.profile?.displayName??'冒険者'),owned:c.roster(m.roster),ready:false,atHome:false,crystals474:crystalBalance474(m.crystals474)};
  c.data.parties462??={};
  if(m.op==='partyCreate462'){if(Object.keys(c.data.parties462).length>=1000)fail('部屋がいっぱいです');let code;do{code=randomBytes(3).toString('hex').toUpperCase()}while(c.data.parties462[code]||c.data.rooms[code]);p={id:'p462-'+randomBytes(8).toString('hex'),code,hostId:id,createdAt:c.now(),game:null,raceCode:null,members:[person]};c.data.parties462[code]=p;if(m.game)openGame462(c,p,m.game);return true}
  p=c.data.parties462[clean(m.code,6).toUpperCase()];if(!p)fail('合言葉の部屋が見つかりません');if(p.members.length>=4)fail('パーティーは4人までです');if(!c.canJoin(session,p.members))fail('この部屋には参加できません');p.members.push(person);r=partyRace462(c,p);if(r?.phase==='lobby'){r.members.push({...person,choice:null,ai:false,ticket:null,passed:false});clearReady462(c,r)}return true;
 }
 if(!p||!me)fail('先にパーティーへ参加してください');
 if(m.op==='partyPresence462'){me.atHome=m.atHome===true;if(me.atHome)me.ready=false;return true}
 if(m.op==='partyRoster462'){me.crystals474=crystalBalance474(m.crystals474);me.owned=c.roster(m.roster);if(r?.phase==='lobby'){const rm=c.member(r,id);if(rm){rm.owned=me.owned;if(rm.choice){rm.choice=rm.owned.find(x=>x.id===rm.choice.id)??null;me.ready=false}}}return true}
 if(m.op==='partyReady462'){if(r?.phase!=='lobby')fail('ゲームの準備画面で押してください');const rm=c.member(r,id);if(!rm?.choice)fail('コマにする魔物を選んでください');if(me.atHome)fail('準備画面へ戻ってください');if(r.game==='sugoroku'&&r.economy474?.mode==='crystal'){if(m.ready===true&&!r.economy474.entries[id])fail('表示された💎の参加費を支払って準備してください');if(m.ready!==true)refundEntry474(c,r,id)}me.ready=m.ready===true;return true}
 if(m.op==='partyLeave462'){const participant=r?.members.find(x=>x.playerId===id&&!x.departed);if(participant&&!['lobby','result'].includes(r.phase))fail('ゲーム終了後に退出できます。ホームへは戻れます');p.members=p.members.filter(x=>x!==me);if(participant){if(r.phase==='lobby'){refundEntry474(c,r,id);r.members=r.members.filter(x=>x!==participant)}else participant.departed=true}if(!p.members.length){if(r&&['lobby','result'].includes(r.phase))deleteGame463(c,r);delete c.data.parties462[p.code];return true}if(p.hostId===id)p.hostId=(p.members.find(x=>c.sessions.get(x.playerId)?.connected)??p.members[0]).playerId;if(r)r.hostId=p.hostId;return true}
 if(p.hostId!==id)fail('ゲームの切替は部屋主が行えます');
 if(m.op==='partyGame462'){openGame462(c,p,m.game);return true}
 if(m.op==='partyLounge462'){if(r&&!['lobby','result'].includes(r.phase))fail('ゲーム終了後に一覧へ戻れます');if(r)deleteGame463(c,r);p.game=null;p.raceCode=null;for(const x of p.members)x.ready=false;return true}
 fail('未対応のパーティー操作です');
}
export function checkPartyStart462(c,r){if(!r.partyId462)return;const p=Object.values(c.data.parties462??{}).find(x=>x.id===r.partyId462);if(!p)fail('パーティーが見つかりません');if(p.members.some(m=>!m.ready||m.atHome||!c.sessions.get(m.playerId)?.connected))fail('全員が準備画面で「準備OK」を押すと開始できます')}
export function advanceParties462(c){for(const p of Object.values(c.data.parties462??{})){const r=partyRace462(c,p),at=c.now(),host=c.sessions.get(p.hostId)?.connected,replacement=p.members.find(m=>m.playerId!==p.hostId&&c.sessions.get(m.playerId)?.connected);if(!r&&!p.members.some(m=>c.sessions.get(m.playerId)?.connected)&&at-p.createdAt>24*60*60*1000){c.transaction(()=>delete c.data.parties462[p.code]);c.broadcast();continue}if(host&&p.hostMissingAt!=null){c.transaction(()=>delete p.hostMissingAt);continue}if(!host&&replacement){if(p.hostMissingAt==null)c.transaction(()=>{p.hostMissingAt=at});else if(at-p.hostMissingAt>=30000){c.transaction(()=>{p.hostId=replacement.playerId;delete p.hostMissingAt;if(r)r.hostId=p.hostId});c.broadcast()}}}}
