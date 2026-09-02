import{ENDGAME_MAX_LEVEL}from"./config.js?v=3.0.5-build305";

/**
 * Field drops are intentionally close to the floor that produced them.
 * Enhancement quality, rarity and affixes remain the main item variance;
 * a lucky roll can no longer skip hundreds of equipment levels.
 */
export function equipmentDropLevelForFloor(floor,{boss=false,elite=false,random=Math.random}={}){
 const safeFloor=Math.max(1,Math.min(ENDGAME_MAX_LEVEL,Math.floor(Number(floor)||1)));
 const spread=boss?.08:elite?.07:.05;
 const center=safeFloor*(boss?1.08:elite?1.03:1);
 const roll=Math.max(0,Math.min(.999999,Number(random?.())||0));
 return Math.max(1,Math.min(ENDGAME_MAX_LEVEL,Math.round(center+safeFloor*(roll*2-1)*spread)));
}
