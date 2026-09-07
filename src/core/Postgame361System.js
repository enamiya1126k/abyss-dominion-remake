export const REINCARNATION_START_GOLD=10000;
export function cycleEquipmentRate(state){const p=state?.campaign100?.reincarnation319;return p?.cycle>0?Math.max(.01,Math.min(1,(Number(p.cycleMaxFloor)||1)/100)):1;}
export function syncCycleEquipment(state){const rate=cycleEquipmentRate(state);for(const item of [...(state.equipment??[]),...(state.reserveEquipment??[]),...(state.bossEquipmentVault??[])])item._cyclePower361=rate;return rate;}
export function revengeStage(state){return Math.max(1,Math.floor(Number(state?.campaign100?.royal360?.memoryWins)||0)+1);}
export function revengeExperience(stage){return Math.min(1e12,Math.round(120000*Math.pow(1.15,Math.max(0,stage-1))));}
export function tuneFinalHero(enemy,{count=4,stage=0}={}){
 // Fixed reference curve: stronger players are never secretly matched.
 const n=Math.max(1,Math.min(4,count)),hpBase=n===1?3.5:n===2?3:n===3?2.4:2;
 const growth=Math.max(0,stage-1),safe=(n,f)=>Math.min(1e14,Math.max(1,Math.round(n*f)));
 enemy.maxHp=safe(enemy.maxHp,hpBase*Math.pow(1.18,growth));enemy.hp=enemy.maxHp;
 for(const key of ['atk','matk'])enemy[key]=safe(enemy[key],1.1*Math.pow(1.08,growth));
 for(const key of ['def','mdef'])enemy[key]=safe(enemy[key],Math.pow(1.06,growth));
 enemy.revengeStage361=stage;return enemy;
}
export function canPostclearEncounter(state,world){return !world?.royal&&(state?.campaign100?.finalCompleted===true||!world?.bossDefeated);}
export function reincarnationPreview(state){return {goldBefore:Math.max(0,Number(state?.player?.gold)||0),goldAfter:REINCARNATION_START_GOLD,monsters:(state.monsters??[]).length};}

export function rearmPostclearEncounters(state,world){if(!state?.campaign100?.finalCompleted||!world||world.royal)return false;const steps=Math.max(0,Number(world.steps)||0);if(!Number.isFinite(world.nextEncounter)||world.nextEncounter>steps+40){world.nextEncounter=steps+8;return true}return false;}
