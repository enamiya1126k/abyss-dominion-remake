import {equipmentReward404} from './components/EquipmentDetails404.js?v=3.1.84-build404';
import {relicForEncounter394,relicById394,relicEffectText394,relicItemText394,relicPercent394,RELIC_EFFECT_LABELS394,CHAPTER_TWO_CIRCLES394,chapterTwoCircleEffects394} from '../data/chapterTwoRelics394.js?v=3.1.74-build394';
import {aggregateRelics394} from '../battle/ChapterTwoRelicCombat394.js?v=3.1.75-build395';
import {equippedMagicCircle} from '../core/MagicCircleSystem.js?v=3.1.78-build398';
import {twinPair385} from '../battle/TwinResonance385.js?v=3.1.75-build395';
import {equipmentVisual} from './components/EquipmentVisual.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function relicDropPreview394(encounter,tier=1){const d=relicForEncounter394(encounter);if(!d)return '';const plus=[0,12,18,24][tier];return `<div class="relic394-drop">${equipmentVisual(d)}<div><small>この部隊の確定報酬・${tier===1?'LR':'神話'}</small><b>${d.name} ＋${plus}</b><p>${relicEffectText394(d,plus)}</p><small>${d.hint}</small></div></div>`;}
export function circleDropPreview394(area){const c=CHAPTER_TWO_CIRCLES394[area];return c?`<div class="relic394-circle"><img src="${c.asset}" alt=""><div><b>3部隊制圧：${c.name}</b><p>${c.summary}</p><small>毎周回1個。段階1：Lv.5 ／ 段階2：Lv.15 ／ 段階3：Lv.30。入手時に解禁、GOLDでLv.99まで強化。</small></div></div>`:'';}
export function relicLoadout394(state,monster){
 const ids=new Set(Object.values(monster?.equipment??{})),items=(state.equipment??[]).filter(i=>ids.has(i.id)&&relicById394(i.chapterTwoRelic394));
 const circle=equippedMagicCircle(monster,state),circleEffects=chapterTwoCircleEffects394(circle.id,circle.level),gear=aggregateRelics394(items,Math.min(1,...items.map(i=>Number(i._cyclePower361??1)))),keys=[...new Set([...Object.keys(gear),...Object.keys(circleEffects)])];if(!keys.length)return '';
 const pair=twinPair385(monster),partnerId=pair?.members.find(id=>id!==monster.speciesId),party=(state.party??[]).map(id=>(state.monsters??[]).find(m=>m.id===id)).filter(Boolean),partner=party.find(m=>m.speciesId===partnerId),paired=!!partner&&party.includes(monster);
 const rows=keys.map(k=>{const g=gear[k]??0,c=circleEffects[k]??0,rate=k==='guard'?1-(1-g)*(1-c):(1+g)*(1+c)-1;return `<li><span>${RELIC_EFFECT_LABELS394[k]}</span><b>${k==='guard'?'−':'+'}${relicPercent394(rate)}</b></li>`;}).join('');
 const pairNote=keys.includes('pair')?`<p class="${paired?'relic394-ready':'relic394-wait'}">${paired?`${esc(pair.name)}：相方を編成済み。両者が生存・連携可能な時に発動。`:pair?`${esc(pair.names[pair.members.indexOf(partnerId)])}を同じ部隊へ編成すると連携特効が有効。`:'この種族には指定ペアがありません。連携特効のある品はペアの仲間へ。'}</p>`:'';
 return `<details class="relic394-loadout"><summary>第二章装備・魔法陣の組み合わせ</summary>${pairNote}<ul>${rows}</ul><small>各条件を満たした時の補正。装備同士は加算、魔法陣は別倍率。複数の攻撃条件成立時は装備の合計を最大＋150%に制限。装備Lvは能力値、＋値は固有效果（＋30まで）、魔法陣Lvは術式を強化。</small>${items.map(i=>`<p><b>${esc(i.name)}</b><small>${esc(relicItemText394(i))}</small></p>`).join('')}<small>連撃は同じ敵にHPダメージを与えた後、そのラウンド中に有効。継続ダメージ・HP量を使う特殊技・割合ダメージ・時間差の残響には、新しい与ダメージ補正を掛けません。</small></details>`;
}
export function relicRewardMarkup394(spoils,state=null){if(!spoils)return '';const r=spoils.relic,c=spoils.circle;return `${state?equipmentReward404(r,state):`<p class="equipment-drop relic394-reward"><b>限定装備確定：[${esc(r.rarity)}] ${esc(r.name)} Lv.${r.level} ＋${r.plus}</b><small>${esc(r.receipt)}</small><small>${esc(r.effect)}</small></p>`}${c?`<p class="relic394-reward"><b>地域制圧：${esc(c.name)} Lv.${c.level}</b><small>魔法陣を1個入手。編成 → 魔法陣設定で装着・強化できます。</small></p>`:''}`;}
