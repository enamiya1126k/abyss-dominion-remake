import{bossProfileForFloor}from"../core/EnemyScalingSystem.js?v=0.9.15-alpha.21-phase7";
export const ENEMY_ACTIONS={
 attack:"attack",guard:"guard",charge:"charge",power:"power",heal:"heal",enrage:"enrage",divineBarrier:"divineBarrier",
 devour:"devour",annihilate:"annihilate",wrathBurst:"wrathBurst",mirror:"mirror",sleepMist:"sleepMist",plunder:"plunder",sovereign:"sovereign",
 inferno:"inferno",tidal:"tidal",thunderstorm:"thunderstorm",tempest:"tempest",quake:"quake",radiance:"radiance",eclipse:"eclipse",absoluteZero:"absoluteZero",timeStop:"timeStop",starfall:"starfall"
};

const BOSS_SPECIALS={
 abyss_gluttony:{action:"devour",chance:.38,cooldown:2,intent:"万象を喰らう"},
 abyss_extinction:{action:"annihilate",chance:.35,cooldown:2,intent:"命の終端を開く"},
 abyss_wrath:{action:"wrathBurst",chance:.42,cooldown:2,intent:"傷が憤怒へ変わる"},
 abyss_envy:{action:"mirror",chance:.38,cooldown:3,intent:"最も強い力を写す"},
 abyss_sloth:{action:"sleepMist",chance:.40,cooldown:3,intent:"時間が眠り始める"},
 abyss_greed:{action:"plunder",chance:.40,cooldown:3,intent:"すべての強化を所有する"},
 abyss_pride:{action:"sovereign",chance:.42,cooldown:2,intent:"絶対王域を宣言する"},
 ten_fire:{action:"inferno",chance:.46,cooldown:2,intent:"神炎が世界を覆う"},
 ten_water:{action:"tidal",chance:.42,cooldown:2,intent:"生命の大潮が満ちる"},
 ten_thunder:{action:"thunderstorm",chance:.46,cooldown:2,intent:"天雷が万象へ連鎖する"},
 ten_wind:{action:"tempest",chance:.45,cooldown:2,intent:"天地を裂く神嵐が集う"},
 ten_earth:{action:"quake",chance:.42,cooldown:2,intent:"大陸そのものが軋む"},
 ten_light:{action:"radiance",chance:.44,cooldown:2,intent:"真実の光が満ちる"},
 ten_dark:{action:"eclipse",chance:.44,cooldown:2,intent:"月蝕が命を選別する"},
 ten_ice:{action:"absoluteZero",chance:.43,cooldown:2,intent:"絶対零度が展開される"},
 ten_time:{action:"timeStop",chance:.38,cooldown:3,intent:"因果の秒針が止まる"},
 ten_space:{action:"starfall",chance:.48,cooldown:2,intent:"星界が地上へ墜ちる"}
};

export const SPECIAL_ACTION_INFO={
 devour:{label:"無限捕食",pattern:"singleWeak",multiplier:1.3,drain:.7},
 annihilate:{label:"死滅の波動",pattern:"all",multiplier:1.55},
 wrathBurst:{label:"憤怒爆砕",pattern:"all",multiplier:1.45,selfAtk:.12},
 mirror:{label:"鏡界模倣",pattern:"singleStrong",multiplier:1.7,copyAtk:true},
 sleepMist:{label:"永劫睡界",pattern:"all",multiplier:1.05,slow:.22},
 plunder:{label:"権能強奪",pattern:"all",multiplier:1.15,selfHeal:.16,selfAtk:.08},
 sovereign:{label:"絶対王域",pattern:"all",multiplier:1.6,barrier:2},
 inferno:{label:"神炎・終焉焦土",pattern:"all",multiplier:1.75},
 tidal:{label:"神海・蒼天大瀑",pattern:"all",multiplier:1.4,selfHeal:.22},
 thunderstorm:{label:"神雷・万象連鎖",pattern:"random3",multiplier:1.5},
 tempest:{label:"神嵐・天地解放",pattern:"random3",multiplier:1.65,selfSpd:.12},
 quake:{label:"神地・大陸震界",pattern:"all",multiplier:1.55,selfDef:.12},
 radiance:{label:"神光・万象浄滅",pattern:"all",multiplier:1.6},
 eclipse:{label:"神闇・無明葬界",pattern:"singleWeak",multiplier:2.05,drain:.25},
 absoluteZero:{label:"神氷・絶対零界",pattern:"all",multiplier:1.42,slow:.28},
 timeStop:{label:"神刻・因果停止",pattern:"random3",multiplier:1.8,selfSpd:.18},
 starfall:{label:"神星・天界墜落",pattern:"all",multiplier:1.9,barrier:1}
};

