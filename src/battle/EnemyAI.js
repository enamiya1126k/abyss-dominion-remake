export const ENEMY_ACTIONS={
 attack:"attack",guard:"guard",charge:"charge",power:"power",heal:"heal",enrage:"enrage",
 devour:"devour",annihilate:"annihilate",inferno:"inferno",thunderstorm:"thunderstorm",divineBarrier:"divineBarrier"
};

export function isBossFloor(floor){return floor>0&&floor%10===0}

export function createEnemyBattleState(species,source,floor){
 const boss=source.boss??isBossFloor(floor),hpScale=boss?1.65:1,attackScale=boss?1.12:1,maxHp=Math.floor((species.baseStats.hp+source.level*8)*hpScale);
 return{speciesId:source.speciesId,name:boss?`深淵の${species.name}`:species.name,level:source.level,hp:maxHp,maxHp,
  atk:Math.floor((species.baseStats.atk+source.level*1.4)*attackScale),def:Math.floor((species.baseStats.def+source.level*.5)*(boss?1.08:1)),spd:Math.floor((species.baseStats.spd+source.level*.18)*(boss?1.03:1)),
  emoji:species.emoji??"👾",color:boss?"#bb4cff":species.baseStats.atk>12?"#df6262":"#a58f59",boss,phase:1,enraged:false,guard:false,charging:false,healed:false,
  intent:"様子を見ている",specialCooldown:0,divineBarrier:0};
}

function specialAction(enemy,hpRate){
 if(!enemy.endgameBossId)return null;
 enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);
 if(enemy.divineBarrier>0)enemy.divineBarrier--;
 if(enemy.faction==="tenGod"&&hpRate<=.72&&!enemy.divineBarrierUsed){enemy.divineBarrierUsed=true;enemy.divineBarrier=2;enemy.intent="神域障壁を展開";return ENEMY_ACTIONS.divineBarrier}
 if(enemy.specialCooldown>0)return null;
 const roll=Math.random();
 if(enemy.endgameBossId==="abyss_gluttony"&&roll<.34){enemy.specialCooldown=2;enemy.intent="万象を喰らう";return ENEMY_ACTIONS.devour}
 if(enemy.endgameBossId==="abyss_extinction"&&roll<.32){enemy.specialCooldown=2;enemy.intent="死滅の波動";return ENEMY_ACTIONS.annihilate}
 if(enemy.endgameBossId==="ten_fire"&&roll<.42){enemy.specialCooldown=2;enemy.intent="神炎が世界を覆う";return ENEMY_ACTIONS.inferno}
 if(enemy.endgameBossId==="ten_thunder"&&roll<.42){enemy.specialCooldown=2;enemy.intent="天雷が連鎖する";return ENEMY_ACTIONS.thunderstorm}
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

export function enemyDamageMultiplier(enemy){
 let mult=1;if(enemy.guard){enemy.guard=false;mult*=.48}if((enemy.divineBarrier??0)>0)mult*=.35;return mult;
}
export function enemyHealAmount(enemy){return Math.max(1,Math.floor(enemy.maxHp*(enemy.endgameBossId?.28:enemy.boss?.22:.16)))}
export function enemyAttackMultiplier(enemy,action){
 if(action===ENEMY_ACTIONS.power)return enemy.endgameBossId?2.55:enemy.boss?2.15:1.8;
 if(enemy.enraged)return enemy.endgameBossId?1.55:1.35;return 1;
}
export function specialActionMultiplier(action){
 if(action===ENEMY_ACTIONS.devour)return 1.25;
 if(action===ENEMY_ACTIONS.annihilate)return 1.55;
 if(action===ENEMY_ACTIONS.inferno)return 1.7;
 if(action===ENEMY_ACTIONS.thunderstorm)return 1.45;
 return 1;
}
