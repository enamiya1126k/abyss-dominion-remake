// One continuous, server-owned match. Geometry is shared by physics and drawing.
export const ARENA555=Object.freeze({width:16,height:18.4,reload:2800,supply:30000,pickMs:7000,rotorY:9.25,rotorHalf:2.65,rotorRadius:.43,inertia:14,rotorDrag:.38,feverMs:7000});
export function layout555(){return{bumpers:[[-4.05,6.0,0],[4.05,6.0,1],[-4.05,12.4,2],[4.05,12.4,0],[-2.9,16.0,1],[2.9,16.0,2]].map(([x,y,gem],id)=>({id,x,y,gem,r:.65,value:60,kind:'gem'})).concat([{id:6,x:0,y:14.45,r:.9,value:80,kind:'crown'},{id:7,x:0,y:3.8,r:.6,value:40,kind:'bell'}]),rails:[-1,1].map(side=>({x:side*5.55,from:4.15,to:14.15,r:.12})),lanes:[-1,1].map(side=>({side,x:side*6.8,checkpoints:[3.25,8.9,14.7]})),chests:[],posts:[],belts:[],pickups:[]};}
export const canShoot555=(g,p,at=g.simAt)=>!!(g.game==='pinball'&&g.phase==='play'&&p?.picked&&at>=p.nextShotAt555&&at<g.deadline);
export const final555=(g,at=g.simAt)=>g.phase==='play'&&g.deadline-at<=15000;
export function initArena555(g){g.session555={startedAt:g.simAt,duration:g.duration555,nextSupply:g.simAt+ARENA555.supply,supplyCount:1};g.carnival552.rotor555={angle:0,omega:0,owner:null};g.carnival552.heat=0;for(const p of g.players)Object.assign(p,{shots555:0,nextShotAt555:g.simAt,offerId555:0,offerUntil555:0,lane555:null,lanes555:0,spinWins555:0,breakdown555:{pin:0,lane:0,spinner:0,jackpot:0},wallMult:1});}
export function stepRotor555(g,dt,event,award){const c=g.carnival552,r=c.rotor555;r.omega*=Math.exp(-ARENA555.rotorDrag*dt);if(Math.abs(r.omega)<.004)r.omega=0;const delta=r.omega*dt;r.angle=(r.angle+delta)%(Math.PI*2);
 if(g.simAt<c.feverUntil)return;c.heat=Math.min(100,c.heat+Math.abs(delta)*8.2);
 if(c.heat>=100){c.heat=0;c.feverUntil=g.simAt+ARENA555.feverMs;const p=g.players.find(p=>p.seat===r.owner);if(p){p.spinWins555++;award(g,p,1000,'spinner',0,ARENA555.rotorY,{fixed:true});}event(g,'fever',{seat:r.owner,x:0,y:ARENA555.rotorY,text:'回転で起動！ ７秒、全員得点２倍！'});}
}
// A fixed pivot absorbs translation; the finite moment of inertia receives torque.
// The opposite impulse is applied to the moving body, so a stationary bar cannot add energy.
export function rotorContact555(g,p,{hit,event,cool}){const r=g.carnival552.rotor555,{rotorHalf:half,rotorRadius:radius,rotorY:y,inertia:I}=ARENA555,ux=Math.cos(r.angle),uy=Math.sin(r.angle);
 const along=Math.max(-half,Math.min(half,p.x*ux+(p.y-y)*uy)),shapes=[{qx:ux*along,qy:uy*along,r:.16},...[-1,1].map(sign=>({qx:ux*half*sign,qy:uy*half*sign,r:radius})),{qx:0,qy:0,r:.5}];
 const contact=shapes.map(q=>({...q,dx:p.x-q.qx,dy:p.y-y-q.qy,d:Math.hypot(p.x-q.qx,p.y-y-q.qy),min:p.r+q.r})).filter(q=>q.d<q.min).sort((a,b)=>(b.min-b.d)-(a.min-a.d))[0];if(!contact)return 0;let {qx,qy,dx,dy,d,min}=contact;
 if(d<1e-8){dx=-uy;dy=ux;d=1;}const nx=dx/d,ny=dy/d;p.x=qx+nx*(min+.00001);p.y=y+qy+ny*(min+.00001);
 const lever=qx*ny-qy*nx,sx=-r.omega*qy,sy=r.omega*qx,vn=(p.vx-sx)*nx+(p.vy-sy)*ny;if(vn>=0)return 0;
 const impulse=-1.84*vn/(1/p.mass+lever*lever/I);p.vx+=impulse*nx/p.mass;p.vy+=impulse*ny/p.mass;r.omega=Math.max(-10,Math.min(10,r.omega-impulse*lever/I));if(Math.abs(lever)>.3)r.owner=p.seat;
 if(-vn>.7&&cool(g,`${p.seat}:rotor`,200)){hit(g,p,-vn);event(g,'rotor',{seat:p.seat,x:qx,y:y+qy,strength:-vn,omega:r.omega,lever});}return impulse;
}
export function laneCross555(g,p,oldX,oldY,{event,award,gem}){if(p.lane555&&(g.simAt>p.lane555.until||Math.abs(p.x)<5.7))p.lane555=null;if(p.y<=oldY)return;
 for(const lane of g.layout.lanes){for(let i=0;i<lane.checkpoints.length;i++){const y=lane.checkpoints[i];if(oldY>=y||p.y<y)continue;const x=oldX+(p.x-oldX)*(y-oldY)/(p.y-oldY);if(Math.abs(x-lane.x)>.8)continue;
  if(i===0)p.lane555={side:lane.side,step:0,until:g.simAt+5000};const q=p.lane555;if(!q||q.side!==lane.side||q.step!==i)continue;q.step++;gem(g,p,i,event);event(g,'laneGate',{seat:p.seat,x:lane.x,y,step:q.step});
  if(q.step===3){p.lane555=null;p.lanes555++;award(g,p,800,'lane',lane.x,y);event(g,'laneComplete',{seat:p.seat,x:lane.x,y,text:'外周レーン完走！ ３色 → 王冠へ！'});}
 }}
}
export function shiftArena555(g,shift){g.session555.startedAt+=shift;g.session555.nextSupply+=shift;for(const p of g.players){p.nextShotAt555+=shift;p.offerUntil555+=shift;if(p.lane555)p.lane555.until+=shift;}}
