import{APP_VERSION}from"../../core/config.js?v=2.2.1-hotfix";
import{calculatedStats,displayName}from"../../models/Monster.js?v=2.2.1-hotfix";
import{maxMp}from"../../battle/SkillSystem.js?v=2.2.1-hotfix";
import{ENDGAME_BOSSES,ENDGAME_TRIALS}from"../../core/EndgameSystem.js?v=2.2.1-hotfix";
import{SPECIES}from"../../data/species.js?v=2.2.1-hotfix";
import{monsterVisual}from"../MonsterVisual.js?v=2.2.1-hotfix";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=2.2.1-hotfix";
import{pixelIcon,resourceHud}from"../components/GameChrome.js?v=2.2.1-hotfix";

function partyCard(monster,index){
 const stats=calculatedStats(monster),hp=Math.max(0,Math.min(stats.hp,monster.currentHp??stats.hp)),mpMax=maxMp(monster),mp=Math.max(0,Math.min(mpMax,monster.currentMp??mpMax)),species=SPECIES[monster.speciesId]??{};
 return`<article class="corridor-party-card"><span>${monsterVisual(monster,species.emoji??"MONSTER",{className:"corridor-party-visual"})}<i>${index+1}</i></span><div><b>${displayName(monster)}</b><small>HP ${Math.round(hp).toLocaleString()} / ${stats.hp.toLocaleString()}</small><u class="hp"><em style="width:${hp/Math.max(1,stats.hp)*100}%"></em></u><small>MP ${Math.round(mp).toLocaleString()} / ${mpMax.toLocaleString()}</small><u class="mp"><em style="width:${mp/Math.max(1,mpMax)*100}%"></em></u></div></article>`;
}

export function GauntletScreen(state){
 const trials=state.endgame?.trials??{},run=trials.run??{},trial=ENDGAME_TRIALS[Math.max(0,(run.battle??trials.battle??1)-1)]??ENDGAME_TRIALS[0],party=(state.party??[]).map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean),bosses=trial.bossIds.map(id=>ENDGAME_BOSSES[id]).filter(Boolean),defeated=Boolean(run.defeated),x=Number.isFinite(Number(run.x))?Number(run.x):16,y=Number.isFinite(Number(run.y))?Number(run.y):80;
 const leader=party[0],leaderSpecies=leader?SPECIES[leader.speciesId]:null;
 return`<section class="screen gauntlet-walk-screen" data-gauntlet-loop="${run.loop??trials.loop??1}">
  ${resourceHud(state,{title:"奈落回廊",settings:false,showFloor:false})}
  <header class="corridor-command-header"><span class="trial-pixel-emblem corridor" aria-hidden="true"></span><div><small>ABYSS CORRIDOR・${run.loop??trials.loop??1}周目</small><h1>第${trial.number}/22戦　${trial.name}</h1><p>敵へ触れて戦闘。勝利後、出現する奈落孔へ入ると次の法廷へ進みます。</p></div><strong>${formatCombatPower(partyCombatPower(state))}</strong></header>
  <div class="corridor-party-strip">${party.map(partyCard).join("")}</div>
  <main class="corridor-floor ${defeated?"is-cleared":"is-hostile"}" data-gauntlet-floor style="--gx:${x};--gy:${y}">
   <div class="corridor-grid" aria-hidden="true"></div><i class="corridor-pillar p1"></i><i class="corridor-pillar p2"></i><i class="corridor-flame f1"></i><i class="corridor-flame f2"></i>
   <button type="button" class="corridor-object ${defeated?"abyss-hole":"enemy-seal"}" data-gauntlet-object="${defeated?"exit":"enemy"}" style="--ox:78;--oy:20" aria-label="${defeated?"次の法廷へ続く奈落孔":"法廷の敵"}">
    ${defeated?`<span class="corridor-hole-art"></span><b>次の法廷へ</b>`:`<span class="corridor-enemy-cluster">${bosses.map(boss=>monsterVisual(boss.id,boss.icon,{className:"corridor-enemy-visual"})).join("")}</span><b>${bosses.length>1?"法則群":"法廷主"}</b>`}
   </button>
   <div class="corridor-party-token" data-gauntlet-token style="--gx:${x};--gy:${y}">${leader?monsterVisual(leader,leaderSpecies?.emoji??"MONSTER",{className:"corridor-leader-visual"}):pixelIcon("formation")}<i></i><i></i><i></i></div>
   <span class="corridor-walk-hint">床をタップして歩く</span>
  </main>
  <nav class="corridor-nav"><button type="button" data-gauntlet-items>${pixelIcon("growth")}<b>持ち物</b><small>戦闘前後に使用可</small></button><button type="button" data-gauntlet-center>${pixelIcon("map")}<b>法廷主へ</b><small>${defeated?"奈落孔へ移動":"接触で戦闘開始"}</small></button><button type="button" class="danger" data-gauntlet-return>${pixelIcon("return")}<b>帰還</b><small>進行を保存して退出</small></button></nav>
  <small class="corridor-version">v${APP_VERSION}</small>
 </section>`;
}
