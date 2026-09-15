window.qa445={
 show(kind,value=1405071){
  qa440.reset();
  if(kind==='home')qa440.home();
  else if(kind==='formation')qa437.menu('formation');
  else if(kind==='equipment')qa437.menu('equipment');
  else if(kind==='records')qa438.power();
  else if(kind==='explore')app.innerHTML=ExploreScreen(save.state,{combatPower:value});
  else if(kind==='ranking')app.innerHTML=Modal('戦力記録',`<div class="power-ranking-list">${[1,2,3,4].map(rank=>powerRankingEntryMarkup({rank,playerId:'AD-ABCD-EFGH',displayName:'ゲームマスターお試し',power:value,powerScaleVersion:5,maxFloor:100,icon:{speciesId:'slime',name:'魔物'}},{self:rank===1})).join('')}</div>`,'閉じる');
  const selectors={home:'.home-scene-power-value',formation:'.formation-power strong,.formation-summary strong',equipment:'.selected-equipment-power strong',records:'.power-record-summary b,.power-record-summary strong,.power-source-breakdown article strong,.power-source-breakdown article em',ranking:'.power-ranking-row>strong',explore:'[data-combat-power-value]'};
  document.querySelectorAll(selectors[kind]).forEach(e=>{e.textContent=formatCombatPower(value);e.dataset.powerQa445='true';});
 }
};window.ready445=true;
