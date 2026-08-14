import{displayName,calculatedStats,colorValue,expNeedFor}from"../../models/Monster.js?v=2.6.2";
import{learnedSkills,maxMp,skillElementLabel,effectiveSkillMpCost}from"../../battle/SkillSystem.js?v=2.6.2";
import{cooldownRemaining,statusLabel,enemyStatusesFor,allyAilmentsFor,allyEffectsFor,enemyEffectsFor}from"../../battle/BattleRules.js?v=2.6.2";
import{currentAlly,currentTurnEntry,aliveEnemies,selectedEnemy}from"../../battle/TurnSystem.js?v=2.6.2";
import{monsterVisual}from"../MonsterVisual.js?v=2.6.2";
import{pixelIcon,itemIcon}from"../components/GameChrome.js?v=2.6.2";
import{attributeVisual}from"../components/AttributeVisual.js?v=2.6.2";
import{normalizeBattleSpeed}from"../../core/config.js?v=2.6.2";

function renderTurnOrder(battle){
 return (battle.turnQueue??[]).map((entry,index)=>{
  const classes=["turn-chip",entry.type,index===battle.queueIndex?"current":"",index<battle.queueIndex?"done":""].filter(Boolean).join(" ");
  return `<span class="${classes}" title="${entry.name}"><b>${entry.name}</b><small>速度 ${entry.spd}</small></span>`;
 }).join("");
}
function growthText(unit){const stars=Math.max(1,Number(unit?.stars??unit?.sourceStars)||1),plus=Math.max(0,Number(unit?.plus??unit?.sourcePlus)||0);return`${stars<=5?"★".repeat(stars):`★${stars}`} ・ +${plus}`}
const BATTLE_ROLE_LABELS={balanced:"万能型",burst:"高火力型",controller:"妨害型",support:"支援型",speed:"高速型",tank:"防御型",healer:"回復型",magic:"魔法型",physical:"物理型",debuffer:"弱体型",poison:"毒撃型",burner:"炎撃型"};
const BATTLE_EFFECT_LABELS={atkDown:"攻撃↓",defDown:"防御↓",spdDown:"速度↓",stun:"行動不能",vulnerable:"被ダメージ増加",taunt:"挑発",guard:"防御",counter:"反撃",atkUp:"攻撃↑",defUp:"防御↑",spdUp:"速度↑",regen:"再生",lifeSteal:"吸収"};
function battleRoleLabel(role){return BATTLE_ROLE_LABELS[String(role??"balanced").toLowerCase()]??String(role??"万能型")}
function battleEffectLabel(effect){return BATTLE_EFFECT_LABELS[effect?.kind]??effect?.name??String(effect?.kind??"効果")}
function battleStatusLabel(status){const labels={poison:"毒",burn:"炎上",bleed:"出血",curse:"呪い",paralysis:"麻痺",freeze:"凍結",shock:"感電",sleep:"睡眠",charm:"魅了",confusion:"混乱",fear:"恐怖"};return labels[status?.id]??status?.name??statusLabel(status)}
function remainingTurns(turns,persistent=false){const value=Math.max(0,Number(turns)||0);return value?` 残${value}`:persistent?"・持続":""}
const INVINCIBLE_ALLIANCE_IDS=Object.freeze(["myth_enami","myth_rion","myth_yori","myth_hide"]);
function invincibleAllianceActive(battle){const ids=new Set((battle.party??[]).map(monster=>monster.speciesId));return INVINCIBLE_ALLIANCE_IDS.every(id=>ids.has(id))}
function hpBar(battle,id,rate,label,tone){
 const normalized=Math.max(0,Math.min(100,Number(rate)||0)),trail=battle.hpTrails?.[id],elapsed=trail?Math.max(0,Date.now()-(Number(trail.startedAt)||0)):Infinity,duration=Math.max(1,Number(trail?.duration)||1400),from=Math.max(normalized,Number(trail?.from)||normalized),active=Boolean(trail&&elapsed<duration&&from>normalized);
 const timing=active?` style="--hp-from:${from.toFixed(3)}%;--hp-to:${normalized.toFixed(3)}%;--hp-trail-duration:${duration}ms;--hp-trail-delay:-${Math.min(elapsed,duration)}ms"`:"";
 const afterimage=active?'<i class="hp-trail" aria-hidden="true"></i>':"";
 return`<div class="battle-bar ${tone} ${active?"has-hp-trail":""}"${timing}>${afterimage}<i class="hp-fill ${active?"hp-fill-draining":""}" style="width:${normalized}%"></i><span class="bar-label">${label}</span></div>`;
}

