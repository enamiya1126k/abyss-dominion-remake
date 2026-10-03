// Shared by the authoritative server, browser prediction and renderers.
export const CONTROL586=Object.freeze({staleMs:300,dashMs:200,dashCooldown:4000,dashSpeed:1.45});
export const vector586=(x,y)=>{const d=Math.hypot(x,y);return d>1?{x:x/d,y:y/d}:{x,y};};
export function stick586(dx,dy){const d=Math.hypot(dx,dy),power=Math.max(0,Math.min(1,(d-4)/30));return d?{x:dx/d*power,y:dy/d*power}:{x:0,y:0};}
export function gaps586(w){return w.openings??[{center:w.gap,width:w.width}];}
export function segments586(w){let previous=0;const segments=[];for(const gap of [...gaps586(w)].sort((a,b)=>a.center-b.center)){const left=gap.center-gap.width/2;if(left>previous)segments.push([previous,left]);previous=gap.center+gap.width/2;}if(previous<1)segments.push([previous,1]);return segments;}
export function nearestGap586(w,cross){return gaps586(w).reduce((best,gap)=>Math.abs(gap.center-cross)<Math.abs(best.center-cross)?gap:best);}
export function canDash586(g,p,at=g.lastAt??g.serverAt){return !!p?.alive&&g.phase==='play'&&g.stage==='run'&&at>=(p.dashReadyAt??0)&&at>=(p.dashUntil??0);}
export function velocity586(p,at,speed){if(at<(p.dashUntil??0))return{x:p.dashX*CONTROL586.dashSpeed,y:p.dashY*CONTROL586.dashSpeed};if(p.control==='steer')return at-(p.controlAt??0)<=CONTROL586.staleMs?{x:(p.steerX??0)*speed,y:(p.steerY??0)*speed}:{x:0,y:0};const dx=(p.target?.x??p.x)-p.x,dy=(p.target?.y??p.y)-p.y,d=Math.hypot(dx,dy);return d?{x:dx/d*speed,y:dy/d*speed}:{x:0,y:0};}
export function move586(p,seconds,at,speed,edge){const v=velocity586(p,at,speed),point=p.control!=='steer'&&at>=(p.dashUntil??0),limit=point?Math.hypot((p.target?.x??p.x)-p.x,(p.target?.y??p.y)-p.y):Infinity,len=Math.hypot(v.x,v.y),scale=len?Math.min(seconds,limit/len):0,clamp=n=>Math.max(edge,Math.min(1-edge,n));return{x:clamp(p.x+v.x*scale),y:clamp(p.y+v.y*scale)};}
export const patternName586=kind=>({single:'すき間へ逃げろ',double:'二択ゲート',chase:'連続ウォール',cross:'クロスウォール'}[kind]??'すき間へ逃げろ');
