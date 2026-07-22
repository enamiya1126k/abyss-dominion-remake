import{PUBLIC_MAX_LEVEL,TRUE_MAX_LEVEL,ABYSS_UNLOCK_FLOOR}from"./config.js?v=0.9.15-alpha.32-phase10-10-release-audit";
export function visibleLevelCap(state){return state?.flags?.abyssUnlocked?TRUE_MAX_LEVEL:PUBLIC_MAX_LEVEL}
export function canUnlockAbyss(state){return(state?.player?.maxFloor??1)>=ABYSS_UNLOCK_FLOOR}
export function normalizeProgressionFlags(state){state.flags??={};state.flags.abyssUnlocked??=false;state.flags.trueLevelCapRevealed??=false;state.flags.deepAbyssUnlocked??=false;return state.flags}
