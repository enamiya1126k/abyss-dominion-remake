// Shared, server-authoritative walking on the platform tops (percent coordinates).
export const WALK514=Object.freeze({speed:32,left:7,right:93,top:63,bottom:77,gateLeft:46,gateRight:54,bridgeY:70,bounceMs:260});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const side514=p=>p.x<50?'o':'x';
export function floorPoint514(x,y){x=clamp(x,WALK514.left,WALK514.right);if(x>=WALK514.gateLeft&&x<=WALK514.gateRight)return{x,y:WALK514.bridgeY};const center=x<50?25:75,edge=clamp((Math.abs(x-center)-14)/5,0,1);return{x,y:clamp(y,63+edge*2,77-edge*2)}}
export const spawn514=(seat,side='o')=>({x:(side==='o'?18:68)+(seat%2)*13,y:66+Math.floor(seat/2)*8});
export function position514(p,at){const motion=p.motion514;if(!motion?.points?.length)return{...(p.location514??spawn514(p.seat,p.side??'o'))};const t=Math.max(0,at-motion.at),pts=motion.points;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(t<=b.t){const f=clamp((t-a.t)/(b.t-a.t||1),0,1);return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f}}}const end=pts.at(-1);return{x:end.x,y:end.y}}
export const moving514=(p,at)=>!!p.motion514&&at<p.motion514.until;
export function settle514(p,at){const point=position514(p,at);p.side=side514(point);if(point.x<WALK514.gateLeft||point.x>WALK514.gateRight)p.safeSide514=p.side;if(p.motion514&&at>=p.motion514.until){p.location514=point;p.motion514=null}return point}
function trajectory(p,points,at,duration=null){let t=0;const timed=[{...points[0],t:0}];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];t+=Math.hypot(b.x-a.x,(b.y-a.y)*1.5)/WALK514.speed*1000;timed.push({...b,t})}if(duration!=null){for(const point of timed)point.t=t?point.t/t*duration:duration;t=duration}p.motion514={at,until:at+t,points:timed,originSide:p.safeSide514??p.side??side514(points[0])};p.movedAt=at;return t}
export function walk514(p,target,at){const from=settle514(p,at),to=floorPoint514(target.x,target.y),points=[from];
 if(side514(from)!==side514(to)){const exit=from.x<50?WALK514.gateLeft:WALK514.gateRight,entry=from.x<50?WALK514.gateRight:WALK514.gateLeft;points.push({x:exit,y:WALK514.bridgeY},{x:entry,y:WALK514.bridgeY})}
 points.push(to);p.destination514=to;trajectory(p,points,at);return to;
}
// Closing is evaluated at the deadline, never at a late server tick or the desired target.
export function closeGate514(p,at){const point=position514(p,at),inside=point.x>=WALK514.gateLeft&&point.x<=WALK514.gateRight;let side=side514(point);
 if(inside){const pts=p.motion514?.points??[],prior=[...pts].reverse().find(q=>q.t<=at-(p.motion514?.at??at)&&(q.x<WALK514.gateLeft||q.x>WALK514.gateRight));side=prior?side514(prior):p.motion514?.originSide??p.safeSide514??p.side??'o';const to={x:side==='o'?42:58,y:clamp(point.y,65,75)};p.side=side;p.location514=point;trajectory(p,[point,to],at,WALK514.bounceMs);p.bumpAt514=at;p.destination514=to;
 }else{p.location514=point;p.motion514=null;p.destination514=point;p.side=side}
 return{side:p.side,pushed:inside};
}
export function tapPoint514(clientX,clientY,rect){if(!rect||rect.width<=0||rect.height<=0)return null;const x=(clientX-rect.left)/rect.width*100,y=(clientY-rect.top)/rect.height*100;if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>100||y<54||y>91)return null;return floorPoint514(x,y)}
