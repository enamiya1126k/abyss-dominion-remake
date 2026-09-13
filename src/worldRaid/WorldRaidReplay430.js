import {WorldRaidBattle428} from './runtime430/online-server/src/WorldRaidBattle428.js';
import {raidSnapshot} from './runtime430/online-server/src/RaidCoordinator.js';
export const OFFLINE_RULE_VERSION430=1,OFFLINE_LIFETIME430=86400000,OFFLINE_MAX_COMMANDS430=256;
export function seededRandom430(seed){let s=seed>>>0;const random=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};return random;}
export function createOfflineTicketBattle430(session,campaign,id,seed,issuedAt){
 const engine=new WorldRaidBattle428({session,now:()=>issuedAt,random:seededRandom430(seed)}),r=engine.create(session,campaign,id);if(!r.ok)throw new Error(r.message);
 return {...r.room,members:[...r.room.members]};
}
export class WorldRaidReplay430{
 constructor(ticket){
  if(ticket.ruleVersion!==OFFLINE_RULE_VERSION430)throw new Error('この挑戦権の戦闘形式は未対応です。');
  this.ticket=ticket;this.room=structuredClone(ticket.initialRoom);this.room.members=new Set(this.room.members);this.commands=[];this.events=[];this.time=ticket.issuedAt;this.initialHp=this.room.raid.boss.hp;
  this.session={playerId:ticket.playerId,connected:true,ready:true};this.random=seededRandom430(ticket.seed);
  this.engine=new WorldRaidBattle428({session:this.session,now:()=>this.time,random:this.random,broadcast:(_,message)=>this.events.push(...message.events??[])});
 }
 get ended(){return this.room.phase==='lobby'||this.room.raid.phase==='finished';}
 get damage(){return Math.max(0,Math.floor(this.initialHp-this.room.raid.boss.hp));}
 step(command){
  if(this.ended)throw new Error('この挑戦は終了しています。');if(this.commands.length>=OFFLINE_MAX_COMMANDS430)throw new Error('操作記録の上限です。');
  const raid=this.room.raid;if(!command||command.round!==raid.round)throw new Error('ラウンドが一致しません。');this.events=[];let r={ok:true};
  if(command.kind==='advance'){
   if(raid.phase==='result')this.time=Math.max(this.time,raid.nextRoundAt);
   else if(raid.phase==='command')this.time=Math.max(this.time,raid.deadlineAt);
   else throw new Error('進行できない戦闘状態です。');this.engine.advance(this.room);
  }else if(command.kind==='action')r=this.engine.action(this.room,this.session,command.action??{});
  else if(command.kind==='auto')r=this.engine.setAuto(this.room,this.session,command.enabled===true);
  else if(command.kind==='speed')r=this.engine.setSpeed(this.room,this.session,command.speed);
  else if(command.kind==='retreat'){raid.outcome='retreat';this.engine._finish(this.room,raid);}
  else throw new Error('未対応の操作記録です。');
  if(!r.ok)throw new Error(r.message||'操作を確認できません。');
  this.commands.push(structuredClone(command));return this.snapshot();
 }
 snapshot(){return {raid:raidSnapshot(this.room.raid),damage:this.damage,ended:this.ended,events:structuredClone(this.events),result:this.room.raid.outcome??null};}
}
export function replayOffline430(ticket,commands,{complete=true}={}){
 if(!Array.isArray(commands)||commands.length>OFFLINE_MAX_COMMANDS430||JSON.stringify(commands).length>48000)throw new Error('操作記録が大きすぎます。');
 const replay=new WorldRaidReplay430(ticket);for(const command of commands)replay.step(command);
 if(complete&&!replay.ended)throw new Error('戦闘が完了していません。');return replay;
}
