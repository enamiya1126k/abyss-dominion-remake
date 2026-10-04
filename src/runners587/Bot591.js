import {course589,hazard589} from './Courses589.js';
import {surfaces587,enemyAt587} from './Level587.js';
import {control587} from './Physics587.js';
// Bounded local observations replace hundreds of simulated future steps.
export function bot591(g,p){
 const course=course589(g),now=g.lastAt;
 const humans=g.players.filter(q=>!q.ai&&!q.auto&&q.alive&&!q.respawnAt&&q.finishTime==null);
 if(humans.length&&p.grounded&&p.x>Math.max(...humans.map(q=>q.x))+190){control587(p,{axis:0,jump:false,attack:false},now);return;}
 const enemy=g.enemies.filter(e=>!e.defeated).map(e=>enemyAt587(e,g.elapsed)).find(e=>e.x>p.x&&e.x-p.x<155&&Math.abs(e.y-p.y)<40);
 // AI helps with enemies but will not deliberately shoot through a teammate.
 const friend=g.players.some(q=>q!==p&&q.alive&&!q.respawnAt&&q.x>p.x&&q.x-p.x<170&&Math.abs(q.y-p.y)<40);
 const attack=!!enemy&&!friend;
 if(!p.grounded){const kick=p.wallSide&&now-(p.wallAt??-1e9)<100;control587(p,{axis:1,jump:kick?!p.jumpHeld:p.jumpHeld&&p.vy<0,attack},now);return;}
 const surfaces=surfaces587(g.elapsed,course,g),floor=surfaces.find(s=>s.id===p.platformId);
 const edge=floor?floor.x+floor.w-p.x:0;
 const next=surfaces.filter(s=>s.x>p.x&&s.y<=p.y+35).sort((a,b)=>a.x-b.x)[0];
 const gap=next&&floor?next.x-floor.x-floor.w:0;
 const spring=course.springs.find(s=>s.x>=p.x-15&&s.x-p.x<95&&Math.abs(s.y-p.y)<5);
 const wall=course.walls.some(s=>s.x>p.x&&s.x-p.x<75&&s.y<p.y);
 const vent=course.hazards.some(h=>h.x>p.x-15&&h.x-p.x<100&&(hazard589(h,g.elapsed).active||hazard589(h,g.elapsed).warning));
 const jump=!p.jumpHeld&&(wall||vent||enemy&&enemy.x-p.x<85||edge<65&&gap>8&&!spring);
 control587(p,{axis:1,jump,attack},now);
}
