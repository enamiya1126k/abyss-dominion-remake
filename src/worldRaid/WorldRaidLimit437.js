// Version 3 extends only the duration. Version 1/2 replay engines stay at 10.
export const WORLD_RAID_MAX_ROUNDS437=99;
export function raidRoundLimit437(raid){return Math.max(1,Number(raid?.worldRaid428?.maxRounds)||10);}
export function withWorldRaidLimit437(Base,Parent){
 return class extends Base{
  create(...args){const result=super.create(...args);if(result.ok)result.room.raid.worldRaid428.maxRounds=WORLD_RAID_MAX_ROUNDS437;return result;}
  _resolve(room,raid){Parent.prototype._resolve.call(this,room,raid);if(!raid.outcome&&raid.round>=WORLD_RAID_MAX_ROUNDS437)raid.outcome='limit';}
 };
}
