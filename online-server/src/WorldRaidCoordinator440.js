import {WorldRaidCoordinator437} from './WorldRaidCoordinator437.js';
import {newWorldRaidCampaign428} from './WorldRaidStore428.js';
import {resizeCampaign440} from '../../src/worldRaid/WorldRaidBalance440.js';

export class WorldRaidCoordinator440 extends WorldRaidCoordinator437{
 constructor(options={}){
  super(options);
  if(!this.healthy()||this.ledger.state.current.balance440===1)return;
  const result=this.ledger.transact(s=>{
   const c=s.current;resizeCampaign440(c);
   for(const a of Object.values(s.attempts))if(a.status==='active'&&a.campaignId===c.id){
    const r=a.room.raid;r.boss.maxHp=c.maxHp;r.boss.hp=c.hp;
    r.weeklyBoss.maxHp=c.maxHp;r.progress.maxHp=c.maxHp;r.progress.hp=c.hp;
    r.circle432={...r.circle432,...c.circle432};
    r.boss.shield=c.circle432.shield;r.boss.maxShield=c.circle432.maxShield;
   }
   if(c.hp===0){
    c.completedAt=this.now();c.completionReason440='hp-rebalance';
    // No attack occurred during migration: do not invent a last-hit winner.
    s.history.push(structuredClone(c));s.current=newWorldRaidCampaign428(c.sequence+1,this.now());
    for(const a of Object.values(s.attempts))if(a.status==='active'&&a.campaignId===c.id)this._closeAttempt(s,a,'sharedVictory');
    this._settleRewards429(s,s.history.at(-1));
   }
   return {ok:true};
  });
  if(!result.ok)this.ledger.error=new Error('World raid HP migration could not be saved');
 }
}
