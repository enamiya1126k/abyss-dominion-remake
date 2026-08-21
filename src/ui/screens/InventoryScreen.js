import{equipmentDisplayRarity,equipmentRarityColor,equipmentStatLabel}from"../../data/equipment.js?v=2.11.2-build166";
import{equipmentStatMultiplier}from"../../models/Equipment.js?v=2.11.2-build166";
import{resourceHud,bottomNav,sectionTitle}from"../components/GameChrome.js?v=2.11.2-build166";
import{equipmentSocketSummary}from"../components/EquipmentSocketSummary.js?v=2.11.2-build166";
import{equipmentVisual}from"../components/EquipmentVisual.js?v=2.11.2-build166";
import{ENDGAME_BOSSES}from"../../core/EndgameSystem.js?v=2.11.2-build166";
import{monsterVisual}from"../MonsterVisual.js?v=2.11.2-build166";

const CONSUMABLES=[
 ["potions","🧪","薬草","HPを回復"],
 ["highPotions","⚗️","上級回復薬","HPを大きく回復"],
 ["partyPotions","💚","全体回復薬","味方全員のHPを回復"],
 ["manaPotions","💧","魔力水","MPを回復"],
 ["highManaPotions","🔷","上級魔力水","MPを大きく回復"],
 ["partyManaPotions","🌊","全体魔力水","味方全員のMPを回復"],
 ["fullManaPotions","💠","魔力全快薬","MPを全回復"],
 ["partyFullManaPotions","🌀","全体魔力全快薬","味方全員のMPを全回復"],
 ["reviveLeaves","🍃","蘇生の葉","戦闘不能を回復"],
 ["statusCures","🩹","浄化薬","状態異常を解除"],
 ["partyStatusCures","💨","全体浄化薬","味方全員の状態異常を解除"],
 ["fullHeals","✨","万能霊薬","HP・MP・状態異常を回復"],
 ["partyFullHeals","🌟","全体万能霊薬","味方全員を完全回復"]
 ,["experienceItems","📘","経験値パック（小）","現在Lv基準・N標準で約1Lv分"]
 ,["experienceItemsMedium","📗","経験値パック（中）","300階解禁・N標準で約3Lv分"]
 ,["experienceItemsLarge","📙","経験値パック（大）","750階解禁・N標準で約6Lv分"]
 ,["experienceItemsUltra","📕","経験値パック（超）","1000階解禁・N標準で最大約10Lv分"]
];
const MATERIALS=[
 ["captureCrystals","🔮","捕獲結晶","捕獲失敗は1個、成功時は敵に応じて最大75個消費"],
 ["abyssKeys","🗝️","深淵の鍵","深淵で使用する特別な鍵"]
];
const ARMORY_CATEGORIES=[["all","すべて"],["weapon","武器"],["armor","防具"],["accessory","アクセ"]];
const INVENTORY_CATEGORIES=[["all","すべて"],["consumable","消費"],["material","素材"]];
const SLOT_ICONS={weapon:"⚔️",armor:"🛡️",accessory:"💍"};
// This URL is consumed by app.css through a custom property, so it resolves
// relative to src/Styles/app.css rather than this module or index.html.
const ITEM_ART_ROOT="../../assets/ui/items";

function itemArt(name,fallback){
 return`<span class="v2-item-art" style="--item-art:url('${ITEM_ART_ROOT}/${name}.png')"><i>${fallback}</i></span>`;
}

function equipmentStats(item){
 const multiplier=equipmentStatMultiplier(item);
 return Object.entries(item.stats??{}).slice(0,2).map(([key,value])=>`${equipmentStatLabel(key)}+${Math.round(value*multiplier)}`).join(" / ")||"能力補正なし";
}

function equipmentCard(item){
 const rarity=equipmentDisplayRarity(item),color=equipmentRarityColor(item);
 return`<button type="button" class="v2-inventory-item equipment" data-inventory-equipment="${item.id}" style="--item-rarity:${color}">
  <span class="v2-item-rarity">${rarity}</span>
  ${equipmentVisual(item,{className:"inventory-equipment-art"})}
  <b style="color:${color}">${item.name}</b>
  <small>Lv.${item.level??1}${item.plus?`・+${item.plus}`:""}<br>${equipmentStats(item)}</small>
  ${equipmentSocketSummary(item,{compact:true})}
  ${item.equippedBy?'<em>Ｅ</em>':""}
 </button>`;
}

function stackCard([id,icon,name,description],inventory,type){
 const amount=Math.max(0,Number(inventory[id])||0);
 return`<button type="button" class="v2-inventory-item stack" data-inventory-stack="${id}" data-inventory-kind="${type}">
  ${itemArt(id,icon)}<b>${name}</b><small>${description}</small><strong>×${amount.toLocaleString()}</strong>
 </button>`;
}

