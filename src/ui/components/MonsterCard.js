import{displayName,rankName,colorValue,calculatedStats}from"../../models/Monster.js?v=0.9.2-alpha.2";
import{PERSONALITIES}from"../../data/personalities.js?v=0.9.2-alpha.2";

export function MonsterCard(monster,inParty=false){
  const stats=calculatedStats(monster);
  const personality=PERSONALITIES[monster.personalityId];
  return`
    <article class="monster-card">
      <div class="monster-orb" style="background:${colorValue(monster)}"></div>
      <div>
        <div class="monster-name">${inParty?"🟢 出撃 ":""}${monster.favorite?"★ ":""}${displayName(monster)}</div>
        <div class="subline">${rankName(monster)} / Lv.${monster.level} +${monster.plus}</div>
        <div class="stars">${"★".repeat(monster.stars)}${"☆".repeat(Math.max(0,5-monster.stars))}</div>
        <div class="subline">
          <span class="badge">${personality.name}</span>
          HP ${stats.hp} / ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}
        </div>
      </div>
      <button data-monster-id="${monster.id}">詳細</button>
    </article>
  `;
}
