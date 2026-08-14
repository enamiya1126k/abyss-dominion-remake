import{SPECIES}from"../../data/species.js?v=2.6.2";
import{displayName}from"../../models/Monster.js?v=2.6.2";
import{allLearnedSkills,effectiveSkillMpCost,normalizeSkillLoadout,skillElementLabel,skillProgressFor}from"../../battle/SkillSystem.js?v=2.6.2";
import{monsterVisual}from"../MonsterVisual.js?v=2.6.2";
import{resourceHud,bottomNav,pixelIcon}from"../components/GameChrome.js?v=2.6.2";

const ROLE_LABELS={
 tank:"前衛・守護",guard:"前衛・守護",defense:"前衛・守護",
 support:"後方支援",healer:"後方支援",magic:"魔法後衛",ranged:"遠隔後衛",
 debuffer:"妨害支援",poison:"妨害支援",burner:"妨害支援",controller:"妨害支援",
 drain:"前衛・吸収",burst:"前衛・火力",critical:"前衛・会心",speed:"遊撃",
 balanced:"万能",bruiser:"前衛・攻防",ambush:"遊撃"
};

function effectText(skill){
 if(skill.type==="allHeal"||skill.type==="selfHeal")return`回復 ${Math.round((skill.heal??0)*100)}%`;
 if(skill.type==="mpHeal")return`MP回復 ${Math.round((skill.mpHeal??0)*100)}%`;
 if(skill.type==="revive")return`蘇生HP ${Math.round((skill.revive??0)*100)}%`;
 if(skill.type==="multiAttack")return`威力 ${Math.round((skill.power??0)*100)}%×${skill.hits??2}`;
 if(skill.type==="drain")return`威力 ${Math.round((skill.power??0)*100)}%・吸収`;
 if(["buff","stance","cleanse"].includes(skill.type))return"能力強化・特殊効果";
 return`威力 ${Math.round((skill.power??0)*100)}%`;
}

function skillSlot(monster,skill,index){
 if(!skill)return`<button type="button" class="skill-slot-card compact empty" data-skill-slot="${index}">
  <strong>SLOT ${index+1}</strong><h3>＋ 未設定</h3><p>タップして選択</p>
 </button>`;
 const progress=skillProgressFor(monster,skill.id);
 return`<button type="button" class="skill-slot-card compact filled" data-skill-slot="${index}" data-skill-id="${skill.id}">
  <span class="skill-slot-heading"><strong>SLOT ${index+1}</strong><b>熟練Lv.${progress.level}</b></span>
  <h3>${skill.name}</h3>
  <p>${skill.tag??skill.type}・${skillElementLabel(skill)}属性・${skill.target??"敵単体"}</p>
  <span class="skill-slot-details"><i>${effectText(skill)}</i><i>MP ${effectiveSkillMpCost(monster,skill)}</i><i>CT ${skill.cooldown??0}</i></span>
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
   <p class="skill-compact-help">未習得スキルは一覧に混ぜず、各枠の選択画面には習得済みだけを表示します。</p>
  </div>
  ${bottomNav("skills")}
 </section>`;
}