function sortedEquipment(state,category="all",sort="rarity"){
 const rarityOrder={N:1,R:2,SR:3,SSR:4,UR:5,LR:6,"神話":7,"深淵":8,"十神":9};
 return[...(state.equipment??[])].filter(item=>category==="all"||item.slot===category).sort((a,b)=>{
  if(sort==="level")return(b.level??1)-(a.level??1);
  if(sort==="name")return String(a.name).localeCompare(String(b.name),"ja");
  return(rarityOrder[equipmentDisplayRarity(b)]??0)-(rarityOrder[equipmentDisplayRarity(a)]??0)||(b.level??1)-(a.level??1);
 });
}

function fragmentCards(state){
 const emergency=state.endgame?.emergency??{},fragments=emergency.fragments??{},records=emergency.records??{};
 const cards=Object.values(ENDGAME_BOSSES).filter(boss=>(Number(fragments[boss.id])||0)>0||(records[boss.id]?.encounters??0)>0).map(boss=>{
  const amount=Math.max(0,Number(fragments[boss.id])||0);
  return`<button type="button" class="v2-inventory-item stack endgame-fragment-item ${boss.faction}" data-endgame-fragment="${boss.id}">${monsterVisual(boss.id,boss.icon,{className:"inventory-fragment-visual"})}<small>${boss.faction==="tenGod"?"十神の法則片":"深淵の存在片"}</small><b>${boss.name}の欠片</b><strong>×${amount.toLocaleString()}</strong><em>欠片祭壇へ</em></button>`;
 }).join("");
 return`${cards}<button type="button" class="v2-inventory-item fragment-altar-entry" data-open-fragment-altar>${itemArt("abyssKeys","✦")}<b>欠片祭壇</b><small>人物契約／専用装備の顕現</small><strong>開く</strong></button>`;
}

export function ArmoryScreen(state,category="all",sort="rarity"){
 const equipment=sortedEquipment(state,category,sort);
 return`<section class="screen v2-screen inventory-screen-v2 armory-screen-v2">
  ${resourceHud(state,{backId:"backInventory",title:"武器庫"})}
  <main class="v2-screen-content">
   ${sectionTitle("武器庫",`${equipment.length}個 / 全装備 ${(state.equipment??[]).length}個`)}
   <div class="v2-category-tabs">${ARMORY_CATEGORIES.map(([id,label])=>`<button type="button" data-inventory-category="${id}" class="${category===id?"active":""}">${label}</button>`).join("")}</div>
   <div class="v2-inventory-toolbar">
    <span class="v2-inventory-mode">装備管理</span>
    <span>タップで装着・強化・スロット・売却</span>
    <select id="inventorySort" aria-label="並び替え"><option value="rarity" ${sort==="rarity"?"selected":""}>レア度順</option><option value="level" ${sort==="level"?"selected":""}>レベル順</option><option value="name" ${sort==="name"?"selected":""}>名前順</option></select>
   </div>
   <div class="v2-inventory-grid" id="inventoryContextGrid">${equipment.map(equipmentCard).join("")||'<div class="v2-empty-state">この分類の装備はありません</div>'}</div>
  </main>
  ${bottomNav("armory")}
 </section>`;
}

export function InventoryScreen(state,category="all"){
 const baseStacks=[
  ...(category==="all"||category==="consumable"?CONSUMABLES.map(item=>stackCard(item,state.inventory??{},"consumable")):[]),
  ...(category==="all"||category==="material"?MATERIALS.map(item=>stackCard(item,state.inventory??{},"material")):[])
 ];
 const fragments=category==="all"||category==="material"?fragmentCards(state):"",stackCount=baseStacks.length+(fragments?1:0);
 return`<section class="screen v2-screen inventory-screen-v2">
  ${resourceHud(state,{backId:"backInventory",title:"持ち物"})}
  <main class="v2-screen-content">
   ${sectionTitle("持ち物",`${stackCount}分類`)}
   <div class="v2-category-tabs">${INVENTORY_CATEGORIES.map(([id,label])=>`<button type="button" data-inventory-category="${id}" class="${category===id?"active":""}">${label}</button>`).join("")}</div>
   <div class="v2-inventory-toolbar">
    <span class="v2-inventory-mode">道具・素材</span>
    <span>タップで詳細・使用</span>
   </div>
   <div class="v2-inventory-grid" id="inventoryContextGrid">${baseStacks.join("")}${fragments||(!baseStacks.length?'<div class="v2-empty-state">この分類の持ち物はありません</div>':"")}</div>
  </main>
  ${bottomNav("inventory")}
 </section>`;
}
