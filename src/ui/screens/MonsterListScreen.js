import{SPECIES}from"../../data/species.js?v=2.3.1";
import{orderedMonsterSpecies}from"../../data/monsterCatalog.js?v=2.3.1";
import{monsterVisual}from"../MonsterVisual.js?v=2.3.1";
import{resourceHud,bottomNav,sectionTitle}from"../components/GameChrome.js?v=2.3.1";
import{MONSTER_STORAGE_CAP}from"../../core/config.js?v=2.3.1";

const RARITY_VALUE={N:1,R:2,SR:3,SSR:4,UR:5,LR:6,"神話":7,"深淵":8,"十神":9};
function safe(value){return String(value??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}

function speciesCard(species,index,owned,state){
 const count=owned.length,highest=count?Math.max(...owned.map(monster=>monster.level??1)):0,stars=count?Math.max(...owned.map(monster=>monster.stars??1)):0,seen=count>0;
 const materialFor=target=>owned.filter(monster=>monster.id!==target.id&&!state.party.includes(monster.id)&&!monster.favorite&&!monster.locked).length;
 const materialCount=seen?Math.max(...owned.map(materialFor)):0,ready=seen&&materialCount>=2,starText=stars<=6?"★".repeat(stars):`★${stars}`;
 return`<button type="button" class="monster-species-card rarity-${species.rarity} ${seen?"owned":"unknown"} ${ready?"combine-ready":""}" ${seen?`data-monster-species="${species.id}"`:"disabled"} data-species-search="${safe(`${species.name} ${species.race??""} ${species.rarity} ${index+1}`.toLowerCase())}">
  <span class="monster-species-number">No.${String(index+1).padStart(3,"0")}</span>
  ${ready?'<span class="monster-combine-ready-badge">合成可能</span>':""}
  <span class="monster-species-art">${seen?monsterVisual(species.id,species.emoji??"👹",{className:"monster-species-visual"}):"<i>？</i>"}</span>
  <b>${seen?species.name:"？？？？"}</b>
  <small>${seen?`${species.rarity}・${species.element??"無"} / 最高Lv.${highest}`:"未所持"}</small>
  <strong>${seen?`所持 ${count}体｜固有値 ${starText}`:"0体"}</strong>
 </button>`;
}

export function MonsterListScreen(state,{search=""}={}){
 const catalog=orderedMonsterSpecies(SPECIES),ownedBySpecies=new Map();
 state.monsters.forEach(monster=>{const list=ownedBySpecies.get(monster.speciesId)??[];list.push(monster);ownedBySpecies.set(monster.speciesId,list)});
 const indexed=catalog.map((species,index)=>({species,index,owned:ownedBySpecies.get(species.id)??[]}));
 indexed.sort((a,b)=>Number(Boolean(b.owned.length))-Number(Boolean(a.owned.length))||a.index-b.index);
 const discovered=indexed.filter(entry=>entry.owned.length).length,totalOwned=state.monsters.length;
 return`<section class="screen v2-screen monster-index-screen">
  ${resourceHud(state,{backId:"backHome",title:"魔物一覧"})}
  <main class="v2-screen-content">
   ${sectionTitle("魔物一覧",`発見 ${discovered}/${catalog.length}・所持 ${totalOwned}/${MONSTER_STORAGE_CAP}`)}
   <section class="monster-index-tools">
    <div class="monster-index-copy"><b>MONSTER ARCHIVE</b><span>同名魔物の合成・整理を一か所で管理</span></div>
    <input id="monsterSearch" type="search" value="${safe(search)}" placeholder="No.・名前・種族・レア度で検索">
    <div class="monster-index-legend"><span>所持中を先に表示</span><span>カードをタップして合成・逃す</span></div>
    <section class="monster-bulk-synthesis"><div class="bulk-synthesis-copy"><small>AUTO SYNTHESIS</small><b>同名個体を一括統合</b><span>最良個体へ「＋」を継承</span></div><div class="bulk-synthesis-controls"><label><select id="bulkSynthesisRarity" aria-label="対象レア度上限"><option>N</option><option>R</option><option>SR</option><option selected>SSR</option><option>UR</option><option>LR</option><option>神話</option></select><em>以下</em></label><button type="button" id="bulkSynthesizeMonsters">保護して一括統合</button></div><small class="bulk-synthesis-safety">編成・お気に入り・ロック・最良個体・深淵／十神は保護されます。</small></section>
   </section>
   <div class="monster-species-grid" id="monsterSpeciesGrid">${indexed.map(({species,index,owned})=>speciesCard(species,index,owned,state)).join("")}</div>
  </main>
  ${bottomNav("monsters")}
 </section>`;
}
