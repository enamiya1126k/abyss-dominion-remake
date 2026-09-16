import fs from 'node:fs';
import assert from 'node:assert/strict';
import {SPECIES} from '../../src/data/species.js';
import {ENDGAME_CHARACTERS} from '../../src/data/endgameCharacters.js';
import {raceProfile451,raceWeight451,drawRace451,odds451,payout451} from '../../src/race/RaceRules451.js';
const ids=[...Object.keys(SPECIES),...Object.keys(ENDGAME_CHARACTERS)],profiles=ids.map(id=>raceProfile451(id));
assert.ok(profiles.every(p=>p.speed+p.stamina+p.technique===210));
const lineup=['slime','ember_gecko','glacier_queen','myth_rion','myth_yori','myth_hide','myth_enami','ten_time'];
const checks=[];
for(const course of ['芝','砂'])for(const mixed of [false,true]){
 const racers=lineup.map((id,i)=>({speciesId:id,profile:raceProfile451(id),condition:mixed?i%5:2}));
 const weights=racers.map(r=>raceWeight451(r,course)),sum=weights.reduce((a,b)=>a+b,0),wins=Array(8).fill(0),count=50000;
 for(let seed=1;seed<=count;seed++)wins[drawRace451(racers,course,seed).order[0]]++;
 const rows=lineup.map((id,i)=>{const expected=weights[i]/sum,actual=wins[i]/count;assert.ok(Math.abs(expected-actual)<.008);return{id,expectedWinPercent:+(expected*100).toFixed(2),observedWinPercent:+(actual*100).toFixed(2)}});
 const returns=[];for(const kind of ['win','pair','exact'])for(let a=0;a<8;a++)for(let b=0;b<(kind==='win'?1:8);b++){
  if(kind!=='win'&&a===b)continue;const ticket={kind,picks:kind==='win'?[a]:[a,b]},odds=odds451(racers,course,ticket);let prob=weights[a]/sum;
  if(kind==='exact')prob*=weights[b]/(sum-weights[a]);if(kind==='pair')prob=prob*weights[b]/(sum-weights[a])+weights[b]/sum*weights[a]/(sum-weights[b]);
  const expected=odds*prob;assert.ok(expected<=.900001&&expected>.875);assert.ok(Number.isSafeInteger(payout451(1000000,odds)));returns.push(expected);
 }
 checks.push({course,conditions:mixed?'mixed 1–5':'all normal',races:count,rows,expectedReturnRange:returns.reduce((r,n)=>[Math.min(r[0],n),Math.max(r[1],n)],[1,0])});
}
const report={profiles:ids.length,totalPoints:210,skills:new Set(profiles.map(p=>p.skill)).size,groundCounts:profiles.reduce((o,p)=>(o[p.ground]=(o[p.ground]??0)+1,o),{}),simulatedRaces:200000,checks,prizes:[8000,3000,1000],training:{first:{expPercent:3,affection:8},second:{expPercent:2.5,affection:7},third:{expPercent:2.2,affection:6},other:{expPercent:2,affection:5}},oddsPolicy:'Same 90% theoretical ticket return target, rounded down to 0.1 odds; no hidden post-purchase changes'};
fs.writeFileSync('docs/build453/balance-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({profiles:report.profiles,skills:report.skills,simulatedRaces:report.simulatedRaces,checks:'pass'}));
