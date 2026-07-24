import{displayName,calculatedStats,colorValue,expNeedFor}from"../../models/Monster.js?v=1.3.0";
import{learnedSkills,maxMp,skillElementLabel,effectiveSkillMpCost}from"../../battle/SkillSystem.js?v=1.3.0";
import{cooldownRemaining,statusLabel,enemyStatusesFor,allyEffectsFor,enemyEffectsFor}from"../../battle/BattleRules.js?v=0.9.15-alpha.95.1-stability-audit";
import{currentAlly,currentTurnEntry,aliveEnemies,selectedEnemy}from"../../battle/TurnSystem.js?v=1.3.0";

function renderTurnOrder(battle){
 return (battle.turnQueue??[]).map((entry,index)=>{
  const shortName=entry.name.length>6?entry.name.slice(0,6)+"…":entry.name;
  const classes=["turn-chip",entry.type,index===battle.queueIndex?"current":"",index<battle.queueIndex?"done":""].filter(Boolean).join(" ");
  return `<span class="${classes}"><b>${shortName}</b><small>SPD ${entry.spd}</small></span>`;
 }).join("");
}

function renderEnemies(battle,enemies,target){
 return enemies.map(enemy=>{
  const statuses=enemyStatusesFor(battle,enemy.id),effects=enemyEffectsFor(battle,enemy.id);
  const statusHtml=`<div class="status-row enemy-status-row" ${statuses.length||effects.length?"":'aria-hidden="true"'}>${statuses.map(s=>`<span class="status-chip ${s.id}">${statusLabel(s)}</span>`).join("")}${effects.map(e=>`<span class="status-chip ${e.kind}">${({atkDown:"攻撃↓",defDown:"防御↓",spdDown:"速度↓",stun:"行動不能"})[e.kind]??e.kind} ${e.turns}T</span>`).join("")}</div>`;
  const badge=enemy.boss?'<span class="boss-badge">BOSS</span>':enemy.elite?`<span class="elite-badge">${enemy.eliteAffixIcon??"🜲"} ELITE・${enemy.eliteAffixName??"変異"}</span>`:"";const danger="";
  return `<button id="enemy-${enemy.id}" data-enemy-target="${enemy.id}" class="combatant enemy-combatant ${enemy.elite?"elite-enemy":""} ${target?.id===enemy.id?"targeted":""}">
   <div class="enemy-info">
    <div class="enemy-name">${badge}${danger}${enemy.name} Lv.${enemy.level}</div>
    <div class="enemy-intent">${enemy.intent}${enemy.enraged?"・狂暴化":""}</div>
    ${enemy.elite?`<small class="elite-description">${enemy.eliteDescription??"第二世界で変異した強敵"}</small>`:""}
    ${statusHtml}
   </div>
   <div class="enemy-orb" style="background:${enemy.color}"><span>${enemy.emoji??"👾"}</span></div>
   <div class="enemy-vitals">
    <div class="battle-bar"><i style="width:${enemy.hp/enemy.maxHp*100}%"></i></div>
    <div class="battle-hp">${enemy.hp}/${enemy.maxHp}</div>
   </div>
  </button>`;
 }).join("");
}

function renderParty(battle,actor){
 return battle.party.map(m=>{
 const stats=calculatedStats(m),mp=maxMp(m),need=expNeedFor(m);
  const effects=allyEffectsFor(battle,m.id),effectHtml=`<div class="status-row ally-status-row" ${effects.length?"":'aria-hidden="true"'}>${effects.map(e=>`<span class="status-chip ${e.kind}">${({taunt:"挑発",guard:"防御",counter:"反撃",atkUp:"攻撃↑",defUp:"防御↑",spdUp:"速度↑",regen:"再生",lifeSteal:"吸収"})[e.kind]??e.kind} ${e.turns}T</span>`).join("")}</div>`;
  return `<button id="ally-${m.id}" data-battle-detail="${m.id}" class="battle-unit combatant ${actor?.id===m.id?"active":""} ${m.currentHp<=0?"dead":""}">
   <div class="unit-head"><span class="unit-orb" style="background:${colorValue(m)}">${battle.species?.[m.speciesId]?.emoji??"●"}</span><b>${displayName(m)} Lv.${m.level}</b></div>
   <div class="battle-bar ally"><span class="bar-label">HP ${m.currentHp}/${stats.hp}</span><i style="width:${Math.max(0,m.currentHp/stats.hp*100)}%"></i></div>
   <div class="battle-bar mp"><span class="bar-label">MP ${m.currentMp}/${mp}</span><i style="width:${Math.max(0,m.currentMp/mp*100)}%"></i></div>
   <small class="battle-mini-stats">ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}</small>${effectHtml}
   <div class="battle-exp-row"><small>あと${Math.max(0,need-m.exp)}</small><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/need*100)}%"></i></div></div>
  </button>`;
 }).join("");
}

