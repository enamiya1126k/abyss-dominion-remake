import fs from'node:fs';import assert from'node:assert/strict';
import{racePool455}from'../../src/race/RaceCatalog451.js';
import{raceProfile451,raceForecast455,raceWeights455,drawRace451,odds451,ticketWins451,rng451}from'../../src/race/RaceRules451.js';
const random=rng451(455),scenarios=[],favorites={old:0,current:0,observed:0},courses=['芝','砂'];let count=0;
// 2,000 distinct fields × 100 draws; includes common fatigue and mixed moods.
for(let field=0;field<2000;field++){
 const pool=[...racePool455],course=courses[field%2],racers=Array.from({length:8},()=>{const speciesId=pool.splice(Math.floor(random()*pool.length),1)[0];return{speciesId,profile:raceProfile451(speciesId),condition:Math.floor(random()*5),rulesVersion:3,fatigue455:field%2?Math.floor(random()*4):0}}),f=raceForecast455(racers,course),top=f.reduce((a,b)=>a.probability>b.probability?a:b),old=raceForecast455(racers.map(r=>({...r,rulesVersion:2})),course);
 favorites.old+=Math.max(...old.map(x=>x.probability));favorites.current+=top.probability;assert.ok(top.probability<=.800000001);
 for(let n=0;n<100;n++){const result=drawRace451(racers,course,Math.floor(random()*0xffffffff));favorites.observed+=result.order[0]===top.index?1:0;count++}
 const w=raceWeights455(racers,course),sum=w.reduce((a,b)=>a+b,0);
 for(const kind of['win','pair','exact'])for(let a=0;a<8;a++)for(let b=0;b<(kind==='win'?1:8);b++){if(kind!=='win'&&a===b)continue;const picks=kind==='win'?[a]:[a,b];let p=w[a]/sum;if(kind==='exact')p*=w[b]/(sum-w[a]);if(kind==='pair')p=p*w[b]/(sum-w[a])+w[b]/sum*w[a]/(sum-w[b]);assert.ok(odds451(racers,course,{kind,picks})*p<=.9000001)}
 if(field<4)scenarios.push({course,rows:f.map(x=>({...x,speciesId:racers[x.index].speciesId,fatigue:racers[x.index].fatigue455,condition:racers[x.index].condition}))});
}
const report={fields:2000,races:count,favoriteOldPercent:favorites.old/20,favoriteExpectedPercent:favorites.current/20,favoriteObservedPercent:100*favorites.observed/count,scenarios,allTicketExpectedReturnAtMost:.9};assert.ok(Math.abs(report.favoriteExpectedPercent-report.favoriteObservedPercent)<.6);assert.ok(report.favoriteExpectedPercent>30);fs.writeFileSync('docs/build455/balance-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,scenarios:undefined}));
