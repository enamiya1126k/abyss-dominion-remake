// Normalized positions shared by simulation, sprite rendering and tap targets.
const clamp=n=>Math.max(0,Math.min(1,n));
export function route500(e,progress){const t=clamp(progress),sway=(e.kindIndex??e.kind)===2?Math.sin(t*Math.PI*8+(e.wiggle??0)*Math.PI*2)*Math.sin(Math.min(1,t*8)*Math.PI/2)*.062*(1-t*.4):0;return{x:(e.routeX??.5)*(1-t)+(e.routeEnd??.5)*t+Math.sin(t*Math.PI)*(e.curve??0)+sway,y:.055+t*.625}}
export function missilePoint500(m,at){const t=clamp((at-m.spawnAt)/(m.arriveAt-m.spawnAt));return{x:m.fromX+(.5-m.fromX)*t,y:m.fromY+(.817-m.fromY)*t,progress:t}}
export function missileLayout500(missiles,at,w,h){return(missiles??[]).filter(m=>at>=m.spawnAt&&at<m.arriveAt).map(m=>{const p=missilePoint500(m,at);return{...m,x:p.x*w,y:p.y*h,progress:p.progress,size:32,touchSize:54}})}
