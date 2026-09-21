import{seatColors499}from'../party/PartyColors499.js';
import{progress496,remaining496}from'./Rules496.js';
import{draw497}from'./Scene497.js';
export const colors496=['#ffdc83','#78ddff','#c1f18c','#f6a7d8'];
// Feet sit on the four platforms in shared-pond.png; the net originates at chest height.
export const crew496=[{x:.16,y:.666},{x:.84,y:.666},{x:.16,y:.881},{x:.84,y:.881}];
export function point496(e,progress,width,height){const t=Math.max(0,Math.min(1,progress));return{x:width*((e.routeX??.5)*(1-t)+(e.routeEnd??.5)*t+Math.sin(t*Math.PI)*(e.curve??0)),y:height*(.18+t*.50)}}
export function layout496(enemies,at,width,height){const size=Math.max(42,Math.min(80,width*.175,height*.15));return enemies.map(e=>{const progress=progress496(e,at),s=size*(e.kind===3?1.18:1);return{...e,...point496(e,progress,width,height),progress,size:s,touchSize:Math.max(52,s),eta:remaining496(e,at)}})}
// Network corrections may slow a sprite briefly, but never rewind or teleport it.
// Coordinates and touch targets consume the same final layout.
export function stable496(layout,u,now,width,height){u.motion??=new Map();const live=new Set();const result=layout.map(e=>{live.add(e.id);const prev=u.motion.get(e.id),dt=prev?Math.max(0,Math.min(100,now-prev.at)):0;const progress=prev?Math.max(prev.progress,Math.min(e.progress,prev.progress+dt/e.travelMs*1.5)):e.progress;u.motion.set(e.id,{at:now,progress});return{...e,progress,...point496(e,progress,width,height)}});for(const id of u.motion.keys())if(!live.has(id))u.motion.delete(id);return result}
export function draw496(canvas,g,u,at,now,layout){return draw497(canvas,g,u,at,now,layout,seatColors499(g.players),crew496,point496)}
