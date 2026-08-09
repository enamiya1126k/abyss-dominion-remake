import{displayName,calculatedStats,colorValue,expNeedFor}from"../../models/Monster.js?v=2.2.1-hotfix";
import{learnedSkills,maxMp,skillElementLabel,effectiveSkillMpCost}from"../../battle/SkillSystem.js?v=2.2.1-hotfix";
import{cooldownRemaining,statusLabel,enemyStatusesFor,allyAilmentsFor,allyEffectsFor,enemyEffectsFor}from"../../battle/BattleRules.js?v=2.2.1-hotfix";
import{currentAlly,currentTurnEntry,aliveEnemies,selectedEnemy}from"../../battle/TurnSystem.js?v=2.2.1-hotfix";
import{monsterVisual}from"../MonsterVisual.js?v=2.2.1-hotfix";
import{pixelIcon,itemIcon}from"../components/GameChrome.js?v=2.2.1-hotfix";
import{attributeVisual}from"../components/AttributeVisual.js?v=2.2.1-hotfix";
import{normalizeBattleSpeed}from"../../core/config.js?v=2.2.1-hotfix";

function renderTurnOrder(battle){
 return (battle.turnQueue??[]).map((entry,index)=>{
  const shortName=entry.name.length>6?entry.name.slice(0,6)+"…":entry.name;
  const classes=["turn-chip",entry.type,index===battle.queueIndex?"current":"",index<battle.queueIndex?"done":""].filter(Boolean).join(" ");
  return `<span class="${classes}"><b>${shortName}</b><small>SPD ${entry.spd}</small></span>`;
 }).join("");
}

function renderEnemies(battle,enemies,target){
 return enemies.map((enemy,index)=>{
  const statuses=enemyStatusesFor(battle,enemy.id),effects=enemyEffectsFor(battle,enemy.id);
  const statusHtml=`<div class="status-row enemy-status-row" ${statuses.length||effects.length?"":'aria-hidden="true"'}>${statuses.map(s=>`<span class="status-chip ${s.id}">${statusLabel(s)}</span>`).join("")}${effects.map(e=>`<span class="status-chip ${e.kind}">${({atkDown:"攻撃↓",defDown:"防御↓",spdDown:"速度↓",stun:"行動不能"})[e.kind]??e.kind} ${e.turns}T</span>`).join("")}</div>`;
  const badge=enemy.boss?'<span class="boss-badge">BOSS</span>':enemy.elite?`<span class="elite-badge">${enemy.eliteAffixIcon??"🜲"} ELITE・${enemy.eliteAffixName??"変異"}</span>`:"";const danger="";
  const hpRate=Math.max(0,Math.min(100,enemy.hp/Math.max(1,enemy.maxHp)*100));
  const line=index<2?"front-line":"rear-line";
  const dead=enemy.hp<=0,element=enemy.trialElement??enemy.element??battle.species?.[enemy.speciesId]?.element??"neutral";
  return `<button id="enemy-${enemy.id}" ${dead?'disabled aria-hidden="true"':`data-enemy-target="${enemy.id}"`} style="--formation-index:${index};--unit-color:${enemy.color}" class="combatant enemy-combatant side-battle-unit formation-slot-${index+1} ${line} ${dead?"dead":""} ${enemy.boss?"boss-enemy":""} ${enemy.elite?"elite-enemy":""} ${target?.id===enemy.id?"targeted":""}">
   <span class="target-reticle" aria-hidden="true"></span>
   <div class="side-unit-sprite enemy-orb">${monsterVisual(enemy,enemy.emoji??"👾",{frame:enemy.hp<=0?"down":"idle",className:"battle-enemy-visual"})}</div>
   <div class="side-unit-card enemy-info">
    <div class="side-unit-name enemy-name">${badge}${danger}<b>${enemy.name}</b><small>Lv.${enemy.level}</small><i class="unit-attribute-logo">${attributeVisual(element,{label:`${element}属性`})}</i></div>
    <div class="side-unit-intent enemy-intent"><span>次の行動</span><b>${enemy.intent}${enemy.enraged?"・狂暴化":""}</b></div>
    <div class="battle-bar enemy-hp"><span class="bar-label">HP ${enemy.hp}/${enemy.maxHp}</span><i style="width:${hpRate}%"></i></div>
    ${enemy.elite?`<small class="elite-description">${enemy.eliteDescription??"第二世界で変異した強敵"}</small>`:""}
    ${statusHtml}
   </div>
  </button>`;
 }).join("");
}

