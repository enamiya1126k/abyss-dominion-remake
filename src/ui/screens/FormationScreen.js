import{SPECIES}from"../../data/species.js?v=1.2.0";
import{calculatedStats,displayName}from"../../models/Monster.js?v=1.2.0";
import{maxMp,normalizeSkillLoadout,skillById}from"../../battle/SkillSystem.js?v=1.2.0";
import{monsterCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=1.2.0";
import{equipmentDisplayRarity,equipmentSubslotLabel,equipmentStatLabel}from"../../data/equipment.js?v=1.2.0";
import{formatAffix}from"../../data/equipmentAffixes.js?v=1.2.0";
import{equipmentStatMultiplier}from"../../models/Equipment.js?v=1.2.0";

const ELEMENTS={
 neutral:["⚪","無"],fire:["🔥","火"],water:["💧","水"],ice:["❄️","氷"],lightning:["⚡","雷"],thunder:["⚡","雷"],
 earth:["🪨","土"],wind:["🌪️","風"],light:["✨","光"],dark:["🌑","闇"],poison:["☠️","毒"],nature:["🌿","自然"]
};

function rarityClass(rarity){return({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity??"N").toLowerCase()}
function monsterRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function elementData(monster){
 const species=SPECIES[monster.speciesId]??{};
 return ELEMENTS[monster.attribute??species.element??"neutral"]??["◈",monster.attribute??species.element??"不明"];
}
function weaponLine(state,monster,subslot){
 const item=state.equipment?.find(entry=>entry.id===monster.equipment?.[subslot]);
 if(!item)return`<div class="formation-weapon empty"><small>${equipmentSubslotLabel(subslot)}</small><b>なし</b></div>`;
 const multiplier=equipmentStatMultiplier(item),stats=Object.entries(item.stats??{}).slice(0,2).map(([key,value])=>`${equipmentStatLabel(key)}+${Math.round(value*multiplier)}`).join(" ");
 const affix=(item.affixes??[]).slice(0,1).map(formatAffix).join(""),buff=[stats,affix].filter(Boolean).join(" / ")||"補正なし";
 const rarity=equipmentDisplayRarity(item);
 return`<div class="formation-weapon"><small>${equipmentSubslotLabel(subslot)}・${rarity}</small><b class="rarity-name-${rarityClass(rarity)}">${item.name}${item.plus?` +${item.plus}`:""}</b><em>${buff}</em></div>`;
}
function memberCard(state,monster,index){
 const species=SPECIES[monster.speciesId]??{},stats=calculatedStats(monster),mp=maxMp(monster),[elementIcon,elementName]=elementData(monster),rarity=monsterRarity(monster);
 normalizeSkillLoadout(monster);
 const skills=Array.from({length:4},(_,slot)=>skillById(monster.equippedSkills?.[slot]));
 return`<article class="formation-member" data-formation-member="${monster.id}">
  <div class="formation-slot-label">SLOT ${index+1}</div>
  <div class="formation-member-icon">${species.emoji??"👹"}</div>
  <b class="formation-member-name rarity-name-${rarityClass(rarity)}">${displayName(monster)}</b>
  <small class="formation-member-meta">${rarity}・${elementIcon}${elementName}<br>Lv.${monster.level}・★${monster.stars??1}・+${monster.plus??0}</small>
  <div class="formation-power"><small>戦力</small><strong>${formatCombatPower(monsterCombatPower(monster))}</strong></div>
  <div class="formation-stats">
   <span>HP<b>${stats.hp.toLocaleString()}</b></span><span>MP<b>${mp.toLocaleString()}</b></span>
   <span>ATK<b>${stats.atk.toLocaleString()}</b></span><span>DEF<b>${stats.def.toLocaleString()}</b></span>
   <span>SPD<b>${stats.spd.toLocaleString()}</b></span><span>❤️<b>${monster.affection??0}</b></span>
  </div>
  <section class="formation-loadout">
   <h3>⚔️ 武器・補正</h3>
   ${weaponLine(state,monster,"weaponRight")}
   ${weaponLine(state,monster,"weaponLeft")}
  </section>
  <section class="formation-skills">
   <h3>✨ 設定中スキル</h3>
   ${skills.map((skill,slot)=>`<div><small>${slot+1}</small><b>${skill?.name??"未設定"}</b></div>`).join("")}
  </section>
  <div class="formation-actions">
   <button data-formation-growth="${monster.id}">育成</button>
   <button data-formation-equipment="${monster.id}">装備</button>
   <button data-formation-skills="${monster.id}">スキル</button>
   <button class="danger" data-formation-remove="${monster.id}">外す</button>
  </div>
 </article>`;
}
function emptyCard(index){
 return`<button class="formation-member formation-empty" data-formation-add="${index}">
  <span>SLOT ${index+1}</span><strong>＋</strong><b>編成</b><small>控えモンスターから選択</small>
 </button>`;
}

export function FormationScreen(state,{origin="home"}={}){
 const party=(state.party??[]).map(id=>state.monsters?.find(monster=>monster.id===id)).filter(Boolean);
 const cards=Array.from({length:4},(_,index)=>party[index]?memberCard(state,party[index],index):emptyCard(index)).join("");
 const total=party.reduce((sum,monster)=>sum+monsterCombatPower(monster),0);
 return`<section class="screen formation-screen" data-origin="${origin}">
  <header class="topbar formation-topbar">
   <button id="backFormation">←</button>
   <div><small>PARTY DASHBOARD</small><h2>部隊編成</h2></div>
   <span>${party.length}/4</span>
  </header>
  <div class="formation-page">
   <div class="formation-summary"><div><small>部隊総戦力</small><strong>${formatCombatPower(total)}</strong></div><p>4体の装備・補正・スキルを一画面で比較</p></div>
   <div class="formation-grid">${cards}</div>
  </div>
 </section>`;
}
