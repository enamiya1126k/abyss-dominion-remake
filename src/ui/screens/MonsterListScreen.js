import{SPECIES}from"../../data/species.js?v=1.9.0-monster-catalog";
import{orderedMonsterSpecies}from"../../data/monsterCatalog.js?v=1.9.1-endgame-sprites";
import{monsterVisual}from"../MonsterVisual.js?v=1.9.1-endgame-sprites";
import{resourceHud,bottomNav,sectionTitle}from"../components/GameChrome.js?v=1.13.0-alpha115";

const RARITY_VALUE={N:1,R:2,SR:3,SSR:4,UR:5,LR:6,"神話":7,"深淵":8,"十神":9};
function safe(value){return String(value??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}

function speciesCard(species,index,owned){
 const count=owned.length,highest=count?Math.max(...owned.map(monster=>monster.level??1)):0,stars=count?Math.max(...owned.map(monster=>monster.stars??1)):0,seen=count>0;
 return`<button type="button" class="monster-species-card rarity-${species.rarity} ${seen?"owned":"unknown"}" ${seen?`data-monster-species="${species.id}"`:"disabled"} data-species-search="${safe(`${species.name} ${species.race??""} ${species.rarity} ${index+1}`.toLowerCase())}">
  <span class="monster-species-number">No.${String(index+1).padStart(3,"0")}</span>
  <span class="monster-species-art">${seen?monsterVisual(species.id,species.emoji??"👹",{className:"monster-species-visual"}):"<i>？</i>"}</span>
  <b>${seen?species.name:"？？？？"}</b>
  <small>${seen?`${species.rarity}・${species.element??"無"} / 最高Lv.${highest}`:"未所持"}</small>
  <strong>${seen?`所持 ${count}体・⭐${stars}`:"0体"}</strong>
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
   ${sectionTitle("魔物一覧",`発見 ${discovered}/${catalog.length}・所持 ${totalOwned}/500`)}
   <section class="monster-index-tools">
    <div class="monster-index-copy"><b>MONSTER ARCHIVE</b><span>同名魔物の合成・整理を一か所で管理</span></div>
    <input id="monsterSearch" type="search" value="${safe(search)}" placeholder="No.・名前・種族・レア度で検索">
    <div class="monster-index-legend"><span>所持中を先に表示</span><span>カードをタップして合成・逃す</span></div>
   </section>
   <div class="monster-species-grid" id="monsterSpeciesGrid">${indexed.map(({species,index,owned})=>speciesCard(species,index,owned)).join("")}</div>
  </main>
  ${bottomNav("monsters")}
 </section>`;
}
