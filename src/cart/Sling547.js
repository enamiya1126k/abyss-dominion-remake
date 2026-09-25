// Pull length is measured in CSS pixels, independent of hold time and device DPR.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const deadzone547=12;
export function pullLimit547(width,height){return Math.max(72,Math.min(120,width*.28,height*.34))}
export function pull547(start,end,metrics){
 const dx=end.x-start.x,dy=end.y-start.y,distance=Math.hypot(dx,dy);
 const active=distance>deadzone547,limit=pullLimit547(metrics.width,metrics.height);
 // Undo the road projection so the cart's initial screen direction really is
 // opposite the finger, including the slight perspective skew at outer lanes.
 const vy=dy/metrics.yScale,vx=(-dx-metrics.skewX*vy)/metrics.xScale;
 return{startX:start.x,startY:start.y,x:end.x,y:end.y,distance,active,
  power:active?clamp((distance-deadzone547)/(limit-deadzone547),.08,1):0,
  angle:active?Math.atan2(vx,vy)||0:0};
}
