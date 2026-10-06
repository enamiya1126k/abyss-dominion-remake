import {RUN587,control587,stepRunner587,enemyContact588} from './Physics587.js';
import {course589} from './Courses589.js';
import {enemyAt587} from './Level587.js';
export function remember591(c){
 const g=c.state?.runners,u=c.runnersUI587;if(!g||!u)return;
 if(u.motionId!==g.id||u.motionStart591!==g.startAt){u.motionStart591=g.startAt;u.motionId=g.id;u.frames591=[];u.corrections591=new Map();u.inputs591=[];}
 const frames=u.frames591;
 if(frames.at(-1)?.serverAt!==g.serverAt){frames.push(g);if(frames.length>6)frames.shift();}
}
function extrapolate(c,p,g,at){
 const q={...p},u=c.runnersUI587,self=p.playerId===c.transport.selfId&&!p.auto;
 if(p.waiting||!p.alive||p.respawnAt||p.finishTime!=null||g.phase!=='play'||g.stage!=='run')return q;
 const ms=Math.min(150,Math.max(0,at-g.serverAt)),course=course589(g);
 if(self){
  const pending=(u.inputs591??[]).filter(i=>i.seq>(p.processedSeq??p.lastSeq));
  for(const i of pending)control587(q,i.target,g.serverAt);
  control587(q,u.intent??{axis:0,jump:false,attack:false},g.serverAt);
 }
 const defeated=new Set();
 for(let dt=0;dt<ms;){
  const step=Math.min(RUN587.step,ms-dt);dt+=step;
  const {before}=stepRunner587(q,g.serverAt+dt,g.elapsed+dt,step/1000,g);
  for(const e of g.enemies){
   if(e.defeated||defeated.has(e.id))continue;
   const enemy=enemyAt587(e,g.elapsed+dt);
   if(enemyContact588(q,enemy,before)==='stomp'){q.y=enemy.y-24;q.vy=q.jumpHeld?-365:-285;q.grounded=false;q.lastGroundAt=-1e9;q.springFlight=true;defeated.add(e.id);break;}
  }
  const spring=course.springs.find(s=>q.grounded&&Math.abs(s.x-q.x)<21&&Math.abs(s.y-q.y)<5);
  if(spring){q.vy=-(spring.power??RUN587.spring);q.grounded=false;q.lastGroundAt=-1e9;q.springFlight=true;}
 }
 return q;
}
export function predict591(c,p,at){
 const u=c.runnersUI587,g=c.state.runners,frames=u.frames591??[],self=p.playerId===c.transport.selfId&&!p.auto;
 if(!self&&g.phase==='play'&&g.stage==='run'&&frames.length>1&&!p.respawnAt&&p.alive&&p.finishTime==null){
  const t=at-75;
  for(let i=frames.length-1;i>0;i--){const a=frames[i-1],b=frames[i];if(t<a.serverAt||t>b.serverAt)continue;
   const pa=a.players[p.seat],pb=b.players[p.seat];
   if(!pa||!pb||pa.respawnAt||pb.respawnAt||Math.abs(pa.x-pb.x)>100)break;
   const f=(t-a.serverAt)/Math.max(1,b.serverAt-a.serverAt);
   return {...p,x:pa.x+(pb.x-pa.x)*f,y:pa.y+(pb.y-pa.y)*f};
  }
 }
 // Remote players use snapshots, never run a second physics simulation locally.
 if(!self){const ms=g.phase==='play'&&g.stage==='run'&&p.alive&&!p.respawnAt&&p.finishTime==null?Math.min(50,Math.max(0,at-75-g.serverAt)):0;return {...p,x:p.x+p.vx*ms/1000,y:p.y+(p.grounded?0:p.vy*ms/1000)};}
 const q=extrapolate(c,p,g,at);
 const records=u.corrections591??=new Map();let r=records.get(p.seat);
 if(!r){r={source:g,at,dx:0,dy:0};records.set(p.seat,r);}
 if(r.source.serverAt!==g.serverAt){
  const old=r.source.players[p.seat];
  if(old&&old.alive&&p.alive&&!old.respawnAt&&!p.respawnAt&&Math.abs(old.x-p.x)<85&&old.checkpoint===p.checkpoint){
   const before=extrapolate(c,old,r.source,at);r.dx=Math.max(-26,Math.min(26,r.dx+before.x-q.x));r.dy=Math.max(-22,Math.min(22,r.dy+before.y-q.y));
  }else{r.dx=0;r.dy=0;}
  r.source=g;
 }
 const decay=Math.exp(-Math.max(0,at-r.at)/65);r.dx*=decay;r.dy*=decay;r.at=at;
 q.x+=r.dx;q.y+=r.dy;return q;
}
