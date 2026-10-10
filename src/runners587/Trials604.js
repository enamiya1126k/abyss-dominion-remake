import {enemyAt587} from './Level587.js';
import {sweep604} from './Threats604.js';
export function hitTarget604(g,course,b,oldX,oldY,emit,limit=2){
 for(const trial of course.trials601){if(trial.kind604!=='targets')continue;const state=g.coop601[trial.id]??={open:false,hit604:[]};state.hit604??=[];
  for(const target of trial.targets604){if(state.hit604.includes(target.id))continue;const t=sweep604(oldX,oldY,b.x,b.y,{x:target.x-12,y:target.y-12,w:24,h:24},5);if(t==null||t>=limit)continue;state.hit604.push(target.id);emit(g,'target-hit',{seat:b.owner,x:target.x,y:target.y});return true;}
 }return false;
}
export function trial604(g,trial,players,emit){
 const state=g.coop601[trial.id]??={charge:0,open:false},mode=trial.kind604;
 if(!mode||mode==='duet')return false;
 if(mode==='sprint'){
  if(state.open&&g.elapsed>=state.until604&&!state.claimed604){state.open=false;state.charge=0;}
  const held=players.some(p=>p.grounded&&Math.abs(p.x-trial.pads[0].x)<23&&Math.abs(p.y-trial.pads[0].y)<5);
  if(held&&!state.open){state.open=true;state.until604=g.elapsed+trial.limit604;emit(g,'star-unlock',{x:trial.reward.x,y:trial.reward.y});}
  return true;
 }
 if(state.open)return true;
 let open=false;
 if(mode==='targets')open=trial.targets604.every(t=>state.hit604?.includes(t.id));
 if(mode==='combat')open=trial.guards604.every(id=>g.enemies.find(e=>e.id===id)?.defeated);
 if(mode==='ice'){const e=g.enemies.find(e=>e.id===trial.iceId604),q=e?.ice&&enemyAt587(e,g.elapsed),pad=trial.pads[0];open=!!q&&Math.abs(q.x-pad.x)<32&&Math.abs(q.y-pad.y)<8;
  if(e&&!open&&(e.defeated||!q||Math.abs(q.x-pad.x)>240)){state.resetAt604??=g.elapsed+1800;if(g.elapsed>=state.resetAt604){e.defeated=false;e.ice={x:pad.x-85,y:pad.y,dir:1,vx:0,vy:0,at:g.elapsed,until:1e9,kicker:null,grace:0};e.frozenAt=g.elapsed;e.frozenUntil=1e9;delete state.resetAt604;}}
 }
 if(mode==='rings'){state.ring604??=0;const ring=trial.rings604[state.ring604];if(ring&&players.some(p=>Math.hypot(p.x-ring.x,p.y-14-ring.y)<27)){state.ring604++;emit(g,'ring',{x:ring.x,y:ring.y});}open=state.ring604>=trial.rings604.length;}
 if(open){state.open=true;state.at=g.elapsed;emit(g,'star-unlock',{x:trial.reward.x,y:trial.reward.y});}return true;
}
