import{
 ABYSS_SKILL_CATEGORIES,
 ABYSS_SKILL_NODES,
 abyssSkillCategoryById,
 abyssSkillNodeById,
 abyssSkillTreeSummary
}from"../../core/AbyssSkillTreeSystem.js?v=0.9.15-alpha.95.1-stability-audit";

function nodeStatus(state,node,learned){
 if(learned.has(node.id))return"learned";
 if(!node.requires.every(id=>learned.has(id)))return"locked";
 return(state.player?.gold??0)>=node.cost?"available":"short";
}

function requirementText(node,learned){
 const missing=node.requires.filter(id=>!learned.has(id));
 if(!missing.length)return"習得可能";
 return`前提：${missing.map(id=>abyssSkillNodeById(id)?.name).filter(Boolean).join("・")}`;
}

function nodeCard(state,node,learned){
 const status=nodeStatus(state,node,learned);
 const buttonText=status==="learned"?"習得済み":status==="locked"?"前提スキルが必要":status==="short"?"GOLD不足":`${node.cost.toLocaleString()}Gで習得`;
 return`
  <article class="abyss-tree-node ${status}" data-abyss-node-card="${node.id}">
   <div class="abyss-node-orb"><span>${node.icon}</span><i></i></div>
   <div class="abyss-node-copy">
    <small>TIER ${node.tier}</small>
    <h3>${node.name}</h3>
    <p>${node.description}</p>
    <em>${status==="learned"?"効果発動中":requirementText(node,learned)}</em>
   </div>
   <button type="button" data-learn-abyss-skill="${node.id}" ${status==="learned"||status==="locked"?"disabled":""}>${buttonText}</button>
  </article>`;
}

export function AbyssSkillTreeScreen(state,activeCategoryId="economy"){
 const category=abyssSkillCategoryById(activeCategoryId);
 const summary=abyssSkillTreeSummary(state);
 const learned=new Set(state.abyssSkillTree.learned);
 const nodes=ABYSS_SKILL_NODES.filter(node=>node.category===category.id);
 const maxTier=Math.max(...nodes.map(node=>node.tier));
 const tiers=Array.from({length:maxTier},(_,index)=>{
  const tier=index+1;
  const tierNodes=nodes.filter(node=>node.tier===tier);
  return`<div class="abyss-tree-tier columns-${tierNodes.length}" data-abyss-tier="${tier}">${tierNodes.map(node=>nodeCard(state,node,learned)).join("")}</div>`;
 }).join("");
 const categoryProgress=summary.byCategory[category.id];
 return`
  <section class="screen abyss-skill-tree-screen" style="--abyss-category:${category.color}">
   <header class="topbar abyss-tree-topbar">
    <button id="backAbyssSkillHome">←</button>
    <h2>深淵スキルツリー</h2>
    <span></span>
   </header>
   <div class="page abyss-tree-page">
    <div class="abyss-tree-hero">
     <small class="eyebrow">ABYSS GROWTH / GOLD SYSTEM</small>
     <h1>力を買い、何度でも組み替える。</h1>
     <p>スキルポイントは使用しない。必要なのはGOLDだけ。</p>
    </div>

    <div class="panel abyss-tree-wallet">
     <div><small>所持GOLD</small><strong>${(state.player?.gold??0).toLocaleString()}G</strong></div>
     <div><small>累計投資</small><b>${summary.investedGold.toLocaleString()}G</b></div>
     <div><small>習得</small><b>${summary.learnedCount}/${summary.totalCount}</b></div>
    </div>

    <div class="abyss-tree-foundation-note">
     <b>alpha95：スキル効果反映</b>
     <span>習得した効果は、戦闘・探索・GOLD報酬へ即時反映される。</span>
    </div>

    <nav class="abyss-tree-tabs" aria-label="スキルカテゴリ">
     ${ABYSS_SKILL_CATEGORIES.map(item=>{
      const progress=summary.byCategory[item.id];
      return`<button type="button" data-abyss-category="${item.id}" class="${item.id===category.id?"active":""}" style="--tab-color:${item.color}"><span>${item.icon}</span><b>${item.name}</b><small>${progress.learned}/${progress.total}</small></button>`;
     }).join("")}
    </nav>

    <div class="panel abyss-category-head">
     <span>${category.icon}</span>
     <div><small>${categoryProgress.learned}/${categoryProgress.total} 習得</small><h2>${category.name}</h2><p>${category.subtitle}</p></div>
    </div>

    <div class="abyss-skill-tree">${tiers}</div>

    <div class="panel abyss-tree-reset-panel">
     <div><h3>振り直し</h3><p>習得内容をすべて解除し、投入したGOLDを全額返還する。</p></div>
     <button id="resetAbyssSkillTree" type="button" ${summary.learnedCount?"":"disabled"}>無料リセット<br><small>${summary.investedGold.toLocaleString()}G返還</small></button>
    </div>
   </div>
  </section>`;
}
