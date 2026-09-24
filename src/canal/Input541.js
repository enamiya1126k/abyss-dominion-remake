// Native pointer capture: draw one short net stroke, lift to commit, cancel to discard.
export function bindStroke541(surface,{stroke,preview,missile},win=globalThis){
 const abort=new AbortController(),on=(el,n,fn)=>el?.addEventListener(n,fn,{signal:abort.signal,passive:false});let active=null;
 const point=e=>{const b=surface.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),y:Math.max(0,Math.min(1,(e.clientY-b.top)/b.height))}};
 const add=e=>{if(!active)return;const q=point(e),last=active.path.at(-1),d=Math.hypot(q.x-last.x,q.y-last.y);if(d<.007)return;if(active.length+d>1.4||active.path.length>=32)return;active.path.push(q);active.length+=d;preview(active.path)};
 const cancel=()=>{active=null;preview(null)};
 on(surface,'pointerdown',e=>{if(e.button>0||active)return;e.preventDefault();const target=e.target.closest?.('[data-cn-target496]'),id=Number(target?.dataset.cnTarget496);if(id<0){missile(-id);return}active={id:e.pointerId,path:[point(e)],length:0};surface.setPointerCapture?.(e.pointerId);preview(active.path)});
 on(surface,'pointermove',e=>{if(active?.id!==e.pointerId)return;e.preventDefault();add(e)});
 on(surface,'pointerup',e=>{if(active?.id!==e.pointerId)return;e.preventDefault();add(e);const path=active.path;cancel();stroke(path)});
 on(surface,'pointercancel',cancel);on(surface,'lostpointercapture',cancel);on(win,'blur',cancel);on(document,'visibilitychange',()=>{if(document.hidden)cancel()});on(surface,'contextmenu',e=>e.preventDefault());
 return()=>{abort.abort();cancel()};
}
