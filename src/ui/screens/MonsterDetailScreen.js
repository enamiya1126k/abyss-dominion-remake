import{SPECIES}from"../../data/species.js?v=1.6.0";
import{PERSONALITIES}from"../../data/personalities.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{MONSTER_COLORS}from"../../data/colors.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{ATTRIBUTES}from"../../data/attributes.js?v=1.1.0";
import{maxMp}from"../../battle/SkillSystem.js?v=1.6.0";
import{displayName,rankName,colorValue,calculatedStats,TRAITS,limitBreakGrowth,affectionBonuses,expNeedFor,totalExperience}from"../../models/Monster.js?v=1.6.0";
import{monsterVisual}from"../MonsterVisual.js?v=1.6.0";

function monsterRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function rarityNameClass(rarity){return ({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase()}
function nextAffection(aff){if(aff>=1000)return null;return Math.min(1000,Math.ceil((aff+1)/100)*100)}
function sourceLabel(method){
 return({capture:"探索・捕獲",summon:"召喚",market:"闇市場",darkMarket:"闇市場",endgameContract:"契約",deepSummon:"深淵召喚",serialCode:"シリアルコード"}[method]??method??"不明");
}

export function MonsterDetailScreen(monster,state){
  if(!monster)return`<section class="screen"><header class="topbar"><button id="backMonsters">←</button><h2>モンスター育成</h2></header><div class="page"><div class="empty">モンスターが見つかりません</div></div></section>`;
  const rarity=monsterRarity(monster),rarityClass=rarityNameClass(rarity),species=SPECIES[monster.speciesId],personality=PERSONALITIES[monster.personalityId],stats=calculatedStats(monster),trait=TRAITS[monster.traitId]??TRAITS.steady;
  const mp=maxMp(monster),need=expNeedFor(monster),remaining=Math.max(0,need-(monster.exp??0)),aff=monster.affection??monster.bond??0,next=nextAffection(aff),growth=limitBreakGrowth(monster.speciesId);
  const materials=state.monsters.filter(entry=>entry.id!==monster.id&&entry.speciesId===monster.speciesId&&!state.party.includes(entry.id)&&!entry.favorite&&!entry.locked).length;
  const ordered=[...state.party.map(id=>state.monsters.find(entry=>entry.id===id)).filter(Boolean),...state.monsters.filter(entry=>!state.party.includes(entry.id))];
  const index=Math.max(0,ordered.findIndex(entry=>entry.id===monster.id)),previous=ordered[(index-1+ordered.length)%ordered.length],nextMonster=ordered[(index+1)%ordered.length];
  const attribute=ATTRIBUTES[monster.attribute??species.element]??{icon:"◈",name:monster.attribute??species.element??"不明"};
  const affection=affectionBonuses(aff),affectionText=Object.entries(affection).map(([key,value])=>`${key.toUpperCase()} +${Math.round(value*100)}%`).join(" / ");
  const specialContract=Boolean(monster.isContractedEndgame),fieldEncounter=!specialContract&&species.fieldEncounter!==false;
  const sources=specialContract?["シリアルコード","緊急戦闘での契約"]:(Array.isArray(species.acquisition)&&species.acquisition.length?species.acquisition:(fieldEncounter?["探索","召喚","闇市場"]:["召喚","闇市場"]));
  return`<section class="screen monster-growth-screen">
   <header class="topbar"><button id="backMonsters">←</button><h2>モンスター育成</h2><button id="toggleFavorite">${monster.favorite?"★":"☆"}</button></header>
   <div class="page compact-growth-page">
    <div class="monster-switcher"><button data-switch-monster="${previous?.id??monster.id}" aria-label="前の魔物">‹</button><div><small>${state.party.includes(monster.id)?"出撃メンバー":"控え魔物"} ${index+1}/${ordered.length}</small><b class="monster-rarity-name rarity-name-${rarityClass}">${displayName(monster)}</b></div><button data-switch-monster="${nextMonster?.id??monster.id}" aria-label="次の魔物">›</button></div>

    <div class="panel compact-growth-summary">
     <div class="compact-growth-identity"><div class="detail-orb" style="background:${colorValue(monster)}">${monsterVisual(monster.speciesId,species.emoji??"👹",{className:"monster-detail-visual"})}</div><div><small>${rankName(monster)} / ${species.race}族</small><h1 class="monster-rarity-name rarity-name-${rarityClass}">${displayName(monster)}</h1><p><b>${rarity}</b>・${attribute.icon}${attribute.name}属性・${species.growthLabel??"標準"}成長</p><em>Lv.${monster.level}　⭐${monster.stars??1}　+${monster.plus??0}　❤️${aff}</em></div></div>
     <div class="compact-growth-stats">
      <span><small>HP</small><b>${stats.hp.toLocaleString()}</b></span><span><small>MP</small><b>${mp.toLocaleString()}</b></span>
      <span><small>ATK</small><b>${stats.atk.toLocaleString()}</b></span><span><small>DEF</small><b>${stats.def.toLocaleString()}</b></span>
      <span><small>SPD</small><b>${stats.spd.toLocaleString()}</b></span><span><small>会心 / 回避</small><b>${stats.crit}% / ${stats.evasion}%</b></span>
     </div>
     <div class="compact-exp-line"><span>累計EXP ${totalExperience(monster).toLocaleString()}</span><span>次まで ${remaining.toLocaleString()} EXP</span><i><u style="width:${Math.min(100,Math.max(0,(monster.exp??0)/Math.max(1,need)*100))}%"></u></i></div>
    </div>

    <div class="panel compact-limit-panel">
     <div><small>同名素材を合成</small><h2>＋${(monster.plus??0)+1}へ限界突破</h2><p>素材 ${materials}/2　<span>基礎値 HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}</span></p></div>
     <button id="limitBreakButton" class="limit-break-main" ${materials<2?"disabled":""}>${materials>=2?"✨ 同名2体を合成する":`あと${2-materials}体必要`}</button>
    </div>

    <div class="panel compact-affection-panel">
     <div class="spread"><div><small>FRIENDSHIP</small><h2>❤️ なつき度</h2></div><b>${aff}/1000${aff>=1000?"・親友":""}</b></div>
     <div class="affection-meter"><i style="width:${Math.min(100,aff/10)}%"></i></div>
     <p>現在の補正：<b>${affectionText}</b></p>
     <small>${next?`次のボーナスまであと ${next-aff}（${next}/1000）`:"すべてのなつきボーナスを解放済み"}</small>
    </div>

    <div class="panel acquisition-guide">
     <div class="spread"><div><small>HOW TO GET</small><h2>入手の手引き</h2></div>${monsterVisual(monster.speciesId,species.emoji??"👹",{className:"acquisition-monster-visual"})}</div>
     <div class="acquisition-guide-grid">
      <div><small>探索での出現帯</small><b>${fieldEncounter?`${species.minFloor??1}階以降・近い階層帯ほど出現しやすい`:"通常探索には出現しません"}</b></div>
      <div><small>主な入手方法</small><b>${sources.join("・")}</b></div>
      <div><small>捕獲の目安</small><b>${fieldEncounter?`${Math.round((species.captureRate??0)*100)}%（残HPで変動）`:"召喚・販売限定"}</b></div>
      <div><small>この個体の入手</small><b>${sourceLabel(monster.obtainedMethod)}・${monster.obtainedFloor??1}階時点</b></div>
     </div>
     <small>同名素材が必要な場合は、出現帯を探索するか召喚・闇市場を利用してください。</small>
    </div>

    <div class="growth-quick-actions">${state.party.includes(monster.id)?'<button id="openMonsterEquipment">⚔️ 装備を変更</button>':'<button disabled>⚔️ 編成後に装備可能</button>'}<button type="button" data-open-codex-species="${monster.speciesId}">📖 図鑑で記録を見る</button></div>

    <details class="panel detail-fold"><summary>個体設定</summary><div class="fold-content">
     <h3>名前</h3><div class="edit-row"><input id="nicknameInput" maxlength="12" value="${displayName(monster)}"><button id="saveNickname">変更</button></div>
     <h3>個体カラー</h3><div class="color-row">${MONSTER_COLORS.map(color=>`<button class="color-dot ${monster.colorId===color.id?"selected":""}" style="background:${color.value}" data-color-id="${color.id}" aria-label="${color.name}"></button>`).join("")}</div>
     <p><b>固有特性：${trait.name}</b><br><small class="muted">${trait.description}</small></p>
     <p><b>性格：${personality?.name??"不明"}</b><br><small class="muted">${personality?.description??""}</small></p>
    </div></details>

    <div class="panel danger-zone"><h2>モンスター整理</h2><button id="releaseMonster" class="danger">このモンスターを解放</button><small class="muted">出撃中・お気に入り・ロック中は解放できません。</small></div>
   </div>
  </section>`;
}
