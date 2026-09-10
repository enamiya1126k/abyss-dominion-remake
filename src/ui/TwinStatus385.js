import {RESONANCE_PAIRS385 as TWIN_PAIRS385,TWIN_RULE385,twinPair385,twinMembers385,twinActionBlocked395} from '../battle/TwinResonance385.js?v=3.1.75-build395';
import {ultimateIsolated,ultimateExtraBlocked} from '../core/EndgameUltimateSystem.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function twinStatus385(roster,{side='ally',battle=null,compact=false}={}){
 const rows=TWIN_PAIRS385.filter(p=>p.members.some(id=>roster.some(u=>u.speciesId===id))).map(pair=>{
  const blocked=u=>battle&&twinActionBlocked395(battle,u,side);
  const present=pair.members.map(id=>roster.some(u=>u.speciesId===id)),members=twinMembers385(pair,roster,side,blocked),active=members.every(Boolean),missing=pair.names.filter((_,i)=>!present[i]);
  const status=active?'共鳴中':missing.length?`${missing.join('・')}を編成で発動`:'戦闘不能・行動不能・隔離などで休止';
  const left=battle&&active?pair.members.filter(id=>Number(battle.twinResonance385?.used?.[`${side}:${pair.id}:${id}`]??0)<Math.max(1,Number(battle.turn)||1)).length:null;
  return `<div class="twin-card385 ${active?'active':'dormant'}" data-twin-pair="${pair.id}"><b>${side==='enemy'?'敵 ':''}${pair.name}</b><span>${escape(status)}${left===null?'':`・残り${left}/2${left===1&&pair.burst?`・次は${escape(pair.burst.name)}`:''}`}${battle&&pair.charge390?`・魔力 ${Math.min(2,Math.max(0,Number(battle.twinResonance385?.charge390?.[`${side}:${pair.id}`])||0))}/3`:''}</span>${compact?'':`<small>${pair.names.join(' ＆ ')} — ${pair.description}</small>`}</div>`;
 });
 if(!rows.length)return '';
 return `<section class="twin-status385 ${compact?'compact':''}" aria-label="${side==='enemy'?'敵の':'味方の'}ペア共鳴">${rows.join('')}${compact?'':`<p>${TWIN_RULE385}</p>`}</section>`;
}
export function twinCodex385(subject){
 const pair=twinPair385(subject);if(!pair)return '';
 return `<article class="twin-codex385"><b>ペア共鳴：${pair.name}</b><p>${pair.names.join(' ＆ ')}を一緒に編成</p><p>${pair.description}</p><small>${TWIN_RULE385}</small></article>`;
}
