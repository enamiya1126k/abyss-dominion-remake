export const ENEMY_ACTIONS={
 attack:"attack",
 guard:"guard",
 charge:"charge",
 power:"power",
 heal:"heal",
 enrage:"enrage"
};

export function isBossFloor(floor){
 return floor>0&&floor%10===0;
}

export function createEnemyBattleState(species,source,floor){
 const boss=isBossFloor(floor);
 const hpScale=boss?2.35:1;
 const attackScale=boss?1.3:1;
 const maxHp=Math.floor((species.baseStats.hp+source.level*8)*hpScale);
 return{
  speciesId:source.speciesId,
  name:boss?`深淵の${species.name}`:species.name,
  level:source.level,
  hp:maxHp,
  maxHp,
  atk:Math.floor((species.baseStats.atk+source.level*1.4)*attackScale),
  def:Math.floor((species.baseStats.def+source.level*.5)*(boss?1.2:1)),
  color:boss?"#bb4cff":species.baseStats.atk>12?"#df6262":"#a58f59",
  boss,
  phase:1,
  enraged:false,
  guard:false,
  charging:false,
  healed:false,
  intent:"様子を見ている"
 };
}

export function chooseEnemyAction(enemy){
 const hpRate=enemy.hp/enemy.maxHp;

 if(enemy.charging){
  enemy.charging=false;
  enemy.intent="強攻撃を放つ";
  return ENEMY_ACTIONS.power;
 }

 if(enemy.boss&&hpRate<=.5&&!enemy.enraged){
  enemy.enraged=true;
  enemy.phase=2;
  enemy.intent="狂暴化";
  return ENEMY_ACTIONS.enrage;
 }

 if(hpRate<=.3&&!enemy.healed&&Math.random()<.5){
  enemy.healed=true;
  enemy.intent="自己回復";
  return ENEMY_ACTIONS.heal;
 }

 const roll=Math.random();
 const guardChance=enemy.boss?.12:.18;
 const chargeChance=enemy.boss?.25:.16;

 if(roll<guardChance){
  enemy.guard=true;
  enemy.intent="防御態勢";
  return ENEMY_ACTIONS.guard;
 }

 if(roll<guardChance+chargeChance){
  enemy.charging=true;
  enemy.intent="力を溜めている";
  return ENEMY_ACTIONS.charge;
 }

 enemy.intent=enemy.enraged?"狂乱攻撃":"通常攻撃";
 return ENEMY_ACTIONS.attack;
}

export function enemyDamageMultiplier(enemy){
 if(!enemy.guard)return 1;
 enemy.guard=false;
 return .48;
}

export function enemyHealAmount(enemy){
 return Math.max(1,Math.floor(enemy.maxHp*(enemy.boss?.22:.16)));
}

export function enemyAttackMultiplier(enemy,action){
 if(action===ENEMY_ACTIONS.power)return enemy.boss?2.15:1.8;
 if(enemy.enraged)return 1.35;
 return 1;
}
