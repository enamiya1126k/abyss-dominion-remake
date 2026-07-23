import{MonsterCard}from"../components/MonsterCard.js?v=0.9.15-alpha.95-abyss-skill-effects";
import{SPECIES}from"../../data/species.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{displayName}from"../../models/Monster.js?v=0.9.15-alpha.95-abyss-skill-effects";

function partyCard(m){const sp=SPECIES[m.speciesId];return`<article class="party-growth-card"><button class="party-growth-main" data-monster-id="${m.id}"><span>${sp?.emoji??"👹"}</span><div><b>${displayName(m)}</b><small>${sp?.rarity??"N"} / Lv.${m.level} / ⭐${m.stars??1} / +${m.plus??0} / ❤️${m.affection??0}</small></div></button><div class="party-growth-actions"><button data-quick-equipment="${m.id}">⚔️ 装備</button><button data-quick-growth="${m.id}">💪 強化</button></div></article>`}

export function MonsterListScreen(state,{editing=false,selected=new Set()}={}){
  const party=state.party.map(id=>state.monsters.find(m=>m.id===id)).filter(Boolean);
  const partyIds=new Set(party.map(m=>m.id));
  const reserve=[...state.monsters].filter(m=>!partyIds.has(m.id)).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||b.level-a.level||b.stars-a.stars);
  return`
    <section class="screen">
      <header class="topbar">
        <button id="backHome">←</button>
        <h2>魔物強化</h2>
        <button id="toggleMonsterEdit" class="manage-edit-button">${editing?"完了":"編集"}</button>
      </header>
      <div class="page">
        <div class="panel party-growth-panel"><div class="spread"><div><h2>現在のパーティー</h2><small class="muted">まず育てたい4体をすぐ選べます</small></div><span class="muted">${party.length}/4</span></div><div class="party-growth-grid">${party.map(partyCard).join("")||'<div class="empty">パーティーが編成されていません</div>'}</div></div>
        <div class="panel monster-list-tools">
          <div><b>控え魔物</b><small class="muted"> パーティー外の魔物</small></div>
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
          ${reserve.map(m=>MonsterCard(m,false,{editing,selected:selected.has(m.id)})).join("")||'<div class="empty">控え魔物はいません</div>'}
        </div>
      </div>
    </section>`;
}
