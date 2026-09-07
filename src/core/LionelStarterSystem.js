import{isLionelAvatar}from"./CampaignProtagonistSystem.js";

export const LIONEL_STARTER_SKILL=Object.freeze({
 id:"lionel_foresight_strike",name:"予見の一撃",mp:4,cooldown:1,
 type:"attack",power:2.8,damageClass:"physical",element:"neutral",
 target:"敵単体",tag:"リオネル専用",guaranteedHit:true,defenseIgnore:.25,
 unlock:Object.freeze({type:"level",value:1}),
 description:"敵が動く先を読み、未来の一点を貫く。必中の無属性攻撃。防御の25%を無視する。"
});
export const FIRST_CAPTURE_SPECIES_ID="dire_wolf";
export function lionelStarterSkills(monster){return isLionelAvatar(monster)?[LIONEL_STARTER_SKILL]:[]}

// This is an encounter profile, never a captured monster's growth profile.
export function firstCaptureEncounter(){
 return{speciesId:FIRST_CAPTURE_SPECIES_ID,level:1,boss:false,combatRarity:"SR",
  firstCaptureProfileVersion:369,enemyLoadoutVersion:5,equipped:false,enemyGear:[],
  enemyMagicCircle:null,enemyEquipmentSlots:0,enemyFloor:1,enemyEconomyFloor:1};
}
export function tuneFirstCaptureEnemy(enemy){
 if(!enemy||enemy.firstCaptureProfileVersion!==369)return enemy;
 Object.assign(enemy,{maxHp:26,hp:26,atk:4,matk:4,def:2,mdef:2,spd:8,
  evasion:0,crit:0,accuracy:100,hiddenDamageTaken:1,hiddenStatusResist:0,
  hiddenCapturePressure:1,hiddenAi:0,guard:false,charging:false,divineBarrier:0});
 return enemy;
}
