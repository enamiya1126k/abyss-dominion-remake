import{ABYSS_SKILL_CATEGORIES,ABYSS_SKILL_NODES,abyssSkillBranches,abyssSkillCategoryById,abyssSkillEffectSummary,magicCircleUnlockForNode,abyssSkillNodeById,abyssSkillTreeSummary}from"../../core/AbyssSkillTreeSystem.js?v=3.1.15-build334";
import{magicCircleById}from"../../core/MagicCircleSystem.js?v=3.1.1-build316";
import{pixelIcon}from"../components/GameChrome.js?v=3.1.1-build311";

const ROW_HEIGHT=144,CATEGORY_ICON={economy:"coin",combat:"crossed-swords",exploration:"dungeon"};
function treeIcon(categoryId){return pixelIcon(CATEGORY_ICON[categoryId]??"skills")}
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
 const status=nodeStatus(state,node,learned),circleId=magicCircleUnlockForNode(node.id),circle=circleId?magicCircleById(circleId):null;
 const missing=Math.max(0,node.cost-(state.player?.gold??0)),buttonText=status==="learned"?"習得済み":status==="locked"?"前の技能が必要":status==="short"?`あと ${missing.toLocaleString()}G`:`購入 ${node.cost.toLocaleString()}G`;
 return`<article class="abyss-tree-node ${status} path-${node.pathType??"foundation"}" data-abyss-node-card="${node.id}" style="grid-column:${node.lane??2};grid-row:${node.tier}">
  <div class="abyss-node-orb"><span>${treeIcon(node.category)}</span><i></i></div><div class="abyss-node-copy"><small>${node.tier}段階・${node.branchName??"根源"}</small><h3>${node.name}</h3><p>${node.description}</p>
  ${circle?`<span class="abyss-circle-unlock"><img src="${circle.asset}" alt=""><b>魔法陣解禁</b><strong>${circle.name} 1段階</strong></span>`:""}<em>${status==="learned"?"効果発動中":status==="locked"?requirementText(node,learned):status==="short"?"前提達成・GOLD不足":"習得可能"}</em></div>
  <button type="button" data-learn-abyss-skill="${node.id}" ${["learned","locked"].includes(status)?"disabled":""}>${buttonText}</button></article>`;
}
function connectionLines(nodes,learned,maxTier){
 const nodeMap=new Map(nodes.map(node=>[node.id,node])),lines=[];
 for(const target of nodes)for(const sourceId of[...target.requires,...(target.requiresAny??[])]){const source=nodeMap.get(sourceId);if(!source)continue;const x1=((source.lane??2)-.5)*100,x2=((target.lane??2)-.5)*100,y1=(source.tier-.5)*ROW_HEIGHT,y2=(target.tier-.5)*ROW_HEIGHT,active=learned.has(source.id)&&learned.has(target.id),reachable=learned.has(source.id)&&!learned.has(target.id);lines.push(`<path class="${active?"learned":reachable?"reachable":""}" d="M ${x1} ${y1} C ${x1} ${y1+ROW_HEIGHT*.52}, ${x2} ${y2-ROW_HEIGHT*.52}, ${x2} ${y2}"/>`)}
 return`<svg class="abyss-tree-connections" viewBox="0 0 300 ${maxTier*ROW_HEIGHT}" preserveAspectRatio="none" aria-hidden="true">${lines.join("")}</svg>`;
}
function effectSummary(state,categoryId){const effects=abyssSkillEffectSummary(state,categoryId);return effects.length?effects.map(effect=>`<span><small>${effect.label.replace("味方全体の","")}</small><b>${effect.text}</b></span>`).join(""):`<span class="empty-effect">まだ効果なし</span>`}

export function AbyssSkillTreeScreen(state,activeCategoryId="economy"){
 const category=abyssSkillCategoryById(activeCategoryId),summary=abyssSkillTreeSummary(state),learned=new Set(state.abyssSkillTree.learned),nodes=ABYSS_SKILL_NODES.filter(node=>node.category===category.id),maxTier=Math.max(...nodes.map(node=>node.tier)),categoryProgress=summary.byCategory[category.id],branches=abyssSkillBranches(category.id);
 return`<section class="screen abyss-skill-tree-screen" style="--abyss-category:${category.color}"><header class="topbar abyss-tree-topbar"><button id="backAbyssSkillHome">←</button><h2>深淵スキルツリー</h2><span></span></header><div class="page abyss-tree-page">
  <div class="abyss-tree-hero"><small class="eyebrow">深淵成長・技能系統</small><h1>一番上から、力をつないでいく。</h1><p>階層ではなく、線でつながった前の技能が購入条件です。</p></div>
  <div class="panel abyss-tree-wallet"><div><small>所持GOLD</small><strong>${(state.player?.gold??0).toLocaleString()}G</strong></div><div><small>購入条件</small><b>前提技能＋GOLD</b></div><div><small>習得</small><b>${summary.learnedCount}/${summary.totalCount}</b></div></div>
  <div class="abyss-tree-foundation-note"><b>全297ノード・順路購入</b><span>一番上の根源から開始し、光った線の先にある技能を順番に習得します。階層到達条件はありません。</span></div>
  <nav class="abyss-tree-tabs" aria-label="スキルカテゴリ">${ABYSS_SKILL_CATEGORIES.map(item=>{const progress=summary.byCategory[item.id];return`<button type="button" data-abyss-category="${item.id}" class="${item.id===category.id?"active":""}" style="--tab-color:${item.color}"><span>${treeIcon(item.id)}</span><b>${item.name}</b><small>${progress.learned}/${progress.total}</small></button>`}).join("")}</nav>
  <div class="panel abyss-category-head"><span>${treeIcon(category.id)}</span><div><small>${categoryProgress.learned}/${categoryProgress.total} 習得</small><h2>${category.name}</h2><p>${category.subtitle}</p></div></div>
  <div class="abyss-current-effects"><header><b>現在の合計効果</b><small>${category.name}</small></header><div>${effectSummary(state,category.id)}</div></div>
  <div class="abyss-branch-legend">${branches.map(branch=>`<span data-branch-lane="${branch.lane}"><i>${treeIcon(category.id)}</i><b>${branch.name}</b></span>`).join("")}</div>
  <div class="abyss-skill-tree-map" style="--tree-tiers:${maxTier};--tree-row:${ROW_HEIGHT}px;--tree-height:${maxTier*ROW_HEIGHT}px">${connectionLines(nodes,learned,maxTier)}<div class="abyss-tree-grid">${nodes.map(node=>nodeCard(state,node,learned)).join("")}</div></div>
  <div class="panel abyss-tree-reset-panel abyss-tree-permanent-panel"><div><h3>恒久成長</h3><p>習得したノードと解禁した魔法陣は永久に保持されます。</p></div><span class="abyss-tree-permanent-seal">恒久<br>保持</span></div>
 </div></section>`;
}
