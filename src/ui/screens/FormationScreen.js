import{SPECIES}from"../../data/species.js?v=2.6.0";
import{displayName}from"../../models/Monster.js?v=2.6.0";
import{effectiveSkillMpCost,maxMp,normalizeSkillLoadout,skillById,skillElementLabel,skillProgressFor}from"../../battle/SkillSystem.js?v=2.6.0";
import{monsterCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=2.6.0";
import{equipmentDisplayRarity,equipmentSubslotLabel,SLOT_UNLOCK_LEVEL}from"../../data/equipment.js?v=2.6.0";
import{monsterVisual}from"../MonsterVisual.js?v=2.6.0";
import{resourceHud,bottomNav}from"../components/GameChrome.js?v=2.6.0";
import{equipmentSocketSummary}from"../components/EquipmentSocketSummary.js?v=2.6.0";

const ELEMENTS={
 neutral:["⚪","無"],fire:["🔥","火"],water:["💧","水"],ice:["❄️","氷"],lightning:["⚡","雷"],thunder:["⚡","雷"],
 earth:["🪨","土"],wind:["🌪️","風"],light:["✨","光"],dark:["🌑","闇"],poison:["☠️","毒"],nature:["🌿","自然"]
};
const LOADOUT_SLOTS=["weaponRight","weaponLeft","accessoryNeck","accessoryFinger","armorBody","armorSupport"];
const FORMATION_SLOT_LABELS={
 weaponRight:"右手",weaponLeft:"左手",accessoryNeck:"首",accessoryFinger:"指",armorBody:"胴",armorSupport:"補助"
};
function formationSlotLabel(subslot){return FORMATION_SLOT_LABELS[subslot]??equipmentSubslotLabel(subslot)}
function formationRoleLabel(species){
 const role=String(species?.role??"").toLowerCase();
 if(["healer","support"].some(value=>role.includes(value)))return"後方支援型";
 if(["magic","controller","debuffer","poison","burner"].some(value=>role.includes(value)))return"魔法攻撃型";
 if(["tank","guardian","defender"].some(value=>role.includes(value)))return"前衛防御型";
 if(["assassin","speed","scout"].some(value=>role.includes(value)))return"高速奇襲型";
 return"物理攻撃型";
}

function rarityClass(rarity){return({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity??"N").toLowerCase()}
function monsterRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function elementData(monster){
 const species=SPECIES[monster.speciesId]??{};
 return ELEMENTS[monster.attribute??species.element??"neutral"]??["◈",monster.attribute??species.element??"不明"];
}
function equipmentSlot(state,monster,subslot){
 const unlockLevel=SLOT_UNLOCK_LEVEL[subslot]??1;
 if(monster.level<unlockLevel)return`<div class="formation-gear-slot locked"><small>${formationSlotLabel(subslot)}</small><b>🔒 Lv.${unlockLevel}</b><em>未解放</em></div>`;
 const item=state.equipment?.find(entry=>entry.id===monster.equipment?.[subslot]);
 if(!item)return`<button type="button" class="formation-gear-slot empty" data-formation-gear-add="${monster.id}" data-formation-subslot="${subslot}"><small>${formationSlotLabel(subslot)}</small><b>＋ なし</b><em>タップして装備</em></button>`;
 const rarity=equipmentDisplayRarity(item);
 return`<button type="button" class="formation-gear-slot equipped" data-formation-gear-open="${item.id}" data-owner="${monster.id}" data-formation-subslot="${subslot}">
  <small>${formationSlotLabel(subslot)}・<span class="rarity-name-${rarityClass(rarity)}">${rarity}</span></small>
  <b>Lv.${item.level??1}・+${item.plus??0}</b>
  <em>${item.name}</em>
  ${equipmentSocketSummary(item,{compact:true})}
 </button>`;
}
function skillEffectText(skill){
 if(skill.type==="allHeal"||skill.type==="selfHeal")return`回復 ${Math.round((skill.heal??0)*100)}%`;
 if(skill.type==="mpHeal")return`MP回復 ${Math.round((skill.mpHeal??0)*100)}%`;
 if(skill.type==="revive")return`蘇生 ${Math.round((skill.revive??0)*100)}%`;
 if(skill.type==="multiAttack")return`威力 ${Math.round((skill.power??0)*100)}%×${skill.hits??2}`;
 if(skill.type==="drain")return`威力 ${Math.round((skill.power??0)*100)}%・吸収${Math.round((skill.drain??0)*100)}%`;
 if(skill.type==="buff"||skill.type==="stance"||skill.type==="cleanse")return skill.tag??"特殊効果";
 return`威力 ${Math.round((skill.power??0)*100)}%`;
}
function skillSlot(monster,skill,slot){
 if(!skill)return`<button type="button" class="empty" data-formation-skill="${monster.id}" data-skill-slot="${slot}"><small>${slot+1}</small><span><b>未設定</b><em>タップして選択</em></span><i>›</i></button>`;
 const progress=skillProgressFor(monster,skill.id),cost=effectiveSkillMpCost(monster,skill),baseCost=skill.mp??0;
 const costLabel=cost===baseCost?`MP ${cost}`:`MP ${cost}（基本${baseCost}）`;
 return`<button type="button" data-formation-skill="${monster.id}" data-skill-slot="${slot}">
  <small>${slot+1}</small>
  <span><b>${skill.name}</b><em>熟練Lv.${progress.level}・${skillElementLabel(skill)}・${skillEffectText(skill)}・${costLabel}・CT ${skill.cooldown??0}</em></span>
  <i>›</i>
 </button>`;
}
function memberCard(state,monster,index,{readOnly=false}={}){
 const species=SPECIES[monster.speciesId]??{},[elementIcon,elementName]=elementData(monster),rarity=monsterRarity(monster);
 normalizeSkillLoadout(monster);
 const skills=Array.from({length:4},(_,slot)=>skillById(monster.equippedSkills?.[slot]));
 return`<article class="formation-member" data-formation-member="${monster.id}" data-formation-index="${index}">
  <div class="formation-member-drag" ${readOnly?"":`data-formation-member-drag="${monster.id}" title="長押しして並び替え"`}>
   <div class="formation-slot-label">SLOT ${index+1}</div>
   <div class="formation-member-icon">${monsterVisual(monster,species.emoji??"👹",{className:"formation-monster-visual"})}</div>
   <b class="formation-member-name rarity-name-${rarityClass(rarity)}">${displayName(monster)}</b>
   <small class="formation-member-meta">${rarity}・${elementIcon}${elementName}・${formationRoleLabel(species)}<br>Lv.${monster.level}・★${monster.stars??1}・+${monster.plus??0}</small>
   <small class="formation-total-exp">${readOnly?"探索中・確認のみ":"長押しして順番を変更"}</small>
  </div>
  <div class="formation-power"><small>戦力</small><strong>${formatCombatPower(monsterCombatPower(monster))}</strong></div>
  <details class="formation-section formation-loadout" open>
   <summary>装備6枠 <small>右手・左手 / 首・指 / 胴・補助</small></summary>
   <div class="formation-gear-grid">${LOADOUT_SLOTS.map(subslot=>equipmentSlot(state,monster,subslot)).join("")}</div>
  </details>
  <details class="formation-section formation-skills" open>
   <summary>設定中スキル <small>タップで開閉</small></summary>
   <div class="formation-skill-list">${skills.map((skill,slot)=>skillSlot(monster,skill,slot)).join("")}</div>
  </details>
  ${readOnly?'<div class="formation-readonly-note">帰還後に順番・交代・スキルを変更できます</div>':`<div class="formation-actions compact"><button data-formation-skills="${monster.id}">スキル編集</button><button data-formation-replace="${monster.id}">交代</button><button class="danger formation-remove-action" data-formation-remove="${monster.id}">隊列から外す</button></div>`}
 </article>`;
}
function emptyCard(index,{readOnly=false}={}){
 return`<button class="formation-member formation-empty" ${readOnly?"disabled":`data-formation-add="${index}"`} data-formation-index="${index}">
  <span>SLOT ${index+1}</span><strong>＋</strong><b>編成</b><small>控えモンスターから選択</small>
 </button>`;
}

export function FormationScreen(state,{origin="home"}={}){
 const party=(state.party??[]).map(id=>state.monsters?.find(monster=>monster.id===id)).filter(Boolean);
 const readOnly=origin==="explore",cards=Array.from({length:4},(_,index)=>party[index]?memberCard(state,party[index],index,{readOnly}):emptyCard(index,{readOnly})).join("");
 const total=party.reduce((sum,monster)=>sum+monsterCombatPower(monster),0);
 return`<section class="screen formation-screen v2-screen" data-origin="${origin}">
  ${resourceHud(state,{backId:"backFormation",title:"編成"})}
  <div class="formation-page">
   <div class="formation-summary"><div><small>パーティ ${party.length}/4・総戦力</small><strong>${formatCombatPower(total)}</strong></div><p>${readOnly?"探索中は確認のみ・変更は帰還後":"長押しで隊列変更・交代・4スキル設定"}</p><button type="button" class="formation-rarity-help" data-formation-rarity-help aria-label="レア度一覧">？</button></div>
   <aside class="formation-rarity-drawer" data-formation-rarity-drawer aria-hidden="true"><button type="button" data-formation-rarity-close>▶</button><small>レア度・表示色</small><div>${["N","R","SR","SSR","UR","LR","神話","深淵","十神"].map(rarity=>`<span class="rarity-name-${rarityClass(rarity)}">${rarity}</span>`).join("")}</div></aside>
   <div class="formation-grid">${cards}</div>
  </div>
  ${bottomNav("formation")}
 </section>`;
}
