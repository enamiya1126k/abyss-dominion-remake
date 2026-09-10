import {calculatedStats} from '../models/Monster.js?v=3.1.82-build402';
import {twinPair385} from '../battle/TwinResonance385.js?v=3.1.75-build395';
import {ultimateIsolated} from '../core/EndgameUltimateSystem.js';
const positive=new Set(['atkUp','defUp','spdUp','regen','guard','counter','accuracyUp','evasionUp','critUp','guaranteedHit','guaranteedCritical','lifeSteal']);
export function prioritizeChapterTwoTargets393(enemy,opponents,battle,natives){
 if(!enemy.elitePolicy393)return opponents;
 const living=opponents.filter(u=>u.currentHp>0&&!u.captured&&!ultimateIsolated(battle,u));
 const taunters=living.filter(u=>(battle.allyEffects?.[u.id]??[]).some(e=>e.kind==='taunt'&&(e.turns??1)>0));
 const foes=taunters.length?taunters:living;
 const score=u=>{
  const hp=Math.max(1,u._maxHp??u.maxHp??(u.speciesId?calculatedStats(u).hp:u.currentHp)),ratio=u.currentHp/hp,skills=natives[u.speciesId]?.authoredSkills??[];
  const pair=twinPair385(u),paired=pair?.members.every(id=>foes.some(x=>x.speciesId===id));
  const support=skills.some(k=>['allHeal','cleanse','revive'].includes(k.type))||['healer','support'].includes(u.role);
  const buffed=(battle.allyEffects?.[u.id]??[]).some(e=>positive.has(e.kind)&&(e.turns??1)>0);
  return (1-Math.min(1,ratio))*10+(ratio<=.35?14:0)+(enemy.elitePolicy393==='pair'&&paired?12:0)+(enemy.elitePolicy393==='support'&&support?12:0)+(enemy.elitePolicy393==='buff'&&buffed?12:0);
 };
 return foes.map((u,i)=>({u,i,score:score(u)})).sort((a,b)=>b.score-a.score||a.i-b.i).map(x=>x.u);
}
