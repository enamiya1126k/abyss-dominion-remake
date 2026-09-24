import {playerColor499} from './PartyColors499.js';

// Presentation only. Do not mutate game state, reorder players or add/remove DOM.
// Every selector points at an existing name/card; ordinal results use player IDs.
export function applyPlayerColors542(c){
 const root=c.root;if(!root)return;
 const paint=(e,p)=>{if(!e||!p)return;e.style.setProperty('--identity542',playerColor499(p).hex);e.dataset.identity542=p.playerId;};
 const group=(selector,rows)=>[...root.querySelectorAll(selector)].forEach((e,i)=>paint(e,rows?.[i]));
 const sets={
  cabbage:['.cb-seat','.cb-ranking article'],canal:['.cn-crew496 article','.cn-result-crew>article'],
  gorilla:['.gg-players502 article','.gg-records502 article'],luck:['.lk-players507 article','.lk-results507 article'],
  quiz:['.q-seats513 article','.q-results513 article'],tower:['.tw-people517>div','.tw-resultrow517'],
  sumo:['.sm-seats523>div','.sm-resultrow523'],fishing:['.fi-seats524>div','.fi-resultrow524'],
  hide:['.hd-players536>div','.hd-standings536 article'],tetra:['.tt-standings539>div','.tt-results539 article'],
  sugoroku:['.sg-seat-slot470','.sg-results-table tbody tr'],bomb:['.bb-players542 article','.bb-results542 article']
 };
 for(const[k,[seats,results]]of Object.entries(sets)){const g=c.state?.[k];if(!g)continue;group(seats,g.players);group(results,g.results?.length?g.results.map(r=>g.players.find(p=>p.playerId===r.playerId)??g.players[r.seat]):g.players);
  if(k==='tetra')group('.tt-podium539>div',[1,0,2].map(i=>g.players.find(p=>p.playerId===g.results?.[i]?.playerId)));
  if(k==='tower')group('.tw-winners517>div',g.players.filter(p=>p.role===g.winner));
  if(k==='fishing')group('.fi-result-hero524 article',(g.results??[]).filter(r=>r.rank===1).map(r=>g.players.find(p=>p.playerId===r.playerId)));
  if(k==='hide')group('.hd-winners536>div',g.players.filter(p=>!p.hunter));
 }
 const race=c.state?.room;if(race){for(const e of root.querySelectorAll('[data-race-runner]')){const racer=race.racers?.[Number(e.dataset.raceRunner)];paint(e,race.members.find(m=>m.playerId===racer?.ownerId))}for(const e of root.querySelectorAll('[data-podium-place]')){const racer=race.racers?.[race.order?.[Number(e.dataset.podiumPlace)]];paint(e,race.members.find(m=>m.playerId===racer?.ownerId))}}
}
