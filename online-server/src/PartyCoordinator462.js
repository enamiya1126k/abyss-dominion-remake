import{createLuck511 as createLuck507}from'./LuckCoordinator511.js';
import{createGorilla502}from'./GorillaCoordinator502.js';
import{color499,validColor499}from'../../src/party/PartyColors499.js';
import{createCanal489}from'./CanalCoordinator489.js';
import{createCabbage484}from'./CabbageCoordinator484.js';
const portrait476=m=>{const x=m.owned?.find(x=>x.id===m.slotOne476);return x?{speciesId:x.speciesId}:null};
const slot476=(owned,id)=>owned.some(x=>x.id===id)?id:null;
import{cancelEntries474,refundEntry474,crystalBalance474,minimumFee474}from'./SugorokuRewards474.js';
import{createBoard463}from'./SugorokuCoordinator463.js';
import{randomBytes}from'node:crypto';
import{PARTY_GAMES462}from'../../src/party/PartyGames462.js';
const fail=s=>{throw Error(s)};
const clean=(s,n=16)=>String(s??'').replace(/[<>\u0000-\u001f]/g,'').slice(0,n);
export const partyFor462=(c,id)=>Object.values(c.data.parties462??{}).find(p=>p.members.some(m=>m.playerId===id))??null;
export const partyRace462=(c,p)=>p?.raceCode?(p.game==='luck'?c.data.luckRooms507?.[p.raceCode]:p.game==='gorilla'?c.data.gorillaRooms502?.[p.raceCode]:p.game==='canal'?c.data.canalRooms489?.[p.raceCode]:p.game==='sugoroku'?c.data.boardRooms463?.[p.raceCode]:p.game==='cabbage'?c.data.cabbageRooms484?.[p.raceCode]:c.data.rooms[p.raceCode])??null:null;
export function partyView462(c,session){const p=partyFor462(c,session.playerId);if(!p)return null;const r=partyRace462(c,p);return{minimumCrystals474:minimumFee474(p),aiColors500:{...(p.aiColors500??{})},id:p.id,code:p.code,hostId:p.hostId,game:p.game,phase:r?.phase??'lounge',raceId:r?.id??null,members:p.members.map((m,i)=>({playerId:m.playerId,name:m.name,color499:color499(m.color499,i).id,seatToken485:m.seatToken485??null,portrait476:portrait476(m),connected:!!c.sessions.get(m.playerId)?.connected,atHome:!!m.atHome,ready:!!m.ready,spectating:!!r&&!r.members.some(x=>x.playerId===m.playerId&&!x.departed)}))}}
export function clearReady462(c,r){const p=Object.values(c.data.parties462??{}).find(p=>p.id===r?.partyId462);if(p)for(const m of p.members)m.ready=false}
function deleteGame463(c,r){if(r?.game==='luck'){delete c.data.luckRooms507[r.code]}else if(r?.game==='gorilla'){delete c.data.gorillaRooms502[r.code]}else if(r?.game==='canal'){delete c.data.canalRooms489[r.code];for(const[key]of c.canalQueue489??[])if(key.startsWith(r.id+':'))c.canalQueue489.delete(key)}else if(r?.game==='cabbage'){delete c.data.cabbageRooms484[r.code];for(const [key]of c.cabbageQueue484??[])if(key.startsWith(r.id+':'))c.cabbageQueue484.delete(key)}else if(r?.game==='sugoroku'){cancelEntries474(c,r);delete c.data.boardRooms463[r.code]}else if(r)delete c.data.rooms[r.code]}
export function openGame462(c,p,game){if(!PARTY_GAMES462.some(g=>g.id===game))fail('このゲームはまだ遊べません');const old=partyRace462(c,p);if(old&&!['lobby','result'].includes(old.phase))fail('今のゲームが終わってから切り替えられます');if(p.members.some(m=>c.sessions.get(m.playerId)&&c.isBusy(c.sessions.get(m.playerId))))fail('ほかのオンラインコンテンツの終了を待っています');if(old)deleteGame463(c,old);const people=p.members.map((m,i)=>({playerId:m.playerId,name:m.name,color499:color499(m.color499,i).id,owned:m.owned,choice:null,ai:false}));const r=game==='luck'?createLuck507(c,p,people):game==='gorilla'?createGorilla502(c,p,people):game==='canal'?createCanal489(c,p,people):game==='sugoroku'?createBoard463(c,p,people):game==='cabbage'?createCabbage484(c,p,people):c.makeRoom(p.code,people,8);r.hostId=p.hostId;r.partyId462=p.id;if(game==='sugoroku'&&old?.economy474){const fee=Math.min(old.economy474.fee,minimumFee474(p));r.economy474={mode:old.economy474.mode==='crystal'&&fee>0?'crystal':'practice',fee:fee||500,epoch:0,entries:{}}}if(old?.game!=='luck'&&old?.game!=='gorilla'&&old?.game!=='canal'&&old?.game!=='sugoroku'&&old?.game!=='cabbage'&&old&&game==='race'){r.track459=old.track459;r.course=old.course==='芝'?'砂':'芝';r.aiFatigue455=old.aiFatigue455??{}}if(game==='luck'){c.data.luckRooms507??={};c.data.luckRooms507[p.code]=r}else if(game==='gorilla'){c.data.gorillaRooms502??={};c.data.gorillaRooms502[p.code]=r}else if(game==='canal'){c.data.canalRooms489??={};c.data.canalRooms489[p.code]=r}else if(game==='sugoroku'){c.data.boardRooms463??={};c.data.boardRooms463[p.code]=r}else if(game==='cabbage'){c.data.cabbageRooms484??={};c.data.cabbageRooms484[p.code]=r}else c.data.rooms[p.code]=r;p.raceCode=p.code;p.game=game;for(const m of p.members)m.ready=false}
export function handleParty462(c,session,m){
 const id=session.playerId;let p=partyFor462(c,id),r=partyRace462(c,p),me=p?.members.find(x=>x.playerId===id);
 if(!String(m.op).startsWith('party'))return false;
 if(Number(m.rulesVersion)<8)fail('ゲームをBuild462へ更新してください');
 if(m.op==='partyCreate462'||m.op==='partyJoin462'){
  if(p)return true;if(c.roomFor(id)||c.isBusy(session))fail('参加中のコンテンツを終了してから集合してください');
  const person={playerId:id,name:clean(m.displayName??session.profile?.displayName??'冒険者'),owned:c.roster(m.roster),ready:false,atHome:false,crystals474:crystalBalance474(m.crystals474)};
  person.seatToken485=randomBytes(8).toString('hex');person.luckVersion511=m.luckVersion511===1?1:0;person.luckVersion509=m.luckVersion509===1?1:0;person.luckVersion508=m.luckVersion508===1?1:0;person.luckVersion507=m.luckVersion507===1?1:0;person.gorillaRules505=m.gorillaRules505===1?1:0;person.gorillaRules504=m.gorillaRules504===1?1:0;person.gorillaRules503=m.gorillaRules503===1?1:0;person.gorillaVersion502=m.gorillaVersion502===1?1:0;person.canalVersion489=m.canalVersion489===1?1:0;person.canalRules492=m.canalRules492===1?1:0;person.canalRules494=m.canalRules494===1?1:0;person.canalRules496=m.canalRules496===1?1:0;person.canalRules500=m.canalRules500===1?1:0;person.cabbageVersion484=m.cabbageVersion484===1?1:0;person.cabbageScoring491=m.cabbageScoring491===1?1:0;person.slotOne476=slot476(person.owned,m.slotOne476);
  c.data.parties462??={};
  if(m.op==='partyCreate462'){person.color499=color499(c.data.accounts[id]?.partyColor499,0).id;if(Object.keys(c.data.parties462).length>=1000)fail('部屋がいっぱいです');let code;do{code=randomBytes(3).toString('hex').toUpperCase()}while(c.data.parties462[code]||c.data.rooms[code]);p={id:'p462-'+randomBytes(8).toString('hex'),code,hostId:id,createdAt:c.now(),game:null,raceCode:null,members:[person]};c.data.parties462[code]=p;if(m.game)openGame462(c,p,m.game);return true}
  p=c.data.parties462[clean(m.code,6).toUpperCase()];if(!p)fail('合言葉の部屋が見つかりません');if(p.members.length>=4)fail('パーティーは4人までです');if(!c.canJoin(session,p.members))fail('この部屋には参加できません');person.color499=color499(c.data.accounts[id]?.partyColor499,p.members.length).id;p.members.push(person);r=partyRace462(c,p);if(r?.phase==='lobby'){r.members.push({...person,choice:null,ai:false,ticket:null,passed:false});clearReady462(c,r)}return true;
 }
 if(!p||!me)fail('先にパーティーへ参加してください');
 if(m.op==='partyKick485'){
  if(p.hostId!==id)fail('部屋主だけが退場させられます');
  if(m.partyId!==p.id||m.gameId!==(r?.id??null))fail('部屋の状態が変わりました。参加者を選び直してください');
  if(m.playerId===id)fail('自分は「パーティーから退出」を使ってください');
  if(r&&!['lobby','result'].includes(r.phase))fail('対戦中は退場させられません。ゲーム終了後に操作してください');
  const target=p.members.find(x=>x.playerId===m.playerId);if(!target)return true;
  if((target.seatToken485??null)!==(m.seatToken485??null))fail('このプレイヤーは入り直しています。参加者を選び直してください');
  const participant=r?.members.find(x=>x.playerId===target.playerId&&!x.departed);
  if(r?.phase==='lobby'){
   refundEntry474(c,r,target.playerId,'部屋主による開始前の退場');
   r.members=r.members.filter(x=>x.playerId!==target.playerId);
  }else if(participant)participant.departed=true;
  p.members=p.members.filter(x=>x.playerId!==target.playerId);
  if(r){r.updatedAt=c.now();if(r.game==='luck'||r.game==='gorilla'||r.game==='canal'||r.game==='sugoroku'||r.game==='cabbage')r.revision=(r.revision??0)+1}
  return true;
 }
 if(m.op==='partyMemberColor500'){
  if(p.hostId!==id)fail('他のプレイヤーの色は部屋主が変更できます');
  if(m.partyId!==p.id)fail('部屋の状態が変わりました。選び直してください');
  if(!validColor499(m.color499))fail('ブルー・グリーン・ピンク・オレンジから選んでください');
  if(r&&!['lobby','result'].includes(r.phase))fail('カラーはゲーム終了後に変更できます');
  if(m.aiSeat500!=null){
   if(!Number.isInteger(m.aiSeat500)||m.aiSeat500<0||m.aiSeat500>3||p.members[m.aiSeat500])fail('この席にはプレイヤーが参加しています。選び直してください');
   p.aiColors500??={};p.aiColors500[m.aiSeat500]=m.color499;return true;
  }
  const target=p.members.find(x=>x.playerId===m.playerId);
  if(!target||(target.seatToken485??null)!==(m.seatToken485??null))fail('このプレイヤーは入り直しています。選び直してください');
  // Room-only override: the guest still owns their account preference.
  target.color499=m.color499;
  if(r?.phase==='lobby'){const rm=c.member(r,target.playerId);if(rm)rm.color499=m.color499;r.revision=(r.revision??0)+1;r.updatedAt=c.now()}
  return true;
 }
 if(m.op==='partyColor499'){
  if(m.partyId!==p.id||(m.seatToken485??null)!==(me.seatToken485??null))fail('部屋の状態が変わりました。自分の枠を選び直してください');
  if(!validColor499(m.color499))fail('ブルー・グリーン・ピンク・オレンジから選んでください');
  if(r&&!['lobby','result'].includes(r.phase))fail('カラーはゲーム終了後に変更できます');
  // The authenticated sender alone owns this preference; ignore any supplied playerId.
  c.data.accounts[id].partyColor499=m.color499;me.color499=m.color499;
  if(r?.phase==='lobby'){const rm=c.member(r,id);if(rm)rm.color499=m.color499;r.revision=(r.revision??0)+1;r.updatedAt=c.now()}
  return true;
 }
 if(m.op==='partyPresence462'){me.atHome=m.atHome===true;if(me.atHome)me.ready=false;return true}
 if(m.op==='partyRoster462'){me.luckVersion511=m.luckVersion511===1?1:0;me.luckVersion509=m.luckVersion509===1?1:0;me.luckVersion508=m.luckVersion508===1?1:0;me.luckVersion507=m.luckVersion507===1?1:0;me.gorillaRules505=m.gorillaRules505===1?1:0;me.gorillaRules504=m.gorillaRules504===1?1:0;me.gorillaRules503=m.gorillaRules503===1?1:0;me.gorillaVersion502=m.gorillaVersion502===1?1:0;me.canalVersion489=m.canalVersion489===1?1:0;me.canalRules492=m.canalRules492===1?1:0;me.canalRules494=m.canalRules494===1?1:0;me.canalRules496=m.canalRules496===1?1:0;me.canalRules500=m.canalRules500===1?1:0;me.cabbageVersion484=m.cabbageVersion484===1?1:0;me.cabbageScoring491=m.cabbageScoring491===1?1:0;me.crystals474=crystalBalance474(m.crystals474);me.owned=c.roster(m.roster);me.slotOne476=slot476(me.owned,Object.hasOwn(m,'slotOne476')?m.slotOne476:me.slotOne476);if(r?.phase==='lobby'){const rm=c.member(r,id);if(rm){rm.owned=me.owned;if(rm.choice){rm.choice=rm.owned.find(x=>x.id===rm.choice.id)??null;me.ready=false}}}return true}
 if(m.op==='partyReady462'){if(r?.phase!=='lobby')fail('ゲームの準備画面で押してください');if(r.game==='luck'&&r.rules511===1&&m.luckVersion511!==1)fail('運だけ大運動会には本体のBuild511更新が必要です');if(r.game==='luck'&&r.rules509===1&&m.luckVersion509!==1)fail('運だけ大運動会には本体のBuild509更新が必要です');if(r.game==='luck'&&r.rules508===1&&m.luckVersion508!==1)fail('運だけ大運動会には本体のBuild508更新が必要です');if(r.game==='luck'&&m.luckVersion507!==1)fail('運だけ大運動会には本体のBuild507更新が必要です');if(r.game==='gorilla'&&r.rules505===1&&m.gorillaRules505!==1)fail('胸毛抜きには本体のBuild505更新が必要です');if(r.game==='gorilla'&&r.rules504===1&&m.gorillaRules504!==1)fail('胸毛抜きには本体のBuild504更新が必要です');if(r.game==='gorilla'&&r.rules503===1&&m.gorillaRules503!==1)fail('胸毛抜きには本体のBuild503更新が必要です');if(r.game==='gorilla'&&m.gorillaVersion502!==1)fail('胸毛抜きには本体のBuild502更新が必要です');if(r.game==='canal'&&(m.canalVersion489!==1||m.canalRules492!==1))fail('新しい用水路には本体のBuild492更新が必要です');if(r.game==='canal'&&m.canalRules494!==1)fail('新しい用水路には本体のBuild494更新が必要です');if(r.game==='canal'&&m.canalRules496!==1)fail('共有水場には本体のBuild496更新が必要です');if(r.game==='cabbage'&&(m.cabbageVersion484!==1||m.cabbageScoring491!==1))fail('新しい減点ルールには本体のBuild491更新が必要です');const rm=c.member(r,id);if(!rm?.choice)fail('コマにする魔物を選んでください');if(me.atHome)fail('準備画面へ戻ってください');if(r.game==='sugoroku'&&r.economy474?.mode==='crystal'){if(m.ready===true&&!r.economy474.entries[id])fail('表示された💎の参加費を支払って準備してください');if(m.ready!==true)refundEntry474(c,r,id)}if(r.game==='luck'){me.luckVersion511=m.luckVersion511===1?1:0;me.luckVersion509=m.luckVersion509===1?1:0;me.luckVersion508=m.luckVersion508===1?1:0;me.luckVersion507=1;}if(r.game==='canal'){me.canalVersion489=1;me.canalRules492=1;me.canalRules494=1;me.canalRules496=1;me.canalRules500=m.canalRules500===1?1:0}if(r.game==='gorilla'){me.gorillaVersion502=1;me.gorillaRules505=m.gorillaRules505===1?1:0;me.gorillaRules504=m.gorillaRules504===1?1:0;me.gorillaRules503=m.gorillaRules503===1?1:0;}if(r.game==='cabbage'){me.cabbageVersion484=1;me.cabbageScoring491=1}me.ready=m.ready===true;return true}
 if(m.op==='partyLeave462'){const participant=r?.members.find(x=>x.playerId===id&&!x.departed);if(participant&&!['lobby','result'].includes(r.phase))fail('ゲーム終了後に退出できます。ホームへは戻れます');p.members=p.members.filter(x=>x!==me);if(participant){if(r.phase==='lobby'){refundEntry474(c,r,id);r.members=r.members.filter(x=>x!==participant)}else participant.departed=true}if(!p.members.length){if(r&&['lobby','result'].includes(r.phase))deleteGame463(c,r);delete c.data.parties462[p.code];return true}if(p.hostId===id)p.hostId=(p.members.find(x=>c.sessions.get(x.playerId)?.connected)??p.members[0]).playerId;if(r)r.hostId=p.hostId;return true}
 if(p.hostId!==id)fail('ゲームの切替は部屋主が行えます');
 if(m.op==='partyResult490'){
  if(m.partyId!==p.id||!['again','list'].includes(m.kind))fail('結果画面の操作が無効です。更新してもう一度選んでください');
  // Retransmitting the same completed action must never clear the NEXT game.
  if(p.lastResult490?.gameId===m.gameId&&p.lastResult490.kind===m.kind)return true;
  if(!r||r.id!==m.gameId||r.phase!=='result')fail('ゲームの状態が変わりました。最新の画面を確認してください');
  if(m.kind==='again')openGame462(c,p,p.game);
  else{deleteGame463(c,r);p.game=null;p.raceCode=null;for(const x of p.members)x.ready=false}
  p.lastResult490={gameId:m.gameId,kind:m.kind};return true;
 }
 if(m.op==='partyGame462'){openGame462(c,p,m.game);return true}
 if(m.op==='partyLounge462'){if(r&&!['lobby','result'].includes(r.phase))fail('ゲーム終了後に一覧へ戻れます');if(r)deleteGame463(c,r);p.game=null;p.raceCode=null;for(const x of p.members)x.ready=false;return true}
 fail('未対応のパーティー操作です');
}
export function checkPartyStart462(c,r){if(!r.partyId462)return;const p=Object.values(c.data.parties462??{}).find(x=>x.id===r.partyId462);if(!p)fail('パーティーが見つかりません');if(p.members.some(m=>!m.ready||m.atHome||!c.sessions.get(m.playerId)?.connected))fail('全員が準備画面で「準備OK」を押すと開始できます')}
export function advanceParties462(c){for(const p of Object.values(c.data.parties462??{})){const r=partyRace462(c,p),at=c.now(),host=c.sessions.get(p.hostId)?.connected,replacement=p.members.find(m=>m.playerId!==p.hostId&&c.sessions.get(m.playerId)?.connected);if(!r&&!p.members.some(m=>c.sessions.get(m.playerId)?.connected)&&at-p.createdAt>24*60*60*1000){c.transaction(()=>delete c.data.parties462[p.code]);c.broadcast();continue}if(host&&p.hostMissingAt!=null){c.transaction(()=>delete p.hostMissingAt);continue}if(!host&&replacement){if(p.hostMissingAt==null)c.transaction(()=>{p.hostMissingAt=at});else if(at-p.hostMissingAt>=30000){c.transaction(()=>{p.hostId=replacement.playerId;delete p.hostMissingAt;if(r)r.hostId=p.hostId});c.broadcast()}}}}
