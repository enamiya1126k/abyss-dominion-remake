// Normalized coordinates of the water in the existing pond artwork.
// Shared by touch input, server targeting and drawing; never spawn on the banks.
export const WATER526=Object.freeze({far:.17,near:.75,banks:[[.17,.24,.79],[.24,.09,.94],[.40,.07,.94],[.58,.115,.915],[.75,.18,.83]]});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const depth526=y=>clamp((y-WATER526.far)/(WATER526.near-WATER526.far),0,1);
export const waterScale526=y=>.28+.72*Math.pow(depth526(y),.85);
export function waterBounds526(y){y=clamp(y,WATER526.far,WATER526.near);const rows=WATER526.banks;let a=rows[0],b=rows.at(-1);for(let i=1;i<rows.length;i++){if(y<=rows[i][0]){a=rows[i-1];b=rows[i];break}}const f=(y-a[0])/(b[0]-a[0]);return{left:a[1]+(b[1]-a[1])*f,right:a[2]+(b[2]-a[2])*f}}
export function inWater526(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||y<WATER526.far||y>WATER526.near)return false;const b=waterBounds526(y);return x>=b.left&&x<=b.right}
export function clampWater526(x,y,padding=0){y=clamp(y,WATER526.far+padding,WATER526.near-padding);const b=waterBounds526(y);return{x:clamp(x,b.left+padding,b.right-padding),y}}
export function fishAim526(pos,x,y){const scale=waterScale526(pos.y);return Math.hypot((pos.x-x)/(.05+.035*scale),(pos.y-y)/(.035+.035*scale))}
export function shadowSize526(width,tier,y){return width*([.078,.091,.11,.13,.185][tier]??.09)*waterScale526(y)}
export const available526=(s,elapsed)=>s.readyAt<=elapsed&&!s.reservedBy530&&(s.expiresAt526==null||elapsed<s.expiresAt526);
export const landingDuration526=fish=>fish?.tier===4?2800:2100;
export function retrievalPoint526(p,progress){const f=clamp(progress,0,1)*.63;return clampWater526(p.castX*(1-f)+(.13+p.seat*.2467)*f,p.castY*(1-f)+.735*f,.005)}
export const dockPoint530=seat=>clampWater526(.13+seat*.2467,.735,.005);
export function lineDistance530(p,x=p.castX,y=p.castY){const d=dockPoint530(p.seat);return Math.hypot((x-d.x)*.86,y-d.y)}
export function castDistance530(p,x=p.castX,y=p.castY){return clamp(lineDistance530(p,x,y)/.59,0,1)}
// A close cast comes home quickly; the far bank takes roughly twice as long.
export function haulScale530(p){return .62+castDistance530(p)*.76}
export function reelTowardDock530(p,seconds){const d=dockPoint530(p.seat),dx=d.x-p.castX,dy=d.y-p.castY,dist=Math.hypot(dx,dy);if(dist<=.012)return true;const step=Math.min(dist,seconds*.19);p.castX+=dx/dist*step;p.castY+=dy/dist*step;({x:p.castX,y:p.castY}=clampWater526(p.castX,p.castY,.005));return dist-step<=.012}
export function visualCue526(p,mood){const tension=p.tension??0,danger=mood==='warn'||mood==='surge'||tension>=.76;return{danger,critical:tension>=.87,cue:danger?'ease':'reel',color:tension>=.87?'#ff9276':danger?'#ffd07e':'#b8efd7',taut:danger?Math.max(.76,tension):tension}}
