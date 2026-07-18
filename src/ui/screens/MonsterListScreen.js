import{MonsterCard}from"../components/MonsterCard.js";

export function MonsterListScreen(state){
  const sorted=[...state.monsters].sort((a,b)=>
    Number(b.favorite)-Number(a.favorite)||
    b.level-a.level||
    b.stars-a.stars
  );
  return`
    <section class="screen">
      <header class="topbar">
        <button id="backHome">←</button>
        <h2>手持ちモンスター</h2>
        <span class="muted">${state.monsters.length}/500</span>
      </header>
      <div class="page">
        <div class="panel">
          <input id="monsterSearch" placeholder="名前・種族で検索">
        </div>
        <div id="monsterList" class="monster-list">
          ${sorted.map(m=>MonsterCard(m,state.party.includes(m.id))).join("")}
        </div>
      </div>
    </section>
  `;
}
