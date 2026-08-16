import{displayName,rankName,colorValue,calculatedStats}from"../../models/Monster.js?v=2.10.0-build159";
import{PERSONALITIES}from"../../data/personalities.js?v=2.10.0-build159";
import{SPECIES}from"../../data/species.js?v=2.10.0-build159";
import{monsterCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=2.10.0-build159";
import{monsterVisual}from"../MonsterVisual.js?v=2.10.0-build159";

export function MonsterCard(monster,inParty=false,{editing=false,selected=false}={}){
  const stats=calculatedStats(monster),personality=PERSONALITIES[monster.personalityId],species=SPECIES[monster.speciesId];
  const protectedMonster=inParty||monster.favorite||monster.locked;
  return`<article class="monster-card ${selected?"selected":""} ${protectedMonster?"protected-entry":""}">
    ${editing?`<label class="manage-check"><input type="checkbox" data-select-monster="${monster.id}" ${selected?"checked":""} ${protectedMonster?"disabled":""}><span></span></label>`:""}
    <div class="monster-orb" style="background:${colorValue(monster)}">${monsterVisual(monster,species?.emoji??"👹",{className:"monster-card-visual"})}</div>
    <div>
      <div class="monster-name">${monster.favorite?"★ ":""}${monster.locked?"🔒 ":""}${displayName(monster)}</div>
      <div class="subline">${rankName(monster)} / Lv.${monster.level} +${monster.plus} / ⚔️戦力 ${formatCombatPower(monsterCombatPower(monster))}</div>
      <div class="stars" title="生まれ持った固有値・最大10">${monster.stars<=6?"★".repeat(monster.stars):`★${monster.stars}`}</div>
      <div class="subline"><span class="badge">${personality.name}</span> ❤️${monster.affection??0}　HP ${stats.hp} / ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}</div>
    </div>
    ${editing?"":`<button data-monster-id="${monster.id}">詳細</button>`}
  </article>`;
}
