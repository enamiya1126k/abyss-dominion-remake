// Server-created world bosses alone use a finite HP basis for percentage effects.
// Ordinary encounters and minions retain their original calculations.
export const WORLD_RAID_PERCENT_HP428 = 1600000;
export function worldRaidPercentHp428(unit, hp) {
 return unit?.worldRaidBoss428 === true ? Math.min(hp, WORLD_RAID_PERCENT_HP428) : hp;
}
