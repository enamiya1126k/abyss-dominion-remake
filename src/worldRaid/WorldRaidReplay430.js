import {WorldRaidEngine443} from './WorldRaidEngine443.js';
import {withWorldRaidLimit437} from './WorldRaidLimit437.js';
import {withWorldRaidSpeed438} from './WorldRaidSpeed438.js';
import {withWorldRaidRules432,snapshotExtras432} from './WorldRaidRules432.js';
const WorldRaidBattle432=withWorldRaidRules432(WorldRaidBattle428,raidSnapshot);
import {WorldRaidBattle428} from './runtime430/online-server/src/WorldRaidBattle428.js';
import {RaidCoordinator,raidSnapshot} from './runtime430/online-server/src/RaidCoordinator.js';
const WorldRaidBattle437=withWorldRaidRules432(withWorldRaidLimit437(WorldRaidBattle428,RaidCoordinator),raidSnapshot,{maxRounds:99});
const engines438=[WorldRaidBattle428,WorldRaidBattle432,WorldRaidBattle437].map(Base=>withWorldRaidSpeed438(Base,raidSnapshot));
engines438.push(WorldRaidEngine443);
const Engine430=version=>engines438[version-1];
const limits430=t=>t.ruleVersion>=3?{commands:1024,bytes:112000}:{commands:256,bytes:48000};
export const OFFLINE_RULE_VERSION430=1,OFFLINE_LIFETIME430=86400000,OFFLINE_MAX_COMMANDS430=256;
export function seededRandom430(seed){let s=seed>>>0;const random=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};return random;}
export function createOfflineTicketBattle430(session,campaign,id,seed,issuedAt,ruleVersion=1){
 const engine=new (Engine430(ruleVersion))({session,now:()=>issuedAt,random:seededRandom430(seed)}),r=engine.create(session,campaign,id);if(!r.ok)throw new Error(r.message);
 return {...r.room,members:[...r.room.members]};
}
export class WorldRaidReplay430{
 constructor(ticket){
  if(![1,2,3,4].includes(ticket.ruleVersion))throw new Error('この挑戦権の戦闘形式は未対応です。');
  this.ticket=ticket;this.room=structuredClone(ticket.initialRoom);this.room.members=new Set(this.room.members);if(ticket.ruleVersion>=2)this.room.raid.progress.contribution=this.room.raid.contribution;this.commands=[];this.events=[];this.time=ticket.issuedAt;this.initialHp=this.room.raid.boss.hp;
  this.session={playerId:ticket.playerId,connected:true,ready:true};this.random=seededRandom430(ticket.seed);
  this.engine=new (Engine430(ticket.ruleVersion))({session:this.session,now:()=>this.time,random:this.random,broadcast:(_,message)=>this.events.push(...message.events??[])});
 }
 get ended(){return this.room.phase==='lobby'||this.room.raid.phase==='finished';}
 get damage(){return this.ticket.ruleVersion>=2?Math.max(0,Math.floor(this.room.raid.damage432??0)):Math.max(0,Math.floor(this.initialHp-this.room.raid.boss.hp));}
 step(command){
  if(this.ended)throw new Error('この挑戦は終了しています。');if(this.commands.length>=limits430(this.ticket).commands)throw new Error('操作記録の上限です。');
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
 snapshot(){return {raid:{...raidSnapshot(this.room.raid),...snapshotExtras432(this.room.raid)},damage:this.damage,ended:this.ended,events:structuredClone(this.events),result:this.room.raid.outcome??null};}
}
export function replayOffline430(ticket,commands,{complete=true}={}){
 if(!Array.isArray(commands)||commands.length>limits430(ticket).commands||JSON.stringify(commands).length>limits430(ticket).bytes)throw new Error('操作記録が大きすぎます。');
 const replay=new WorldRaidReplay430(ticket);for(const command of commands)replay.step(command);
 if(complete&&!replay.ended)throw new Error('戦闘が完了していません。');return replay;
}
