import{displayName,rankName,colorValue,calculatedStats}from"../../models/Monster.js?v=0.9.15-alpha.95-abyss-skill-effects";
import{PERSONALITIES}from"../../data/personalities.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{SPECIES}from"../../data/species.js?v=0.9.15-alpha.32-phase10-10-release-audit";

export function MonsterCard(monster,inParty=false,{editing=false,selected=false}={}){
  const stats=calculatedStats(monster),personality=PERSONALITIES[monster.personalityId],species=SPECIES[monster.speciesId];
  const protectedMonster=inParty||monster.favorite||monster.locked;
  return`<article class="monster-card ${selected?"selected":""} ${protectedMonster?"protected-entry":""}">
    ${editing?`<label class="manage-check"><input type="checkbox" data-select-monster="${monster.id}" ${selected?"checked":""} ${protectedMonster?"disabled":""}><span></span></label>`:""}
    <div class="monster-orb" style="background:${colorValue(monster)}"><span aria-hidden="true">${species?.emoji??"👹"}</span></div>
    <div>
      <div class="monster-name">${monster.favorite?"★ ":""}${monster.locked?"🔒 ":""}${displayName(monster)}</div>
      <div class="subline">${rankName(monster)} / Lv.${monster.level} +${monster.plus}</div>
      <div class="stars">${"★".repeat(monster.stars)}${"☆".repeat(Math.max(0,5-monster.stars))}</div>
      <div class="subline"><span class="badge">${personality.name}</span> ❤️${monster.affection??0}　HP ${stats.hp} / ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}</div>
    </div>
    ${editing?"":`<button data-monster-id="${monster.id}">詳細</button>`}
  </article>`;
}
