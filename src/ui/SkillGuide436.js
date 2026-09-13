import {skillEffectDetails} from '../battle/SkillSystem.js';

export const escapeGuide436=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const n=value=>Math.max(0,Number(value)||0),pct=value=>`${Math.round(n(value)*100)}%`;
const turns=e=>e.turns?`・${e.turns}ターン`:'';
const names={atkUp:'攻撃上昇',atkDown:'攻撃低下',defUp:'防御上昇',defDown:'防御低下',spdUp:'速度上昇',spdDown:'速度低下',accuracyUp:'命中上昇',accuracyDown:'命中低下',evasionUp:'回避上昇',evasionDown:'回避低下',guard:'被ダメージ軽減',regen:'毎ターンHP回復',vulnerable:'被ダメージ増加',healDown:'HP回復量低下',reviveSeal:'蘇生封印',stun:'行動不能',counter:'反撃',lifeSteal:'HP吸収',magicToPhysical:'魔力を攻撃へ変換'};
export function effectText436(e){
 const target=e.enemy?'対象':e.allies?'味方全体':'自分';
 if(e.kind==='guaranteedHit')return `${target}：必中${turns(e)}`;
 if(e.kind==='guaranteedCritical')return `${target}：確定会心${turns(e)}`;
 const value=['reviveSeal','stun'].includes(e.kind)?'':n(e.value)?pct(e.kind==='healDown'?Math.min(.9,n(e.value)):e.value):'';
 return `${target}：${names[e.kind]??e.name??'特殊効果'}${value}${turns(e)}${e.chance!=null&&e.chance<1?`・成功率${pct(e.chance)}`:''}`;
}
// Display only. Never feeds back into skill resolution or authored records.
export function guideSkillDetails436(skill){
 const basic=skillEffectDetails({...skill,effects:[]});
 if(n(skill.partyShieldRate))basic.push(`味方全体へ最大HP${pct(skill.partyShieldRate)}の障壁`);
 if(n(skill.selfShieldRate))basic.push(`自分へ最大HP${pct(skill.selfShieldRate)}の障壁`);
 if(skill.invertOneBuff)basic.push('相手の強化を1つ弱体へ反転');
 if(skill.dispelOne&&!skill.dispelEnemyBuff)basic.push('相手の解除可能な強化を1つ解除');
 if(skill.cooldownDelay)basic.push(`相手のスキル再使用を${skill.cooldownDelay}ターン遅延`);
 if(skill.increaseEnemyCooldowns)basic.push(`相手の再使用待ちスキルを${skill.increaseEnemyCooldowns}ターン延長`);
 if(skill.reducePartyCooldowns)basic.push(`味方の再使用待ちスキルを${skill.reducePartyCooldowns}ターン短縮`);
 return [...new Set([...basic,...(skill.effects??[]).map(effectText436)])];
}
export function motherSkillSummary436(s){
 const rows=[],physical=s.damageClass==='physical',power=n(s.multiplier??s.power),all=s.pattern==='all'||s.allEnemies;
 if(power)rows.push(`${all?'こちら全体':s.pattern==='singleWeak'?'HPの低い1体':'こちら1体'}へ${physical?'物理':'魔法'}${pct(power)}${n(s.hits)>1?`×${s.hits}回`:''}`);
 if(s.guaranteedHit)rows.push('必中');
 if(s.guaranteedCritical)rows.push('確定会心');
 if(n(s.defenseIgnore))rows.push(`${physical?'物理':'魔法'}防御${pct(Math.min(.9,s.defenseIgnore))}無視`);
 if(n(s.currentHpDamage))rows.push(`現在HP${pct(Math.min(.25,s.currentHpDamage))}の追加ダメージ`);
 if(n(s.execute))rows.push(`対象HP${pct(s.execute)}以下で基礎威力2倍`);
 if(n(s.heal))rows.push(`${s.type==='allHeal'||s.target==='味方全体'?'敵側全体':'母'}を最大HP${pct(s.heal)}回復`);
 if(s.cleanse)rows.push('状態異常・弱体解除');
 if(n(s.partyShieldRate))rows.push(`敵側全体へHP${pct(s.partyShieldRate)}障壁`);
 if(n(s.selfShieldRate))rows.push(`母へHP${pct(s.selfShieldRate)}障壁`);
 if(n(s.revive))rows.push('戦闘不能の敵1体を蘇生');
 if(s.dispelOne||s.dispelEnemyBuff)rows.push('こちらの強化1つ解除');
 if(s.dispel)rows.push('対象の強化解除');
 if(s.invertOneBuff)rows.push('こちらの強化1つを弱体へ反転');
 if(s.cooldownDelay)rows.push(`再使用${s.cooldownDelay}ターン遅延`);
 if(s.increaseAllyCooldowns)rows.push(`こちらの再使用待ちスキルを${s.increaseAllyCooldowns}ターン延長`);
 if(s.reducePartyCooldowns)rows.push(`敵側の固有技再使用を${s.reducePartyCooldowns}ターン短縮`);
 if(s.status)rows.push(`${s.status.name??'状態異常'}${s.status.turns?` ${s.status.turns}ターン`:''}`);
 for(const e of s.effects??[])rows.push(effectText436(e).replace('味方全体','敵側全体').replace('自分','母'));
 return rows.join(' ／ ');
}
export function skillReadingMs436(text,speed=1){
 return Math.max(3000,Math.min(6000,1600+[...String(text)].length*26),720/Math.max(.5,Number(speed)||1));
}
// A speed/auto toggle rerenders the arena. Reattach the same announcement and
// keep its original wall-clock deadline rather than dismissing or restarting it.
export async function holdSkillBanner436(el,{getArena,isCurrent,duration,now=()=>performance.now(),delay=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
 const start=now();
 while(isCurrent()&&now()-start<duration){
  const arena=getArena();if(!arena)break;
  if(el.parentNode!==arena)arena.appendChild(el);
  await delay(Math.min(50,Math.max(1,duration-(now()-start))));
 }
 if(isCurrent()&&el.isConnected){el.classList.add('leaving');await delay(220);}
 el.remove();
}
