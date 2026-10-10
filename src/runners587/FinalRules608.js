import {sweep604} from './Threats604.js';
const live=(p,g)=>p.alive&&!p.departed&&!p.ai&&!p.auto&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null&&!(p.frozenUntil604>g.elapsed);
const on=(p,q)=>p.grounded&&Math.abs(p.x-q.x)<22&&Math.abs(p.y-q.y)<3;
export const crew608=g=>g.players.filter(p=>p.alive&&!p.departed&&!p.ai&&!p.auto&&!p.waiting&&!p.paused&&!p.respawnAt);
export function finalReady608(g,c){return !c.final608||crew608(g).length>=2&&c.gates608.every(h=>g.final608?.[h.id]?.done);}
export function finalWalls608(c,g){return (c.gates608??[]).filter(h=>!g.final608?.[h.id]?.done).map(h=>({id:h.id+'-wall',x:h.x,y:-1600,w:24,h:2800,wall:true,finalWall608:true}));}
export function finalStep608(g,c,emit){
 if(!c.final608)return;g.final608??={};const players=g.players.filter(p=>live(p,g));
 for(const h of c.gates608){const s=g.final608[h.id]??={done:false,hits:[]};if(s.done)continue;
  const before=c.gates608.slice(0,c.gates608.indexOf(h)).every(q=>g.final608[q.id]?.done);
  if(h.rescue608&&before&&players.length>=2&&players.some(p=>p.x>=h.rescue608.x&&p.x<h.x&&p.y<=h.rescue608.y))g.coop601[h.id+'-ladder']={open:true};
  const left=players.filter(p=>on(p,h.left)),right=players.filter(p=>on(p,h.right));let success=false;
  if(h.kind==='relay'||h.kind==='ice')g.coop601[h.id]={open:before&&players.length>=2&&left.length>0};
  if(before&&players.length>=2){
   if(h.kind==='relay'||h.kind==='sync')success=left.some(a=>right.some(b=>b.seat!==a.seat));
   if(h.kind==='sync'){s.charge=success?(s.charge??0)+(s.chargeAt===g.elapsed?0:25):0;s.chargeAt=g.elapsed;success=s.charge>=650;}
   if(h.kind==='targets'){s.hits=s.hits.filter(v=>g.elapsed-v.at<=h.window&&players.some(p=>p.seat===v.seat));success=s.hits.length===2&&s.hits[0].seat!==s.hits[1].seat;}
   if(h.kind==='hunt'){
    const foes=h.guards.map(id=>g.enemies.find(e=>e.id===id)),dead=foes.filter(e=>e?.defeated);
    success=dead.length===2&&dead[0].finalHit608?.seat!==dead[1].finalHit608?.seat&&dead.every(e=>players.some(p=>p.seat===e.finalHit608?.seat))&&Math.abs(dead[0].finalHit608?.at-dead[1].finalHit608?.at)<=h.window;
    if(!success&&dead.some(e=>g.elapsed-(e.finalHit608?.at??0)>h.window))for(const e of foes){e.defeated=false;e.downUntil=0;delete e.ice;delete e.finalHit608;delete e.throw604;}
   }
   if(h.kind==='ice'){
    const e=g.enemies.find(e=>e.id===h.iceId),q=e?.ice;
    success=!!q&&!e.defeated&&Math.abs(q.x-h.right.x)<45&&Math.abs(q.y-h.right.y)<4&&left.some(p=>p.seat!==q.kicker)&&players.some(p=>p.seat===q.kicker);
   }
  }
  if(h.kind==='ice'){
   const e=g.enemies.find(e=>e.id===h.iceId);if(e&&(e.defeated||!e.ice||e.ice.y>400||e.ice.x>h.x||e.ice.x<h.left.x)){s.reset??=g.elapsed+1600;if(g.elapsed>=s.reset){e.defeated=false;e.ice={x:e.x,y:e.y,vx:0,vy:0,dir:1,at:g.elapsed,until:1e9,kicker:null,grace:0};e.frozenUntil=1e9;delete s.reset;}}
  }
  if(success){s.done=true;s.by=[...new Set(players.map(p=>p.seat))];g.coop601[h.id]={open:true};emit(g,'final-seal',{x:h.x,y:240,index:c.gates608.indexOf(h)+1});if(h.kind==='ice'){const e=g.enemies.find(e=>e.id===h.iceId);e.defeated=true;delete e.ice;}}
 }
}
export function hitFinalTarget608(g,c,b,x,y,emit,limit=2){
 if(!c.final608||!live(g.players[b.owner]??{},g))return false;
 for(const h of c.gates608){if(h.kind!=='targets'||g.final608?.[h.id]?.done)continue;
  for(const q of h.targets){const t=sweep604(x,y,b.x,b.y,{x:q.x-12,y:q.y-12,w:24,h:24},5);if(t==null||t>=limit)continue;
   g.final608??={};const s=g.final608[h.id]??={done:false,hits:[]};s.hits=s.hits.filter(v=>v.id!==q.id);s.hits.push({id:q.id,seat:b.owner,at:g.elapsed});emit(g,'target-hit',{seat:b.owner,x:q.x,y:q.y});return true;}
 }return false;
}
// Every damage path (shots, punches, stomps, kicked ice) goes through this gate.
export function bossPair608(g,b,seat,emit){
 if(!b.final608)return true;const p=g.players[seat];if(!p||!live(p,g)||crew608(g).length<2)return false;
 const old=b.pair608;if(old&&old.seat!==seat&&g.elapsed-old.at<=1000&&live(g.players[old.seat]??{},g)){delete b.pair608;emit(g,'final-pair',{seat,helper:old.seat,x:b.x,y:b.y-50});return true;}
 b.pair608={seat,at:g.elapsed};emit(g,'boss-block',{seat,x:b.x,y:b.y-50,pair608:true});return false;
}
