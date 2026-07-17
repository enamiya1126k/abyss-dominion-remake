import{RARITY_ORDER,RARITY_COLORS,equipmentStatLabel}from"../../data/equipment.js";
import{displayName}from"../../models/Monster.js";

export function EquipmentScreen(state,targetId){
 const target=state.monsters.find(m=>m.id===targetId)??state.monsters.find(m=>state.party.includes(m.id))??state.monsters[0];
 const sort=state.settings.equipmentSort??"rarity";
 const list=[...state.equipment].sort((a,b)=>{
  if(sort==="rarity")return RARITY_ORDER[b.rarity]-RARITY_ORDER[a.rarity]||b.plus-a.plus;
  if(sort==="power")return Object.values(b.stats).reduce((x,y)=>x+y,0)-Object.values(a.stats).reduce((x,y)=>x+y,0);
  if(sort==="favorite")return Number(b.favorite)-Number(a.favorite)||RARITY_ORDER[b.rarity]-RARITY_ORDER[a.rarity];
  return a.name.localeCompare(b.name,"ja");
 });
 const equippedName=id=>state.equipment.find(i=>i.id===id)?.name??"なし";
 return`<section class="screen">
  <header class="topbar"><button id="backEquipmentHome">←</button><h2>装備管理</h2><span>${state.equipment.length}/500</span></header>
  <div class="page">
   <div class="panel">
    <div class="spread"><b>装備対象</b><select id="equipmentTarget">${state.monsters.map(m=>`<option value="${m.id}" ${m.id===target.id?"selected":""}>${displayName(m)}</option>`).join("")}</select></div>
    <div class="subline" style="margin-top:10px">武器：${equippedName(target.equipment.weapon)}<br>防具：${equippedName(target.equipment.armor)}<br>アクセ：${equippedName(target.equipment.accessory)}</div>
   </div>
   <div class="panel">
    <div class="spread"><b>並び替え</b><select id="equipmentSort">
      <option value="rarity" ${sort==="rarity"?"selected":""}>レア度順</option>
      <option value="power" ${sort==="power"?"selected":""}>能力値順</option>
      <option value="favorite" ${sort==="favorite"?"selected":""}>お気に入り順</option>
      <option value="name" ${sort==="name"?"selected":""}>名前順</option>
    </select></div>
   </div>
   <div class="equipment-list">${list.map(item=>equipmentCard(item,state,target)).join("")||'<div class="empty">装備をまだ持っていない</div>'}</div>
  </div>
 </section>`;
}
function equipmentCard(item,state,target){
 const stats=Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ");
 const owner=item.equippedBy?state.monsters.find(m=>m.id===item.equippedBy):null;
 return`<article class="equipment-card">
  <div class="spread"><b style="color:${RARITY_COLORS[item.rarity]}">[${item.rarity}] ${item.name}${item.plus?` +${item.plus}`:""}</b><span>${item.favorite?"★":""}${item.locked?"🔒":""}</span></div>
  <div class="subline">${item.slot} / ${stats}<br>${owner?`装備中：${displayName(owner)}`:"未装備"}</div>
  <div class="equipment-actions">
   <button data-equip="${item.id}" data-target="${target.id}">装備</button>
   ${item.equippedBy?`<button data-unequip="${item.id}">外す</button>`:`<button data-sell="${item.id}">売却</button>`}
   <button data-favorite-equipment="${item.id}">${item.favorite?"★解除":"☆お気に入り"}</button>
   <button data-lock-equipment="${item.id}">${item.locked?"🔓解除":"🔒ロック"}</button>
  </div>
 </article>`;
}
