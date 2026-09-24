// One shared net: most recently pressed direction wins, including the second thumb.
export function bindCanal489(surface,onDown,onUp,win=globalThis,supportsPointer=!!globalThis.PointerEvent){
 const pointers=new Map();
 const button=e=>e.target.closest?.('[data-cn-lane]');
 const begin=(id,b,e)=>{if(!b||b.disabled||pointers.has(id))return;e.preventDefault();pointers.set(id,Number(b.dataset.cnLane));onDown(Number(b.dataset.cnLane));};
 const end=id=>{if(!pointers.delete(id))return;const left=[...pointers.values()];if(left.length)onDown(left.at(-1),false);else onUp();};
 const down=e=>{if(e.button>0)return;const b=button(e);begin(e.pointerId,b,e);if(b&&!b.disabled)try{b.setPointerCapture?.(e.pointerId)}catch{}};
 const up=e=>end(e.pointerId);
 const touch=e=>{for(const p of e.changedTouches??[])begin(p.identifier,p.target.closest?.('[data-cn-lane]'),e)};
 const touchEnd=e=>{for(const p of e.changedTouches??[])end(p.identifier)};
 const cancel=()=>{pointers.clear();onUp();};
 const hidden=()=>{if(globalThis.document?.visibilityState==='hidden')cancel()};
 const menu=e=>{if(button(e))e.preventDefault()};
 if(supportsPointer){surface.addEventListener('pointerdown',down,{passive:false});win.addEventListener?.('pointerup',up);win.addEventListener?.('pointercancel',up);surface.addEventListener('lostpointercapture',up)}
 else{surface.addEventListener('touchstart',touch,{passive:false});win.addEventListener?.('touchend',touchEnd);win.addEventListener?.('touchcancel',touchEnd)}
 win.addEventListener?.('blur',cancel);globalThis.document?.addEventListener('visibilitychange',hidden);surface.addEventListener('contextmenu',menu);
 return()=>{surface.removeEventListener('pointerdown',down);win.removeEventListener?.('pointerup',up);win.removeEventListener?.('pointercancel',up);surface.removeEventListener('lostpointercapture',up);surface.removeEventListener('touchstart',touch);win.removeEventListener?.('touchend',touchEnd);win.removeEventListener?.('touchcancel',touchEnd);win.removeEventListener?.('blur',cancel);globalThis.document?.removeEventListener('visibilitychange',hidden);surface.removeEventListener('contextmenu',menu);cancel()};
}
export function flushCanal489(c,u,game,now){
 if(!game||!c.connected()||!u.pending.length||now-u.lastFlush<80)return;
 const fresh=u.pending.filter(x=>x.sentAt==null),batch=(fresh.length?fresh:u.pending.filter(x=>now-x.sentAt>=500)).slice(0,24);
 if(!batch.length)return;
 if(c.raw('canalInput489',{gameId:game.id,inputs:batch.map(({seq,lane,held,pulse,burst,targetId,missileId500,stroke541})=>({seq,lane,held,pulse,burst,...(targetId!=null?{targetId}:{}),...(missileId500!=null?{missileId500}:{}),...(stroke541?{stroke541}:{})}))})===false)return;
 u.lastFlush=now;for(const x of batch)x.sentAt=now;
}
export function acknowledgeCanal489(u,p){u.seq=Math.max(u.seq??0,p?.lastSeq??0);u.pending=u.pending.filter(x=>x.seq>(p?.lastSeq??0));}
export function position489(lane,progress,wiggle=0){const r=47-30*Math.max(0,Math.min(1,progress)),w=wiggle*4;return lane===0?{x:50+w,y:50-r}:lane===1?{x:50+r,y:50+w}:lane===2?{x:50+w,y:50+r}:{x:50-r,y:50+w}}