function renderEnemies(battle,enemies,target){
 return enemies.map((enemy,index)=>{
  const statuses=enemyStatusesFor(battle,enemy.id),effects=enemyEffectsFor(battle,enemy.id);
  const statusHtml=`<div class="status-row enemy-status-row" data-status-detail="${enemy.id}" ${statuses.length||effects.length?"":'aria-hidden="true"'}>${statuses.map(s=>`<span class="status-chip ${s.id}">${battleStatusLabel(s)}${remainingTurns(s.turns)}</span>`).join("")}${effects.map(e=>`<span class="status-chip ${e.kind}">${battleEffectLabel(e)}${remainingTurns(e.turns)}</span>`).join("")}</div>`;
  const badge=enemy.boss?'<span class="boss-badge">ボス</span>':enemy.elite?`<span class="elite-badge">${enemy.eliteAffixIcon??"🜲"} 強敵・${enemy.eliteAffixName??"変異"}</span>`:"";const danger="";
  const hpRate=Math.max(0,Math.min(100,enemy.hp/Math.max(1,enemy.maxHp)*100));
  const line=index<2?"front-line":"rear-line";
  const dead=enemy.hp<=0,element=enemy.trialElement??enemy.element??battle.species?.[enemy.speciesId]?.element??"neutral";
  return `<button id="enemy-${enemy.id}" ${dead?'disabled aria-hidden="true"':`data-enemy-target="${enemy.id}"`} style="--formation-index:${index};--unit-color:${enemy.color}" class="combatant enemy-combatant side-battle-unit formation-slot-${index+1} ${line} ${dead?"dead":""} ${enemy.boss?"boss-enemy":""} ${enemy.elite?"elite-enemy":""} ${target?.id===enemy.id?"targeted":""}">
   <span class="target-reticle" aria-hidden="true"></span>
   <span class="battle-unit-floating-name">${badge}<b>${enemy.name}</b></span>
   <div class="side-unit-sprite enemy-orb">${monsterVisual(enemy,enemy.emoji??"👾",{frame:enemy.hp<=0?"down":"idle",className:"battle-enemy-visual"})}</div>
   <div class="side-unit-card enemy-info">
    <div class="side-unit-name enemy-name">${danger}<small>Lv.${enemy.level}</small><em class="battle-unit-growth">${growthText(enemy)}</em><i class="unit-attribute-logo">${attributeVisual(element,{label:`${element}属性`})}</i></div>
    <div class="side-unit-intent enemy-intent"><span>戦闘特性</span><b>${enemy.enraged?"狂暴化・":""}${battleRoleLabel(enemy.role)}</b></div>
    ${hpBar(battle,`enemy:${enemy.id}`,hpRate,`HP ${enemy.hp}/${enemy.maxHp}`,"enemy-hp")}
    ${enemy.elite?`<small class="elite-description">${enemy.eliteDescription??"第二世界で変異した強敵"}</small>`:""}
    ${statusHtml}
   </div>
  </button>`;
 }).join("");
}

