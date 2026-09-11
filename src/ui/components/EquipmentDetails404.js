import {equipmentDisplayRarity,equipmentRarityColor,equipmentStatLabel} from '../../data/equipment.js?v=3.1.55-build375';
import {equipmentStatMultiplier} from '../../models/Equipment.js?v=3.1.55-build375';
import {affixQuality,formatAffix} from '../../data/equipmentAffixes.js?v=3.1.55-build375';
import {relicItemText394} from '../../data/chapterTwoRelics394.js?v=3.1.74-build394';
import {EQUIPMENT_SERIES} from '../../data/equipmentSeries.js?v=3.1.38-build358';
import {RAID_VAJRA_WEAPON_DESCRIPTION} from '../../core/RaidPresentation.js?v=3.1.48-build368';
import {equipmentVisual} from './EquipmentVisual.js?v=3.1.61-build381';
import {slotLabel} from '../../services/EquipmentStorage.js?v=3.1.78-build398';

export const EQUIPMENT_LOCK_ART404='assets/ui/items/equipment-lock404.png?v=3.1.84-build404';
export const equipmentEscape404=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const esc=equipmentEscape404;
export function equipmentLockBadge404(item){
 return item?.locked?`<span class="equipment-lock-badge404" role="img" aria-label="ロック中" title="ロック中"><img src="${EQUIPMENT_LOCK_ART404}" width="28" height="28" alt="" draggable="false"></span>`:'';
}
export function equipmentReceiptItem404(receipt,state){
 if(!receipt)return null;
 return ['equipment','reserveEquipment','bossEquipmentVault'].flatMap(key=>state?.[key]??[]).find(item=>item.id===receipt.id)??receipt.item??receipt;
}
export function equipmentPerformance404(item){
 const multiplier=equipmentStatMultiplier(item);
 return Object.entries(item.stats??{}).filter(([,value])=>Number.isFinite(Number(value))).map(([key,value])=>({label:equipmentStatLabel(key),value:Math.round(Number(value)*multiplier)}));
}
export function equipmentNotes404(item){
 return [...new Set([relicItemText394(item),item.fixedEffectText,item.effect,item.description,item.signatureWeaponEffectId==='raid-vajra-fang368'?RAID_VAJRA_WEAPON_DESCRIPTION:'',item.series?`${EQUIPMENT_SERIES[item.series]?.name??item.series}シリーズ`:'',item.ruleOverrides?.unsellable?'売却・合成素材に使用不可':''].filter(text=>typeof text==='string'&&text.trim()))];
}
export function equipmentReward404(receipt,state){
 const item=equipmentReceiptItem404(receipt,state);if(!item)return '';
 const stats=equipmentPerformance404(item),notes=equipmentNotes404(item),affixes=Array.isArray(item.affixes)?item.affixes:[],rarity=equipmentDisplayRarity(item);
 return `<article class="equipment-reward404" style="--reward-rarity:${equipmentRarityColor(item)}"><header><span class="equipment-reward-art404">${item.slot||item.visualAsset||item.iconAtlas?equipmentVisual(item,{label:esc(item.name)}):''}${equipmentLockBadge404(item)}</span><div><small>${esc(rarity)}${item.slot?`・${esc(slotLabel(item.slot))}`:''}・Lv.${Math.max(1,Number(item.level)||1)}${item.plus?` ＋${Number(item.plus)||0}`:''}</small><h3>${esc(item.name)}</h3></div></header>${stats.length?`<dl class="equipment-reward-stats404">${stats.map(stat=>`<div><dt>${esc(stat.label)}</dt><dd>${stat.value>=0?'+':''}${stat.value}</dd></div>`).join('')}</dl>`:'<small>性能詳細は装備管理で確認できます。</small>'}${affixes.length?`<div class="equipment-reward-affixes404">${affixes.map(affix=>`<small style="color:${affixQuality(affix).color}">${esc(formatAffix(affix))}</small>`).join('')}</div>`:''}${notes.length?`<div class="equipment-reward-notes404"><b>備考</b>${notes.map(note=>`<small>${esc(note)}</small>`).join('')}</div>`:''}${receipt.receipt?`<p class="equipment-reward-receipt404">${esc(receipt.receipt)}</p>`:''}</article>`;
}
