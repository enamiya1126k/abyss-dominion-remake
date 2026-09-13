import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {WEEKLY_RAID_BOSSES} from './WeeklyRaidCatalog.js';

export const WORLD_RAID_RULES428=Object.freeze({dailyLimit:3,quietRounds:5,maxRounds:10,timezone:'Asia/Tokyo'});
const DAY=86400000;
export function worldRaidDay428(now){return new Date(now+9*3600000).toISOString().slice(0,10);}
export function worldRaidReset428(now){return (Math.floor((now+9*3600000)/DAY)+1)*DAY-9*3600000;}
export function worldRaidBoss428(sequence=1){
 const index=(sequence-1)%WEEKLY_RAID_BOSSES.length,base=WEEKLY_RAID_BOSSES[index];
 return {...structuredClone(base),level:5000,maxHp:[100_000_000_000,120_000_000_000,140_000_000_000][index],subBoss:{...base.subBoss,level:100,maxHp:12500,respawnDelayRounds:null,maxRespawnsPerAttempt:0,rewardableKillsPerCampaign:0}};
}
export function newWorldRaidCampaign428(sequence,now){const boss=worldRaidBoss428(sequence);return {id:`world-${sequence}-${boss.id}`,sequence,bossId:boss.id,maxHp:boss.maxHp,hp:boss.maxHp,startedAt:now,contribution:{}};}
export function createWorldRaidState428(now){return {version:1,revision:0,current:newWorldRaidCampaign428(1,now),days:{},attempts:{},history:[]};}
const whole=(n,min=0)=>Number.isSafeInteger(n)&&n>=min;
export function validateWorldRaidState428(s){
 if(!s||s.version!==1||!whole(s.revision)||!s.current||!whole(s.current.sequence,1)||!whole(s.current.maxHp,1)||!whole(s.current.hp,1)||s.current.hp>s.current.maxHp||!s.days||!s.attempts||!Array.isArray(s.history))throw new Error('Invalid world raid state');
 const expected=newWorldRaidCampaign428(s.current.sequence,0);if(s.current.id!==expected.id||s.current.bossId!==expected.bossId)throw new Error('Invalid world raid campaign');
 for(const rows of Object.values(s.days))for(const used of Object.values(rows))if(!whole(used)||used>3)throw new Error('Invalid daily count');
 for(const [id,a]of Object.entries(s.attempts))if(a.id!==id||!a.playerId||!a.requestId||!a.campaignId||!['active','ended'].includes(a.status)||!whole(a.damage)||a.status==='active'&&!a.room?.raid)throw new Error('Invalid attempt');
 return s;
}

// Atomic rename is shared with the other server ledgers. No client sends HP or damage.
export class WorldRaidStore428{
 constructor({stateFile=null,now=()=>Date.now(),persist=null}={}){
  this.stateFile=stateFile?path.resolve(stateFile):null;this.now=now;this.persistOverride=persist;this.error=null;this.state=createWorldRaidState428(now());
  try{if(this.stateFile&&fs.existsSync(this.stateFile))this.state=validateWorldRaidState428(JSON.parse(fs.readFileSync(this.stateFile,'utf8')));else this._write(this.state);}catch(e){this.error=e;}
 }
 healthy(){return !this.error;}
 snapshot(){return structuredClone(this.state);}
 _write(next){
  if(this.persistOverride&&this.persistOverride(next)===false)throw new Error('World raid persistence rejected');
  if(!this.stateFile)return;
  const directory=path.dirname(this.stateFile);fs.mkdirSync(directory,{recursive:true});
  const temporary=this.stateFile+'.'+randomBytes(6).toString('hex')+'.tmp';let descriptor;
  try{descriptor=fs.openSync(temporary,'wx',0o600);fs.writeFileSync(descriptor,JSON.stringify(next));fs.fsyncSync(descriptor);fs.closeSync(descriptor);descriptor=null;fs.renameSync(temporary,this.stateFile);}finally{if(descriptor!=null)fs.closeSync(descriptor);try{fs.unlinkSync(temporary);}catch{}}
 }
 transact(change){
  if(this.error)return {ok:false,code:'WORLD_RAID_STORAGE',message:'共闘レイドの保存データを確認できません。管理者の復旧をお待ちください。'};
  const next=this.snapshot();let result;
  try{result=change(next);if(result?.ok===false||result?.unchanged)return result;next.revision++;validateWorldRaidState428(next);this._write(next);this.state=next;return result??{ok:true};}
  catch(error){return {ok:false,code:'WORLD_RAID_SAVE',message:'共闘レイドを保存できませんでした。しばらくしてから再試行してください。'};}
 }
}