function renderParty(battle,actor){
 return battle.party.map((m,index)=>{
 const stats=calculatedStats(m),mp=maxMp(m),need=expNeedFor(m);
  const ailments=allyAilmentsFor(battle,m.id),effects=allyEffectsFor(battle,m.id),effectHtml=`<div class="status-row ally-status-row" ${ailments.length||effects.length?"":'aria-hidden="true"'}>${ailments.map(e=>`<span class="status-chip ${e.id}">${statusLabel(e)}・持続</span>`).join("")}${effects.map(e=>`<span class="status-chip ${e.kind}">${({taunt:"挑発",guard:"防御",counter:"反撃",atkUp:"攻撃↑",defUp:"防御↑",spdUp:"速度↑",regen:"再生",lifeSteal:"吸収"})[e.kind]??e.kind} ${e.turns}T</span>`).join("")}</div>`;
  const hpRate=Math.max(0,Math.min(100,m.currentHp/Math.max(1,stats.hp)*100)),mpRate=Math.max(0,Math.min(100,m.currentMp/Math.max(1,mp)*100));
  const line=index<2?"front-line":"rear-line",element=m.attribute??battle.species?.[m.speciesId]?.element??"neutral";
  return `<button id="ally-${m.id}" data-battle-detail="${m.id}" style="--formation-index:${index};--unit-color:${colorValue(m)}" class="battle-unit combatant side-battle-unit formation-slot-${index+1} ${line} ${actor?.id===m.id?"active":""} ${m.currentHp<=0?"dead":""}">
   <span class="active-turn-marker" aria-hidden="true">TURN</span>
   <div class="side-unit-sprite unit-orb">${monsterVisual(m,battle.species?.[m.speciesId]?.emoji??"●",{frame:m.currentHp<=0?"down":"idle",className:"battle-ally-visual"})}</div>
   <div class="side-unit-card ally-info">
    <div class="side-unit-name unit-head"><b>${displayName(m)}</b><small>Lv.${m.level}</small><i class="unit-attribute-logo">${attributeVisual(element,{label:`${element}属性`})}</i></div>
    <div class="battle-bar ally"><span class="bar-label">HP ${m.currentHp}/${stats.hp}</span><i style="width:${hpRate}%"></i></div>
    <div class="battle-bar mp"><span class="bar-label">MP ${m.currentMp}/${mp}</span><i style="width:${mpRate}%"></i></div>
    <small class="battle-mini-stats">物攻 ${stats.atk}　魔攻 ${stats.matk??stats.atk}<br>物防 ${stats.def}　魔防 ${stats.mdef??stats.def}　SPD ${stats.spd}</small>${effectHtml}
    <div class="battle-exp-row" aria-hidden="true"><small>あと${Math.max(0,need-m.exp)}</small><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/Math.max(1,need)*100)}%"></i></div></div>
   </div>
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
  ["potions",itemIcon("potions"),"薬草","単体HP100＋最大HP10%回復"],
  ["highPotions",itemIcon("highPotions"),"ハイポーション","単体HP300＋最大HP25%回復"],
  ["partyPotions",itemIcon("partyPotions"),"全体回復薬","生存者全員HP50＋最大HP7%回復"],
  ["manaPotions",itemIcon("manaPotions"),"マナポーション","単体MP30＋最大MP10%回復"],
  ["highManaPotions",itemIcon("highManaPotions"),"ハイマナポーション","単体MP100＋最大MP25%回復"],
  ["partyManaPotions",itemIcon("partyManaPotions"),"全体マナポーション","生存者全員MP30＋最大MP7%回復"],
  ["fullManaPotions",itemIcon("fullManaPotions"),"精霊の雫","単体MP全回復"],
  ["partyFullManaPotions",itemIcon("partyFullManaPotions"),"深淵の霊水","生存者全員MP全回復"],
  ["reviveLeaves",itemIcon("reviveLeaves"),"命の葉","戦闘不能者をHP30%で蘇生"],
  ["statusCures",itemIcon("statusCures"),"万能薬・単体","単体の状態異常解除"],
  ["partyStatusCures",itemIcon("partyStatusCures"),"万能薬・全体","全員の状態異常解除"],
  ["fullHeals",itemIcon("fullHeals"),"完全回復薬・単体","HP・MP・異常を全回復"],
  ["partyFullHeals",itemIcon("partyFullHeals"),"完全回復薬・全体","全員を完全回復"]
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
 else if(battle.auto)controls=`<div class="auto-command-wait"><span>${pixelIcon("crossed-swords")}</span><div><b>FULL AUTO 進行中</b><small>戦場をタップ、または上のAUTOボタンで手動操作へ</small></div></div>`;
 else if(battle.skillMenu)controls=renderSkills(battle,actor,skills);
 else if(battle.itemMenu)controls=renderItems(inventory);
 else controls=`<div class="command-grid"><button data-command="attack"><i>${pixelIcon("crossed-swords")}</i><span>たたかう</span></button><button data-command="guard"><i>${pixelIcon("equipment")}</i><span>ガード</span></button><button data-command="skill"><i>${pixelIcon("skills")}</i><span>スキル</span></button><button data-command="item"><i>${pixelIcon("growth")}</i><span>アイテム</span></button><button data-command="capture"><i>${pixelIcon("capture")}</i><span>捕獲</span></button></div>`;
 return `<div class="battle-command ${battle.auto?"is-auto":""}"><div class="battle-command-head spread"><h2>${title}</h2><span class="muted">${pixelIcon("capture")} 捕獲結晶 ${inventory.captureCrystals}</span></div>${targetHelp}${controls}</div>`;
}

export function BattleScreen(battle,inventory,settings,floor=1){
 const actor=currentAlly(battle),current=currentTurnEntry(battle),livingEnemies=aliveEnemies(battle),enemies=battle.enemies??[],target=selectedEnemy(battle),skills=actor?learnedSkills(actor):[];
 const special=battle.specialBattle?`<div class="special-battle-strip ${battle.specialBattleType}"><b>${battle.specialTitle??"SPECIAL BATTLE"}</b><small>${battle.specialSubtitle??"敗北ペナルティなし"}</small></div>`:"";
 const floorBand=Math.max(1,Math.min(20,Math.floor((Math.max(1,Number(floor)||1)-1)/50)+1));
 const speed=normalizeBattleSpeed(settings.battleSpeed),scaled=ms=>`${Math.max(1,Math.round(ms/speed))}ms`;
 const timingStyle=`--battle-lunge:${scaled(220)};--battle-skill-lunge:${scaled(300)};--battle-hit:${scaled(260)};--battle-critical-hit:${scaled(300)};--battle-defeat:${scaled(500)};--battle-float:${scaled(550)};--battle-banner-in:${scaled(280)};--battle-banner-out:${scaled(220)};--battle-flash:${scaled(380)};--battle-particle:${scaled(720)}`;
 const theme=String(battle.battleTheme??"default").replace(/[^a-z0-9-]/gi,"");
 const biomeBadge=battle.biomeBattle?`<div class="battle-biome-badge" style="--biome-accent:${battle.biomeBattle.accent}"><b>${battle.biomeBattle.name}</b><small>適性 +22% / 不適性 −16%</small></div>`:"";
 return `<section class="battle-screen side-battle-v2 battle-theme-${theme} ${battle.auto?"auto-mode":"manual-mode"} ${battle.specialBattle?"special-battle":""}" data-speed="${speed}" style="${timingStyle}" data-floor-band="${floorBand}">${special}
  <div class="battle-header"><div class="round-label"><small>ROUND</small><b>${battle.turn}</b></div><div class="battle-header-title"><b>${battle.specialTitle??`${floor}F・ENCOUNTER`}</b><small>${battle.auto?"FULL AUTO":"COMMAND BATTLE"}</small></div><button id="toggleBattleAuto" class="${battle.auto?"enabled":""}"><span>AUTO</span><b>${battle.auto?"ON":"OFF"}</b></button><button id="battleSpeed">×${speed}</button>${battle.specialBattle?`<button disabled>逃走不可</button>`:`<button id="escapeBattle">逃げる</button>`}</div>
  <div class="turn-order"><span class="turn-order-title">行動順</span>${renderTurnOrder(battle)}</div>
  <div class="battle-arena side-battle-arena multi-enemy">
   <div class="battle-stage-vignette" aria-hidden="true"></div>
   ${biomeBadge}
   <span class="formation-label party-label">ALLY　<span>後衛 ← → 前衛</span></span><span class="formation-label enemy-label"><span>前衛 ← → 後衛</span>　ENEMY</span>
   <div class="battle-party side-party">${renderParty(battle,actor)}</div>
   <div class="battle-clash-line" aria-hidden="true"><span>VS</span></div>
   <div class="enemy-party side-enemies">${renderEnemies(battle,enemies,target)}</div>
   ${battle.auto?'<div class="auto-battle-notice"><b>FULL AUTO</b><small>戦場をタップで手動へ</small></div>':""}
   <div id="battleFxLayer" class="battle-fx-layer"></div>
  </div>
  ${renderCommands(battle,actor,current,livingEnemies,target,inventory,skills)}
  <div class="battle-log">${(battle.log??[]).map(line=>`<div>${line}</div>`).join("")}</div>
 </section>`;
}
