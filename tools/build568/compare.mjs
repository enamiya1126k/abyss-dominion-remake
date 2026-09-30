import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import * as after from '../../src/ricochet550/Hockey564.js';
import {members} from '../build563/fixture.mjs';
const source=execFileSync('git',['show','649b9d3d328fdfff5177263d8e3711d135b9c45b:src/ricochet550/Hockey564.js'],{encoding:'utf8'});
const before=await import('data:text/javascript;base64,'+Buffer.from(source.replace("'./Goals563.js'",JSON.stringify(new URL('../../src/ricochet550/Goals563.js',import.meta.url).href))).toString('base64'));
const report={scope:'Deterministic AI matches, not human playtesting. Same 12 seeds per propeller/speed combination; changes can alter later random decisions.',before:[],after:[]};
for(const [name,rules] of [['before',before],['after',after]])for(const rotor of [false,true])for(const speed of [1,2]){
 const row={rotor,speed,matches:12,goals:0,ownGoals:0,passes:0,teamGoals:[0,0]};
 for(let seed=1;seed<=row.matches;seed++){
  const g=rules.makeHockey564({id:'compare',code:'TEST',hostId:'p0',members:members(),now:0});g.hockey565={rotor,speed};rules.startHockey564(g,0,seed);g.players.forEach(p=>p.ai=true);
  for(let at=20;at<=g.deadline;at+=20)rules.advanceHockey564(g,at);
  if(g.phase!=='result')throw Error('match did not finish');
  for(const t of g.teams564){row.goals+=t.goals;row.teamGoals[t.id]+=t.goals;}
  for(const p of g.players){row.ownGoals+=p.ownGoals564;row.passes+=p.passes565;}
 }
 row.ownGoalFraction=row.ownGoals/row.goals;report[name].push(row);
}
await writeFile(new URL('../../docs/build568/ai-comparison.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
