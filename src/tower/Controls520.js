// Each touch owns its own direction; releasing one thumb never releases another.
export function bindDirections520(buttons,u,on,send,enabled,unlock){
 u.moves520=new Map();
 const refresh=()=>{
  u.input.axis=[...u.moves520.values()].at(-1)?.axis??((u.keys?.right?1:0)-(u.keys?.left?1:0));
  for(const b of buttons){const pressed=[...u.moves520.values()].some(v=>v.axis===Number(b.dataset.twMove520));b.classList.toggle('tw-pressed518',pressed);b.setAttribute('aria-pressed',String(pressed));}
  send();
 };
 for(const b of buttons){
  on(b,'pointerdown',e=>{if(b.disabled||!enabled())return;e.preventDefault();unlock();u.moves520.delete(e.pointerId);u.moves520.set(e.pointerId,{axis:Number(b.dataset.twMove520)});b.setPointerCapture(e.pointerId);refresh()});
  on(b,'pointermove',e=>{if(!u.moves520.has(e.pointerId))return;const target=buttons.find(v=>{const r=v.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});if(target){const axis=Number(target.dataset.twMove520);if(u.moves520.get(e.pointerId).axis!==axis){u.moves520.set(e.pointerId,{axis});refresh()}}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])on(b,type,e=>{if(u.moves520.delete(e.pointerId))refresh()});
 }
 return()=>{u.moves520.clear();refresh()};
}
