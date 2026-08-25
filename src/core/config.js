export const SAVE_KEY="abyss-dominion-remake-v001";
export const SAVE_SCHEMA_VERSION=58;
export const MAX_PARTY_SIZE=4;
export const PUBLIC_MAX_LEVEL=100;
export const TRUE_MAX_LEVEL=10000;
// Ordinary monsters retain the public/normal growth cap. Only authored
// endgame enemies and contracted Deep Abyss / Ten-God units may use this cap.
export const ENDGAME_MAX_LEVEL=99999;
export const MONSTER_STORAGE_CAP=3000;
export const ABYSS_UNLOCK_FLOOR=100;
export const BATTLE_SPEED_OPTIONS=Object.freeze([.5,1,2,4]);
export const CAMERA_DRAG_THRESHOLD_PX=10;
export const WATER_RULES=Object.freeze({minPerFloor:1,maxPerFloor:5,hpRecoveryRate:.02,mpRecoveryRate:.02});
// v2.1.0 economy: every player-paid magic-crystal requirement is ten times the
// former value. Rewards are intentionally not multiplied.
export const PREMIUM_COST_MULTIPLIER=10;
export function premiumCrystalCost(baseCost){return Math.max(0,Math.round((Number(baseCost)||0)*PREMIUM_COST_MULTIPLIER))}
export const MONSTER_STAR_MAX=10;
export const COMBAT_POWER_DISPLAY_SCALE=90;
export function normalizeBattleSpeed(value){const speed=Number(value);return BATTLE_SPEED_OPTIONS.includes(speed)?speed:1}
// Production packages must never expose temporary TEST ACCESS routes.
export const CONTENT_TEST_MODE=false;
export const CONTENT_TEST_UNLOCK_FLOOR=10;
export function contentUnlockFloor(productionFloor){
  return CONTENT_TEST_MODE?CONTENT_TEST_UNLOCK_FLOOR:Math.max(1,Number(productionFloor)||1);
}
export function isContentUnlocked(stateOrFloor,productionFloor){
  const floor=typeof stateOrFloor==="number"?stateOrFloor:Number(stateOrFloor?.player?.maxFloor)||0;
  return floor>=contentUnlockFloor(productionFloor);
}
export const APP_VERSION="2.11.53";
