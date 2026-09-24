import '../build539/catalog-fixture.mjs';
import {RaceCoordinator451} from '../../online-server/src/RaceCoordinator451.js';
import {partyFor462,partyRace462} from '../../online-server/src/PartyCoordinator462.js';
import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const versions={rulesVersion:20,bombVersion542:1,tetraVersion539:3,hideVersion536:5,fishingVersion524:8,sumoVersion523:3,towerVersion517:5,quizVersion514:1,quizVersion513:1,luckVersion511:1,luckVersion509:1,luckVersion508:1,luckVersion507:1,gorillaVersion502:1,gorillaRules503:1,gorillaRules504:1,gorillaRules505:1,canalVersion489:1,canalRules492:1,canalRules494:1,canalRules496:1,canalRules500:1,canalRules541:1,cabbageVersion484:1,cabbageScoring491:1,minigamesVersion528:1};
const colors=['pink','orange','blue','green'],roster=['slime','wolf','goblin','skeleton'].map((speciesId,i)=>({id:'m'+i,speciesId})),ops={bomb:'bomb542',tetra:'tetra539',hide:'hide536',fishing:'fishing524',sumo:'sumo523',tower:'tower517',quiz:'quiz513',luck:'luck511',gorilla:'gorilla502',canal:'canal489',cabbage:'cabbage484',sugoroku:'sg463',race:'select'},fixtures={};let serial=0;
for(const [kind,op] of Object.entries(ops)){
 let now=100000;const errors=[],sessions=new Map(roster.map((_,i)=>['p'+i,{playerId:'p'+i,clientKey:'p'+i,connected:true,profile:{name:'カラー'+i}}]));const c=new RaceCoordinator451({sessions,now:()=>now,send:(id,m)=>{if(m.type==='raceError451')errors.push(m)}});let g,party;
 const req=(id,action,extra={})=>c.handle(sessions.get(id),{op:action,...versions,roster,displayName:'カラー'+id.slice(1),...(action==='sg463'?{requestId:'qaColor-'+(++serial),revision:g.revision}:{}),...extra});
 req('p0','partyCreate462',{game:kind});party=partyFor462(c,'p0');for(let i=1;i<4;i++)req('p'+i,'partyJoin462',{code:party.code});g=partyRace462(c,party);
 for(let i=0;i<4;i++){const pm=party.members[i];req('p'+i,'partyColor499',{partyId:party.id,seatToken485:pm.seatToken485,color499:colors[i]});req('p'+i,op,{gameId:g.id,kind:'select',monsterId:'m'+i});req('p'+i,'partyReady462',{ready:true})}
 if(kind!=='race')req('p0',op,{gameId:g.id,kind:'start'});else{req('p0','start');for(let n=0;n<3&&['entry','parade'].includes(g.phase);n++){now=g.deadline+1;c.advance()}}
 assert.deepEqual(errors,[],kind+' errors');const state=c.view(sessions.get('p0')),view=state[kind==='race'?'room':kind];assert(view,kind+' snapshot');const rows=kind==='race'?view.members:view.players;assert.equal(rows.length,4,kind);assert.deepEqual(rows.map(p=>p.color499),colors,kind+' preserves all four colors');fixtures[kind]=state;console.log(kind,view.phase,rows.map(p=>p.color499).join('/'));
}
await writeFile(new URL('../../docs/build542/color-fixtures.json',import.meta.url),JSON.stringify(fixtures));
