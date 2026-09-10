import {endgameCharacter} from '../data/endgameCharacters.js';

// Each commander uses its real, existing authorities. Separate per-skill CTs
// prevent one authority's cooldown from silencing the entire support kit.
export function chooseChapterTwoCommander397(enemy,context={}){
 if(!enemy?.chapterTwoTactics382?.commander397)return null;
 const profile=endgameCharacter(enemy.endgameBossId);if(!profile)return null;
 enemy.specialCooldown=Math.max(0,(Number(enemy.specialCooldown)||0)-1);
 if(enemy.specialCooldown>0){enemy.intent='再唱封印のため通常攻撃';return 'attack';}
 const turn=Math.max(1,Number(context.battle?.turn)||1),cooldowns=enemy.commanderCooldowns397??={},allies=(context.allies??[enemy]).filter(m=>m.hp>0&&!m.captured),effects=context.battle?.enemyEffects??{};
 // Final legacy super-skills and ultimate358 stay under the existing ultimate rules.
 const skills=profile.skills.filter(s=>!s.ultimate358).slice(1,4),ready=s=>(cooldowns[s.id]??0)<=turn&&(enemy.currentMp??0)>=(s.mp??0);
 const choose=s=>{cooldowns[s.id]=turn+Math.max(0,Number(s.cooldown)||0)+1;enemy.intent=s.name;return `authority:${s.id}`;};
 const revive=skills.find(s=>s.revive&&ready(s));
 if(revive&&!enemy.commanderRevived397&&(context.allies??[]).some(m=>m.hp<=0&&!m.captured&&!(effects[m.id]??[]).some(e=>e.kind==='reviveSeal'&&e.turns>0)))return choose(revive);
 const heal=skills.find(s=>s.heal&&ready(s)&&(s.type==='allHeal'?allies.some(m=>m.hp/m.maxHp<.62):enemy.hp/enemy.maxHp<.6));if(heal)return choose(heal);
 const buff=skills.find(s=>['buff','stance'].includes(s.type)&&!s.heal&&ready(s)&&!(effects[enemy.id]??[]).some(e=>s.effects?.some(x=>x.kind===e.kind)&&e.turns>1));if(buff)return choose(buff);
 const attack=skills.find(s=>s.power>0&&ready(s));if(attack)return choose(attack);
 if((enemy.currentMp??0)<Math.min(100,enemy.maxMp*.24)&&(cooldowns.recharge??0)<=turn){cooldowns.recharge=turn+5;enemy.intent='魔力を練り直す';return 'ch2:recharge';}
 enemy.intent='次の権能に備えて通常攻撃';return 'attack';
}

export function reduceChapterTwoCooldowns397(battle,source,amount){
 if(!source?.chapterTwoTactics382?.commander397)return;
 const turn=Math.max(1,Number(battle.turn)||1),reduction=Math.max(0,Math.min(3,Math.floor(Number(amount)||0)));
 for(const ally of battle.enemies??[]){
  if(ally.hp<=0||ally.captured)continue;
  for(const cooldowns of [ally.chapterTwoCooldowns383,ally.commanderCooldowns397]){
   for(const [id,due]of Object.entries(cooldowns??{}))if(id!=='recharge'&&Number(due)>turn)cooldowns[id]=Math.max(turn+1,Number(due)-reduction);
  }
 }
}
