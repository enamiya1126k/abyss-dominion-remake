// Display bookkeeping only. Does not alter absorbed damage or shield grants.
export function rememberShieldCapacity(unit,capacity=unit?.heroShield348){if(!unit)return 0;unit.heroShieldMax378=Math.max(0,Math.floor(Number(unit.heroShieldMax378)||0),Math.floor(Number(capacity)||0),Math.floor(Number(unit.heroShield348)||0));return unit.heroShieldMax378;}
export function shieldCapacity(unit){return Math.max(0,Math.floor(Number(unit?.heroShieldMax378)||0),Math.floor(Number(unit?.heroShield348)||0));}
