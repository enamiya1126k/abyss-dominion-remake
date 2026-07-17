export function createBattleRulesState(party){
 return{
  cooldowns:Object.fromEntries(party.map(m=>[m.id,{}])),
  enemyStatuses:[],
  log:["戦闘開始"],
  lastStatusTurn:0
 };
}

export function cooldownRemaining(battle,monsterId,skillId){
 return battle.cooldowns?.[monsterId]?.[skillId]??0;
}

export function setSkillCooldown(battle,monsterId,skill){
 if(!skill?.cooldown)return;
 battle.cooldowns[monsterId]??={};
 battle.cooldowns[monsterId][skill.id]=skill.cooldown+1;
}

export function tickCooldowns(battle){
 Object.values(battle.cooldowns??{}).forEach(map=>{
  Object.keys(map).forEach(id=>{
   map[id]=Math.max(0,map[id]-1);
   if(map[id]===0)delete map[id];
  });
 });
}

export function addBattleLog(battle,text){
 battle.log??=[];
 battle.log.unshift(text);
 battle.log=battle.log.slice(0,6);
}

export function applyEnemyStatus(battle,status){
 if(!status)return false;
 battle.enemyStatuses??=[];
 const existing=battle.enemyStatuses.find(s=>s.id===status.id);
 if(existing){
  existing.turns=Math.max(existing.turns,status.turns);
  existing.power=Math.max(existing.power,status.power);
 }else{
  battle.enemyStatuses.push({...status});
 }
 return true;
}

export function processEnemyStatuses(battle){
 const enemy=battle.enemy;
 const results=[];
 battle.enemyStatuses=(battle.enemyStatuses??[]).filter(status=>{
  let damage=0;
  if(status.id==="poison")damage=Math.max(1,Math.floor(enemy.maxHp*status.power));
  if(status.id==="burn")damage=Math.max(1,Math.floor(enemy.maxHp*status.power));
  if(damage){
   enemy.hp=Math.max(0,enemy.hp-damage);
   results.push({id:status.id,name:status.name,damage});
  }
  status.turns--;
  return status.turns>0&&enemy.hp>0;
 });
 return results;
}

export function statusLabel(status){
 return `${status.name} ${status.turns}T`;
}