function renderParty(battle,actor){
 return battle.party.map((m,index)=>{
 const stats=calculatedStats(m),mp=maxMp(m),need=expNeedFor(m);
 const ailments=allyAilmentsFor(battle,m.id),effects=allyEffectsFor(battle,m.id),effectHtml=`<div class="status-row ally-status-row" data-status-detail="${m.id}" ${ailments.length||effects.length?"":'aria-hidden="true"'}>${ailments.map(e=>`<span class="status-chip ${e.id}">${battleStatusLabel(e)}${remainingTurns(e.turns,true)}</span>`).join("")}${effects.map(e=>`<span class="status-chip ${e.kind}">${battleEffectLabel(e)}${remainingTurns(e.turns)}</span>`).join("")}</div>`;
  const hpRate=Math.max(0,Math.min(100,m.currentHp/Math.max(1,stats.hp)*100)),mpRate=Math.max(0,Math.min(100,m.currentMp/Math.max(1,mp)*100));
  const line=index<2?"front-line":"rear-line",element=m.attribute??battle.species?.[m.speciesId]?.element??"neutral";
  return `<button id="ally-${m.id}" data-battle-detail="${m.id}" style="--formation-index:${index};--unit-color:${colorValue(m)}" class="battle-unit combatant side-battle-unit formation-slot-${index+1} ${line} ${actor?.id===m.id?"active":""} ${m.currentHp<=0?"dead":""}">
   <span class="active-turn-marker" aria-hidden="true">行動中</span>
   <span class="battle-unit-floating-name"><b>${displayName(m)}</b></span>
   <div class="side-unit-sprite unit-orb">${battle.magicCircleArt?.[m.id]??""}${monsterVisual(m,battle.species?.[m.speciesId]?.emoji??"●",{frame:m.currentHp<=0?"down":"idle",className:"battle-ally-visual"})}</div>
   <div class="side-unit-card ally-info">
    <div class="side-unit-name unit-head"><small>Lv.${m.level}</small><em class="battle-unit-growth">${growthText(m)}</em><i class="unit-attribute-logo">${attributeVisual(element,{label:`${element}属性`})}</i></div>
    ${hpBar(battle,`ally:${m.id}`,hpRate,`HP ${m.currentHp}/${stats.hp}`,"ally")}
    <div class="battle-bar mp"><span class="bar-label">MP ${m.currentMp}/${mp}</span><i style="width:${mpRate}%"></i></div>
    <small class="battle-mini-stats">物攻 ${stats.atk}　魔攻 ${stats.matk??stats.atk}<br>物防 ${stats.def}　魔防 ${stats.mdef??stats.def}　速度 ${stats.spd}</small>${effectHtml}
    <div class="battle-exp-row" aria-hidden="true"><small>あと${Math.max(0,need-m.exp)}</small><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/Math.max(1,need)*100)}%"></i></div></div>
   </div>
  </button>`;
 }).join("");
}

