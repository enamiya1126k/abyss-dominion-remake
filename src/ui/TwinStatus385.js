import {singleTrait410} from '../battle/SingleTraits410.js?v=3.1.90-build410';
import {PAIR_SERIES409,pairCondition409} from '../battle/PairSynergy409.js?v=3.1.89-build409';
import {chapterTwoPairMember406} from '../data/chapterTwoPairNames406.js?v=3.1.86-build406';
import {RESONANCE_PAIRS385 as TWIN_PAIRS385,TWIN_RULE385,twinPair385,twinMembers385,twinActionBlocked395} from '../battle/TwinResonance385.js?v=3.1.89-build409';
import {ultimateIsolated,ultimateExtraBlocked} from '../core/EndgameUltimateSystem.js?v=3.1.90-build410';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function twinStatus385(roster,{side='ally',battle=null,compact=false}={}){
 const rows=TWIN_PAIRS385.filter(p=>p.members.some(id=>roster.some(u=>u.speciesId===id))).map(pair=>{
  const blocked=u=>battle&&twinActionBlocked395(battle,u,side);
  const present=pair.members.map(id=>roster.some(u=>u.speciesId===id)),members=twinMembers385(pair,roster,side,blocked),active=members.every(Boolean),missing=pair.members.filter((_,i)=>!present[i]).map(id=>chapterTwoPairMember406(id)?.name??id);
  const common=chapterTwoPairMember406(pair.members[0]);
  const status=active?'共鳴中':missing.length?`${missing.join('・')}を編成で発動`:'戦闘不能・行動不能・隔離などで休止';
  const benefit=pairCondition409(battle,side,pair.id),visibleStatus=compact&&active&&/MP|発動済み|救援済み|標的一致|標的が別|次の共鳴/.test(benefit)?benefit:status;
  const left=battle&&active?pair.members.filter(id=>Number(battle.twinResonance385?.used?.[`${side}:${pair.id}:${id}`]??0)<Math.max(1,Number(battle.turn)||1)).length:null;
  return `<div class="twin-card385 ${active?'active':'dormant'}" data-twin-pair="${pair.id}" title="${escape(pairCondition409(battle,side,pair.id))}"><b>${side==='enemy'?'敵 ':''}${common?`【${common.group}】`:''}${pair.name}</b><span>${escape(visibleStatus)}${left===null?'':`・残り${left}/2${left===1&&pair.burst?`・次は${escape(pair.burst.name)}`:''}`}${battle&&pair.charge390?`・魔力 ${Math.min(2,Math.max(0,Number(battle.twinResonance385?.charge390?.[`${side}:${pair.id}`])||0))}/3`:''}</span>${compact?'':`<small>${pair.members.map(id=>chapterTwoPairMember406(id)?.name??id).join(' ＆ ')} — ${pair.description}</small><small class="pair-feature409">相乗効果：${escape(PAIR_SERIES409[pair.id]?.feature.description??'')}<br>状態：${escape(pairCondition409(battle,side,pair.id))}</small>`}</div>`;
 });
 if(!rows.length)return '';
 return `<section class="twin-status385 ${compact?'compact':''}" aria-label="${side==='enemy'?'敵の':'味方の'}ペア共鳴">${rows.join('')}${compact?'':`<p>${TWIN_RULE385}</p>`}</section>`;
}
export function twinCodex385(subject){
 const trait=singleTrait410(typeof subject==='string'?{speciesId:subject}:subject);if(trait)return `<article class="twin-codex385"><b>特殊能力：${escape(trait.name)}</b><p>${escape(trait.description)}</p><p>${escape(trait.exception)}</p><p>${escape(trait.notes)}</p><small>戦闘中の基礎値補正：${Object.entries(trait.entryMultipliers).map(([k,v])=>`${k.toUpperCase()} ${Math.round(v*100)}%`).join(' / ')}${trait.fixedMaxHp?'・最大HP100固定':''}</small></article>`;
 const pair=twinPair385(subject);if(!pair)return '';
 const names=pair.members.map(id=>chapterTwoPairMember406(id)?.name??id);
 return `<article class="twin-codex385"><b>ペア共鳴：${pair.name}</b><p>${names.join(' ＆ ')}を一緒に編成</p><p>${pair.description}</p><p class="pair-feature409">相乗効果：${escape(PAIR_SERIES409[pair.id]?.feature.description??'')}</p><p>対処：${escape(PAIR_SERIES409[pair.id]?.counterplay??'')}</p><small>${TWIN_RULE385}</small></article>`;
}
