import{RARITY_ORDER,RARITY_COLORS,equipmentStatLabel}from"../../data/equipment.js";
import{displayName}from"../../models/Monster.js";
import{EQUIPMENT_LIMIT,RESERVE_LIMIT,slotLabel,equipmentSellPrice}from"../../services/EquipmentStorage.js";

const SLOT_ICONS={weapon:"⚔️",armor:"🛡️",accessory:"💍"};

export function EquipmentScreen(state,targetId,{home=false}={}){
 const target=state.monsters.find(m=>m.id===targetId)??state.monsters.find(m=>state.party.includes(m.id))??state.monsters[0];
 const slot=state.settings.equipmentSlot??"weapon";
 let storage=state.settings.equipmentStorage??"inventory";
 if(!home&&storage!=="inventory")storage="inventory";
 const sort=state.settings.equipmentSort??"rarity";
 const source=storage==="reserve"?state.reserveEquipment:storage==="bossVault"?state.bossEquipmentVault:state.equipment;
 const list=[...source].filter(item=>item.slot===slot).sort((a,b)=>sortItems(a,b,sort));
 const equippedName=id=>state.equipment.find(i=>i.id===id)?.name??"なし";
 const storageCount=storage==="inventory"?`${state.equipment.length}/${EQUIPMENT_LIMIT}`:storage==="reserve"?`${state.reserveEquipment.length}/${RESERVE_LIMIT}`:`${state.bossEquipmentVault.length}`;
 return`<section class="screen">
  <header class="topbar"><button id="backEquipmentHome">←</button><h2>装備管理</h2><span>${storageCount}</span></header>
  <div class="page equipment-page">
   <div class="panel">
    <div class="spread"><b>装備対象</b><select id="equipmentTarget">${state.monsters.map(m=>`<option value="${m.id}" ${m.id===target.id?"selected":""}>${displayName(m)}</option>`).join("")}</select></div>
    <div class="equipped-summary">
     <span>⚔️ 武器：${equippedName(target.equipment.weapon)}</span>
     <span>🛡️ 防具：${equippedName(target.equipment.armor)}</span>
     <span>💍 アクセ：${equippedName(target.equipment.accessory)}</span>
    </div>
   </div>

   <div class="equipment-slot-tabs">
    ${["weapon","armor","accessory"].map(id=>`<button data-equipment-slot="${id}" class="${slot===id?"active":""}">${SLOT_ICONS[id]} ${slotLabel(id)}</button>`).join("")}
   </div>

   <div class="equipment-storage-tabs">
    <button data-equipment-storage="inventory" class="${storage==="inventory"?"active":""}">所持品 <small>${state.equipment.length}/${EQUIPMENT_LIMIT}</small></button>
    <button data-equipment-storage="reserve" class="${storage==="reserve"?"active":""}" ${home?"":"disabled"}>予備BOX <small>${state.reserveEquipment.length}/${RESERVE_LIMIT}</small></button>
    <button data-equipment-storage="bossVault" class="${storage==="bossVault"?"active":""}" ${home?"":"disabled"}>王装保管庫 <small>${state.bossEquipmentVault.length}</small></button>
   </div>
   ${!home?'<p class="storage-notice">予備BOXと王装保管庫は帰還中のみ整理できます。</p>':""}

   <div class="panel equipment-sort-panel">
    <div class="spread"><b>${slotLabel(slot)}の並び替え</b><select id="equipmentSort">
      <option value="rarity" ${sort==="rarity"?"selected":""}>レア度順</option>
      <option value="power" ${sort==="power"?"selected":""}>総合能力順</option>
      <option value="atk" ${sort==="atk"?"selected":""}>ATK順</option>
      <option value="def" ${sort==="def"?"selected":""}>DEF順</option>
      <option value="hp" ${sort==="hp"?"selected":""}>HP順</option>
      <option value="spd" ${sort==="spd"?"selected":""}>SPD順</option>
      <option value="newest" ${sort==="newest"?"selected":""}>新しい順</option>
      <option value="favorite" ${sort==="favorite"?"selected":""}>お気に入り順</option>
      <option value="name" ${sort==="name"?"selected":""}>名前順</option>
    </select></div>
   </div>

   <div class="equipment-list">${list.map(item=>equipmentCard(item,state,target,storage)).join("")||`<div class="empty">${slotLabel(slot)}はまだありません</div>`}</div>
  </div>
 </section>`;
}

function sortItems(a,b,sort){
 if(sort==="rarity")return RARITY_ORDER[b.rarity]-RARITY_ORDER[a.rarity]||(b.plus??0)-(a.plus??0);
 if(sort==="power")return statTotal(b)-statTotal(a);
 if(["atk","def","hp","spd"].includes(sort))return (b.stats?.[sort]??0)-(a.stats?.[sort]??0)||RARITY_ORDER[b.rarity]-RARITY_ORDER[a.rarity];
 if(sort==="newest")return new Date(b.createdAt??0)-new Date(a.createdAt??0);
 if(sort==="favorite")return Number(b.favorite)-Number(a.favorite)||RARITY_ORDER[b.rarity]-RARITY_ORDER[a.rarity];
 return a.name.localeCompare(b.name,"ja");
}
function statTotal(item){return Object.values(item.stats??{}).reduce((sum,value)=>sum+value,0)+(item.plus??0)*3+(item.level??1)}

function equipmentCard(item,state,target,storage){
 const stats=Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ");
 const owner=item.equippedBy?state.monsters.find(m=>m.id===item.equippedBy):null;
 const inventory=storage==="inventory";
 return`<article class="equipment-card">
  <div class="spread"><b style="color:${RARITY_COLORS[item.rarity]}">[${item.rarity}] ${item.name}${item.plus?` +${item.plus}`:""}</b><span>${item.favorite?"★":""}${item.locked?"🔒":""}</span></div>
  <div class="subline">${slotLabel(item.slot)} / ${stats}<br>${owner?`装備中：${displayName(owner)}`:storage==="reserve"?"予備BOXに保管":storage==="bossVault"?"王装保管庫に保管":"未装備"}</div>
  <div class="equipment-actions">
   ${inventory?`<button data-equip="${item.id}" data-target="${target.id}">装備</button>
   ${item.equippedBy?`<button data-unequip="${item.id}">外す</button>`:`<button data-sell="${item.id}">売却 ${equipmentSellPrice(item)}G</button>`}
   <button data-favorite-equipment="${item.id}">${item.favorite?"★解除":"☆お気に入り"}</button>
   <button data-lock-equipment="${item.id}">${item.locked?"🔓解除":"🔒ロック"}</button>`:
   `<button data-take-equipment="${item.id}" data-storage="${storage}">所持品へ移す</button>`}
  </div>
 </article>`;
}
