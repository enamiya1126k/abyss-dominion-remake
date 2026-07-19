import{displayName,calculatedStats,colorValue,expNeedFor}from"../../models/Monster.js";
import{learnedSkills,maxMp}from"../../battle/SkillSystem.js";
import{cooldownRemaining,statusLabel,enemyStatusesFor}from"../../battle/BattleRules.js";
import{currentAlly,currentTurnEntry,aliveEnemies,selectedEnemy}from"../../battle/TurnSystem.js";

function renderTurnOrder(battle){
 return (battle.turnQueue??[]).map((entry,index)=>{
  const shortName=entry.name.length>6?entry.name.slice(0,6)+"…":entry.name;
  const classes=["turn-chip",entry.type,index===battle.queueIndex?"current":"",index<battle.queueIndex?"done":""].filter(Boolean).join(" ");
  return `<span class="${classes}"><b>${shortName}</b><small>SPD ${entry.spd}</small></span>`;
 }).join("");
}

function renderEnemies(battle,enemies,target){
 return enemies.map(enemy=>{
  const statuses=enemyStatusesFor(battle,enemy.id);
  const statusHtml=statuses.length?`<div class="status-row">${statuses.map(s=>`<span class="status-chip ${s.id}">${statusLabel(s)}</span>`).join("")}</div>`:"";
  const badge=enemy.boss?'<span class="boss-badge">BOSS</span>':"";
  return `<button id="enemy-${enemy.id}" data-enemy-target="${enemy.id}" class="combatant enemy-combatant ${target?.id===enemy.id?"targeted":""}">
   <div class="enemy-name">${badge}${enemy.name} Lv.${enemy.level}</div>
   <div class="enemy-intent">${enemy.intent}${enemy.enraged?"・狂暴化":""}</div>
   ${statusHtml}
   <div class="enemy-orb" style="background:${enemy.color}"><span>${enemy.emoji??"👾"}</span></div>
   <div class="battle-bar"><i style="width:${enemy.hp/enemy.maxHp*100}%"></i></div>
   <div class="battle-hp">${enemy.hp}/${enemy.maxHp}</div>
  </button>`;
 }).join("");
}

function renderParty(battle,actor){
 return battle.party.map(m=>{
  const stats=calculatedStats(m),mp=maxMp(m),need=expNeedFor(m);
  return `<button id="ally-${m.id}" data-battle-detail="${m.id}" class="battle-unit combatant ${actor?.id===m.id?"active":""} ${m.currentHp<=0?"dead":""}">
   <div class="unit-head"><span class="unit-orb" style="background:${colorValue(m)}">${battle.species?.[m.speciesId]?.emoji??"●"}</span><b>${displayName(m)} Lv.${m.level}</b></div>
   <div class="battle-bar ally"><span class="bar-label">HP ${m.currentHp}/${stats.hp}</span><i style="width:${Math.max(0,m.currentHp/stats.hp*100)}%"></i></div>
   <div class="battle-bar mp"><span class="bar-label">MP ${m.currentMp}/${mp}</span><i style="width:${Math.max(0,m.currentMp/mp*100)}%"></i></div>
   <small class="battle-mini-stats">ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}</small>
   <div class="battle-exp-row"><small>あと${Math.max(0,need-m.exp)}</small><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/need*100)}%"></i></div></div>
  </button>`;
 }).join("");
}

function renderSkills(battle,actor,skills){
 const rows=skills.map(skill=>{
  const cd=cooldownRemaining(battle,actor.id,skill.id),disabled=actor.currentMp<skill.mp||cd>0;
  const cost=cd>0?`CD ${cd}`:`MP ${skill.mp}`;
  return `<button data-skill-id="${skill.id}" ${disabled?"disabled":""}><span><b>${skill.name}</b><small>${skill.description}</small></span><strong>${cost}</strong></button>`;
 }).join("");
 return `<div class="skill-command-list">${rows}<button id="closeSkillMenu" class="secondary">戻る</button></div>`;
}

function renderItems(inventory){
 const defs=[
  ["potions","❤️","単体回復薬","HP100回復"],
  ["partyPotions","💚","全体回復薬","全員HP50回復"],
  ["statusCures","🩹","状態異常回復・単体","単体の異常解除"],
  ["partyStatusCures","💨","状態異常回復・全体","全員の異常解除"],
  ["fullHeals","✨","完全回復薬・単体","HP・MP・異常を全回復"],
  ["partyFullHeals","🌟","完全回復薬・全体","全員を完全回復"]
 ];
 const rows=defs.filter(d=>(inventory[d[0]]??0)>0).map(([id,icon,name,desc])=>`<button data-battle-item="${id}"><span><b>${icon} ${name}</b><small>${desc}</small></span><strong>×${inventory[id]??0}</strong></button>`).join("");
 const body=rows||'<div class="empty">使用できるアイテムがありません</div>';
 return `<div class="skill-command-list battle-item-list">${body}<button id="closeItemMenu" class="secondary">戻る</button></div>`;
}

function renderCommands(battle,actor,current,enemies,target,inventory,skills){
 const title=actor?`${displayName(actor)}の行動`:current?.type==="enemy"?`${(battle.enemies??[]).find(e=>e.id===current.id)?.name??"敵"}が行動中`:"ラウンド処理中";
 const targetHelp=actor&&enemies.length>1?`<small class="target-help">攻撃対象：${target?.name??"なし"}（敵をタップして変更）</small>`:"";
 let controls;
 if(!actor)controls='<div class="enemy-thinking">敵の行動を処理しています…</div>';
 else if(battle.skillMenu)controls=renderSkills(battle,actor,skills);
 else if(battle.itemMenu)controls=renderItems(inventory);
 else controls='<div class="command-grid"><button data-command="attack">たたかう</button><button data-command="guard">ガード</button><button data-command="skill">スキル</button><button data-command="item">アイテム</button><button data-command="capture">捕獲</button></div>';
 return `<div class="battle-command"><div class="spread"><h2>${title}</h2><span class="muted">捕獲結晶 ${inventory.captureCrystals}</span></div>${targetHelp}${controls}</div>`;
}

export function BattleScreen(battle,inventory,settings){
 const actor=currentAlly(battle),current=currentTurnEntry(battle),enemies=aliveEnemies(battle),target=selectedEnemy(battle),skills=actor?learnedSkills(actor):[];
 return `<section class="battle-screen" data-speed="${settings.battleSpeed}">
  <div class="battle-header"><div class="round-label"><small>ROUND</small><b>${battle.turn}</b></div><button id="toggleBattleAuto">AUTO ${battle.auto?"ON":"OFF"}</button><button id="battleSpeed">×${settings.battleSpeed}</button><button id="escapeBattle">逃げる</button></div>
  <div class="turn-order"><span class="turn-order-title">行動順</span>${renderTurnOrder(battle)}</div>
  <div class="battle-arena multi-enemy"><div class="enemy-party">${renderEnemies(battle,enemies,target)}</div><div class="battle-party">${renderParty(battle,actor)}</div><div id="battleFxLayer" class="battle-fx-layer"></div></div>
  ${renderCommands(battle,actor,current,enemies,target,inventory,skills)}
  <div class="battle-log">${(battle.log??[]).map(line=>`<div>${line}</div>`).join("")}</div>
 </section>`;
}
