import{SPECIES}from"../../data/species.js?v=1.9.0-monster-catalog";
import{displayName}from"../../models/Monster.js?v=1.9.0-monster-catalog";
import{allSpeciesSkills,allLearnedSkills,effectiveSkillMpCost,normalizeSkillLoadout,skillElementLabel,skillProgressFor}from"../../battle/SkillSystem.js?v=1.13.0-alpha115";
import{monsterVisual}from"../MonsterVisual.js?v=1.9.1-endgame-sprites";
import{resourceHud,bottomNav}from"../components/GameChrome.js?v=1.13.0-alpha115";
const ROLE_LABELS={tank:"タンク",support:"回復・支援",debuffer:"デバフ",poison:"継続ダメージ",burner:"継続ダメージ",controller:"妨害",drain:"吸収",burst:"攻撃特化",critical:"会心特化",speed:"高速攻撃",balanced:"万能",bruiser:"攻防",magic:"魔法攻撃",ambush:"奇襲"};
function effectText(skill){if(skill.type==="allHeal"||skill.type==="selfHeal")return`回復量 ${Math.round((skill.heal??0)*100)}%`;if(skill.type==="mpHeal")return`MP回復 ${Math.round((skill.mpHeal??0)*100)}%`;if(skill.type==="revive")return`蘇生HP ${Math.round((skill.revive??0)*100)}%`;if(skill.type==="multiAttack")return`威力 ${Math.round((skill.power??0)*100)}% × ${skill.hits??2}回`;if(skill.type==="drain")return`威力 ${Math.round((skill.power??0)*100)}% / 吸収 ${Math.round((skill.drain??0)*100)}%`;if(skill.type==="buff"||skill.type==="stance"||skill.type==="cleanse")return"能力強化・特殊効果";return`威力 ${Math.round((skill.power??0)*100)}%`}
function slotMpText(monster,skill){const cost=effectiveSkillMpCost(monster,skill),base=skill.mp??0;return cost===base?`MP ${cost}`:`MP ${cost}（基本 ${base}）`}
function detail(monster,skill,unlocked,equipped){
 const progress=skillProgressFor(monster,skill.id),pct=progress.level>=10?100:Math.min(100,progress.exp/progress.need*100);
 return`<article class="skill-library-card ${unlocked?"":"locked"} ${equipped?"equipped":""}" data-skill-card="${skill.id}" data-skill-id="${skill.id}" data-skill-tag="${skill.tag??"スキル"}" data-skill-drag-source="library" tabindex="${unlocked?0:-1}">
  <div class="skill-card-top"><span class="skill-tag">${skill.tag??"スキル"}</span><small>${skillElementLabel(skill)}属性</small></div>
  <h3>${unlocked?skill.name:"？？？？"}${unlocked&&progress.level>=10?" <em>AWAKENED</em>":""}</h3>
  <p>${unlocked?skill.description:`Lv.${skill.unlock?.value??1}で習得`}</p>
  <div class="skill-meta"><span>${effectText(skill)}</span><span>${slotMpText(monster,skill)}</span><span>CT ${skill.cooldown??0}</span><span>${skill.target??"敵単体"}</span></div>
  ${unlocked?`<div class="skill-card-progress"><span>熟練Lv.${progress.level}</span><div class="skill-level-bar"><i style="width:${pct}%"></i></div><small>${progress.level>=10?"MAX":`${progress.exp}/${progress.need}`}</small></div>`:""}
  ${equipped?`<b class="skill-equipped-mark">装着中</b>`:""}
 </article>`;
}

export function SkillScreen(state,selectedId){
 const monsters=state.monsters,monster=monsters.find(m=>m.id===selectedId)??monsters[0];
 if(!monster)return`<section class="screen"><div class="page"><button id="backSkillHome">← 戻る</button><p>モンスターがいません。</p></div></section>`;
 normalizeSkillLoadout(monster);
 const sp=SPECIES[monster.speciesId],rarity=monster.summonTier??monster.summonRarity??sp?.rarity??"N",learned=new Set(allLearnedSkills(monster).map(x=>x.id)),equipped=monster.equippedSkills??[],all=allSpeciesSkills(monster.speciesId);
 const slots=Array.from({length:4},(_,index)=>{
  const id=equipped[index],skill=all.find(x=>x.id===id),progress=skill?skillProgressFor(monster,skill.id):null,pct=progress?(progress.level>=10?100:Math.min(100,progress.exp/progress.need*100)):0;
  return`<article class="skill-slot-card ${skill?"filled":"empty"}" data-skill-slot="${index}" data-skill-id="${skill?.id??""}" data-skill-drag-source="equipped" tabindex="0">
   <div class="skill-slot-heading"><strong>SLOT ${index+1}</strong>${progress?`<b>熟練Lv.${progress.level}</b>`:""}</div>
   <h3>${skill?.name??"未設定"}</h3>
   ${skill?`<p>${skill.tag??skill.type}・${skillElementLabel(skill)}属性・${skill.target??"敵単体"}</p>
    <div class="skill-slot-details"><span>${effectText(skill)}</span><span>${slotMpText(monster,skill)}</span><span>CT ${skill.cooldown??0}</span></div>
    <div class="skill-slot-exp"><i style="width:${pct}%"></i></div>`:`<p>カードをタップ、または長押しでここへ移動</p>`}
  </article>`;
 }).join("");
 const tags=["すべて",...[...new Set(all.map(s=>s.tag??"スキル"))]];
 return`<section class="screen skill-screen v2-screen">
  ${resourceHud(state,{backId:"backSkillHome",title:"スキル設定"})}
  <div class="page">
   <div class="skill-monster-tabs">${monsters.map(m=>{const s=SPECIES[m.speciesId];return`<button data-skill-monster="${m.id}" class="${m.id===monster.id?"active":""}">${monsterVisual(m,s?.emoji??"👹",{className:"skill-tab-monster-visual"})}<small>${displayName(m)}</small></button>`}).join("")}</div>
   <div class="panel skill-owner"><div class="skill-owner-icon">${monsterVisual(monster,sp?.emoji??"👹",{className:"skill-owner-monster-visual"})}</div><div><small>${ROLE_LABELS[sp?.role]??sp?.role??"魔物"} / ${rarity} / ${skillElementLabel({element:sp?.element})}属性</small><h2>${displayName(monster)}</h2><p>Lv.${monster.level}　習得 ${learned.size}/${all.length}</p></div></div>
   <section class="panel equipped-skill-panel"><div class="spread"><h2>メイン4スロット</h2><small>タップで操作 / 長押しで移動</small></div><div class="equipped-skill-grid">${slots}</div></section>
   <section class="skill-library" data-skill-library-drop>
    <div class="spread"><h2>所持スキルカード</h2><small>${learned.size}/${all.length} 習得済み</small></div>
    <div class="skill-filter-row">${tags.map((t,i)=>`<button data-skill-filter="${t}" class="${i===0?"active":""}">${t}</button>`).join("")}</div>
    <div class="skill-library-grid">${all.map(skill=>detail(monster,skill,learned.has(skill.id),equipped.includes(skill.id))).join("")}</div>
   </section>
   <div class="skill-help">タップで装着先を直接指定できます。長押ししたカードは4枠間、または所持一覧から4枠へ移動できます。</div>
  </div>
  ${bottomNav("skills")}
 </section>`;
}
