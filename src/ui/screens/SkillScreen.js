import{SPECIES}from"../../data/species.js?v=2.11.82-build258";
import{displayName}from"../../models/Monster.js?v=3.0.1-build301";
import{allLearnedSkills,effectiveSkillMpCost,normalizeSkillLoadout,skillElementLabel,skillProgressFor,skillEffectSummary}from"../../battle/SkillSystem.js?v=2.11.83-build259";
import{monsterVisual}from"../MonsterVisual.js?v=3.0.1-build301";
import{resourceHud,bottomNav,pixelIcon}from"../components/GameChrome.js?v=2.11.0-build164";

const ROLE_LABELS={
 tank:"前衛・守護",guard:"前衛・守護",defense:"前衛・守護",
 support:"後方支援",healer:"後方支援",magic:"魔法後衛",ranged:"遠隔後衛",
 debuffer:"妨害支援",poison:"妨害支援",burner:"妨害支援",controller:"妨害支援",
 drain:"前衛・吸収",burst:"前衛・火力",critical:"前衛・会心",speed:"遊撃",
 balanced:"万能",bruiser:"前衛・攻防",ambush:"遊撃"
};

function skillSlot(monster,skill,index){
 if(!skill)return`<button type="button" class="skill-slot-card compact empty" data-skill-slot="${index}">
  <strong>SLOT ${index+1}</strong><h3>＋ 未設定</h3><p>タップして選択</p>
 </button>`;
 const progress=skillProgressFor(monster,skill.id);
 const masterySteps=Math.max(0,progress.level-1),masteryRate=progress.need?Math.min(100,progress.exp/Math.max(1,progress.need)*100):100,masteryExp=Number(progress.exp.toFixed?.(2)??progress.exp).toLocaleString();
 return`<button type="button" class="skill-slot-card compact filled" data-skill-slot="${index}" data-skill-id="${skill.id}">
  <span class="skill-slot-heading"><strong>SLOT ${index+1}</strong><b>熟練Lv.${progress.level}</b></span>
  <h3>${skill.name}</h3>
  <p>${skill.tag??skill.type}・${skillElementLabel(skill)}属性・${skill.target??"敵単体"}</p>
  <p class="skill-concrete-summary">${skillEffectSummary(skill," / ")}</p>
  <span class="skill-mastery-summary">威力・回復 +${masterySteps*2}% / 状態成功 +${masterySteps}% / MP消費 −${masterySteps}%</span>
  <span class="skill-mastery-meter"><i style="width:${masteryRate}%"></i><small>${progress.need?`${masteryExp} / ${progress.need.toLocaleString()} EXP`:"MASTER"}</small></span>
  <span class="skill-slot-details"><i>MP ${effectiveSkillMpCost(monster,skill)}</i><i>CT ${skill.cooldown??0}</i></span>
  <em>詳細・変更 ›</em>
 </button>`;
}

export function SkillScreen(state,selectedId){
 const party=(state.party??[]).map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 const monster=state.monsters.find(entry=>entry.id===selectedId)??party[0]??state.monsters[0];
 if(!monster)return`<section class="screen v2-screen">${resourceHud(state,{backId:"backSkillHome",title:"スキル設定"})}<div class="page"><p>モンスターがいません。</p></div>${bottomNav("skills")}</section>`;
 normalizeSkillLoadout(monster);
 const species=SPECIES[monster.speciesId]??{},rarity=monster.summonTier??monster.summonRarity??species.rarity??"N";
 const learned=allLearnedSkills(monster),all=learned;
 const slots=Array.from({length:4},(_,index)=>{
  const id=monster.equippedSkills?.[index];
  return skillSlot(monster,all.find(skill=>skill.id===id),index);
 }).join("");
 return`<section class="screen skill-screen skill-screen-compact v2-screen">
  ${resourceHud(state,{backId:"backSkillHome",title:"スキル設定"})}
  <div class="page">
   <button type="button" class="abyss-tree-gateway" data-open-abyss-skill-tree><span>${pixelIcon("skills")}</span><div><small>ABYSS GROWTH</small><b>深淵スキルツリー</b><em>三つの分岐で最奥の力を選ぶ</em></div><i>›</i></button>
   <div class="skill-monster-tabs party-only">
    ${party.map(member=>{const data=SPECIES[member.speciesId]??{};return`<button data-skill-monster="${member.id}" class="${member.id===monster.id?"active":""}">${monsterVisual(member,data.emoji??"👹",{className:"skill-tab-monster-visual"})}<small>${displayName(member)}</small></button>`}).join("")}
    <button type="button" class="skill-reserve-picker" data-open-skill-reserve><b>＋</b><small>控えから選ぶ</small></button>
   </div>
   <div class="panel skill-owner compact">
    <div class="skill-owner-icon">${monsterVisual(monster,species.emoji??"👹",{className:"skill-owner-monster-visual"})}</div>
    <div><small>${ROLE_LABELS[species.role]??species.role??"魔物"} / ${rarity} / ${skillElementLabel({element:species.element})}属性</small><h2>${displayName(monster)}</h2><p>Lv.${monster.level}　習得 ${learned.length}/${all.length}</p></div>
    <div class="skill-owner-actions"><button type="button" data-skill-recommend>おすすめ一括設定</button><button type="button" data-skill-clear>全解除</button></div>
   </div>
   <section class="panel equipped-skill-panel compact">
    <div class="spread"><h2>戦闘に持ち込む4スキル</h2><small>各枠をタップ</small></div>
    <div class="equipped-skill-grid">${slots}</div>
   </section>
   <p class="skill-compact-help">スキル使用1回で熟練EXPを1獲得。熟練Lvごとに威力・回復・障壁+2%、状態成功+1%、MP消費-1%（Lv.10上限）。既存の熟練Lv・EXPはそのまま引き継ぎます。</p>
  </div>
  ${bottomNav("skills")}
 </section>`;
}
