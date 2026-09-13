import {allLearnedSkills,normalizeSkillLoadout,canonicalSkillId,effectiveSkillMpCost,applySkillMastery} from '../battle/SkillSystem.js';
import {SPECIES} from '../data/species.js';
import {displayName,calculatedStats,TRAITS} from '../models/Monster.js';
import {endgameCharacter} from '../data/endgameCharacters.js';
import {monsterVisual} from './MonsterVisual.js';
import {escapeGuide436 as esc,effectText436,guideSkillDetails436} from './SkillGuide436.js';
const positive=(s,k)=>Number(s?.[k])>0;
const effects=(s,k,enemy)=>s.effects?.filter(e=>e.kind===k&&(enemy==null||Boolean(e.enemy)===enemy))??[];
export const ROLE_GUIDE436=Object.freeze([
 {id:'healDown',label:'敵の回復を抑えたい',hint:'HP回復量を下げるスキル。回復を完全に止める効果ではありません。強化解除・蘇生封印は別の項目です。',match:s=>effects(s,'healDown',true).length>0},
 {id:'dispel',label:'敵の強化を消したい',hint:'解除できる強化が対象です。ランダム解除では、再生が必ず選ばれるとは限りません。',match:s=>Boolean(s.dispelEnemyBuff||s.dispelOne||s.dispel)},
 {id:'reviveSeal',label:'敵の蘇生を封じたい',hint:'蘇生を封じるスキルです。HP回復量低下とは別の効果です。',match:s=>effects(s,'reviveSeal',true).length>0},
 {id:'guard',label:'大ダメージに耐えたい',hint:'障壁・軽減・防御強化を探します。自分だけか、味方全体かも確認できます。',match:s=>positive(s,'partyShieldRate')||positive(s,'selfShieldRate')||positive(s,'barrier')||effects(s,'guard',false).length>0||effects(s,'defUp',false).length>0},
 {id:'heal',label:'HP・MPを回復したい',hint:'回復・再生・吸収を探します。対象と発動条件はスキルごとに異なります。',match:s=>['heal','selfHeal','mpHeal','drain'].some(k=>positive(s,k))||effects(s,'regen',false).length>0},
 {id:'revive',label:'味方を復活させたい',hint:'蘇生に必要なMPや、HPを分ける条件も確認できます。',match:s=>positive(s,'revive')||positive(s,'reviveTransferRate')},
 {id:'cleanse',label:'味方の弱体・異常を消したい',hint:'状態異常・弱体を解除するスキルです。対象を確認して選ぼう。',match:s=>Boolean(s.cleanse||s.type==='cleanse')},
 {id:'speed',label:'行動順を有利にしたい',hint:'速度強化・速度低下を探します。先手を取れるかは相手の速度にもよります。',match:s=>effects(s,'spdUp',false).length>0||effects(s,'spdDown',true).length>0},
 {id:'damage',label:'攻撃の火力を伸ばしたい',hint:'攻撃スキル・攻撃強化・防御低下を探します。威力だけでなく、属性・対象・条件も比べよう。',match:s=>positive(s,'power')||effects(s,'atkUp',false).length>0||effects(s,'defDown',true).length>0||effects(s,'vulnerable',true).length>0}
]);
export function rolePriority436(role,s){
 if(['healDown','reviveSeal','dispel','speed','cleanse'].includes(role))return '速度 → HP・防御：早めに効果を入れ、次の使用まで生き残る。MP消費も確認。';
 if(role==='guard')return 'HP・物理防御・魔法防御 → 速度：受ける攻撃に合わせて耐久を確保し、障壁・軽減を先に使う。';
 if(['heal','revive'].includes(role))return s.reviveTransferRate?'HP → MP・速度：分与する蘇生量は自分の現在HPに依存。':'MP・速度 → HP・防御：回復を継続して使い、回復役自身の戦闘不能を防ぐ。';
 if(!positive(s,'power'))return '速度・MP → HP・防御：攻撃役より先に支援を入れ、継続して使う。';
 return `${s.damageClass==='magic'?'魔法攻撃':s.damageClass==='hybrid'?'物理攻撃・魔法攻撃（スキルの参照先を確認）':'物理攻撃'} → 速度・耐久：このスキルの参照能力を伸ばす。`;
}
export function roleReason436(role,s){
 const key=role==='speed'?(effects(s,'spdDown',true).length?'spdDown':'spdUp'):role;
 if(['healDown','reviveSeal','speed'].includes(role))return effects(s,key).map(effectText436).join(' ／ ');
 if(role==='dispel')return s.dispel?'対象の解除可能な強化を解除':'相手側の解除可能な強化をランダムに1つ解除';
 return guideSkillDetails436(s).join(' ／ ');
}
// Every calculation runs on a copy, including mastery/loadout helpers that
// normally initialize save fields. Opening or filtering the guide cannot equip,
// learn, heal, spend, or write anything in the player's state.
export function roleRoster436(state){
 return (state.monsters??[]).filter(m=>SPECIES[m.speciesId]).map(original=>{
  const monster=JSON.parse(JSON.stringify(original));
  // Native equipment/abyss projections are deliberately non-enumerable on the
  // save object. Include their data in our private copy, never lose weapon skills
  // or display naked stats, and never initialize fields on the original.
  for(const key of Object.getOwnPropertyNames(original)){
   const descriptor=Object.getOwnPropertyDescriptor(original,key);
   if(!descriptor.enumerable&&'value' in descriptor&&descriptor.value!==undefined&&typeof descriptor.value!=='function')monster[key]=JSON.parse(JSON.stringify(descriptor.value));
  }
  const sp=SPECIES[monster.speciesId],hero=endgameCharacter(monster.endgameBossId);
  const equipped=new Set(normalizeSkillLoadout(monster).map(canonicalSkillId)),learned=new Set(allLearnedSkills(monster).map(s=>s.id));
  const all=allLearnedSkills({...monster,level:Number.MAX_SAFE_INTEGER});
  const skills=all.map(raw=>{const skill=applySkillMastery(monster,raw);return {skill,learned:learned.has(raw.id),equipped:equipped.has(raw.id),mp:effectiveSkillMpCost(monster,raw),unlock:raw.unlock?.value??1};});
  const name=displayName(monster),speciesName=hero?.name??sp.name;
  return {monster,name,speciesName,rarity:monster.summonTier??monster.summonRarity??sp.rarity,trait:TRAITS[monster.traitId]?.name??'',skills,inParty:(state.party??[]).includes(monster.id),search:[name,speciesName,...skills.flatMap(r=>[r.skill.name,roleReason436('damage',r.skill)])].join(' ').toLowerCase()};
 });
}
export function roleCandidates436(roster,role='healDown',{query='',learnedOnly=false}={}){
 const config=ROLE_GUIDE436.find(r=>r.id===role)??ROLE_GUIDE436[0],words=String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
 const availability=r=>r.equipped?2:r.learned?1:0;
 return roster.filter(r=>words.every(w=>r.search.includes(w))).map(entry=>{
  const matches=entry.skills.filter(r=>config.match(r.skill)&&(!learnedOnly||r.learned)).sort((a,b)=>availability(b)-availability(a)||a.mp-b.mp||String(a.skill.id).localeCompare(String(b.skill.id)));
  return {...entry,matches};
 }).filter(r=>r.matches.length).sort((a,b)=>availability(b.matches[0])-availability(a.matches[0])||Number(b.inParty)-Number(a.inParty)||a.name.localeCompare(b.name,'ja')||String(a.monster.id).localeCompare(String(b.monster.id)));
}
const readiness=r=>r.equipped?'スキル設定中':r.learned?'習得済み・未設定':`Lv.${r.unlock}で習得`;
export function roleGuideShell436(){return `<div class="role-guide436"><p>やりたいことから、所持している仲間を探そう。</p><label>困っていること<select data-role-select436>${ROLE_GUIDE436.map(r=>`<option value="${r.id}">${r.label}</option>`).join('')}</select></label><label>名前・スキルで絞る<input type="search" data-role-query436 placeholder="キャラ名・スキル名" maxlength="80"></label><label class="role-check436"><input type="checkbox" data-role-learned436>習得済みだけ表示</label><p data-role-hint436></p><small data-role-count436 aria-live="polite"></small><div data-role-results436></div><nav data-role-pages436 aria-label="候補のページ"></nav></div>`;}
export function roleResult436(entry,role){
 const r=entry.matches[0],m=entry.monster;
 return `<article class="role-result436"><header>${monsterVisual(m,'',{className:'role-portrait436'})}<div><strong>${esc(entry.name)}</strong><small>${esc(entry.speciesName)}・${esc(entry.rarity)}<br>Lv.${m.level}${entry.inParty?'・編成中':''}</small></div></header><span class="role-ready436 ${r.learned?'':'locked'}">${readiness(r)}</span><b>${esc(r.skill.name)}</b><p>${esc(roleReason436(role,r.skill))}</p><small>消費MP ${r.mp}・再使用 ${r.skill.cooldown??0}ターン${r.skill.equipmentGranted?'・装備スキル':''}</small><button type="button" data-role-detail436="${esc(m.id)}">スキル・育成の目安を見る${entry.matches.length>1?`（${entry.matches.length}スキル）`:''}</button></article>`;
}
export function roleDetail436(entry,role){
 const stats=calculatedStats(entry.monster);
 return `<div class="role-detail436"><header>${monsterVisual(entry.monster,'',{className:'role-portrait436'})}<p>${esc(entry.speciesName)}<br>Lv.${entry.monster.level}・${esc(entry.rarity)}${entry.trait?`<br>特性：${esc(entry.trait)}`:''}</p></header><div class="role-stats436">${[['HP',stats.hp],['物理攻撃',stats.atk],['魔法攻撃',stats.matk],['物理防御',stats.def],['魔法防御',stats.mdef],['速度',stats.spd]].map(([name,value])=>`<span>${name}<b>${Math.floor(Number(value)||0)}</b></span>`).join('')}</div>${entry.matches.map(r=>`<section><span class="role-ready436 ${r.learned?'':'locked'}">${readiness(r)}</span><h3>${esc(r.skill.name)}</h3><p>対象：${esc(r.skill.target??(r.skill.allEnemies?'敵全体':['allHeal','cleanse'].includes(r.skill.type)?'味方全体':r.skill.type==='revive'?'味方1体':r.skill.power?'敵1体':'自分'))}<br>消費MP ${r.mp}・再使用 ${r.skill.cooldown??0}ターン${r.skill.equipmentGranted?'<br>現在の装備から習得':''}</p><ul>${guideSkillDetails436(r.skill).map(line=>`<li>${esc(line)}</li>`).join('')}</ul><aside><b>この役割で育てる目安</b><p>${esc(rolePriority436(role,r.skill))}</p></aside></section>`).join('')}<p class="muted">習得済みでも、未設定のスキルは戦闘で使えません。効果の成立は相手の耐性や戦闘中の状態によります。</p></div>`;
}
