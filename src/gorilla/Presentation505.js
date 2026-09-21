import{GORILLA503,warning503}from'./Rules503.js';
import{painWeight505}from'./Rules505.js';
import{ATLAS504,STAGES504,blast504,flight504,count504,kingPose504}from'./Presentation504.js';
import{playerColor499}from'../party/PartyColors499.js';
export{ATLAS504 as ATLAS505,blast504 as blast505,flight504 as flight505,count504 as count505,warning503 as warning505};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
// Stable, anatomical clusters. No rows, mirrored lattice or relationship to the draw.
const roots=[
 [48.1,50.2],[51.6,52.7],[46.9,55.1],[50.1,57.0],[53.1,55.2],
 [48.4,60.0],[52.0,61.3],[45.7,52.4],[54.0,49.5],[50.0,54.3],
 [35.1,54.5],[31.6,56.9],[36.3,58.8],[32.9,60.7],
 [64.4,54.5],[69.1,56.2],[64.1,59.5],[67.8,60.9],
 [48.6,66.3],[52.4,68.7],[49.8,71.5],[46.7,73.6],
 [54.3,73.8],[47.9,77.3],[52.3,78.8],[49.7,80.8],
 [55.9,76.8],[44.0,76.1],[42.0,62.1],[57.8,64.2]
];
export const HAIRS505=Object.freeze(roots.map(([x,y],id)=>Object.freeze({id,x,y,baseX:x,baseY:y,bump:painWeight505(id)===2,zone:id<10?'chest':id<18?'areola':'navel',bend:Math.sin(id*2.73)*.9,length:8.4+(id*7%11)*.52,tilt:(id<10?(x<50?-.5:.5):id<18?(x<50?-.75:.75):Math.sin(id*1.93)*.52)+Math.cos(id*4.31)*.36})));
export const SPOTS505=Object.freeze([{id:0,x:33.4,y:57.2},{id:1,x:66.5,y:57.2}].map(Object.freeze));
export function pain505(g,at=Infinity){let ids=g.picked??[];const last=g.events?.at(-1);if(g.phase==='pluck'&&last&&at-(g.phaseAt503??last.at)<530)ids=ids.filter(id=>id!==last.hair);return[...new Set(ids)].reduce((n,id)=>n+painWeight505(id),0)+(g.painOffset505??0)}
export function stage505(g,at=Infinity){const pain=pain505(g,at);let index=0;for(let i=1;i<STAGES504.length;i++)if(pain>=STAGES504[i].at)index=i;return{asset:STAGES504[index].asset,frame:STAGES504[index].frame,index,pain}}
export function camera505(g,at,reduced=false){if(reduced)return['focus','playing','pluck','pinch'].includes(g.phase)?1:0;const age=at-(g.phaseAt503??at);if(g.phase==='focus')return smooth(age/GORILLA503.focusMs);if(['playing','pluck','pinch'].includes(g.phase))return 1;if(g.phase==='reaction')return g.events.at(-1)?.mercy504?0:1-smooth(age/700);if(g.phase==='drum')return 1-smooth(age/420);return 0}
export function layout505(w,h,g,at,reduced=false){const size=Math.min(w*.97,Math.max(240,h-58),490),x=(w-size)/2,y=Math.max(14,(h-size)*.45),focus=camera505(g,at,reduced),unit=Math.min(w*.96/41,(h-48)/34),target=unit*100/size,scale=1+(target-1)*focus,cx=w/2,cy=y+size*.65,targetY=h*.57;
 return{w,h,size,x,y,focus,scale,cx,cy,dx:0,dy:(targetY-cy)*focus,point(px,py){return{x:cx+(x+size*px/100-cx)*scale,y:cy+(y+size*py/100-cy)*scale+(targetY-cy)*focus}}};
}
// This same cubic drives both the painted filament and nearest-path picking.
export function strandPoint505(h,t){const a=1-t,b=h.bend*5,len=h.length;const x=3*a*a*t*(-1.3)+3*a*t*t*b+t*t*t*(b+1.3),y=3*a*a*t*(-len*.30)+3*a*t*t*(-len*.72)-t*t*t*len;return{x:x*Math.cos(h.tilt)-y*Math.sin(h.tilt),y:x*Math.sin(h.tilt)+y*Math.cos(h.tilt)}}
export function strandScreen505(l,h,t){const p=l.point(h.x,h.y),q=strandPoint505(h,t),unit=l.size*l.scale/370;return{x:p.x+q.x*unit,y:p.y+q.y*unit}}
export function hairTargets505(l){return HAIRS505.map(h=>({id:h.id,...strandScreen505(l,h,.45),width:44,height:44}))}
function segmentDistance(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1));return Math.hypot(x-a.x-t*dx,y-a.y-t*dy)}
export function hit505(l,g,x,y){
 // Only the visible nipple tip is a pinch target; surrounding hair remains hair.
 const radius=l.size*l.scale*.012;
 for(const spot of SPOTS505){const p=l.point(spot.x,spot.y);if(((x-p.x)/radius)**2+((y-p.y)/(radius*.78))**2<=1)return{kind:'pinch',spot:spot.id}}
 let nearest=null,distance=16;
 for(const hair of HAIRS505){if(g.picked.includes(hair.id))continue;let prev=strandScreen505(l,hair,0);for(let j=1;j<=12;j++){const next=strandScreen505(l,hair,j/12),d=segmentDistance(x,y,prev,next);if(d<distance){nearest={kind:'pull',hair:hair.id};distance=d}prev=next}}
 return nearest;
}
export function kingPose505(g,at){return['drum','blast'].includes(g.phase)?kingPose504(g,at):stage505(g,at)}
export function plucker505(g){const last=g.events?.at(-1);return(['pluck','pinch','reaction','drum','blast'].includes(g.phase)?g.players.find(p=>p.playerId===last?.playerId):g.players[g.turnSeat])??g.players[g.turnSeat]}
export const toolColor505=g=>playerColor499(plucker505(g));
export function toolTag505(g,l,at,pending){const e=g.events.at(-1),target=g.phase==='pinch'?SPOTS505[e?.spot505]:g.phase==='pluck'?HAIRS505[e?.hair]:pending?.kind==='pinch'?SPOTS505[pending.hair]:pending?.kind==='pull'?HAIRS505[pending.hair]:null;if(!target)return null;const p=l.point(target.x,target.y);return{x:clamp(p.x+(target.x>50?-52:52),44,l.w-44),y:clamp(p.y-54,38,l.h-32),player:plucker505(g)}}
