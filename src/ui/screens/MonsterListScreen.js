import{MonsterCard}from"../components/MonsterCard.js?v=1.6.0";
import{SPECIES}from"../../data/species.js?v=1.6.0";
import{displayName,totalExperience}from"../../models/Monster.js?v=1.6.0";
import{monsterCombatPower}from"../../core/CombatPower.js?v=1.6.0";
import{monsterVisual}from"../MonsterVisual.js?v=1.6.0";

function partyCard(m){const sp=SPECIES[m.speciesId],rarity=monsterRarity(m);return`<article class="party-growth-card"><button class="party-growth-main" data-monster-id="${m.id}">${monsterVisual(m.speciesId,sp?.emoji??"👹",{className:"party-growth-visual"})}<div><b>${displayName(m)}</b><small>${rarity} / Lv.${m.level} / ⭐${m.stars??1} / +${m.plus??0} / ❤️${m.affection??0}</small></div></button><div class="party-growth-actions"><button data-quick-equipment="${m.id}">⚔️ 装備</button><button data-quick-growth="${m.id}">💪 強化</button></div></article>`}
const RARITY_VALUE={N:1,R:2,SR:3,SSR:4,UR:5,LR:6,"神話":7,"深淵":8,"十神":9};
function monsterRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function sortValue(monster,sort){
 if(sort==="rarity")return RARITY_VALUE[monsterRarity(monster)]??0;
 if(sort==="level")return monster.level??1;
 if(sort==="affection")return monster.affection??0;
 if(sort==="experience")return totalExperience(monster);
 if(sort==="obtained")return Date.parse(monster.obtainedAt??monster.capturedAt??0)||0;
 if(sort==="name")return displayName(monster);
 return monsterCombatPower(monster);
}
function sortedReserve(monsters,sort,direction){
 return [...monsters].sort((a,b)=>{
  const av=sortValue(a,sort),bv=sortValue(b,sort);
  const comparison=typeof av==="string"?av.localeCompare(bv,"ja"):av-bv;
  return(direction==="asc"?comparison:-comparison)||String(a.id).localeCompare(String(b.id));
 });
}
function escapeAttribute(value){return String(value??"").replaceAll("&","&amp;").replaceAll('"',"&quot;")}

export function MonsterListScreen(state,{editing=false,selected=new Set(),search="",sort="power",direction="desc"}={}){
  const party=state.party.map(id=>state.monsters.find(m=>m.id===id)).filter(Boolean);
  const partyIds=new Set(party.map(m=>m.id));
  const reserve=sortedReserve(state.monsters.filter(monster=>!partyIds.has(monster.id)),sort,direction);
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
          <input id="monsterSearch" value="${escapeAttribute(search)}" placeholder="名前・種族で検索">
          <select id="monsterSort" aria-label="並び替え">
           <option value="power" ${sort==="power"?"selected":""}>戦闘力順</option>
           <option value="rarity" ${sort==="rarity"?"selected":""}>レア度順</option>
           <option value="level" ${sort==="level"?"selected":""}>レベル順</option>
           <option value="affection" ${sort==="affection"?"selected":""}>なつき度順</option>
           <option value="experience" ${sort==="experience"?"selected":""}>累計EXP順</option>
           <option value="obtained" ${sort==="obtained"?"selected":""}>入手順</option>
           <option value="name" ${sort==="name"?"selected":""}>名前順</option>
          </select>
          <button id="monsterSortDirection" type="button">${direction==="desc"?"降順 ↓":"昇順 ↑"}</button>
          <small class="muted">${reserve.length}体 / 全${state.monsters.length}体</small>
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
