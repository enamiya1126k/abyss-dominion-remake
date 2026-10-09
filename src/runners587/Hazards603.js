// Deterministic geometry: rendering, server collision and prediction share time.
export const cycle603=(h,t)=>((t+(h.offset??0))%h.period+h.period)%h.period;
export function phase603(p,t){if(!p.phase603)return {solid:true,warning:false};const h=p.phase603,a=cycle603(h,t);return {solid:a<h.on,warning:a>=h.on-700&&a<h.on,phase:a};}
export function platform603(p,t){
 if(p.orbit603){const h=p.orbit603,a=t/h.period*Math.PI*2+(h.offset??0);return {x:p.x+Math.cos(a)*h.rx,y:p.y+Math.sin(a)*h.ry};}
 return p.move?{[p.move.axis]:p[p.move.axis]+Math.sin(t/p.move.period*Math.PI*2)*p.move.range}:{};
}
export function saw603(h,t){const a=t/h.period*Math.PI*2+(h.offset??0);return {x:h.x+(h.axis==='y'?0:Math.sin(a)*h.range),y:h.y+(h.axis==='y'?Math.sin(a)*h.range:0),r:h.r??18,angle:a*3};}
export function pendulum603(h,t){const angle=Math.sin(t/h.period*Math.PI*2+(h.offset??0))*(h.swing??.85);return {x:h.x+Math.sin(angle)*h.length,y:h.y+Math.cos(angle)*h.length,r:h.r??23,angle:-angle};}
export function lightning603(h,t){const a=cycle603(h,t),warning=h.warning??650,on=h.on??800;return {warning:a<warning,active:a>=warning&&a<warning+on,phase:a};}
export function cannon603(h,t){const a=cycle603(h,t),warning=h.warning??650,age=a-warning,d=h.dir??-1,speed=h.speed??300;return {warning:a<warning,active:age>=0&&age/1000*speed<(h.range??620),x:h.x+d*(32+Math.max(0,age)/1000*speed),y:h.y-(h.shotHeight??25),r:9};}
export function meteor603(h,t){const a=cycle603(h,t),warning=h.warning??750,fall=h.fall??1000,age=a-warning,from=h.from??h.y-390;return {warning:a<warning,active:age>=0&&age<fall,x:h.x,y:from+(h.y-from)*Math.max(0,age/fall),r:13,phase:a};}
export function jet603(h,t){const a=cycle603(h,t);return {active:a<(h.on??h.period),warning:a>=h.period-600};}
export function lift603(p,course,t,dt){
 const h=course.jets603?.find(h=>p.x+8>h.x&&p.x-8<h.x+h.w&&p.y>h.y-h.h&&p.y-28<h.y&&jet603(h,t).active);
 if(!h)return false;
 p.vy=Math.max(-(h.speed??350),p.vy-2000*dt);p.springFlight=true;p.grounded=false;p.platformId=null;return true;
}
const active=p=>p.alive&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null;
const circle=(p,q)=>{const x=Math.max(p.x-10,Math.min(q.x,p.x+10)),y=Math.max(p.y-28,Math.min(q.y,p.y));return (x-q.x)**2+(y-q.y)**2<q.r*q.r;};
export function hazards603(g,course,hurt){
 if(!course.expert603)return;
 for(const p of g.players){if(!active(p))continue;
  for(const [list,locate,kind] of [[course.saws603,saw603,'saw'],[course.pendulums603,pendulum603,'pendulum'],[course.cannons603,cannon603,'cannon'],[course.meteors603,meteor603,'meteor']]){
   for(const h of list){const reach=h.range??h.length??40;if(p.x<h.x-reach-60||p.x>h.x+reach+60)continue;const q=locate(h,g.elapsed);if(q.active!==false&&circle(p,q))hurt(g,p,kind,q.x);}
  }
  for(const h of course.lightning603)if(Math.abs(p.x-h.x)<(h.w??28)/2+10&&p.y>h.y-h.h&&p.y-28<h.y&&lightning603(h,g.elapsed).active)hurt(g,p,'lightning',h.x);
 }
}
