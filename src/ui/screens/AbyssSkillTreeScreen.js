import{
 ABYSS_SKILL_CATEGORIES,
 ABYSS_SKILL_NODES,
 abyssSkillBranches,
 abyssSkillCategoryById,
 abyssSkillEffectSummary,
 abyssSkillNodeById,
 abyssSkillTreeSummary
}from"../../core/AbyssSkillTreeSystem.js?v=1.4.0";

const ROW_HEIGHT=144;

function prerequisitesMet(node,learned){
 if(!node.requires.every(id=>learned.has(id)))return false;
 const candidates=node.requiresAny??[],needed=Math.max(0,Number(node.requiresAnyCount)||0);
 return!needed||candidates.filter(id=>learned.has(id)).length>=needed;
}

function nodeStatus(state,node,learned){
 if(learned.has(node.id))return"learned";
 if(!prerequisitesMet(node,learned))return"locked";
 return(state.player?.gold??0)>=node.cost?"available":"short";
}

function requirementText(node,learned){
 const missing=node.requires.filter(id=>!learned.has(id));
 if(missing.length)return`前提：${missing.map(id=>abyssSkillNodeById(id)?.name).filter(Boolean).join("・")}`;
 const candidates=node.requiresAny??[],needed=Math.max(0,Number(node.requiresAnyCount)||0),owned=candidates.filter(id=>learned.has(id)).length;
 if(needed&&owned<needed)return`分岐前提：候補から${needed}個（${owned}/${needed}）`;
 return"習得可能";
}

function nodeCard(state,node,learned){
 const status=nodeStatus(state,node,learned);
 const buttonText=status==="learned"?"習得済み":status==="locked"?"ルート未到達":status==="short"?"GOLD不足":`${node.cost.toLocaleString()}G`;
 return`
  <article class="abyss-tree-node ${status} path-${node.pathType??"foundation"}" data-abyss-node-card="${node.id}" style="grid-column:${node.lane??2};grid-row:${node.tier}">
   <div class="abyss-node-orb"><span>${node.icon}</span><i></i></div>
   <div class="abyss-node-copy">
    <small>T${node.tier}・${node.branchName??"根源"}</small>
    <h3>${node.name}</h3>
    <p>${node.description}</p>
    <em>${status==="learned"?"効果発動中":requirementText(node,learned)}</em>
   </div>
   <button type="button" data-learn-abyss-skill="${node.id}" ${status==="learned"||status==="locked"?"disabled":""}>${buttonText}</button>
  </article>`;
}

function connectionLines(nodes,learned,maxTier){
 const nodeMap=new Map(nodes.map(node=>[node.id,node]));
 const lines=[];
 for(const target of nodes){
  const sourceIds=[...target.requires,...(target.requiresAny??[])];
  for(const sourceId of sourceIds){
   const source=nodeMap.get(sourceId);if(!source)continue;
   const x1=((source.lane??2)-.5)*100,x2=((target.lane??2)-.5)*100;
   const y1=(source.tier-.5)*ROW_HEIGHT,y2=(target.tier-.5)*ROW_HEIGHT;
   const active=learned.has(source.id)&&learned.has(target.id),reachable=learned.has(source.id)&&!learned.has(target.id);
   lines.push(`<path class="${active?"learned":reachable?"reachable":""}" d="M ${x1} ${y1} C ${x1} ${y1+ROW_HEIGHT*.52}, ${x2} ${y2-ROW_HEIGHT*.52}, ${x2} ${y2}"/>`);
  }
 }
 return`<svg class="abyss-tree-connections" viewBox="0 0 300 ${maxTier*ROW_HEIGHT}" preserveAspectRatio="none" aria-hidden="true">${lines.join("")}</svg>`;
}

function effectSummary(state,categoryId){
 const effects=abyssSkillEffectSummary(state,categoryId);
 if(!effects.length)return`<span class="empty-effect">まだ効果なし</span>`;
 return effects.map(effect=>`<span><small>${effect.label.replace("味方全体の","")}</small><b>${effect.text}</b></span>`).join("");
}

export function AbyssSkillTreeScreen(state,activeCategoryId="economy"){
 const category=abyssSkillCategoryById(activeCategoryId);
 const summary=abyssSkillTreeSummary(state);
 const learned=new Set(state.abyssSkillTree.learned);
 const nodes=ABYSS_SKILL_NODES.filter(node=>node.category===category.id);
 const maxTier=Math.max(...nodes.map(node=>node.tier));
 const categoryProgress=summary.byCategory[category.id];
 const branches=abyssSkillBranches(category.id);
 return`
  <section class="screen abyss-skill-tree-screen" style="--abyss-category:${category.color}">
   <header class="topbar abyss-tree-topbar">
    <button id="backAbyssSkillHome">←</button>
    <h2>深淵スキルツリー</h2>
    <span></span>
   </header>
   <div class="page abyss-tree-page">
    <div class="abyss-tree-hero">
     <small class="eyebrow">ABYSS GROWTH / ROUTE SYSTEM</small>
     <h1>選んだ道が、最奥の力を変える。</h1>
     <p>枝を渡り、合流条件を満たして深層へ進む。</p>
    </div>

    <div class="panel abyss-tree-wallet">
     <div><small>所持GOLD</small><strong>${(state.player?.gold??0).toLocaleString()}G</strong></div>
     <div><small>累計投資</small><b>${summary.investedGold.toLocaleString()}G</b></div>
     <div><small>習得</small><b>${summary.learnedCount}/${summary.totalCount}</b></div>
    </div>

    <div class="abyss-tree-foundation-note">
     <b>全297ノード・各分野99ノード</b>
     <span>3本の専門ルート、交差分岐、2ルート合流門を配置。既存の習得状態と投資GOLDは保護される。</span>
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

    <div class="abyss-current-effects">
     <header><b>現在の合計効果</b><small>${category.name}</small></header>
     <div>${effectSummary(state,category.id)}</div>
    </div>

    <div class="abyss-branch-legend">${branches.map(branch=>`<span data-branch-lane="${branch.lane}"><i>${branch.icon}</i><b>${branch.name}</b></span>`).join("")}</div>
    <div class="abyss-skill-tree-map" style="--tree-tiers:${maxTier};--tree-row:${ROW_HEIGHT}px;--tree-height:${maxTier*ROW_HEIGHT}px">
     ${connectionLines(nodes,learned,maxTier)}
     <div class="abyss-tree-grid">${nodes.map(node=>nodeCard(state,node,learned)).join("")}</div>
    </div>

    <div class="panel abyss-tree-reset-panel">
     <div><h3>振り直し</h3><p>習得内容をすべて解除し、投入したGOLDを全額返還する。</p></div>
     <button id="resetAbyssSkillTree" type="button" ${summary.learnedCount?"":"disabled"}>無料リセット<br><small>${summary.investedGold.toLocaleString()}G返還</small></button>
    </div>
   </div>
  </section>`;
}