function renderSkills(battle,actor,skills){
 const rows=skills.map(skill=>{
  const cd=cooldownRemaining(battle,actor.id,skill.id),mpCost=effectiveSkillMpCost(actor,skill),disabled=actor.currentMp<mpCost||cd>0;
  const cost=cd>0?`CD ${cd}`:`MP ${mpCost}`;
  return `<button data-skill-id="${skill.id}" ${disabled?"disabled":""}><span><b>${skill.name}</b><small>${skill.tag??"スキル"}・${skill.target??"敵単体"}・${skillElementLabel(skill)}属性</small><small>${skill.description}</small></span><strong>${cost}</strong></button>`;
 }).join("");
 return `<div class="skill-command-list">${rows}<button id="closeSkillMenu" class="secondary">戻る</button></div>`;
}

function renderItems(inventory){
 const defs=[
  ["potions","🌿","薬草","単体HP100＋最大HP10%回復"],
  ["highPotions","🧪","ハイポーション","単体HP300＋最大HP25%回復"],
  ["partyPotions","💚","全体回復薬","生存者全員HP50＋最大HP7%回復"],
  ["manaPotions","💧","マナポーション","単体MP30＋最大MP10%回復"],
  ["highManaPotions","🔷","ハイマナポーション","単体MP100＋最大MP25%回復"],
  ["partyManaPotions","🌊","全体マナポーション","生存者全員MP30＋最大MP7%回復"],
  ["fullManaPotions","💠","精霊の雫","単体MP全回復"],
  ["partyFullManaPotions","🌀","深淵の霊水","生存者全員MP全回復"],
  ["reviveLeaves","🍃","命の葉","戦闘不能者をHP30%で蘇生"],
  ["statusCures","🩹","万能薬・単体","単体の状態異常解除"],
  ["partyStatusCures","💨","万能薬・全体","全員の状態異常解除"],
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
 const special=battle.specialBattle?`<div class="special-battle-strip ${battle.specialBattleType}"><b>${battle.specialTitle??"SPECIAL BATTLE"}</b><small>${battle.specialSubtitle??"敗北ペナルティなし"}</small></div>`:"";
 return `<section class="battle-screen ${battle.specialBattle?"special-battle":""}" data-speed="${settings.battleSpeed}">${special}
  <div class="battle-header"><div class="round-label"><small>ROUND</small><b>${battle.turn}</b></div><button id="toggleBattleAuto">AUTO ${battle.auto?"ON":"OFF"}</button><button id="battleSpeed">×${settings.battleSpeed}</button>${battle.specialBattle?`<button disabled>逃走不可</button>`:`<button id="escapeBattle">逃げる</button>`}</div>
  <div class="turn-order"><span class="turn-order-title">行動順</span>${renderTurnOrder(battle)}</div>
  <div class="battle-arena multi-enemy"><div class="enemy-party">${renderEnemies(battle,enemies,target)}</div><div class="battle-party">${renderParty(battle,actor)}</div><div id="battleFxLayer" class="battle-fx-layer"></div></div>
  ${renderCommands(battle,actor,current,enemies,target,inventory,skills)}
  <div class="battle-log">${(battle.log??[]).map(line=>`<div>${line}</div>`).join("")}</div>
 </section>`;
}
