import {WorldRaidCoordinator430} from './WorldRaidCoordinator430.js';
import {WorldRaidBattle432} from './WorldRaidBattle432.js';
import {newWorldRaidCampaign428} from './WorldRaidStore428.js';
import {RAID_CIRCLES432,sharedCircle432,equipRaidBoss432,applySharedImpact432} from '../../src/worldRaid/WorldRaidRules432.js';
export class WorldRaidCoordinator432 extends WorldRaidCoordinator430{
 constructor(options={}){
  super(options);this.BattleClass428=WorldRaidBattle432;this.offlineRuleVersion430=2;
  // Resume already-started online attempts with the new equipment, without
  // consuming another attempt. Issued offline tickets retain their ruleVersion.
  if(this.healthy()&&Object.values(this.ledger.state.attempts).some(a=>a.status==='active'&&!a.room.raid.rules432))this.ledger.transact(s=>{
   for(const a of Object.values(s.attempts))if(a.status==='active'&&a.campaignId===s.current.id&&!a.room.raid.rules432)this._prepareBattle432(s.current,a.room.raid);
   return {ok:true};
  });
 }
 snapshot(playerId){const state=super.snapshot(playerId),c=this.ledger.state.current,def=RAID_CIRCLES432[c.bossId];return {...state,campaign:{...state.campaign,boss:{...state.campaign.boss,circleId:def.id,circleName:def.name,magicCircleAsset:def.asset},circle432:sharedCircle432(c)}};}
 _prepareBattle432(c,battle){c.circle432??=sharedCircle432(c);equipRaidBoss432(battle,c);battle.settledDamage432=battle.damage432;}
 _settleDamage(s,a,before,battle){
  if(!battle.rules432)return super._settleDamage(s,a,before,battle);
  const c=s.current;if(c.id!==a.campaignId)return;
  const damage=Math.max(0,Math.floor(battle.damage432-(battle.settledDamage432??0)));a.damage+=damage;c.contribution[a.playerId].damage+=damage;
  c.hp=battle.boss.hp;c.circle432={...battle.circle432};delete c.circle432.hits;battle.progress.hp=c.hp;
  if(c.hp===0){
   c.completedAt=this.now();c.killerId=a.playerId;s.history.push(structuredClone(c));s.current=newWorldRaidCampaign428(c.sequence+1,this.now());
   for(const other of Object.values(s.attempts))if(other.status==='active'&&other.campaignId===c.id){if(other.room?.raid){other.room.raid.boss.hp=0;other.room.raid.progress.hp=0;}this._closeAttempt(s,other,other.id===a.id?'victory':'sharedVictory');}
   this._settleRewards429(s,s.history.at(-1));
  }
 }
 _applyOfflineImpact432(c,damage){return applySharedImpact432(c,damage);}
}
