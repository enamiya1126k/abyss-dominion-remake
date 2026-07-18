import{displayName,calculatedStats,colorValue}from"../../models/Monster.js";
import{learnedSkills,maxMp}from"../../battle/SkillSystem.js";
import{cooldownRemaining,statusLabel}from"../../battle/BattleRules.js";
import{currentAlly,currentTurnEntry}from"../../battle/TurnSystem.js";

export function BattleScreen(battle,inventory,settings){
 const actor=currentAlly(battle);
 const current=currentTurnEntry(battle);
 const enemy=battle.enemy;
 const skills=actor?learnedSkills(actor):[];
 return`
 <section class="battle-screen" data-speed="${settings.battleSpeed}">
  <div class="battle-header">
   <div class="round-label"><small>ROUND</small><b>${battle.turn}</b></div>
   <button id="toggleBattleAuto">AUTO ${battle.auto?"ON":"OFF"}</button>
   <button id="battleSpeed">×${settings.battleSpeed}</button>
   <button id="escapeBattle">逃げる</button>
  </div>
  <div class="turn-order">
   <span class="turn-order-title">行動順</span>
   ${(battle.turnQueue??[]).map((entry,index)=>`<span class="turn-chip ${entry.type} ${index===battle.queueIndex?"current":""} ${index<battle.queueIndex?"done":""}"><b>${entry.name}</b><small>SPD ${entry.spd}</small></span>`).join("")}
  </div>
  <div class="battle-arena">
   <div id="enemyActor" class="combatant enemy-combatant">
    <div class="enemy-name">${enemy.boss?'<span class="boss-badge">BOSS</span>':""}${enemy.name} Lv.${enemy.level}</div><div class="enemy-intent">${enemy.intent}${enemy.enraged?"・狂暴化":""}</div>${(battle.enemyStatuses??[]).length?`<div class="status-row">${battle.enemyStatuses.map(s=>`<span class="status-chip ${s.id}">${statusLabel(s)}</span>`).join("")}</div>`:""}
    <div class="enemy-orb" style="background:${enemy.color}"><span>${enemy.emoji??"👾"}</span></div>
    <div class="battle-bar"><i style="width:${enemy.hp/enemy.maxHp*100}%"></i></div>
    <div class="battle-hp">${enemy.hp}/${enemy.maxHp}</div>
   </div>
   <div class="battle-party">
    ${battle.party.map(m=>{const stats=calculatedStats(m),mp=maxMp(m),need=40+m.level*25;return`<button id="ally-${m.id}" data-battle-detail="${m.id}" class="battle-unit combatant ${actor?.id===m.id?"active":""} ${m.currentHp<=0?"dead":""}">
      <div class="unit-head"><span class="unit-orb" style="background:${colorValue(m)}">${battle.species?.[m.speciesId]?.emoji??"●"}</span><b>${displayName(m)} Lv.${m.level}</b></div>
      <small>HP ${m.currentHp}/${stats.hp}</small><div class="battle-bar ally"><i style="width:${Math.max(0,m.currentHp/stats.hp*100)}%"></i></div>
      <small class="mp-label">MP ${m.currentMp}/${mp}</small><div class="battle-bar mp"><i style="width:${Math.max(0,m.currentMp/mp*100)}%"></i></div>
      <small class="battle-mini-stats">ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}</small>
      <small>EXP ${m.exp}/${need}</small><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/need*100)}%"></i></div>
     </button>`}).join("")}
   </div>
   <div id="battleFxLayer" class="battle-fx-layer"></div>
  </div>
  <div class="battle-command">
   <div class="spread"><h2>${actor?`${displayName(actor)}の行動`:current?.type==="enemy"?`${enemy.name}が行動中`:"ラウンド処理中"}</h2><span class="muted">捕獲結晶 ${inventory.captureCrystals}</span></div>
   ${!actor?`<div class="enemy-thinking">敵の行動を処理しています…</div>`:battle.skillMenu?`<div class="skill-command-list">${skills.map(skill=>{const cd=cooldownRemaining(battle,actor.id,skill.id),disabled=actor.currentMp<skill.mp||cd>0;return`<button data-skill-id="${skill.id}" ${disabled?"disabled":""}><span><b>${skill.name}</b><small>${skill.description}</small></span><strong>${cd>0?`CD ${cd}`:`MP ${skill.mp}`}</strong></button>`}).join("")}<button id="closeSkillMenu" class="secondary">戻る</button></div>`:`<div class="command-grid"><button data-command="attack">たたかう</button><button data-command="guard">ガード</button><button data-command="skill">スキル</button><button data-command="item">アイテム</button><button data-command="capture">捕獲</button></div>`}
  </div><div class="battle-log">${(battle.log??[]).map(line=>`<div>${line}</div>`).join("")}</div>
 </section>`;
}
