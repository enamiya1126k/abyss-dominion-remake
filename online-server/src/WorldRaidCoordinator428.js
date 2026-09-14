import {raidPortrait439} from '../../src/worldRaid/WorldRaidPortrait439.js';
import {randomBytes} from 'node:crypto';
import {sanitizeProfile} from './RoomStore.js';
import {raidSnapshot} from './RaidCoordinator.js';
import {WorldRaidBattle428} from './WorldRaidBattle428.js';
import {WorldRaidStore428,WORLD_RAID_RULES428,worldRaidDay428,worldRaidReset428,worldRaidBoss428,newWorldRaidCampaign428} from './WorldRaidStore428.js';

const requestPattern=/^[A-Za-z0-9_-]{16,96}$/;
const clone=structuredClone;
const fail=(code,message)=>({ok:false,code,message});
const roomData=room=>({...room,members:[...room.members]});
const reviveRoom=data=>({...clone(data),members:new Set(data.members)});
export class WorldRaidCoordinator428{
 constructor({sessions=new Map(),now=()=>Date.now(),random=Math.random,stateFile=null,persist=null,send=()=>{},isBusy=()=>false}={}){
  this.sessions=sessions;this.now=now;this.random=random;this.send=send;this.isBusy=isBusy;this.ledger=new WorldRaidStore428({stateFile,now,persist});this.watchers=new Set();
 }
 _authenticated(session){return Boolean(session?.connected&&this.sessions.get(session.playerId)===session);}
 healthy(){return this.ledger.healthy();}
 active(playerId,state=this.ledger.state){return Object.values(state.attempts).find(a=>a.playerId===playerId&&a.status==='active')??null;}
 snapshot(playerId){
  const s=this.ledger.state,now=this.now(),a=this.active(playerId)??Object.values(s.attempts).filter(a=>a.playerId===playerId).at(-1)??null;
  const used=s.days[worldRaidDay428(now)]?.[playerId]??0,c=s.current;
  return {revision:s.revision,serverNow:now,available:this.healthy(),rules:{...WORLD_RAID_RULES428},day:worldRaidDay428(now),resetAt:worldRaidReset428(now),used,remaining:Math.max(0,3-used),campaign:{id:c.id,sequence:c.sequence,boss:worldRaidBoss428(c.sequence),hp:c.hp,maxHp:c.maxHp,startedAt:c.startedAt,myDamage:c.contribution[playerId]?.damage??0,participants:Object.keys(c.contribution).length},attempt:a?{id:a.id,requestId:a.requestId,campaignId:a.campaignId,status:a.status,startedAt:a.startedAt,damage:a.damage,raid:a.room?.raid?raidSnapshot(a.room.raid):null,report:a.report??null}:null,lastClear:s.history.at(-1)?{campaignId:s.history.at(-1).id,bossId:s.history.at(-1).bossId,completedAt:s.history.at(-1).completedAt}:null};
 }
 status(session,{requestId,subscribe=true}={}){
  if(!this._authenticated(session))return fail('NOT_READY','先に接続してください');
  if(subscribe)this.watchers.add(session.playerId);else this.watchers.delete(session.playerId);
  this.send(session.playerId,{type:'worldRaidState',requestId,state:this.snapshot(session.playerId),refresh:true});return {ok:true};
 }
 _publish(event={},only=null){
  const targets=only?[only]:[...new Set([...this.watchers,...Object.values(this.ledger.state.attempts).filter(a=>a.status==='active').map(a=>a.playerId)])];
  for(const id of targets)if(this.sessions.get(id)?.connected)this.send(id,{type:'worldRaidState',state:this.snapshot(id),...(event.playerId===id?event:{})});
 }
 start(session,message={}){
  if(!this._authenticated(session))return fail('NOT_READY','先に接続してください');
  const playerId=session.playerId,requestId=String(message.requestId??'');if(!requestPattern.test(requestId))return fail('WORLD_RAID_REQUEST','挑戦操作を確認できません。再度お試しください。');
  const duplicate=Object.values(this.ledger.state.attempts).find(a=>a.playerId===playerId&&a.requestId===requestId);
  if(duplicate){this._publish({playerId,requestId,duplicate:true},playerId);return {ok:true,duplicate:true};}
  if(this.active(playerId)){this._publish({},playerId);return fail('WORLD_RAID_ACTIVE','進行中の挑戦を再開してください。');}
  if(session.roomId||this.isBusy(session))return fail('WORLD_RAID_BUSY','参加中のオンラインコンテンツを終了してから挑戦してください。');
  const profile=sanitizeProfile(message.profile??session.profile);
  if(!profile.battleRoster?.length)return fail('WORLD_RAID_PARTY','先に部隊を編成してください。');
  const result=this.ledger.transact(s=>{
   const now=this.now(),day=worldRaidDay428(now),used=s.days[day]?.[playerId]??0;
   if(used>=3)return fail('WORLD_RAID_LIMIT','本日の挑戦は3回終了しました。日本時間0時に回復します。');
   if(message.campaignId!==s.current.id)return fail('WORLD_RAID_CHANGED','ボスが切り替わりました。最新のボスを確認してください。');
   const id='wr-'+randomBytes(16).toString('hex'),member={...session,profile},events=[];
   const engine=new (this.BattleClass428??WorldRaidBattle428)({session:member,now:this.now,random:this.random,broadcast:(_,e)=>events.push(e)}),created=engine.create(member,s.current,id);
   if(!created.ok)return created;
   // Preserve receipts/reports for retries, but retain only the latest finished
   // battle per player instead of accumulating full rosters every day.
   for(const previous of Object.values(s.attempts))if(previous.playerId===playerId&&previous.status==='ended'){delete previous.room;delete previous.profile;}
   s.days[day]??={};s.days[day][playerId]=used+1;
   s.attempts[id]={id,requestId,playerId,campaignId:s.current.id,sequence:s.current.sequence,bossName:s.current.bossId,day,status:'active',startedAt:now,damage:0,profile,room:roomData(created.room)};
   s.current.contribution[playerId]??={damage:0,attempts:0,name:profile.displayName};s.current.contribution[playerId].name=profile.displayName;s.current.contribution[playerId].playerName441=true;s.current.contribution[playerId].attempts++;s.current.contribution[playerId].portrait439=raidPortrait439(profile);
   return {ok:true,id};
  });
  if(result.ok){this.watchers.add(playerId);this._publish({playerId,requestId,started:true});}
  return {...result,requestId};
 }
 _closeAttempt(s,a,result){
  a.status='ended';a.endedAt=this.now();a.report={attemptId:a.id,campaignId:a.campaignId,bossName:worldRaidBoss428(a.sequence).name,result,damage:a.damage,rounds:a.room?.raid?.round??0,endedAt:a.endedAt};
  delete a.profile;
  if(a.room?.raid){a.room.raid.outcome=result;a.room.raid.phase='finished';a.room.phase='lobby';}
 }
 _settleDamage(s,a,before,battle){
  const current=s.current;if(current.id!==a.campaignId)return;
  const damage=Math.min(current.hp,Math.max(0,Math.floor(before-Math.max(0,Number(battle.boss.hp)||0))));
  current.hp-=damage;a.damage+=damage;current.contribution[a.playerId].damage+=damage;
  if(current.hp===0){
   current.completedAt=this.now();current.killerId=a.playerId;s.history.push(clone(current));s.current=newWorldRaidCampaign428(current.sequence+1,this.now());
   for(const other of Object.values(s.attempts))if(other.status==='active'&&other.campaignId===current.id){if(other.room?.raid){other.room.raid.boss.hp=0;other.room.raid.progress.hp=0;}this._closeAttempt(s,other,other.id===a.id?'victory':'sharedVictory');}
  }
 }
 _operate(session,kind,message={}){
  if(!this._authenticated(session))return fail('NOT_READY','先に接続してください');
  const existing=this.active(session.playerId);if(!existing||existing.id!==message.attemptId)return fail('WORLD_RAID_ATTEMPT','この挑戦は終了しています。最新の戦況を確認してください。');
  if(kind!=='advance'&&(!Number.isInteger(message.round)||message.round!==existing.room.raid.round))return fail('WORLD_RAID_ROUND','ラウンドが進みました。最新の画面で操作してください。');
  let events=[],result=this.ledger.transact(s=>{
   const a=s.attempts[existing.id],room=reviveRoom(a.room),battle=room.raid;
   if(a.campaignId!==s.current.id)return fail('WORLD_RAID_CHANGED','このボスは討伐済みです。');
   this._prepareBattle432?.(s.current,battle);const before=s.current.hp;battle.boss.hp=before;battle.progress.hp=before;
   const engine=new (this.BattleClass428??WorldRaidBattle428)({session:{...session,profile:a.profile},now:this.now,random:this.random,broadcast:(_,e)=>events.push(e)});
   let operated={ok:true};
   if(kind==='action')operated=engine.action(room,session,message.action??message);
   else if(kind==='auto')operated=engine.setAuto(room,session,message.enabled===true);
   else if(kind==='speed')operated=engine.setSpeed(room,session,message.speed);
   else if(kind==='retreat'){this._closeAttempt(s,a,'retreat');return {ok:true};}
   else engine.advance(room);
   if(!operated.ok)return operated;
   a.room=roomData(room);this._settleDamage(s,a,before,battle);
   if(a.status==='active'&&room.phase==='lobby')this._closeAttempt(s,a,battle.outcome??'limit');
   return {ok:true};
  });
  if(result.ok)this._publish({playerId:session.playerId,events:events.flatMap(e=>e.events??[]),battleEvent:events.at(-1)?.type??null});
  return result;
 }
 action(session,message){return this._operate(session,'action',message);}
 auto(session,message){return this._operate(session,'auto',message);}
 speed(session,message){return this._operate(session,'speed',message);}
 retreat(session,message){return this._operate(session,'retreat',message);}
 advance(){
  for(const a of Object.values(this.ledger.state.attempts)){
   if(a.status!=='active')continue;
   const session=this.sessions.get(a.playerId);if(!session?.connected)continue;
   const b=a.room.raid,now=this.now(),allReady=Object.values(b.players).filter(p=>p.hp>0).every(p=>b.actions[p.playerId]);
   if(b.phase==='command'&&(b.autoPlayers?.includes(a.playerId)||allReady||now>=b.deadlineAt)||b.phase==='result'&&now>=b.nextRoundAt){const result=this._operate(session,'advance',{attemptId:a.id});if(!result.ok)this.send(a.playerId,{type:'worldRaidError',...result,state:this.snapshot(a.playerId)});}
  }
 }
 handle(session,message){
  const method={worldRaidStatus:'status',worldRaidStart:'start',worldRaidAction:'action',worldRaidAuto:'auto',worldRaidSpeed:'speed',worldRaidRetreat:'retreat'}[message.type];
  if(!method)return fail('UNKNOWN_MESSAGE','未対応の操作です');
  const result=this[method](session,message);
  if(!result.ok&&session?.playerId)this.send(session.playerId,{type:'worldRaidError',requestId:message.requestId,...result,state:this.snapshot(session.playerId)});
  return result;
 }
}
