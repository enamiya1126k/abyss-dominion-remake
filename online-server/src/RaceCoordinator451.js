import{randomBytes,createHash}from'node:crypto';
import{existsSync,readFileSync,writeFileSync,renameSync,mkdirSync}from'node:fs';
import{dirname}from'node:path';
import{raceSpecies451}from'../../src/race/RaceCatalog451.js';
import{RACE451,raceProfile451,drawRace451,odds451,validTicket451,outcome451}from'../../src/race/RaceRules451.js';
const copy=x=>JSON.parse(JSON.stringify(x)),text=(x,n=40)=>String(x??'').replace(/[<>\u0000-\u001f]/g,'').slice(0,n);
const pool=['slime','ember_gecko','glacier_queen','myth_rion','myth_yori','myth_hide','myth_enami','goblin','skeleton','wolf'].filter(id=>raceSpecies451(id));
const randomInt=n=>randomBytes(4).readUInt32LE()%n;
const fail=message=>{throw Error(message)};
export class RaceCoordinator451{
 constructor({stateFile=null,sessions=new Map(),send=()=>{},now=()=>Date.now(),isBusy=()=>false,canJoin=()=>true}={}){
  Object.assign(this,{stateFile,sessions,send,now,isBusy,canJoin});this.subscribers=new Set();this.data={version:1,serial:0,revision:0,rooms:{},accounts:{}};this.loadError=null;this.writeError=null;
  if(stateFile&&existsSync(stateFile))try{const raw=readFileSync(stateFile,'utf8');if(Buffer.byteLength(raw)>32*1024*1024)throw Error('レース保存容量を超えています');const d=JSON.parse(raw);if(d.version!==1||!d.rooms||!d.accounts||!Number.isSafeInteger(d.serial))throw Error('レース保存形式が不正です');this.data=d}catch(e){this.loadError=e.message}
 }
 healthy(){return !this.loadError&&!this.writeError}
 transaction(fn){if(this.loadError)fail('レース記録を読み込めません。管理者が保存先を確認してください');const before=copy(this.data);try{const result=fn();this.data.revision++;if(this.stateFile){const raw=JSON.stringify(this.data);if(Buffer.byteLength(raw)>32*1024*1024)throw Error('レース保存容量がいっぱいです');mkdirSync(dirname(this.stateFile),{recursive:true});writeFileSync(this.stateFile+'.tmp',raw,{mode:0o600});renameSync(this.stateFile+'.tmp',this.stateFile)}this.writeError=null;return result}catch(e){this.data=before;if(e.code||/保存容量/.test(e.message))this.writeError=e.message;throw e}}
 account(session){const id=session.playerId,key=createHash('sha256').update(String(session.clientKey)).digest('hex'),a=this.data.accounts[id];if(a&&a.key!==key)fail('レースの本人確認に失敗しました');if(a)return a;return this.transaction(()=>this.data.accounts[id]={key,deliveries:[],decisions:{}})}
 roomFor(id){return Object.values(this.data.rooms).find(r=>r.members.some(m=>m.playerId===id&&!m.departed))??null}
 active(id){const r=this.roomFor(id);return Boolean(r&&!['lobby','result'].includes(r.phase))}
 member(r,id){return r?.members.find(m=>m.playerId===id&&!m.departed)}
 roster(source){if(!Array.isArray(source))fail('手持ち魔物を読み込めません');const seen=new Set(),rows=[];for(const m of source.slice(0,500)){const id=text(m.id,100),speciesId=text(m.raceSpeciesId??m.speciesId,80);if(!id||!raceSpecies451(speciesId)||seen.has(id))continue;seen.add(id);rows.push({id,speciesId})}if(!rows.length)fail('出走できる魔物がいません');return rows}
 entrant(speciesId,ownerId=null,monsterId=null,version=2){const sp=raceSpecies451(speciesId);return{speciesId,name:sp.name,ownerId,monsterId,profile:raceProfile451(speciesId,version),condition:randomInt(5)}}
 makeRoom(code,members,rulesVersion=1){const id=`r451-${++this.data.serial}-${randomBytes(4).toString('hex')}`;return{id,code,rulesVersion,hostId:members[0].playerId,phase:'lobby',createdAt:this.now(),updatedAt:this.now(),course:randomInt(2)?'芝':'砂',members:members.map(m=>({...m,ticket:null,passed:false,departed:false})),system:(()=>{const choices=[...pool];return Array.from({length:4},()=>this.entrant(choices.splice(randomInt(choices.length),1)[0],null,null,rulesVersion))})()}}
 issue(a,entry){if(!a.deliveries.some(e=>e.id===entry.id))a.deliveries.push(entry)}
 receipts(session){return this.data.accounts[session.playerId]?.deliveries.slice(0,24)??[]}
 view(session){const r=this.roomFor(session.playerId);let room=null;if(r){room={id:r.id,code:r.code,rulesVersion:r.rulesVersion??1,hostId:r.hostId,phase:r.phase,course:r.course,createdAt:r.createdAt,phaseAt:r.phaseAt,deadline:r.deadline,startAt:r.startAt,system:r.system,racers:r.racers??null,members:r.members.map(m=>({playerId:m.playerId,name:m.name,ai:!!m.ai,connected:m.ai||!!this.sessions.get(m.playerId)?.connected,departed:!!m.departed,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId,name:raceSpecies451(m.choice.speciesId)?.name}:null,ready:!!m.ticket||m.passed,selfTicket:m.playerId===session.playerId?m.ticket:null,ticket:['countdown','race','result'].includes(r.phase)?m.ticket:null})),finishMs:['race','result'].includes(r.phase)?r.outcome?.finishMs:null,order:r.phase==='result'?r.outcome?.order:null,results:r.phase==='result'?r.results:null};}const a=this.data.accounts[session.playerId];return{type:'raceState451',rulesVersion:2,revision:this.data.revision,serverNow:this.now(),available:this.healthy(),selfId:session.playerId,room,deliveries:this.receipts(session),decisions:a?Object.values(a.decisions).slice(-128):[]}}
 push(session){if(session?.connected)this.send(session.playerId,this.view(session))}
 broadcast(){for(const id of this.subscribers)this.push(this.sessions.get(id))}
 handle(session,m){try{
  const a=this.account(session);if(m.op==='status'){if(this.writeError)this.transaction(()=>{});if(m.subscribe===false)this.subscribers.delete(session.playerId);else this.subscribers.add(session.playerId);this.push(session);return}
  this.subscribers.add(session.playerId);
  this.transaction(()=>{let r=this.roomFor(session.playerId),member=this.member(r,session.playerId);const name=text(m.displayName??session.profile?.displayName??session.profile?.name??'冒険者',16);
   if(m.op==='ack'){const ids=new Set((m.ids??[]).filter(x=>typeof x==='string').slice(0,24));a.deliveries=a.deliveries.filter(e=>!ids.has(e.id));return}
   if(m.op==='bet'){
    if(!Number.isSafeInteger(m.amount)||m.amount<RACE451.minBet||m.amount>RACE451.maxBet||m.requestId!==`${m.raceId}:${session.playerId}`||!/^r451-\d+-[a-f0-9]{8}$/.test(m.raceId))fail('馬券の受付情報が不正です');
    const previous=a.decisions[m.requestId];if(previous){if(previous.amount!==m.amount)fail('受付済みの購入金額と一致しません');return}
    const valid=r?.id===m.raceId&&member&&r.phase==='parade'&&this.now()<r.deadline&&!member.ticket&&!member.passed&&validTicket451(m.ticket);
    a.decisions[m.requestId]={requestId:m.requestId,amount:m.amount,status:valid?'accepted':'rejected'};
    if(!valid){this.issue(a,{id:`refund:${m.requestId}`,kind:'refund',requestId:m.requestId,amount:m.amount,gold:m.amount});return}
    member.ticket={kind:m.ticket.kind,picks:[...m.ticket.picks],amount:m.amount,odds:odds451(r.racers,r.course,m.ticket),requestId:m.requestId};return;
   }
   if(m.op==='create'||m.op==='join'){
    if(r)return;if(this.isBusy(session))fail('ほかのオンラインコンテンツを終了してから参加してください');if(a.deliveries.length>80)fail('先に保留中の受取を完了してください');
    const owned=this.roster(m.roster),person={playerId:session.playerId,name,owned,choice:null,ai:false,ticket:null,passed:false};
    if(m.op==='create'){if(Object.keys(this.data.rooms).length>=1000)fail('部屋がいっぱいです');let code;do{code=randomBytes(3).toString('hex').toUpperCase()}while(this.data.rooms[code]);this.data.rooms[code]=this.makeRoom(code,[person],m.rulesVersion>=2?2:1);return}
    const target=this.data.rooms[text(m.code,6).toUpperCase()];if(!target||target.phase!=='lobby')fail('入室できる部屋が見つかりません');if(target.rulesVersion===2&&m.rulesVersion!==2)fail('この部屋は更新版です。ゲームを再読み込みしてから参加してください');if(target.members.length>=4)fail('この部屋は満員です');if(!this.canJoin(session,target.members))fail('この部屋には参加できません');target.members.push(person);return;
   }
   if(!r||!member)fail('先にレースの部屋へ参加してください');
   if(m.op==='select'){if(!['lobby','entry'].includes(r.phase))fail('魔物選択は締め切りました');if(m.roster)member.owned=this.roster(m.roster);const choice=member.owned.find(x=>x.id===m.monsterId);if(!choice)fail('手持ちから魔物を選んでください');member.choice=choice;return}
   if(m.op==='start'){if(r.hostId!==session.playerId)fail('部屋主が開始できます');if(r.phase!=='lobby')return;if(r.members.some(x=>!x.ai&&this.sessions.get(x.playerId)&&this.isBusy(this.sessions.get(x.playerId))))fail('参加者がほかのオンラインコンテンツに参加しています');
    while(r.members.length<4){const i=r.members.length,id=pool[randomInt(pool.length)];r.members.push({playerId:`AI-${r.id}-${i}`,name:`AI ${i+1}`,ai:true,owned:[{id:`ai-${i}`,speciesId:id}],choice:{id:`ai-${i}`,speciesId:id},ticket:null,passed:false})}
    r.phase='entry';r.phaseAt=this.now();r.deadline=this.now()+RACE451.entryMs;return;
   }
   if(m.op==='pass'){if(r.phase==='parade'&&!member.ticket)member.passed=true;return}
   if(m.op==='leave'){if(!['lobby','result'].includes(r.phase))fail('レース終了後に退室できます。ホームへ戻って待つこともできます');if(r.phase==='lobby'){r.members=r.members.filter(x=>x!==member);if(!r.members.length)delete this.data.rooms[r.code];else r.hostId=r.members[0].playerId}else{member.departed=true;const next=r.members.find(x=>!x.ai&&!x.departed);if(next)r.hostId=next.playerId;else delete this.data.rooms[r.code]}return}
   if(m.op==='again'){if(r.phase!=='result'||r.hostId!==session.playerId)fail('結果画面で部屋主が次のレースを開始できます');const people=r.members.filter(x=>!x.ai&&!x.departed&&this.sessions.get(x.playerId)?.connected);if(people.some(x=>this.data.accounts[x.playerId]?.deliveries.some(e=>e.raceId===r.id)))fail('全員の賞金受取を待っています');this.data.rooms[r.code]=this.makeRoom(r.code,people,m.rulesVersion>=2?2:r.rulesVersion??1);return}
   fail('未対応のレース操作です');
  });this.advance();this.broadcast();
 }catch(error){this.send(session.playerId,{type:'raceError451',requestId:m.requestId,message:error.message,held:m.op==='bet'});this.push(session)}}
 advance(){if(this.loadError)return;for(const room of Object.values(this.data.rooms))try{const at=this.now(),phase=room.phase;
  let next=null;const eligible=['lobby','result'].includes(phase),hostConnected=this.sessions.get(room.hostId)?.connected,replacement=room.members.find(m=>!m.ai&&!m.departed&&this.sessions.get(m.playerId)?.connected&&m.playerId!==room.hostId);if(eligible){if(hostConnected&&room.hostMissingAt!=null)next='hostBack';else if(!hostConnected&&replacement){if(room.hostMissingAt==null)next='hostMissing';else if(at-room.hostMissingAt>=30000)next='hostTransfer'}}if(phase==='entry'&&(room.members.every(m=>m.choice)||at>=room.deadline))next='parade';
  if(phase==='parade'&&(at>=room.deadline||at>=room.phaseAt+RACE451.paradeMs&&room.members.every(m=>m.ticket||m.passed)))next='countdown';
  if(phase==='countdown'&&at>=room.startAt)next='race';
  if(phase==='race'&&at>=room.startAt+RACE451.raceMs)next='result';
  if(phase==='lobby'&&at-room.createdAt>20*60*1000&&!room.members.some(m=>this.sessions.get(m.playerId)?.connected))next='expire';
  if(phase==='result'&&at-room.phaseAt>24*60*60*1000&&!room.members.some(m=>this.sessions.get(m.playerId)?.connected))next='expire';
  if(!next)continue;
  this.transaction(()=>{const r=this.data.rooms[room.code];if(next==='hostBack'){delete r.hostMissingAt;return}if(next==='hostMissing'){r.hostMissingAt=at;return}if(next==='hostTransfer'){r.hostId=replacement.playerId;delete r.hostMissingAt;return}if(next==='expire'){delete this.data.rooms[r.code];return}r.phase=next;r.phaseAt=at;
   if(next==='parade'){for(const m of r.members)m.choice??=m.owned[0];r.racers=[...r.system,...r.members.map(m=>this.entrant(m.choice.speciesId,m.playerId,m.choice.id,r.rulesVersion??1))];r.outcome=drawRace451(r.racers,r.course,randomInt(0xffffffff));r.deadline=at+RACE451.betMs;
    for(const m of r.members.filter(x=>x.ai)){const picks=[randomInt(8)];if(randomInt(2)){let n;do{n=randomInt(8)}while(n===picks[0]);picks.push(n)}const kind=picks.length===1?'win':randomInt(2)?'pair':'exact';m.ticket={kind,picks,amount:1000,odds:odds451(r.racers,r.course,{kind,picks})}}
   }
   if(next==='countdown'){for(const m of r.members)if(!m.ticket)m.passed=true;r.startAt=at+RACE451.countdownMs}
   if(next==='result'){r.results=r.members.map(m=>outcome451(r,m));for(const row of r.results.filter(x=>!x.ai)){const a=this.data.accounts[row.playerId];this.issue(a,{id:`result:${r.id}:${row.playerId}`,kind:'result',raceId:r.id,requestId:`${r.id}:${row.playerId}`,gold:row.payout+row.prize,stake:row.stake,monsterId:row.monsterId,affection:5,...row})}}
  });this.broadcast();
 }catch(e){this.writeError=e.message}}
}
