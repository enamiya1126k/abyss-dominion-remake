import{
 RARITY_ORDER,
 equipmentDisplayRarity,
 equipmentRarityColor,
 equipmentStatLabel,
 SLOT_UNLOCK_LEVEL,
 EQUIPMENT_SLOT_ORDER,
 equipmentSubslotLabel,
 compatibleSubslots
}from"../../data/equipment.js?v=1.14.0-alpha124";
import{displayName,calculatedStats}from"../../models/Monster.js?v=1.14.0-alpha124";
import{equipmentStatMultiplier}from"../../models/Equipment.js?v=1.14.0-alpha124";
import{maxMp}from"../../battle/SkillSystem.js?v=1.14.0-alpha124";
import{monsterCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=1.14.0-alpha124";
import{ATTRIBUTES}from"../../data/attributes.js?v=1.1.0";
import{equipmentExpNeed}from"../../services/EquipmentEnhancement.js?v=1.14.0-alpha124";
import{weaponMasteryBadge}from"../../services/WeaponMastery.js?v=1.7.0";
import{seriesMasterySummary}from"../../services/SeriesMastery.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{SPECIES}from"../../data/species.js?v=1.9.0-monster-catalog";
import{EQUIPMENT_SERIES,activeSeriesBonuses,describeSeriesEffect}from"../../data/equipmentSeries.js?v=0.9.15-alpha.95.1-stability-audit";
import{EQUIPMENT_LIMIT,slotLabel,equipmentSellPrice as equipmentSellPriceForState}from"../../services/EquipmentStorage.js?v=1.14.0-alpha124";
import{ensureEquipmentAffixes,affixQuality,formatAffix,equipmentAffixPower,affixDefinition}from"../../data/equipmentAffixes.js?v=1.2.0";
import{monsterVisual}from"../MonsterVisual.js?v=1.9.1-endgame-sprites";
import{resourceHud,bottomNav}from"../components/GameChrome.js?v=1.14.0-alpha124";
import{equipmentSocketSummary}from"../components/EquipmentSocketSummary.js?v=1.14.0-alpha124";

const EQUIPMENT_SCREEN_SLOT_LABELS={
 weaponRight:"右手",weaponLeft:"左手",accessoryNeck:"首",accessoryFinger:"指",armorBody:"胴",armorSupport:"補助"
};
function screenSubslotLabel(subslot){return EQUIPMENT_SCREEN_SLOT_LABELS[subslot]??equipmentSubslotLabel(subslot)}

function monsterRarity(monster){
 return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N";
}

function rarityNameClass(rarity){
 return({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase();
}

function coloredMonsterName(monster){
 return`<b class="monster-rarity-name rarity-name-${rarityNameClass(monsterRarity(monster))}">${displayName(monster)}</b>`;
}

function equipmentRarityClass(item){
 const rarity=equipmentDisplayRarity(item);
 return({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase();
}

function coloredEquipmentName(item,{tag="b",showRarity=true}={}){
 const rarity=equipmentDisplayRarity(item);
 return`<${tag} class="equipment-rarity-name equipment-rarity-${equipmentRarityClass(item)}" style="--equipment-rarity-color:${equipmentRarityColor(item)}">${showRarity?`[${rarity}] `:""}${item.name}${item.plus?` +${item.plus}`:""}</${tag}>`;
}

const SLOT_ICONS={weapon:"⚔️",armor:"🛡️",accessory:"💍"};
let renderedEquipmentState=null;

function equipmentSellPrice(item){
 return equipmentSellPriceForState(item,renderedEquipmentState);
}

function itemStats(item){
 const mult=equipmentStatMultiplier(item);
 return Object.entries(item.stats??{}).map(([key,value])=>`${equipmentStatLabel(key)}+${Math.round(value*mult)}`).join(" / ");
}

function itemAffixes(item,{compact=false}={}){
 const affixes=ensureEquipmentAffixes(item);
 if(!affixes.length)return compact?'<small class="empty-affixes">オプションなし</small>':'<div class="equipment-affixes empty-affixes">ランダムオプションなし</div>';
 const body=affixes.map(affix=>{
  const quality=affixQuality(affix);
  return`<span style="color:${quality.color}" title="${quality.name}">${affix.locked?"📌 ":""}${formatAffix(affix)}${affixDefinition(affix.id)?.legendaryOnly?"〈固有〉":""}</span>`;
 }).join("");
 return`<div class="equipment-affixes ${compact?"compact":""}">${body}</div>`;
}

function equippedSlotCard(state,target,subslot,focusItemId=null){
 const levelRequired=SLOT_UNLOCK_LEVEL[subslot]??1;
 const locked=target.level<levelRequired;
 if(locked){
  return`<div class="equipped-slot-card locked-slot"><span class="equipped-slot-label">${screenSubslotLabel(subslot)}</span><b>🔒 Lv.${levelRequired}</b><small>レベル到達で解放</small></div>`;
 }
 const item=state.equipment.find(entry=>entry.id===target.equipment?.[subslot]);
 if(!item){
  return`<button type="button" class="equipped-slot-card empty-slot" data-open-equipment-slot="${subslot}"><span class="equipped-slot-label">${screenSubslotLabel(subslot)}</span><b>＋ なし</b><small>タップして装備</small></button>`;
 }
 const level=Math.max(1,item.level??1);
 const affixes=ensureEquipmentAffixes(item);
 return`<details class="equipped-slot-card equipped ${item.id===focusItemId?"focused-equipment":""}" data-equipped-item="${item.id}" ${item.id===focusItemId?"open":""}>
  <summary>
   <span class="equipped-slot-label">${screenSubslotLabel(subslot)}</span>
   <div>${coloredEquipmentName(item)}<small>Lv.${level} ∞　${itemStats(item)||"能力補正なし"}</small>${equipmentSocketSummary(item,{compact:true})}</div>
   <i>${item.favorite?"★":""}${item.locked?"🔒":""}${item.ruleOverrides?.unsellable?"🛡️":""}⌄</i>
  </summary>
  <div class="equipped-slot-detail">
   ${itemAffixes(item,{compact:true})}
   <div class="equipped-slot-actions">
    <button type="button" data-enhance-equipment="${item.id}">🔨 育成</button>
    ${affixes.length?`<button type="button" data-reroll-equipment="${item.id}">🎲 GOLD厳選</button>`:'<button type="button" disabled>🎲 厳選不可</button>'}
    <button type="button" data-favorite-equipment="${item.id}">${item.favorite?"★ 解除":"☆ お気に入り"}</button>
    <button type="button" data-lock-equipment="${item.id}">${item.locked?"🔓 解除":"🔒 ロック"}</button>
    <button type="button" data-unequip="${item.id}">装備を外す</button>
   </div>
  </div>
 </details>`;
}

function sortItems(a,b,sort){
 if(sort==="rarity"){
  const aRank=RARITY_ORDER[equipmentDisplayRarity(a)]??RARITY_ORDER[a.rarity]??0;
  const bRank=RARITY_ORDER[equipmentDisplayRarity(b)]??RARITY_ORDER[b.rarity]??0;
  return bRank-aRank;
 }
 if(sort==="power")return total(b)-total(a);
 if(["atk","def","hp","spd"].includes(sort))return(b.stats?.[sort]??0)-(a.stats?.[sort]??0);
 if(sort==="newest")return new Date(b.createdAt)-new Date(a.createdAt);
 if(sort==="favorite")return Number(b.favorite)-Number(a.favorite);
 return a.name.localeCompare(b.name,"ja");
}

function total(item){
 return Object.values(item.stats??{}).reduce((sum,value)=>sum+value,0)*equipmentStatMultiplier(item)+(item.plus??0)*3+(item.level??1)*2+equipmentAffixPower(item);
}

function handLabel(item){
 return item.slot!=="weapon"?"":({right:"右手向き",left:"左手向き",either:"左右対応",twoHanded:"両手武器"}[item.handedness]??"左右対応");
}

function card(item,state,target,storage,{editing=false,selected=false,focused=false}={}){
 const owner=item.equippedBy?state.monsters.find(monster=>monster.id===item.equippedBy):null;
 const inventory=storage==="inventory";
 const level=Math.max(1,item.level??1);
 const need=equipmentExpNeed(level);
 const progress=Math.floor(((item.exp??0)/need)*100);
 const equipButtons=compatibleSubslots(item).map(subslot=>{
  const locked=target.level<SLOT_UNLOCK_LEVEL[subslot];
  const replacesTwoHanded=subslot==="weaponLeft"&&state.equipment.find(entry=>entry.id===target.equipment?.weaponRight)?.handedness==="twoHanded";
  return`<button data-equip="${item.id}" data-target="${target.id}" data-subslot="${subslot}" ${locked?"disabled":""}>${screenSubslotLabel(subslot)}へ${locked?`（Lv.${SLOT_UNLOCK_LEVEL[subslot]}）`:replacesTwoHanded?"（両手武器を外す）":""}</button>`;
 }).join("");
 const protectedItem=!!item.equippedBy||item.favorite||item.locked||item.ruleOverrides?.unsellable;
 const affixes=ensureEquipmentAffixes(item);
 return`<article class="equipment-card ${selected?"selected":""} ${protectedItem?"protected-entry":""} ${focused?"focused-equipment":""}" data-equipment-card-id="${item.id}">
  ${editing&&inventory?`<label class="manage-check"><input type="checkbox" data-select-equipment-id="${item.id}" ${selected?"checked":""} ${protectedItem?"disabled":""}><span></span></label>`:""}
  <div class="spread">${coloredEquipmentName(item)}<span>${item.favorite?"★":""}${item.locked?"🔒":""}${item.ruleOverrides?.unsellable?"🛡️":""}</span></div>
  <div class="subline">
   <span class="equipment-level">Lv.${level} ∞</span> ${slotLabel(item.slot)} ${handLabel(item)} / ${itemStats(item)||"能力補正なし"}
   ${equipmentSocketSummary(item)}
   ${itemAffixes(item)}
   <div class="equipment-exp"><i style="width:${progress}%"></i></div>
   <small class="equipment-exp-label">EXP ${(item.exp??0).toLocaleString()} / ${need.toLocaleString()}</small>
   ${item.series?`<br><span class="series-tag">◆ ${EQUIPMENT_SERIES[item.series]?.name??item.series}シリーズ</span>`:""}
   <br>${owner?`装備中：${displayName(owner)}`:"未装備"}
   ${item.slot==="weapon"?`<div class="equipment-growth-chips">${weaponMasteryBadge(item)}</div>`:""}
  </div>
  <div class="equipment-actions">${editing?"":inventory
   ?equipButtons
    +(item.equippedBy
     ?`<button data-unequip="${item.id}">外す</button>`
     :item.ruleOverrides?.unsellable
      ?'<button disabled>売却不可</button>'
      :`<button data-sell="${item.id}">売却 ${equipmentSellPrice(item)}G</button>`)
    +`<button data-enhance-equipment="${item.id}">🔨 育成</button>`
    +(affixes.length?`<button data-reroll-equipment="${item.id}">🎲 GOLD厳選</button>`:'<button disabled title="ランダムオプションがありません">🎲 厳選不可</button>')
    +`<button data-favorite-equipment="${item.id}">${item.favorite?"★":"☆"}</button><button data-lock-equipment="${item.id}">${item.locked?"🔓":"🔒"}</button>`
   :`<button data-take-equipment="${item.id}" data-storage="${storage}">所持品へ</button>`}</div>
 </article>`;
}

function sortOption(value,label,current){
 return`<option value="${value}" ${value===current?"selected":""}>${label}</option>`;
}

export function EquipmentScreen(state,targetId,{home=false,editing=false,selected=new Set(),focusItemId=null}={}){
 renderedEquipmentState=state;
 state.settings??={};
 const party=state.party.map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 const target=state.monsters.find(monster=>monster.id===targetId)??party[0]??state.monsters[0];
 const slot=state.settings.equipmentSlot??"weapon";
 let storage=state.settings.equipmentStorage??"inventory";
 if(!home&&storage!=="inventory")storage="inventory";
 const sort=state.settings.equipmentSort??"rarity";
 const source=storage==="reserve"?state.reserveEquipment:storage==="bossVault"?state.bossEquipmentVault:state.equipment;
 if(!target)return`<section class="screen"><header class="topbar"><button id="backEquipmentHome">←</button><h2>装備管理</h2></header></section>`;

 const list=[...source].filter(item=>item.slot===slot&&(!item.equippedBy||item.equippedBy===target.id)).sort((a,b)=>sortItems(a,b,sort));
 const species=SPECIES[target.speciesId]??{};
 const attributeId=target.attribute??species.element??"neutral";
 const attribute=ATTRIBUTES[attributeId]??{name:attributeId||"不明",icon:"◈"};
 const stats=calculatedStats(target);
 const power=monsterCombatPower(target);
 const counts={};
 Object.values(target.equipment??{}).forEach(id=>{
  const item=state.equipment.find(entry=>entry.id===id);
  if(item?.series)counts[item.series]=(counts[item.series]??0)+1;
 });
 const active=activeSeriesBonuses(counts);
 const seriesSummary=Object.entries(counts).map(([id,count])=>`${EQUIPMENT_SERIES[id]?.name??id} ${count}/6`).join("・");
 const seriesDetails=Object.entries(counts).map(([id,count])=>{
  const series=EQUIPMENT_SERIES[id];
  if(!series)return"";
  return`<details class="series-detail"><summary><b>${series.name}</b><span>${count}/6</span><small>${series.theme??""}</small></summary>${seriesMasterySummary(state,id)}<div>${Object.entries(series.bonuses).map(([pieces,effect])=>`<p class="${count>=Number(pieces)?"active":""}"><b>${count>=Number(pieces)?"✓":"○"} ${pieces}部位効果</b><span>${describeSeriesEffect(effect)}</span></p>`).join("")}</div></details>`;
 }).join("");

 return`<section class="screen v2-screen equipment-screen-v2">
  ${resourceHud(state,{backId:"backEquipmentHome",title:"装備管理"})}
  <div class="page equipment-page">
   <div class="panel equipment-target-panel">
    <div class="v2-equipment-heading"><div><b>装備対象</b><small>モンスターをタップして切り替え</small></div><span>${state.equipment.length}/${EQUIPMENT_LIMIT}</span><button id="openAffixHelp" class="affix-help-button" aria-label="ランダムオプションとGOLD厳選の説明">？</button></div>
    <div class="equipment-target-list">${party.map(monster=>{
     const monsterSpecies=SPECIES[monster.speciesId]??{};
     const monsterAttribute=ATTRIBUTES[monster.attribute??monsterSpecies.element??"neutral"]??{icon:"◈",name:"不明"};
     return`<button data-equipment-target="${monster.id}" class="${monster.id===target.id?"active":""}">${monsterVisual(monster,monsterSpecies.emoji??"👹",{className:"equipment-tab-monster-visual"})}${coloredMonsterName(monster)}<small>${monsterAttribute.icon}${monsterAttribute.name}・Lv.${monster.level}　⭐${monster.stars??1}　+${monster.plus??0}</small></button>`;
    }).join("")}</div>
    <div class="selected-equipment-target">
     ${monsterVisual(target,species.emoji??"👹",{className:"equipment-target-monster-visual"})}
     <div class="selected-equipment-identity">${coloredMonsterName(target)}<small><em class="attribute-chip">${attribute.icon} ${attribute.name}属性</em>　❤️${target.affection??0}/1000</small></div>
     <div class="selected-equipment-power"><small>戦力</small><strong>${formatCombatPower(power)}</strong></div>
    </div>
    <div class="selected-equipment-stats" aria-label="装備反映後ステータス">
     <span><small>HP</small><b>${stats.hp.toLocaleString()}</b></span>
     <span><small>MP</small><b>${maxMp(target).toLocaleString()}</b></span>
     <span><small>物理ATK</small><b>${stats.atk.toLocaleString()}</b></span>
     <span><small>魔法ATK</small><b>${(stats.matk??stats.atk).toLocaleString()}</b></span>
     <span><small>物理DEF</small><b>${stats.def.toLocaleString()}</b></span>
     <span><small>魔法DEF</small><b>${(stats.mdef??stats.def).toLocaleString()}</b></span>
     <span><small>SPD</small><b>${stats.spd.toLocaleString()}</b></span>
     <span><small>属性</small><b>${attribute.icon}${attribute.name}</b></span>
    </div>
    <div class="equipped-summary six-slots">${EQUIPMENT_SLOT_ORDER.map(subslot=>equippedSlotCard(state,target,subslot,focusItemId)).join("")}</div>
    ${seriesSummary?`<details class="series-summary equipment-series-compact"><summary><b>◆ シリーズ効果</b><small>${seriesSummary}</small><em>${active.length?active.map(entry=>describeSeriesEffect(entry.effect)).join(" / "):"発動待ち"}</em></summary><div>${seriesDetails}</div></details>`:""}
    <div class="auto-equip-row">
     <button id="autoEquipOne">⚡ このキャラを自動装備</button>
     <button id="autoEquipParty">⚡ パーティ全員を自動装備</button>
     <button id="unequipOne">🗑 このキャラの装備解除</button>
     <button id="unequipParty">🗑 パーティ全員の装備解除</button>
    </div>
   </div>
  </div>
  ${bottomNav("equipment")}
 </section>`;
}
