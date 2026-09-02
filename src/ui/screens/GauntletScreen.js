import{APP_VERSION}from"../../core/config.js?v=3.0.5-build305";
import{calculatedStats,displayName}from"../../models/Monster.js?v=3.0.5-build305";
import{maxMp}from"../../battle/SkillSystem.js?v=3.0.5-build305";
import{ENDGAME_BOSSES,ENDGAME_TRIALS}from"../../core/EndgameSystem.js?v=3.0.5-build305";
import{floorBossDefinitionById}from"../../data/floorBosses.js?v=2.11.30-build195";
import{SPECIES}from"../../data/species.js?v=2.11.82-build258";
import{monsterVisual}from"../MonsterVisual.js?v=3.0.5-build305";
import{attributeVisual}from"../components/AttributeVisual.js?v=2.11.0-build164";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=3.0.5-build305";
import{pixelIcon,resourceHud}from"../components/GameChrome.js?v=3.0.5-build305";

function partyCard(monster,index){
 const stats=calculatedStats(monster),hp=Math.max(0,Math.min(stats.hp,monster.currentHp??stats.hp)),mpMax=maxMp(monster),mp=Math.max(0,Math.min(mpMax,monster.currentMp??mpMax)),species=SPECIES[monster.speciesId]??{},rarity=monster.endgameFaction==="tenGod"?"tenGod":monster.endgameFaction==="abyss"?"abyss":species.rarity??"N",attribute=monster.attribute??species.element??"neutral";
 return`<article class="corridor-party-card rarity-${rarity}"><span class="corridor-slot">${index+1}</span>${monsterVisual(monster,species.emoji??"MONSTER",{className:"corridor-party-visual"})}<div><b>${displayName(monster)}</b><i class="corridor-card-attribute">${attributeVisual(attribute,{label:true})}</i><small>HP ${Math.round(hp).toLocaleString()} / ${stats.hp.toLocaleString()}</small><u class="hp"><em style="width:${hp/Math.max(1,stats.hp)*100}%"></em></u><small>MP ${Math.round(mp).toLocaleString()} / ${mpMax.toLocaleString()}</small><u class="mp"><em style="width:${mp/Math.max(1,mpMax)*100}%"></em></u></div></article>`;
}

export function GauntletScreen(state){
 const trials=state.endgame?.trials??{},run=trials.run??{},trial=ENDGAME_TRIALS[Math.max(0,(run.battle??1)-1)]??ENDGAME_TRIALS[0],party=(state.party??[]).map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean),floorBoss=trial.floorBossId?floorBossDefinitionById(trial.floorBossId):null,bosses=trial.bossIds.map(id=>ENDGAME_BOSSES[id]).filter(Boolean),opponents=floorBoss?[{...floorBoss,visualId:floorBoss.visualSpeciesId??floorBoss.speciesId,icon:SPECIES[floorBoss.speciesId]?.emoji??"BOSS"}]:bosses.map(boss=>({...boss,visualId:boss.id})),defeated=Boolean(run.defeated),x=Number.isFinite(Number(run.x))?Number(run.x):50,y=Number.isFinite(Number(run.y))?Number(run.y):88,collapsed=Boolean(state.settings?.gauntletPartyCollapsed);
 const leader=party[0],leaderSpecies=leader?SPECIES[leader.speciesId]:null,victories=Math.max(0,Number(run.victories)||0),score=Math.max(0,Number(run.score)||0);
 return`<section class="screen gauntlet-walk-screen ${collapsed?"party-collapsed":""}" data-gauntlet-loop="${run.loop??1}">
  ${resourceHud(state,{title:"奈落回廊",settings:false,showFloor:false})}
  <header class="corridor-command-header"><span class="trial-pixel-emblem corridor" aria-hidden="true"></span><div><small>ABYSS CORRIDOR・連続踏破 ${victories}勝</small><h1>第${trial.number}戦　${trial.name}</h1><p>接触して審理を開始。勝利後は開いた奈落孔へ歩き、次の法廷へ。</p></div><aside><strong>${formatCombatPower(partyCombatPower(state))}</strong><small>RUN SCORE ${score.toLocaleString()}</small></aside></header>
  <button type="button" class="corridor-party-toggle" data-gauntlet-party-toggle aria-expanded="${!collapsed}"><span>${collapsed?"部隊情報を開く":"部隊情報を閉じる"}</span><b>${collapsed?"⌄":"⌃"}</b></button>
  <div class="corridor-party-strip">${party.map(partyCard).join("")}</div>
  <main class="corridor-floor ${defeated?"is-cleared":"is-hostile"}" data-gauntlet-floor style="--gx:${x};--gy:${y}">
   <button type="button" class="corridor-object ${defeated?"abyss-hole":"enemy-seal"}" data-gauntlet-object="${defeated?"exit":"enemy"}" style="--ox:50;--oy:${defeated?14:45}" aria-label="${defeated?"次の法廷へ続く奈落孔":"法廷の敵"}">
    ${defeated?`<img class="corridor-portal-art" src="./assets/ui/trials/abyss-corridor-portal.png" alt="次の法廷へ続く奈落孔"><b>次の法廷へ</b>`:`<span class="corridor-enemy-cluster">${opponents.map(boss=>monsterVisual({speciesId:boss.speciesId,visualSpeciesId:boss.visualId},boss.icon,{className:"corridor-enemy-visual"})).join("")}</span><b>${opponents.length>1?"法則群":"法廷主"}</b>`}
   </button>
   <div class="corridor-party-token" data-gauntlet-token style="--gx:${x};--gy:${y}">${leader?monsterVisual(leader,leaderSpecies?.emoji??"MONSTER",{className:"corridor-leader-visual"}):pixelIcon("formation")}<i></i></div>
   <span class="corridor-walk-hint">床をタップして歩く</span>
  </main>
  <nav class="corridor-nav"><button type="button" data-gauntlet-items>${pixelIcon("growth")}<b>持ち物</b><small>戦闘前後に使用</small></button><button type="button" class="danger" data-gauntlet-return>${pixelIcon("return")}<b>帰還して精算</b><small>次回は第1戦から</small></button></nav>
  <small class="corridor-version">v${APP_VERSION}</small>
 </section>`;
}
