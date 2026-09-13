import {WorldRaidCoordinator432} from './WorldRaidCoordinator432.js';
import {WorldRaidBattle428} from './WorldRaidBattle428.js';
import {RaidCoordinator,raidSnapshot} from './RaidCoordinator.js';
import {withWorldRaidRules432} from '../../src/worldRaid/WorldRaidRules432.js';
import {withWorldRaidLimit437,WORLD_RAID_MAX_ROUNDS437} from '../../src/worldRaid/WorldRaidLimit437.js';
export const WorldRaidBattle437=withWorldRaidRules432(withWorldRaidLimit437(WorldRaidBattle428,RaidCoordinator),raidSnapshot,{maxRounds:WORLD_RAID_MAX_ROUNDS437});
export class WorldRaidCoordinator437 extends WorldRaidCoordinator432{
 constructor(options={}){super(options);this.BattleClass428=WorldRaidBattle437;this.offlineRuleVersion430=3;
  // Already-ended results and issued tickets are immutable. Active online
  // attempts may continue longer, without charging another daily attempt.
  if(this.healthy()&&Object.values(this.ledger.state.attempts).some(a=>a.status==='active'&&a.room.raid.worldRaid428?.maxRounds!==99))this.ledger.transact(s=>{
   for(const a of Object.values(s.attempts))if(a.status==='active'){
    const r=a.room.raid;r.worldRaid428={...r.worldRaid428,maxRounds:99};
    if(r.outcome==='limit'&&r.round<99&&r.boss.hp>0&&Object.values(r.players).some(p=>p.hp>0))r.outcome=null;
   }return {ok:true};
  });
 }
 snapshot(playerId){const state=super.snapshot(playerId);return {...state,rules:{...state.rules,maxRounds:WORLD_RAID_MAX_ROUNDS437}};}
}
