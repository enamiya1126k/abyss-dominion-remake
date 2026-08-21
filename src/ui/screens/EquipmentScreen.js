import{
 RARITY_ORDER,
 RARITY_COLORS,
 equipmentDisplayRarity,
 equipmentStatLabel,
 SLOT_UNLOCK_LEVEL,
 EQUIPMENT_SLOT_ORDER,
 equipmentSubslotLabel,
 compatibleSubslots,
 equipmentIdentity
}from"../../data/equipment.js?v=2.11.2-build166";
import{displayName,calculatedStats}from"../../models/Monster.js?v=2.11.2-build166";
import{equipmentStatMultiplier}from"../../models/Equipment.js?v=2.11.2-build166";
import{maxMp}from"../../battle/SkillSystem.js?v=2.11.2-build166";
import{monsterCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=2.11.2-build166";
import{ATTRIBUTES}from"../../data/attributes.js?v=2.11.2-build166";
import{equipmentExpNeed}from"../../services/EquipmentEnhancement.js?v=2.11.2-build166";
import{weaponMasteryBadge}from"../../services/WeaponMastery.js?v=2.11.2-build166";
import{seriesMasterySummary}from"../../services/SeriesMastery.js?v=2.11.2-build166";
import{SPECIES}from"../../data/species.js?v=2.11.2-build166";
import{EQUIPMENT_SERIES,activeSeriesBonuses,describeSeriesEffect}from"../../data/equipmentSeries.js?v=2.11.2-build166";
import{EQUIPMENT_LIMIT,slotLabel,equipmentSellPrice as equipmentSellPriceForState}from"../../services/EquipmentStorage.js?v=2.11.2-build166";
import{ensureEquipmentAffixes,affixQuality,formatAffix,equipmentAffixPower,affixDefinition}from"../../data/equipmentAffixes.js?v=2.11.2-build166";
import{monsterVisual}from"../MonsterVisual.js?v=2.11.2-build166";
import{attributeVisual}from"../components/AttributeVisual.js?v=2.11.2-build166";
import{resourceHud,bottomNav,pixelIcon}from"../components/GameChrome.js?v=2.11.2-build166";
import{equipmentSocketSummary}from"../components/EquipmentSocketSummary.js?v=2.11.2-build166";
import{equipmentVisual}from"../components/EquipmentVisual.js?v=2.11.2-build166";
import{equippedMagicCircle}from"../../core/MagicCircleSystem.js?v=2.11.2-build166";
import{signatureWeaponState,signatureWeaponForMonster,signatureEquipmentOwnerName,signatureEquipmentMatchesMonster}from"../../core/SignatureWeaponSystem.js?v=2.11.2-build166";

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

function safeEquipmentRarityColor(item){
 return RARITY_COLORS[equipmentDisplayRarity(item)]??RARITY_COLORS.N??"#ffffff";
}

function coloredEquipmentName(item,{tag="b",showRarity=true}={}){
 const rarity=equipmentDisplayRarity(item);
 return`<${tag} class="equipment-rarity-name equipment-rarity-${equipmentRarityClass(item)}" style="--equipment-rarity-color:${safeEquipmentRarityColor(item)}">${showRarity?`[${rarity}] `:""}${item.name}${item.plus?` +${item.plus}`:""}</${tag}>`;
}

let renderedEquipmentState=null;

function equipmentSellPrice(item){
 return equipmentSellPriceForState(item,renderedEquipmentState);
}

function itemStats(item){
 const mult=equipmentStatMultiplier(item);
 return Object.entries(item.stats??{}).map(([key,value])=>{const amount=Math.round(value*mult);return`${equipmentStatLabel(key)}${amount>=0?"+":""}${amount}`}).join(" / ");
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
function itemFixedEffect(item){return item.fixedEffectText?`<div class="equipment-fixed-authority"><b>固有能力</b><span>${item.fixedEffectText}</span></div>`:""}
function itemIdentityTags(item){const identity=equipmentIdentity(item),series=item.series?EQUIPMENT_SERIES[item.series]:null,slot=identity.subslot?screenSubslotLabel(identity.subslot):"武器";return`<span class="equipment-archetype-chip"><i>${slot}</i>${identity.label}</span>${series?`<span class="equipment-series-chip">◆ ${series.name}シリーズ</span>`:""}`}
function signatureWeaponBadge(state,target,item){const resonance=signatureWeaponState(state,target,item);if(!resonance)return"";return`<div class="signature-weapon-badge ${resonance.active?"active":"inactive"}"><b>${resonance.status}</b><span>${resonance.definition.ownerName}専用・${resonance.definition.name}</span><small>${resonance.nextText}／${resonance.definition.description}</small></div>`}

function equipmentCommand({label,icon="equipment",attributes="",tone="",note="",disabled=false}={}){
 return`<button type="button" class="equipment-command${tone?` tone-${tone}`:""}" ${attributes}${disabled?' disabled aria-disabled="true"':""}><i>${pixelIcon(icon)}</i><span><b>${label}</b>${note?`<small>${note}</small>`:""}</span></button>`;
}

function equippedSlotCard(state,target,subslot,focusItemId=null){
 const levelRequired=SLOT_UNLOCK_LEVEL[subslot]??1;
 const locked=target.level<levelRequired;
 if(locked){
  return`<div class="equipped-slot-card locked-slot"><span class="equipped-slot-label">${screenSubslotLabel(subslot)}</span><b>LOCKED・Lv.${levelRequired}</b><small>レベル到達で解放</small></div>`;
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
   ${equipmentVisual(item,{className:"equipped-slot-art"})}
   <div>${coloredEquipmentName(item)}<small>Lv.${level} ∞　${itemStats(item)||"能力補正なし"}</small><span class="equipment-identity-chips">${itemIdentityTags(item)}</span>${equipmentSocketSummary(item,{compact:true})}</div>
   <i>${item.favorite?"★":""}${item.locked?"L":""}${item.ruleOverrides?.unsellable?"P":""}⌄</i>
  </summary>
  <div class="equipped-slot-detail">
   ${signatureWeaponBadge(state,target,item)}
   ${itemFixedEffect(item)}
   ${itemAffixes(item,{compact:true})}
   <div class="equipped-slot-actions">
    ${equipmentCommand({label:"装備変更",icon:"equipment",attributes:`data-open-equipment-slot="${subslot}"`,tone:"primary",note:screenSubslotLabel(subslot)})}
    ${equipmentCommand({label:"装備育成",icon:"growth",attributes:`data-enhance-equipment="${item.id}"`,note:`Lv.${level} ∞`})}
    ${equipmentCommand({label:"スロット厳選",icon:"summon",attributes:`data-reroll-equipment="${item.id}"`,tone:"forge",note:affixes.length?`${affixes.length}枠を調整`:"初回スロット抽選"})}
    ${equipmentCommand({label:item.favorite?"お気に入り解除":"お気に入り",icon:"event",attributes:`data-favorite-equipment="${item.id}"`,tone:"quiet",note:item.favorite?"登録中":"未登録"})}
    ${equipmentCommand({label:item.locked?"ロック解除":"ロック",icon:"key",attributes:`data-lock-equipment="${item.id}"`,tone:"quiet",note:item.locked?"保護中":"保護なし"})}
    ${equipmentCommand({label:"装備を外す",icon:"return",attributes:`data-unequip="${item.id}"`,tone:"danger",note:"所持品へ戻す"})}
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
  return equipmentCommand({label:`${screenSubslotLabel(subslot)}へ装備`,icon:"equipment",attributes:`data-equip="${item.id}" data-target="${target.id}" data-subslot="${subslot}"`,tone:"primary",note:locked?`Lv.${SLOT_UNLOCK_LEVEL[subslot]}で解放`:replacesTwoHanded?"両手武器と交換":"装備を変更",disabled:locked});
 }).join("");
 const protectedItem=!!item.equippedBy||item.favorite||item.locked||item.ruleOverrides?.unsellable;
 const affixes=ensureEquipmentAffixes(item);
 let actionMarkup="";
 if(!editing){
  if(!inventory){
   actionMarkup=equipmentCommand({label:"所持品へ移動",icon:"inventory",attributes:`data-take-equipment="${item.id}" data-storage="${storage}"`,tone:"primary",note:"装備管理で使用"});
  }else{
   actionMarkup=equipButtons;
   if(item.equippedBy)actionMarkup+=equipmentCommand({label:"装備を外す",icon:"return",attributes:`data-unequip="${item.id}"`,tone:"danger",note:"所持品へ戻す"});
   else if(item.ruleOverrides?.unsellable)actionMarkup+=equipmentCommand({label:"売却不可",icon:"coin",tone:"quiet",note:"保護装備",disabled:true});
   else actionMarkup+=equipmentCommand({label:"売却",icon:"coin",attributes:`data-sell="${item.id}"`,tone:"danger",note:`${equipmentSellPrice(item).toLocaleString()}G`});
   actionMarkup+=equipmentCommand({label:"装備育成",icon:"growth",attributes:`data-enhance-equipment="${item.id}"`,note:`Lv.${level} ∞`});
   actionMarkup+=equipmentCommand({label:"スロット厳選",icon:"summon",attributes:`data-reroll-equipment="${item.id}"`,tone:"forge",note:affixes.length?`${affixes.length}枠を調整`:"初回スロット抽選"});
   actionMarkup+=equipmentCommand({label:item.favorite?"お気に入り解除":"お気に入り",icon:"event",attributes:`data-favorite-equipment="${item.id}"`,tone:"quiet",note:item.favorite?"登録中":"未登録"});
   actionMarkup+=equipmentCommand({label:item.locked?"ロック解除":"ロック",icon:"key",attributes:`data-lock-equipment="${item.id}"`,tone:"quiet",note:item.locked?"保護中":"保護なし"});
  }
 }
 return`<article class="equipment-card ${selected?"selected":""} ${protectedItem?"protected-entry":""} ${focused?"focused-equipment":""}" data-equipment-card-id="${item.id}">
 ${editing&&inventory?`<label class="manage-check"><input type="checkbox" data-select-equipment-id="${item.id}" ${selected?"checked":""} ${protectedItem?"disabled":""}><span></span></label>`:""}
  <div class="equipment-card-identity">${equipmentVisual(item,{className:"equipment-list-art"})}<div class="spread">${coloredEquipmentName(item)}<span>${item.favorite?"★":""}${item.locked?"L":""}${item.ruleOverrides?.unsellable?"P":""}</span>${signatureEquipmentOwnerName(item)?`<small class="signature-owner-chip">${signatureEquipmentOwnerName(item)}専用</small>`:""}</div></div>
  <div class="subline">
   <span class="equipment-level">Lv.${level} ∞</span> ${slotLabel(item.slot)} ${handLabel(item)} / ${itemStats(item)||"能力補正なし"}
   <span class="equipment-identity-chips">${itemIdentityTags(item)}</span>
   ${equipmentSocketSummary(item)}
   ${signatureWeaponBadge(state,target,item)}
   ${itemFixedEffect(item)}
   ${itemAffixes(item)}
   <div class="equipment-exp"><i style="width:${progress}%"></i></div>
   <small class="equipment-exp-label">EXP ${(item.exp??0).toLocaleString()} / ${need.toLocaleString()}</small>
   ${item.series?`<br><span class="series-tag">◆ ${EQUIPMENT_SERIES[item.series]?.name??item.series}シリーズ</span>`:""}
   <br>${owner?`装備中：${displayName(owner)}`:"未装備"}
   ${item.slot==="weapon"?`<div class="equipment-growth-chips">${weaponMasteryBadge(item)}</div>`:""}
  </div>
  <div class="equipment-actions">${actionMarkup}</div>
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
 const canManageInventory=storage==="inventory";
 if(!target)return`<section class="screen"><header class="topbar"><button id="backEquipmentHome">←</button><h2>装備管理</h2></header></section>`;

 const list=[...source].filter(item=>item.slot===slot&&(!item.equippedBy||item.equippedBy===target.id)).sort((a,b)=>Number(signatureEquipmentMatchesMonster(b,target))-Number(signatureEquipmentMatchesMonster(a,target))||sortItems(a,b,sort));
 const species=SPECIES[target.speciesId]??{};
 const attributeId=target.attribute??species.element??"neutral";
 const attribute=ATTRIBUTES[attributeId]??{name:attributeId||"不明"};
 const stats=calculatedStats(target);
 const power=monsterCombatPower(target);
 const circle=equippedMagicCircle(target,state);
 const signature=signatureWeaponForMonster(state,target);
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
 const equippedCards=Object.fromEntries(EQUIPMENT_SLOT_ORDER.map(subslot=>[subslot,equippedSlotCard(state,target,subslot,focusItemId)]));

 return`<section class="screen v2-screen equipment-screen-v2">
  ${resourceHud(state,{backId:"backEquipmentHome",title:"装備管理"})}
  <div class="page equipment-page">
   <div class="panel equipment-target-panel">
    <div class="v2-equipment-heading"><div><b>装備対象</b><small>肖像をタップして切り替え</small></div><span>${state.equipment.length}/${EQUIPMENT_LIMIT}</span><button id="openAffixHelp" class="affix-help-button" aria-label="ランダムオプションとGOLD厳選の説明">？</button></div>
    <div class="equipment-target-list">${party.map((monster,index)=>{
     const monsterSpecies=SPECIES[monster.speciesId]??{};
     const monsterAttributeId=monster.attribute??monsterSpecies.element??"neutral",monsterAttribute=ATTRIBUTES[monsterAttributeId]??{name:"不明"},rarity=rarityNameClass(monsterRarity(monster));
     return`<button data-equipment-target="${monster.id}" class="rarity-target-${rarity} ${monster.id===target.id?"active":""}" aria-label="${displayName(monster)}を選択" title="${displayName(monster)}"><i class="equipment-target-slot">${index+1}</i><span class="equipment-target-portrait">${monsterVisual(monster,monsterSpecies.emoji??"MONSTER",{className:"equipment-tab-monster-visual"})}</span><span class="equipment-target-attribute">${attributeVisual(monsterAttributeId,{label:`${monsterAttribute.name}属性`})}</span><i class="equipment-target-selection" aria-hidden="true"></i></button>`;
    }).join("")}</div>
    <div class="equipment-loadout-workbench" aria-label="装備中の6枠">
     <div class="equipment-slot-rail left">
      ${equippedCards.weaponRight}${equippedCards.accessoryNeck}${equippedCards.armorBody}
     </div>
     <div class="equipment-paper-doll">
      <div class="equipment-paper-doll-portrait">${monsterVisual(target,species.emoji??"MONSTER",{className:"equipment-target-monster-visual"})}</div>
      <button type="button" class="equipment-magic-circle-button" data-open-magic-circle="${target.id}" title="魔法陣を変更・強化"><img src="${circle.asset}" alt=""><span><b>魔法陣設定</b><small>${circle.name}${circle.level?` Lv.${circle.level}`:""}</small></span><i>変更・強化 ›</i></button>
      <div class="selected-equipment-identity">${coloredMonsterName(target)}<small class="selected-equipment-growth">Lv.${target.level}　★${target.stars??1}　+${target.plus??0}</small><button type="button" class="equipment-affection-button" data-affection-info="${target.id}"><em class="attribute-chip">${attributeVisual(attributeId,{label:`${attribute.name}属性`})}${attribute.name}属性</em><span>なつき ${target.affection??0}/1000</span><i>詳細</i></button></div>
      <div class="selected-equipment-power"><small>戦力</small><strong>${formatCombatPower(power)}</strong></div>
      ${signature?.active?`<div class="signature-loadout-status active ${signature.pieces>=6?"awakened":""}"><small>${signature.status}・${signature.nextText}</small><b>${signature.definition.name}${signature.pieces>=6?"・完全覚醒":""}</b><span>${signature.pieces>=6?(signature.definition.awakenedText??signature.definition.description):signature.definition.description}</span></div>`:""}
      <div class="selected-equipment-stats" aria-label="装備反映後ステータス">
       <span><small>HP</small><b>${stats.hp.toLocaleString()}</b></span>
       <span><small>MP</small><b>${maxMp(target).toLocaleString()}</b></span>
       <span><small>物理ATK</small><b>${stats.atk.toLocaleString()}</b></span>
       <span><small>魔法ATK</small><b>${(stats.matk??stats.atk).toLocaleString()}</b></span>
       <span><small>物理DEF</small><b>${stats.def.toLocaleString()}</b></span>
       <span><small>魔法DEF</small><b>${(stats.mdef??stats.def).toLocaleString()}</b></span>
       <span><small>SPD</small><b>${stats.spd.toLocaleString()}</b></span>
       <span><small>回避率</small><b>${Math.min(75,Math.max(0,Number(stats.evasion)||0)).toFixed(1).replace(/\.0$/,"")}%</b></span>
      </div>
     </div>
     <div class="equipment-slot-rail right">
      ${equippedCards.weaponLeft}${equippedCards.accessoryFinger}${equippedCards.armorSupport}
     </div>
    </div>
    ${seriesSummary?`<details class="series-summary equipment-series-compact"><summary><b>◆ シリーズ効果</b><small>${seriesSummary}</small><em>${active.length?active.map(entry=>describeSeriesEffect(entry.effect)).join(" / "):"発動待ち"}</em></summary><div>${seriesDetails}</div></details>`:""}
    <div class="auto-equip-row">
     <button id="autoEquipOne">${pixelIcon("equipment")} このキャラを自動装備</button>
     <button id="autoEquipParty">${pixelIcon("formation")} 全員を自動装備</button>
     <button id="unequipOne">このキャラの装備解除</button>
     <button id="unequipParty">全員の装備解除</button>
    </div>
   </div>
   <nav class="equipment-slot-tabs" aria-label="装備種類">
    <button type="button" data-equipment-slot="weapon" class="${slot==="weapon"?"active":""}">⚔️ 武器</button>
    <button type="button" data-equipment-slot="armor" class="${slot==="armor"?"active":""}">🛡️ 防具</button>
    <button type="button" data-equipment-slot="accessory" class="${slot==="accessory"?"active":""}">💍 アクセ</button>
   </nav>
   <nav class="equipment-storage-tabs" aria-label="装備保管場所">
    <button type="button" data-equipment-storage="inventory" class="${storage==="inventory"?"active":""}">所持品<small>${state.equipment.length}/${EQUIPMENT_LIMIT}</small></button>
    <button type="button" data-equipment-storage="reserve" class="${storage==="reserve"?"active":""}" ${home?"":"disabled"}>予備BOX<small>${state.reserveEquipment.length}</small></button>
    <button type="button" data-equipment-storage="bossVault" class="${storage==="bossVault"?"active":""}" ${home?"":"disabled"}>王装保管庫<small>${state.bossEquipmentVault.length}</small></button>
   </nav>
   <div class="panel equipment-manage-panel ${editing&&canManageInventory?"manage-editing":""}">
    <div class="spread"><div><b>${slotLabel(slot)}一覧</b><small>${canManageInventory?"装備カードの部位ボタンから、選択中の仲間へ装着できます。":"カードから所持品へ戻すと、装備・育成できるようになります。"}</small></div>${canManageInventory?`<button type="button" id="toggleEquipmentEdit" class="manage-edit-button">${editing?"完了":"整理"}</button>`:""}</div>
    ${canManageInventory?(editing?`<div class="bulk-manager"><div class="bulk-presets"><button type="button" data-select-equipment="all">全選択</button><button type="button" data-select-equipment="N">N</button><button type="button" data-select-equipment="R">R</button><button type="button" data-select-equipment="plus0">未強化</button><button type="button" data-select-equipment="duplicate">重複</button><button type="button" data-select-equipment="none">解除</button></div><button type="button" id="lockSelectedEquipment" class="bulk-secondary">選択装備をロック</button><button type="button" id="sellSelectedEquipment" class="bulk-primary danger">選択装備を売却</button></div>`:`<button type="button" id="bulkSellEquipment" class="bulk-secondary">未装備のN・Rを一括売却</button>`):""}
   </div>
   <div class="panel equipment-sort-panel"><div class="spread"><b>${slotLabel(slot)} ${list.length}件</b><select id="equipmentSort" aria-label="装備の並び順">${sortOption("rarity","レア度順",sort)}${sortOption("power","総合能力順",sort)}${sortOption("atk","ATK順",sort)}${sortOption("def","DEF順",sort)}${sortOption("hp","HP順",sort)}${sortOption("spd","SPD順",sort)}${sortOption("newest","新しい順",sort)}${sortOption("favorite","お気に入り順",sort)}${sortOption("name","名前順",sort)}</select></div></div>
   <div class="equipment-list ${editing&&canManageInventory?"manage-editing":""}">${list.map(item=>card(item,state,target,storage,{editing:editing&&canManageInventory,selected:selected.has(item.id),focused:item.id===focusItemId})).join("")||'<div class="empty">この条件の装備はありません</div>'}</div>
  </div>
  ${bottomNav("equipment")}
 </section>`;
}
