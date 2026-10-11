import {partyClock615} from '../party/Realtime615.js';
import {rememberSnapshot615,snapshotPair615,interpolate615} from '../party/Snapshots615.js';
import {cannonStomp605} from './CannonStomp605.js';
import {sweep604} from './Threats604.js';
import {buddyContact601,bounceBuddy601} from './Coop601.js';
import {RUN587,control587,stepRunner587,enemyContact588,stomp599} from './Physics587.js';
import {bossPose612,bossStomp600,bossHead606,bossGuardBounce606} from './Encounters600.js';
import {course589} from './Courses589.js';
import {enemyAt587,surfaces587} from './Level587.js';
function ground596(q,g,at,sourceAt=at){
 if(q.waiting||q.paused||!q.grounded||!q.platformId||q.respawnAt||!q.alive||q.finishTime!=null)return q;
 const course=course589(g),elapsed=g.elapsed+Math.min(150,Math.max(0,at-g.serverAt)),s=surfaces587(elapsed,course,g).find(s=>s.id===q.platformId);
 if(!s||Math.abs(q.y-s.y)>32)return q;
 // Snapshot interpolation can lag by 75ms, but a rider and their platform
 // must be painted at the same time. This affects only display positions.
 if(s.move&&sourceAt!==at){const old=surfaces587(g.elapsed+sourceAt-g.serverAt,course,g).find(p=>p.id===s.id);if(old)q.x+=s.x-old.x;}
 if(q.x+11>s.x&&q.x-11<s.x+s.w)q.y=s.y;
 return q;
}
export function remember591(c){
 const g=c.state?.runners,u=c.runnersUI587;if(!g||!u)return;
 if(u.motionId!==g.id||u.motionRound599!==g.round){u.motionRound599=g.round;u.motionId=g.id;u.frames591=[];u.corrections591=new Map();u.inputs591=[];}
 const self=g.players.find(p=>p.playerId===c.transport?.selfId);
 if(self){const epoch=[g.id,g.round,self.motionEpoch600??0,!!self.respawnAt,!!self.waiting,!!self.paused].join(':');
  if(u.life600!==epoch){if(u.life600&&u.renderer&&!self.respawnAt)u.renderer.snap=true;u.life600=epoch;u.inputs591=[];u.corrections591.delete(self.seat);u.pendingJump=null;u.sentJump=false;}
 }
 rememberSnapshot615(u,g,c.realtime615?.installed?partyClock615(c):g.serverAt);
 const frames=u.frames591;
 if(frames.at(-1)?.serverAt!==g.serverAt){frames.push(g);if(frames.length>6)frames.shift();}
}
function extrapolate(c,p,g,at){
 const q={...p},u=c.runnersUI587,self=p.playerId===c.transport.selfId&&!p.auto;
 if(p.waiting||p.paused||!p.alive||p.respawnAt||p.finishTime!=null||g.phase!=='play'||g.stage!=='run')return q;
 const ms=Math.min(300,Math.max(0,at-g.serverAt)),course=course589(g);
 const pending=self?(u.inputs591??[]).filter(i=>i.seq>(p.processedSeq??p.lastSeq)):[];let input=0;
 const defeated=new Set(),brokenShots=new Set();
 for(let dt=0;dt<ms;){
  const step=RUN587.step;const prior={...q};dt+=step;
  while(input<pending.length&&pending[input].at<=g.serverAt+dt){const i=pending[input++];control587(q,i.target,Math.max(g.serverAt,i.at));}
  const {before}=stepRunner587(q,g.serverAt+dt,g.elapsed+dt,step/1000,g);
  for(const e of g.enemies){
   if(e.defeated||e.ice||e.downUntil>g.serverAt+dt||defeated.has(e.id))continue;
   const enemy=enemyAt587(e,g.elapsed+dt);
   if(!(q.frozenUntil604>g.elapsed+dt)&&enemyContact588(q,enemy,before)==='stomp'){stomp599(q,enemy);defeated.add(e.id);break;}
  }
  for(const base of g.players){
   if(base.seat===q.seat)continue;const lead=dt/1000,oldBase={...base,x:base.x+base.vx*Math.max(0,lead-step/1000),y:base.y+(base.grounded?0:base.vy*Math.max(0,lead-step/1000))},nextBase={...base,x:base.x+base.vx*lead,y:base.y+(base.grounded?0:base.vy*lead)};
   if(buddyContact601(q,before,nextBase,oldBase,g.serverAt+dt)){bounceBuddy601(q,nextBase,g.serverAt+dt);break;}
  }
  if(g.boss600&&!defeated.has('boss600')){const b={...g.boss600,...bossPose612(g.boss600,g.elapsed+dt)};if(bossStomp600(q,b,before,g.elapsed+dt)){stomp599(q,{y:b.y-38});defeated.add('boss600');}else if(bossHead606(q,b,before,g.elapsed+dt)){bossGuardBounce606(q,b,g.serverAt+dt,stomp599);defeated.add('boss600');}}
  for(const base of g.threats604?.shots??[]){
   if(base.kind!=='cannon'||brokenShots.has(base.id)||base.until<=g.elapsed+dt)continue;
   const from=(dt-step)/1000,to=dt/1000,s={...base,oldX:base.x+base.vx*from,oldY:base.y+base.vy*from,x:base.x+base.vx*to,y:base.y+base.vy*to},hit=cannonStomp605(q,before,s,g.elapsed+dt);
   if(!hit)continue;
   const blocked=surfaces587(g.elapsed+dt,course,g).filter(b=>!b.spike&&!b.ice&&!b.oneWay).some(b=>{const t=sweep604(s.oldX,s.oldY,s.x,s.y,b,s.r);return t!=null&&t<=hit.time;});
   if(!blocked){stomp599(q,{y:hit.y+24});brokenShots.add(s.id);break;}
  }
  if(dt>ms){const f=(ms-(dt-step))/step;q.x=prior.x+(q.x-prior.x)*f;q.y=prior.y+(q.y-prior.y)*f;
   q.grounded=prior.grounded&&q.grounded&&prior.platformId===q.platformId;if(!q.grounded)q.platformId=null;
  }
 }
 return q;
}
export function predict591(c,p,at){
 const u=c.runnersUI587,g=c.state.runners,self=p.playerId===c.transport.selfId&&!p.auto;
 if(!self){
  if(g.phase!=='play'||g.stage!=='run'||!p.alive||p.waiting||p.paused||p.respawnAt||p.finishTime!=null)return {...p};
  const pair=snapshotPair615(u,at),q=interpolate615(pair,'players',p.seat);
  if(q&&q.motionEpoch600===p.motionEpoch600&&q.alive&&!q.waiting&&!q.paused&&q.finishTime==null){
   return ground596(q,g,at,pair.time);
  }
  return ground596({...p},g,at,g.serverAt);
 }
 const q=extrapolate(c,p,g,at);
 const records=u.corrections591??=new Map();let r=records.get(p.seat);
 if(!r){r={source:g,at,dx:0,dy:0};records.set(p.seat,r);}
 // Decay the previous correction before adding a new one. Decaying the new
 // correction immediately made each delayed packet visibly kick the player.
 const decay=Math.exp(-Math.max(0,at-r.at)/100);r.dx*=decay;r.dy*=decay;r.at=at;
 if(r.source.serverAt!==g.serverAt){
  const old=r.source.players[p.seat];
  if(old&&old.alive&&p.alive&&!old.respawnAt&&!p.respawnAt&&!p.waiting&&!p.paused&&old.motionEpoch600===p.motionEpoch600&&Math.abs(old.x-p.x)<160&&old.checkpoint===p.checkpoint){
   const before=extrapolate(c,old,r.source,at);r.dx=Math.max(-96,Math.min(96,r.dx+before.x-q.x));r.dy=Math.max(-64,Math.min(64,r.dy+before.y-q.y));
  }else{r.dx=0;r.dy=0;}
  r.source=g;
 }
 if(q.grounded||p.respawnAt||p.waiting||p.paused)r.dy=0;
 q.x=Math.max(RUN587.radius,Math.min(course589(g).length-RUN587.radius,q.x+r.dx));q.y+=r.dy;return ground596(q,g,at);
}
