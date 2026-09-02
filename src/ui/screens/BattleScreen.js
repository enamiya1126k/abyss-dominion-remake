import{displayName,calculatedStats,colorValue,expNeedFor}from"../../models/Monster.js?v=3.0.1-build301";
import{learnedSkills,maxMp,skillElementLabel,effectiveSkillMpCost,skillCombatKeywords}from"../../battle/SkillSystem.js?v=2.11.83-build259";
import{cooldownRemaining,statusLabel,enemyStatusesFor,allyAilmentsFor,allyEffectsFor,enemyEffectsFor}from"../../battle/BattleRules.js?v=2.11.0-build164";
import{currentAlly,currentTurnEntry,aliveEnemies,selectedEnemy}from"../../battle/TurnSystem.js?v=3.0.1-build301";
import{monsterVisual}from"../MonsterVisual.js?v=3.0.1-build301";
import{pixelIcon,itemIcon}from"../components/GameChrome.js?v=2.11.0-build164";
import{attributeVisual}from"../components/AttributeVisual.js?v=2.11.0-build164";
import{normalizeBattleSpeed}from"../../core/config.js?v=3.0.1-build301";
import{ATTRIBUTE_RELATIONS}from"../../data/attributes.js?v=2.11.53-build218";

function battleInteger(value){return Math.round(Number(value)||0).toLocaleString("ja-JP")}
function battleParty(battle){return(Array.isArray(battle?.party)?battle.party:[]).filter(monster=>monster&&typeof monster==="object"&&monster.id&&monster.speciesId)}
function unitStats(unit){return unit?.onlineStats??calculatedStats(unit)}
function unitMaxMp(unit){return Math.max(0,Number(unit?.onlineMaxMp??maxMp(unit))||0)}
function unitName(unit){return unit?.onlineName??displayName(unit)}
function skillMpCost(actor,skill){return Math.max(0,Number(skill?.onlineMpCost??effectiveSkillMpCost(actor,skill))||0)}
function renderTurnOrder(battle){
 return (battle.turnQueue??[]).map((entry,index)=>{
  const classes=["turn-chip",entry.type,index===battle.queueIndex?"current":"",index<battle.queueIndex?"done":""].filter(Boolean).join(" ");
  return `<span class="${classes}" title="${entry.name}"><b>${entry.name}</b><small>速度 ${battleInteger(entry.spd)}</small></span>`;
 }).join("");
}
function growthText(unit){const plus=Math.max(0,Number(unit?.plus??unit?.sourcePlus)||0);return`+${plus}`}
const BATTLE_ROLE_LABELS={balanced:"万能型",burst:"高火力型",controller:"妨害型",support:"支援型",speed:"高速型",tank:"防御型",healer:"回復型",magic:"魔法型",physical:"物理型",debuffer:"弱体型",poison:"毒撃型",burner:"炎撃型"};
const BATTLE_EFFECT_LABELS={atkDown:"攻撃↓",defDown:"防御↓",spdDown:"速度↓",evasionDown:"回避↓",accuracyDown:"命中↓",stun:"行動不能",vulnerable:"被ダメージ増加",taunt:"挑発",guard:"防御",counter:"反撃",atkUp:"攻撃↑",defUp:"防御↑",spdUp:"速度↑",evasionUp:"回避↑",accuracyUp:"命中↑",regen:"再生",lifeSteal:"吸収",magicToPhysical:"魔力→物理"};
function battleRoleLabel(role){return BATTLE_ROLE_LABELS[String(role??"balanced").toLowerCase()]??String(role??"万能型")}
function battleEffectLabel(effect){return BATTLE_EFFECT_LABELS[effect?.kind]??effect?.name??String(effect?.kind??"効果")}
function battleStatusLabel(status){const labels={poison:"毒",burn:"炎上",bleed:"出血",curse:"呪い",paralysis:"麻痺",freeze:"凍結",shock:"感電",sleep:"睡眠",charm:"魅了",confusion:"混乱",fear:"恐怖"};return labels[status?.id]??status?.name??statusLabel(status)}
function remainingTurns(turns,persistent=false){const value=Math.max(0,Number(turns)||0);return value?` 残${value}`:persistent?"・持続":""}
const INVINCIBLE_ALLIANCE_IDS=Object.freeze(["myth_enami","myth_rion","myth_yori","myth_hide"]);
const COMBAT_RANK_POWER=Object.freeze({UR:4,LR:5,"神話":6,"深淵":7,"十神":8});
function combatRank(unit,species={}){
 const value=unit?.endgameFaction==="tenGod"||unit?.faction==="tenGod"?"十神":unit?.endgameFaction==="abyss"||unit?.faction==="abyss"?"深淵":unit?.summonTier??unit?.summonRarity??unit?.combatRarity??species.rarity??null;
 return COMBAT_RANK_POWER[value]>=4?value:null;
}
function rankTone(rank){return({UR:"ur",LR:"lr","神話":"mythic","深淵":"abyss","十神":"ten-god"})[rank]??""}
function rankBadge(rank){return rank?`<span class="combat-rank-badge rank-${rankTone(rank)}">${rank}</span>`:""}
function htmlText(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function equipmentAuthorityBadge(unit){const authorities=unit?._equipmentAuthorities??[];if(!authorities.length)return"";const first=authorities[0],extra=authorities.length-1,title=authorities.map(authority=>`${authority.name}：${authority.description}`).join("／");return`<span class="equipment-authority-badge" title="${htmlText(title)}"><i>◆</i><b>${htmlText(first.name)}</b>${extra?`<em>+${extra}</em>`:""}</span>`}
function biomeAttributeMarks(elements,label){return(elements??[]).map(element=>attributeVisual(element,{className:"battle-biome-attribute",label:`${label} ${element}属性`})).join("")}
function renderBiomeBadge(environment){if(!environment)return"";const favorable=[...new Set(environment.favorable??[])],adverse=[...new Set(environment.adverse??[])],primary=environment.primary??favorable[0]??"neutral",boost=Math.round((Number(environment.boost)||1)*100-100),penalty=Math.round(100-(Number(environment.penalty)||1)*100),effective=Object.entries(ATTRIBUTE_RELATIONS).filter(([,relation])=>relation.strong?.includes(primary)).map(([id])=>id);return`<div class="battle-biome-badge compact" style="--biome-accent:${environment.accent}"><b>${attributeVisual(primary,{className:"battle-biome-primary",label:"階層属性"})}<span>${htmlText(environment.name)}</span></b><small><span class="favorable"><em>環境強化</em>${favorable.length?biomeAttributeMarks(favorable,"環境強化属性"):'<b class="no-attribute">—</b>'}<strong>+${boost}%</strong></span><i aria-hidden="true"></i><span class="adverse"><em>環境弱体</em>${adverse.length?biomeAttributeMarks(adverse,"環境弱体属性"):'<b class="no-attribute">—</b>'}<strong>-${penalty}%</strong></span></small>${effective.length?`<small class="battle-biome-matchup"><em>攻撃有効</em>${biomeAttributeMarks(effective,"攻撃有効属性")}</small>`:""}</div>`}
function invincibleAllianceActive(battle){const ids=new Set(battleParty(battle).filter(monster=>Number(monster.currentHp)>0).map(monster=>monster.speciesId));return INVINCIBLE_ALLIANCE_IDS.every(id=>ids.has(id))}
function hpBar(battle,id,rate,label,tone){
 const normalized=Math.max(0,Math.min(100,Number(rate)||0)),trail=battle.hpTrails?.[id],elapsed=trail?Math.max(0,Date.now()-(Number(trail.startedAt)||0)):Infinity,delay=Math.max(0,Number(trail?.delay)||0),duration=Math.max(1,Number(trail?.duration)||1400),from=Math.max(normalized,Number(trail?.from)||normalized),active=Boolean(trail&&elapsed<delay+duration&&from>normalized),animationDelay=elapsed<delay?delay-elapsed:-Math.min(elapsed-delay,duration);
 const timing=active?` style="--hp-from:${from.toFixed(3)}%;--hp-to:${normalized.toFixed(3)}%;--hp-trail-duration:${duration}ms;--hp-trail-delay:${animationDelay}ms"`:"";
 const afterimage=active?'<i class="hp-trail" aria-hidden="true"></i>':"";
 return`<div class="battle-bar ${tone} ${active?"has-hp-trail":""}"${timing}>${afterimage}<i class="hp-fill ${active?"hp-fill-draining":""}" style="width:${normalized}%"></i><span class="bar-label">${label}</span></div>`;
}

function renderEnemies(battle,enemies,target){
 return enemies.filter(Boolean).map((enemy,index)=>{
  const statuses=enemyStatusesFor(battle,enemy.id),effects=enemyEffectsFor(battle,enemy.id);
  const statusHtml=`<div class="status-row enemy-status-row" data-status-detail="${enemy.id}" ${statuses.length||effects.length?"":'aria-hidden="true"'}>${statuses.map(s=>`<span class="status-chip ${s.id}">${battleStatusLabel(s)}${remainingTurns(s.turns)}</span>`).join("")}${effects.map(e=>`<span class="status-chip ${e.kind}">${battleEffectLabel(e)}${remainingTurns(e.turns)}</span>`).join("")}</div>`;
  const floorBoss=Boolean(enemy.floorBossCatalogId),badge=enemy.boss?`<span class="boss-badge">${floorBoss?"階層ボス":"ボス"}</span>`:enemy.elite?`<span class="elite-badge">${enemy.eliteAffixIcon??"🜲"} 強敵・${enemy.eliteAffixName??"変異"}</span>`:"";const danger="";
  const hpRate=Math.max(0,Math.min(100,enemy.hp/Math.max(1,enemy.maxHp)*100));
  const line=index<2?"front-line":"rear-line";
  const dead=enemy.hp<=0,pendingKo=dead&&(battle.presentationKoIds??[]).map(String).includes(String(enemy.id)),element=enemy.trialElement??enemy.element??battle.species?.[enemy.speciesId]?.element??"neutral",rank=combatRank(enemy,battle.species?.[enemy.speciesId]),rankClass=rank?`combat-rank-unit rank-${rankTone(rank)}`:"";
  return `<button id="enemy-${enemy.id}" ${dead?`disabled${pendingKo?"":' aria-hidden="true"'}`:`data-enemy-target="${enemy.id}"`} style="--formation-index:${index};--unit-color:${enemy.color}" class="combatant enemy-combatant side-battle-unit formation-slot-${index+1} ${line} ${dead?"dead":""} ${pendingKo?"presentation-ko-pending":""} ${enemy.boss?"boss-enemy":""} ${enemy.raidMainBoss?"raid-main-boss":""} ${enemy.raidSubBoss?"raid-sub-boss":""} ${floorBoss?"floor-boss-enemy":""} ${enemy.elite?"elite-enemy":""} ${rankClass} ${target?.id===enemy.id?"targeted":""}">
   <span class="target-reticle" aria-hidden="true"></span>
   <span class="battle-unit-floating-name">${badge}${rankBadge(rank)}<b>${enemy.name}</b></span>
   <div class="side-unit-sprite enemy-orb">${battle.enemyMagicCircleArt?.[enemy.id]??""}${monsterVisual(enemy,enemy.emoji??"👾",{frame:enemy.visualFrame??(enemy.hp<=0&&!pendingKo?"down":"idle"),className:"battle-enemy-visual"})}</div>
   <div class="side-unit-card enemy-info">
    <div class="side-unit-name enemy-name">${danger}<small>Lv.${battleInteger(enemy.level)}</small><em class="battle-unit-growth">${growthText(enemy)}</em><i class="unit-attribute-logo">${attributeVisual(element,{label:`${element}属性`})}</i></div>
    <div class="side-unit-intent enemy-intent"><span>${enemy.magicCircleName?`魔法陣 Lv.${enemy.magicCircleLevel}`:"戦闘特性"}</span><b>${enemy.magicCircleName??`${enemy.enraged?"狂暴化・":""}${battleRoleLabel(enemy.role)}`}</b></div>
    ${hpBar(battle,`enemy:${enemy.id}`,hpRate,`HP ${battleInteger(enemy.hp)}/${battleInteger(enemy.maxHp)}`,"enemy-hp")}
    ${enemy.elite?`<small class="elite-description">${enemy.eliteDescription??"第二世界で変異した強敵"}</small>`:""}
    ${statusHtml}
   </div>
  </button>`;
 }).join("");
}

function renderParty(battle,actor){
 return battleParty(battle).map((m,index)=>{
 const stats=unitStats(m),mp=unitMaxMp(m),need=expNeedFor(m);
 const circle=battle.magicCircleProfiles?.[m.id]??null,circleName=circle?.name??"魔法陣なし",circleLevel=Math.max(0,Number(circle?.level)||0);
 const ailments=allyAilmentsFor(battle,m.id),effects=allyEffectsFor(battle,m.id),effectHtml=`<div class="status-row ally-status-row" data-status-detail="${m.id}" ${ailments.length||effects.length?"":'aria-hidden="true"'}>${ailments.map(e=>`<span class="status-chip ${e.id}">${battleStatusLabel(e)}${remainingTurns(e.turns,true)}</span>`).join("")}${effects.map(e=>`<span class="status-chip ${e.kind}">${battleEffectLabel(e)}${remainingTurns(e.turns)}</span>`).join("")}</div>`;
  const hpRate=Math.max(0,Math.min(100,m.currentHp/Math.max(1,stats.hp)*100)),mpRate=Math.max(0,Math.min(100,m.currentMp/Math.max(1,mp)*100));
  const line=index<2?"front-line":"rear-line",element=m.attribute??battle.species?.[m.speciesId]?.element??"neutral",rank=combatRank(m,battle.species?.[m.speciesId]),rankClass=rank?`combat-rank-unit rank-${rankTone(rank)}`:"";
  const formerFloorBoss=Boolean(m.floorBossCatalogId||m.floorBossId||m.obtainedMethod==="floorBossContract");
  return `<button id="ally-${m.id}" data-battle-detail="${m.id}" ${battle.onlineMode?`data-online-ally-target="${m.id}"`:""} style="--formation-index:${index};--unit-color:${colorValue(m)}" class="battle-unit combatant side-battle-unit formation-slot-${index+1} ${line} ${formerFloorBoss?"party-floor-boss":""} ${rankClass} ${battle.onlineMode&&battle.onlineSelectedAlly===m.id?"online-selected-ally":""} ${actor?.id===m.id?"active":""} ${m.currentHp<=0?"dead":""}">
   <span class="active-turn-marker" aria-hidden="true">行動中</span>
   <span class="battle-unit-floating-name">${rankBadge(rank)}<b>${unitName(m)}</b></span>
   <div class="side-unit-sprite unit-orb">${battle.magicCircleArt?.[m.id]??""}${monsterVisual(m,battle.species?.[m.speciesId]?.emoji??"●",{frame:m.currentHp<=0?"down":"idle",className:"battle-ally-visual"})}</div>
   <div class="side-unit-card ally-info">
    <div class="side-unit-name unit-head"><small>Lv.${battleInteger(m.level)}</small><em class="battle-unit-growth">${growthText(m)}</em>${equipmentAuthorityBadge(m)}<i class="unit-attribute-logo">${attributeVisual(element,{label:`${element}属性`})}</i></div>
    <div class="side-unit-intent ally-circle-intent"><span>${circleLevel?`魔法陣 Lv.${circleLevel}`:"魔法陣"}</span><b>${circleName}</b></div>
    ${hpBar(battle,`ally:${m.id}`,hpRate,`HP ${battleInteger(m.currentHp)}/${battleInteger(stats.hp)}`,"ally")}
    <div class="battle-bar mp ally-mp"><span class="bar-label">MP ${battleInteger(m.currentMp)}/${battleInteger(mp)}</span><i class="resource-fill" style="width:${mpRate}%"></i></div>
    <small class="battle-mini-stats">物攻 ${battleInteger(stats.atk)}　魔攻 ${battleInteger(stats.matk??stats.atk)}<br>物防 ${battleInteger(stats.def)}　魔防 ${battleInteger(stats.mdef??stats.def)}　速度 ${battleInteger(stats.spd)}</small>${effectHtml}
    <div class="battle-exp-row" aria-hidden="true"><small>あと${battleInteger(Math.max(0,need-m.exp))}</small><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/Math.max(1,need)*100)}%"></i></div></div>
   </div>
  </button>`;
 }).join("");
}

function renderSkills(battle,actor,skills){
 const rows=skills.map(skill=>{
  const cd=Math.max(0,Number(cooldownRemaining(battle,actor.id,skill.id))||0),baseCd=Math.max(0,Number(skill.cooldown)||0),mpCost=skillMpCost(actor,skill),disabled=actor.currentMp<mpCost||cd>0;
  const cost=cd>0?`残りCT ${cd} / MP ${mpCost}`:`MP ${mpCost}`,cooldownLabel=baseCd>0?`CT ${baseCd}`:"CTなし";
  const details=skillCombatKeywords(skill).map(line=>`<li>${line}</li>`).join("");
  const skillName=skill.equipmentGranted?`【装備技】${skill.name}`:skill.name,skillTag=skill.equipmentGranted?`${skill.equipmentAuthorityName??"装備固有"}・装備中限定`:skill.tag??"スキル";
  return `<button data-skill-id="${skill.id}" ${disabled?"disabled":""}><span><b>${skillName}</b><small>${skillTag}・${skill.target??"敵単体"}・${skillElementLabel(skill)}属性・${cooldownLabel}</small><ul class="battle-skill-spec">${details}</ul></span><strong>${cost}</strong></button>`;
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

function renderOnlineItems(battle){
 if(battle.onlineItemTargetMenu){
  const targets=battleParty(battle).map(monster=>`<button type="button" data-online-item-target="${monster.id}" ${monster.currentHp<=0?"disabled":""}><span><b>${unitName(monster)}</b><small>HP ${battleInteger(monster.currentHp)} / ${battleInteger(unitStats(monster).hp)}　MP ${battleInteger(monster.currentMp)} / ${battleInteger(unitMaxMp(monster))}</small></span><strong>対象</strong></button>`).join("");
  return`<div class="skill-command-list battle-item-list online-item-target-list"><div class="online-item-step"><b>2 / 2　使用対象を選択</b><small>選択後に行動が確定します</small></div>${targets}<button id="closeOnlineItemTarget" class="secondary">戻る</button></div>`
 }
 const count=Math.max(0,Number(battle.onlineItemCharges)||0),disabled=count<=0;
 return`<div class="skill-command-list battle-item-list"><div class="online-item-step"><b>1 / 2　使用アイテムを選択</b><small>このあと使用対象を選びます</small></div><button type="button" data-online-battle-item="emergency" ${disabled?"disabled":""}><span><b>${itemIcon("potions")} 共闘応急薬</b><small>味方単体のHP40%・MP25%を回復</small></span><strong>×${battleInteger(count)}</strong></button><button id="closeItemMenu" class="secondary">戻る</button></div>`
}

function renderCommands(battle,actor,current,enemies,target,inventory,skills){
 const title=battle.onlineReadOnly?"観戦中":actor?`${unitName(actor)}の行動`:current?.type==="enemy"?`${(battle.enemies??[]).find(e=>e.id===current.id)?.name??"敵"}が行動中`:"ラウンド処理中";
 const targetHelp=actor&&enemies.length>1?`<small class="target-help">攻撃対象：${target?.name??"なし"}（敵をタップして変更）</small>`:"";
 let controls;
 if(battle.onlineReadOnly)controls='<div class="enemy-thinking">両チームの戦況を同期しています…</div>';
 else if(battle.auto)controls=`<div class="auto-command-wait"><span>${pixelIcon("crossed-swords")}</span><div><b>完全自動戦闘 進行中</b><small>戦場をタップ、または上の自動ボタンで手動操作へ</small></div></div>`;
 else if(battle.onlineActionSubmitted)controls='<div class="auto-command-wait"><span>✓</span><div><b>行動入力済み</b><small>ほかのプレイヤーの入力を待っています</small></div></div>';
 else if(!actor)controls='<div class="enemy-thinking">敵の行動を処理しています…</div>';
 else if(battle.skillMenu)controls=renderSkills(battle,actor,skills);
 else if(battle.onlineMode&&(battle.itemMenu||battle.onlineItemTargetMenu))controls=renderOnlineItems(battle);
 else if(battle.itemMenu)controls=renderItems(inventory);
 else{const blocked=Boolean(battle.onlineMode&&!battle.onlineAllowCapture)||Boolean(target&&(target.boss||target.floorBossCatalogId||target.uncapturable||target.endgameBossId||["abyss","tenGod"].includes(target.faction)));controls=`<div class="command-grid"><button data-command="attack"><i>${pixelIcon("crossed-swords")}</i><span>たたかう</span></button><button data-command="guard"><i>${pixelIcon("equipment")}</i><span>ガード</span></button><button data-command="skill"><i>${pixelIcon("skills")}</i><span>スキル</span></button><button data-command="item"><i>${pixelIcon("growth")}</i><span>${battle.onlineMode?"応急薬":"アイテム"}</span></button><button data-command="capture" ${blocked?'disabled aria-label="この敵は捕獲できません"':""}><i>${pixelIcon("capture")}</i><span>${blocked?"捕獲不可":"捕獲"}</span></button></div>`}
 const countdown=battle.onlineCountdownMode?`<strong class="online-shared-countdown" data-online-countdown="${battle.onlineCountdownMode}">${battle.phase==="command"?"--.-":"処理中"}</strong>`:"";
 return `<div class="battle-command ${battle.auto?"is-auto":""}"><div class="battle-command-head spread"><h2>${title}</h2>${countdown}<span class="muted">${pixelIcon("capture")} 捕獲結晶 ${inventory.captureCrystals??0}</span></div>${targetHelp}${controls}</div>`;
}

export function BattleScreen(battle,inventory,settings,floor=1){
 const party=battleParty(battle);if(party.length!==(Array.isArray(battle?.party)?battle.party.length:0))battle={...battle,party};
 const actor=battle.onlineActorId?party.find(monster=>monster.id===battle.onlineActorId&&monster.currentHp>0)??null:currentAlly(battle),current=currentTurnEntry(battle),livingEnemies=aliveEnemies(battle),enemies=(battle.enemies??[]).filter(Boolean),target=selectedEnemy(battle),skills=actor?(battle.onlineSkills??learnedSkills(actor)):[];
 const special=battle.specialBattle?`<div class="special-battle-strip ${battle.specialBattleType}"><b>${battle.specialTitle??"特別戦"}</b><small>${battle.specialSubtitle??"敗北ペナルティなし"}</small></div>`:"";
 const floorBand=Math.max(1,Math.min(20,Math.floor((Math.max(1,Number(floor)||1)-1)/50)+1));
 const speed=normalizeBattleSpeed(battle.onlineMode?battle.speed??settings.battleSpeed:settings.battleSpeed),scaled=ms=>`${Math.max(1,Math.round(ms/speed))}ms`;
 const timingStyle=`--battle-lunge:${scaled(220)};--battle-skill-lunge:${scaled(300)};--battle-hit:${scaled(260)};--battle-critical-hit:${scaled(300)};--battle-defeat:${scaled(500)};--battle-float:1500ms;--battle-banner-in:${scaled(280)};--battle-banner-out:${scaled(220)};--battle-flash:${scaled(380)};--battle-particle:${Math.max(560,Math.round(920/speed))}ms`;
 const theme=String(battle.battleTheme??"default").replace(/[^a-z0-9-]/gi,"");
 const biomeBadge=renderBiomeBadge(battle.biomeBattle);
 const invincibleBadge=invincibleAllianceActive(battle)?'<div class="invincible-alliance-status" role="status" aria-label="無敵・四LR連携が発動中"><span>無敵</span><small>四LR連携・常時発動</small></div>':"";
 const onlineExit=battle.onlineMode==="explore"?'<button type="button" data-online-return>帰還</button>':'<button type="button" disabled>逃走不可</button>';
 const onlineAuto=battle.onlineAutoAvailable?`<button type="button" data-online-battle-auto="${htmlText(battle.onlineMode)}" aria-pressed="${Boolean(battle.auto)}" aria-label="自動戦闘を${battle.auto?"無効":"有効"}にする" class="${battle.auto?"enabled":""}"><span>自動</span><b>${battle.auto?"有効":"無効"}</b></button>`:battle.onlineAutoUnsupported?'<button type="button" disabled class="online-sync-state" title="サーバー197更新後に利用できます"><span>自動</span><b>要更新</b></button>':'<button type="button" disabled class="enabled online-sync-state"><span>同期</span><b>有効</b></button>';
 const offlineExit=battle.specialBattle?`<button id="escapeBattle" type="button" ${battle.escapePending?"disabled":""}>${battle.escapePending?"撤退待ち":"撤退"}</button>`:`<button id="escapeBattle" type="button" ${battle.escapePending?"disabled":""}>${battle.escapePending?"逃走待ち":"逃げる"}</button>`;
 return `<section class="battle-screen side-battle-v2 battle-history-hidden battle-theme-${theme} ${battle.auto?"auto-mode":"manual-mode"} ${battle.specialBattle?"special-battle":""} ${battle.onlineMode?"online-shared-battle":""}" ${battle.onlineMode?`data-online-battle-view="${battle.onlineMode}"`:""} data-speed="${speed}" style="${timingStyle}" data-floor-band="${floorBand}">${special}
  <div class="battle-header"><div class="round-label"><small>ラウンド</small><b>${battle.turn}</b></div><div class="battle-header-title"><b>${battle.specialTitle??`${floor}F・遭遇戦`}</b><small>${battle.onlineMode?battle.auto?"サーバー同期・自動戦闘":"サーバー同期戦闘":battle.auto?"完全自動":"コマンド戦闘"}</small></div>${battle.onlineMode?onlineAuto:`<button id="toggleBattleAuto" type="button" aria-pressed="${battle.auto}" aria-label="自動戦闘を${battle.auto?"無効":"有効"}にする" class="${battle.auto?"enabled":""}"><span>自動</span><b>${battle.auto?"有効":"無効"}</b></button>`}<button id="battleSpeed" ${battle.onlineMode?`data-online-speed-cycle="${battle.onlineMode}"`:""}>×${speed}</button>${battle.onlineMode?onlineExit:offlineExit}</div>
  <div class="turn-order"><span class="turn-order-title">行動順</span>${renderTurnOrder(battle)}</div>
  <div class="battle-arena side-battle-arena multi-enemy">
   <div class="battle-stage-vignette" aria-hidden="true"></div>
   ${biomeBadge}
   ${invincibleBadge}
   <div class="battle-party side-party">${renderParty(battle,actor)}</div>
   <div class="battle-clash-line" aria-hidden="true"><span>対</span></div>
   <div class="enemy-party side-enemies">${renderEnemies(battle,enemies,target)}</div>
   <div id="battleFxLayer" class="battle-fx-layer"></div>
  </div>
  ${renderCommands(battle,actor,current,livingEnemies,target,inventory,skills)}
 </section>`;
}