function renderSkills(battle,actor,skills){
 const rows=skills.map(skill=>{
  const cd=cooldownRemaining(battle,actor.id,skill.id),mpCost=effectiveSkillMpCost(actor,skill),disabled=actor.currentMp<mpCost||cd>0;
  const cost=cd>0?`再使用 ${cd}`:`MP ${mpCost}`;
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
 else if(battle.auto)controls=`<div class="auto-command-wait"><span>${pixelIcon("crossed-swords")}</span><div><b>完全自動戦闘 進行中</b><small>戦場をタップ、または上の自動ボタンで手動操作へ</small></div></div>`;
 else if(battle.skillMenu)controls=renderSkills(battle,actor,skills);
 else if(battle.itemMenu)controls=renderItems(inventory);
 else{const blocked=Boolean(target&&(target.uncapturable||target.endgameBossId||["abyss","tenGod"].includes(target.faction)));controls=`<div class="command-grid"><button data-command="attack"><i>${pixelIcon("crossed-swords")}</i><span>たたかう</span></button><button data-command="guard"><i>${pixelIcon("equipment")}</i><span>ガード</span></button><button data-command="skill"><i>${pixelIcon("skills")}</i><span>スキル</span></button><button data-command="item"><i>${pixelIcon("growth")}</i><span>アイテム</span></button><button data-command="capture" ${blocked?'disabled aria-label="この敵は捕獲できません"':""}><i>${pixelIcon("capture")}</i><span>${blocked?"捕獲不可":"捕獲"}</span></button></div>`}
 return `<div class="battle-command ${battle.auto?"is-auto":""}"><div class="battle-command-head spread"><h2>${title}</h2><span class="muted">${pixelIcon("capture")} 捕獲結晶 ${inventory.captureCrystals}</span></div>${targetHelp}${controls}</div>`;
}

export function BattleScreen(battle,inventory,settings,floor=1){
 const actor=currentAlly(battle),current=currentTurnEntry(battle),livingEnemies=aliveEnemies(battle),enemies=battle.enemies??[],target=selectedEnemy(battle),skills=actor?learnedSkills(actor):[];
 const special=battle.specialBattle?`<div class="special-battle-strip ${battle.specialBattleType}"><b>${battle.specialTitle??"特別戦"}</b><small>${battle.specialSubtitle??"敗北ペナルティなし"}</small></div>`:"";
 const floorBand=Math.max(1,Math.min(20,Math.floor((Math.max(1,Number(floor)||1)-1)/50)+1));
 const speed=normalizeBattleSpeed(settings.battleSpeed),scaled=ms=>`${Math.max(1,Math.round(ms/speed))}ms`;
 const timingStyle=`--battle-lunge:${scaled(220)};--battle-skill-lunge:${scaled(300)};--battle-hit:${scaled(260)};--battle-critical-hit:${scaled(300)};--battle-defeat:${scaled(500)};--battle-float:1500ms;--battle-banner-in:${scaled(280)};--battle-banner-out:${scaled(220)};--battle-flash:${scaled(380)};--battle-particle:${Math.max(560,Math.round(920/speed))}ms`;
 const theme=String(battle.battleTheme??"default").replace(/[^a-z0-9-]/gi,"");
 const biomeBadge=battle.biomeBattle?`<div class="battle-biome-badge compact" style="--biome-accent:${battle.biomeBattle.accent}"><b>${battle.biomeBattle.name}</b><small>適性+22%・不適性−16%</small></div>`:"";
 const invincibleBadge=invincibleAllianceActive(battle)?'<div class="invincible-alliance-status" role="status" aria-label="無敵・四神話連携が発動中"><span>無敵</span><small>四神話連携・常時発動</small></div>':"";
 return `<section class="battle-screen side-battle-v2 battle-theme-${theme} ${battle.auto?"auto-mode":"manual-mode"} ${battle.specialBattle?"special-battle":""}" data-speed="${speed}" style="${timingStyle}" data-floor-band="${floorBand}">${special}
  <div class="battle-header"><div class="round-label"><small>ラウンド</small><b>${battle.turn}</b></div><div class="battle-header-title"><b>${battle.specialTitle??`${floor}F・遭遇戦`}</b><small>${battle.auto?"完全自動":"コマンド戦闘"}</small></div><button id="toggleBattleAuto" class="${battle.auto?"enabled":""}"><span>自動</span><b>${battle.auto?"有効":"無効"}</b></button><button id="battleSpeed">×${speed}</button>${battle.specialBattle?`<button disabled>逃走不可</button>`:`<button id="escapeBattle">逃げる</button>`}</div>
  <div class="turn-order"><span class="turn-order-title">行動順</span>${renderTurnOrder(battle)}</div>
  <div class="battle-arena side-battle-arena multi-enemy">
   <div class="battle-stage-vignette" aria-hidden="true"></div>
   ${biomeBadge}
   ${invincibleBadge}
   <span class="formation-label party-label">味方　<span>後衛 ← → 前衛</span></span><span class="formation-label enemy-label"><span>前衛 ← → 後衛</span>　敵</span>
   <div class="battle-party side-party">${renderParty(battle,actor)}</div>
   <div class="battle-clash-line" aria-hidden="true"><span>対</span></div>
   <div class="enemy-party side-enemies">${renderEnemies(battle,enemies,target)}</div>
   <div id="battleFxLayer" class="battle-fx-layer"></div>
  </div>
  ${renderCommands(battle,actor,current,livingEnemies,target,inventory,skills)}
  <div class="battle-log">${(battle.log??[]).map(line=>`<div>${line}</div>`).join("")}</div>
 </section>`;
}
