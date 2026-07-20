import{MonsterCard}from"../components/MonsterCard.js?v=0.9.6-alpha.1";

export function MonsterListScreen(state,{editing=false,selected=new Set()}={}){
  const sorted=[...state.monsters].sort((a,b)=>Number(b.favorite)-Number(a.favorite)||b.level-a.level||b.stars-a.stars);
  return`
    <section class="screen">
      <header class="topbar">
        <button id="backHome">←</button>
        <h2>手持ちモンスター</h2>
        <button id="toggleMonsterEdit" class="manage-edit-button">${editing?"完了":"編集"}</button>
      </header>
      <div class="page">
        <div class="panel monster-list-tools">
          <input id="monsterSearch" placeholder="名前・種族で検索">
          <small class="muted">${state.monsters.length}/500</small>
        </div>
        ${editing?`<div class="panel bulk-manager">
          <div class="spread"><b>一括管理</b><span id="monsterSelectedCount">${selected.size}体選択</span></div>
          <div class="bulk-presets">
            <button data-select-monsters="all">すべて</button><button data-select-monsters="none">解除</button>
            <button data-select-monsters="N">N</button><button data-select-monsters="R">R</button><button data-select-monsters="plus0">+0</button><button data-select-monsters="unfavorite">未お気に入り</button>
          </div>
          <button id="releaseSelectedMonsters" class="danger bulk-primary" ${selected.size?"":"disabled"}>選択したモンスターを手放す</button>
          <small class="muted">出撃中・お気に入り・ロック中は選択できません</small>
        </div>`:""}
        <div id="monsterList" class="monster-list ${editing?"manage-editing":""}">
          ${sorted.map(m=>MonsterCard(m,state.party.includes(m.id),{editing,selected:selected.has(m.id)})).join("")}
        </div>
      </div>
    </section>`;
}