export function isBossFloor(floor){return floor>0&&floor%10===0}
export function createEnemyBattleState(species,source,floor){
 const boss=source.boss??isBossFloor(floor),profile=boss?bossProfileForFloor(floor):{tier:null,hp:1,atk:1,def:1,spd:1,statusResist:0,healRate:.16,powerMultiplier:1.8};
 const maxHp=Math.max(1,Math.floor((species.baseStats.hp+source.level*8)*profile.hp));
 return{speciesId:source.speciesId,name:source.nameOverride??(boss?`深淵の${species.name}`:species.name),level:source.level,hp:maxHp,maxHp,
  atk:Math.floor((species.baseStats.atk+source.level*1.4)*profile.atk),def:Math.floor((species.baseStats.def+source.level*.5)*profile.def),spd:Math.floor((species.baseStats.spd+source.level*.18)*profile.spd),
  emoji:species.emoji??"👾",color:boss?"#bb4cff":species.baseStats.atk>12?"#df6262":"#a58f59",boss,bossTier:profile.tier,bossStatusResist:profile.statusResist,bossHealRate:profile.healRate,bossPowerMultiplier:profile.powerMultiplier,phase:1,enraged:false,guard:false,charging:false,healed:false,
  intent:"様子を見ている",specialCooldown:0,divineBarrier:0,...source};
}
function specialAction(enemy,hpRate){
 if(!enemy.endgameBossId)return null;enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);if(enemy.divineBarrier>0)enemy.divineBarrier--;
 if(enemy.faction==="tenGod"&&hpRate<=.72&&!enemy.divineBarrierUsed){enemy.divineBarrierUsed=true;enemy.divineBarrier=2;enemy.intent="神域障壁を展開";return ENEMY_ACTIONS.divineBarrier}
 if(enemy.specialCooldown>0)return null;const config=BOSS_SPECIALS[enemy.endgameBossId];if(!config)return null;
 if(Math.random()<config.chance){enemy.specialCooldown=config.cooldown;enemy.intent=config.intent;return ENEMY_ACTIONS[config.action]}
 return null;
}
export function chooseEnemyAction(enemy){
 const hpRate=enemy.hp/enemy.maxHp,special=specialAction(enemy,hpRate);if(special)return special;
 if(enemy.charging){enemy.charging=false;enemy.intent="強攻撃を放つ";return ENEMY_ACTIONS.power}
 if(enemy.boss&&hpRate<=.5&&!enemy.enraged){enemy.enraged=true;enemy.phase=2;enemy.intent=enemy.endgameBossId?"権能が暴走する":"狂暴化";return ENEMY_ACTIONS.enrage}
 if(hpRate<=.3&&!enemy.healed&&Math.random()<.5){enemy.healed=true;enemy.intent="自己回復";return ENEMY_ACTIONS.heal}
 const roll=Math.random(),guardChance=enemy.boss?.12:.18,chargeChance=enemy.boss?.25:.16;
 if(roll<guardChance){enemy.guard=true;enemy.intent="防御態勢";return ENEMY_ACTIONS.guard}
 if(roll<guardChance+chargeChance){enemy.charging=true;enemy.intent="力を溜めている";return ENEMY_ACTIONS.charge}
 enemy.intent=enemy.enraged?"狂乱攻撃":"通常攻撃";return ENEMY_ACTIONS.attack;
}
export function enemyDamageMultiplier(enemy){let mult=1;if(enemy.guard){enemy.guard=false;mult*=.48}if((enemy.divineBarrier??0)>0)mult*=.35;return mult}
export function enemyHealAmount(enemy){return Math.max(1,Math.floor(enemy.maxHp*(enemy.endgameBossId?.28:enemy.boss?(enemy.bossHealRate??.12):.16)))}
export function enemyAttackMultiplier(enemy,action){if(action===ENEMY_ACTIONS.power)return enemy.endgameBossId?2.55:enemy.boss?(enemy.bossPowerMultiplier??1.8):1.8;if(enemy.enraged)return enemy.endgameBossId?1.55:enemy.boss?1.3:1.35;return 1}
export function specialActionMultiplier(action){return SPECIAL_ACTION_INFO[action]?.multiplier??1}
export function specialActionInfo(action){return SPECIAL_ACTION_INFO[action]??null}
