// Shared authoritative pinball mechanisms. Rendering uses this same geometry.
export const CARNIVAL552=Object.freeze({height:18,chainWindow:2300,feverHits:36,feverMs:5000,rotorY:9,rotorHalf:1.85,rotorRadius:.43,rotorOmega:.9,jackpotRestMs:6000});
export const GEM_COLORS552=['#ff7f92','#78d6ff','#8becae'];
export function carnivalLayout552(){
 const gems=[[-3.55,5.65,0],[3.55,5.65,1],[-3.55,11.2,2],[3.55,11.2,0],[-2.15,15.6,1],[2.15,15.6,2]];
 return {bumpers:[...gems.map(([x,y,gem],id)=>({id,x,y,gem,r:.72,value:60,kind:'gem'})),{id:6,x:0,y:13.15,r:1.02,value:120,kind:'crown'},{id:7,x:0,y:4.7,r:.67,value:45,kind:'bell'}],chests:[{id:0,x:-4.65,y:15.95,r:.45,claimed:null},{id:1,x:4.65,y:15.95,r:.45,claimed:null}],posts:[],belts:[],pickups:[]};
}
export function initCarnival552(g){g.carnival552={startedAt:g.simAt,pot:800,wins:0,heat:0,feverUntil:0,lockUntil:0};for(const p of g.players)Object.assign(p,{gems552:0,jackpots552:0,bestCombo552:0});}
export const fever552=g=>!!g.carnival552&&g.simAt<g.carnival552.feverUntil;
export const chainMultiplier552=p=>1+Math.min(4,Math.floor((p.combo??0)/3))*.25;
export const rotorAngle552=(g,at=g.simAt)=>(at-(g.carnival552?.startedAt??at))/1000*CARNIVAL552.rotorOmega;
export function tickCarnival552(g){for(const b of g.layout.chests)if(b.claimed!=null&&g.simAt>=b.respawnAt552){b.claimed=null;delete b.respawnAt552}}
export function pinHit552(g,p,b,{event,award}){
 const c=g.carnival552;
 if(b.kind==='gem'){
  const was=p.gems552;p.gems552|=1<<b.gem;c.pot=Math.min(6000,c.pot+30);
  if(was!==7&&p.gems552===7)event(g,'ready',{seat:p.seat,x:p.x,y:p.y,text:'３色そろった！ 王冠を狙え！'});
  if(!fever552(g)&&++c.heat>=CARNIVAL552.feverHits){c.heat=0;c.feverUntil=g.simAt+CARNIVAL552.feverMs;event(g,'fever',{x:0,y:13.15,text:'FEVER · みんな得点２倍！'})}
 }
 if(b.kind==='crown'&&p.gems552===7&&g.simAt>=c.lockUntil){
  const value=c.pot;p.gems552=0;p.jackpots552++;c.wins++;c.lockUntil=g.simAt+CARNIVAL552.jackpotRestMs;c.pot=Math.min(1800,800+c.wins*100);
  award(g,p,value,'jackpot',b.x,b.y);return;
 }
 const level=id=>p.parts?.[id]??0;
 award(g,p,(b.value+40*level('spark'))*1.35**level('crown'),'pin',b.x,b.y,{gem:b.gem,bumper:b.id});
 if(b.kind==='bell'){p.charge=Math.min(120,p.charge+6);event(g,'bell',{seat:p.seat,x:b.x,y:b.y})}
}
// Closest point on a rotating capsule; relative surface speed transfers momentum.
// Called inside the shared adaptive substep/constraint solver, including unlaunched players.
export function rotorContact552(g,p,{hit,event,cool}){
 const {rotorY:y,rotorHalf:half,rotorRadius:r,rotorOmega:omega}=CARNIVAL552,a=rotorAngle552(g),ux=Math.cos(a),uy=Math.sin(a);
 const along=Math.max(-half,Math.min(half,p.x*ux+(p.y-y)*uy)),qx=ux*along,qy=y+uy*along;
 let dx=p.x-qx,dy=p.y-qy,d=Math.hypot(dx,dy),distance=p.r+r;
 if(d>=distance)return;
 if(d<1e-8){dx=-uy;dy=ux;d=1}
 const nx=dx/d,ny=dy/d;p.x=qx+nx*(distance+.00001);p.y=qy+ny*(distance+.00001);
 const sx=-omega*(qy-y),sy=omega*qx,vn=(p.vx-sx)*nx+(p.vy-sy)*ny;
 if(vn>=0)return;
 p.vx-=1.94*vn*nx;p.vy-=1.94*vn*ny;
 if(-vn>.7&&cool(g,`${p.seat}:rotor`,220)){hit(g,p,-vn);event(g,'rotor',{seat:p.seat,x:qx,y:qy,strength:-vn})}
}
export function comboHit552(g,p,event){
 p.bestCombo552=Math.max(p.bestCombo552??0,p.combo);
 if(p.combo>=3&&p.combo%3===0){const v=Math.hypot(p.vx,p.vy);if(v>.01&&p.combo<=12){p.vx*=1+1.4/v;p.vy*=1+1.4/v}event(g,'combo',{seat:p.seat,x:p.x,y:p.y,count:p.combo,text:p.combo+' CHAIN！'})}
}
export function affinity552(p,id){
 const pairs={spring:['comet','連鎖を加速'],echo:['mirror','反射コンボ'],mirror:['echo','倍率を育てる'],cell:['comet','噴射を充電'],comet:['cell','充電コンボ'],crown:['spark','得点を掛け算'],spark:['crown','勲章コンボ'],magnet:['chest','宝箱コンボ'],chest:['magnet','吸引コンボ'],link:['dice','倍率を掛け算'],dice:['link','衝突コンボ']};
 return (p.parts?.[id]??0)>0?'重ねて強化':pairs[id]&&p.parts?.[pairs[id][0]]?pairs[id][1]:id==='bank'?'後半への投資':'新しい能力';
}
