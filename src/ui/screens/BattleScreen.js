import{displayName,calculatedStats,colorValue}from"../../models/Monster.js";
import{learnedSkills,maxMp}from"../../battle/SkillSystem.js";

export function BattleScreen(battle,inventory,settings){
 const alive=battle.party.filter(m=>m.currentHp>0);
 const actor=alive.length?alive[battle.actorIndex%alive.length]:null;
 const enemy=battle.enemy;
 const skills=actor?learnedSkills(actor):[];
 return`
 <section class="battle-screen" data-speed="${settings.battleSpeed}">
  <div class="battle-header">
   <div>TURN <b>${battle.turn}</b></div>
   <button id="toggleBattleAuto">AUTO ${battle.auto?"ON":"OFF"}</button>
   <button id="battleSpeed">×${settings.battleSpeed}</button>
   <button id="escapeBattle">逃げる</button>
  </div>
  <div class="battle-arena">
   <div id="enemyActor" class="combatant enemy-combatant">
    <div class="enemy-name">${enemy.boss?'<span class="boss-badge">BOSS</span>':""}${enemy.name} Lv.${enemy.level}</div><div class="enemy-intent">${enemy.intent}${enemy.enraged?"・狂暴化":""}</div>
    <div class="enemy-orb" style="background:${enemy.color}"></div>
    <div class="battle-bar"><i style="width:${enemy.hp/enemy.maxHp*100}%"></i></div>
    <div class="battle-hp">${enemy.hp}/${enemy.maxHp}</div>
   </div>
   <div class="battle-party">
    ${battle.party.map(m=>{const stats=calculatedStats(m),mp=maxMp(m);return`<div id="ally-${m.id}" class="battle-unit combatant ${actor?.id===m.id?"active":""} ${m.currentHp<=0?"dead":""}">
      <div class="unit-head"><span class="unit-orb" style="background:${colorValue(m)}"></span><b>${displayName(m)} Lv.${m.level}</b></div>
      <small>HP ${m.currentHp}/${stats.hp}</small><div class="battle-bar ally"><i style="width:${Math.max(0,m.currentHp/stats.hp*100)}%"></i></div>
      <small class="mp-label">MP ${m.currentMp}/${mp}</small><div class="battle-bar mp"><i style="width:${Math.max(0,m.currentMp/mp*100)}%"></i></div>
     </div>`}).join("")}
   </div>
   <div id="battleFxLayer" class="battle-fx-layer"></div>
  </div>
  <div class="battle-command">
   <div class="spread"><h2>${actor?displayName(actor):"全滅"}のターン</h2><span class="muted">捕獲結晶 ${inventory.captureCrystals}</span></div>
   ${battle.skillMenu?`<div class="skill-command-list">${skills.map(skill=>`<button data-skill-id="${skill.id}" ${actor.currentMp<skill.mp?"disabled":""}><span><b>${skill.name}</b><small>${skill.description}</small></span><strong>MP ${skill.mp}</strong></button>`).join("")}<button id="closeSkillMenu" class="secondary">戻る</button></div>`:`<div class="command-grid"><button data-command="attack">たたかう</button><button data-command="guard">ガード</button><button data-command="skill">スキル</button><button data-command="item">アイテム</button><button data-command="capture">捕獲</button></div>`}
  </div>
 </section>`;
}
