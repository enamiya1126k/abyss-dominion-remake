import {CABBAGE484 as RULES, SWIPE567, stroke567} from './Rules484.js';

export function predict567(game, player, pending=[]) {
  if (!player) return null;
  const local={...player};
  for (const input of pending) if (input.seq>(player.lastSeq??0)) stroke567(game,local,input,input.at);
  return local;
}

export function flush567(client,ui,game,now) {
  if (!game||!client.connected()||now-ui.lastFlush<80) return;
  const fresh=ui.pending.filter(v=>v.sentAt486==null);
  const batch=(fresh.length?fresh:ui.pending.filter(v=>now-v.sentAt486>=350)).slice(0,RULES.maxBatch);
  if (!batch.length) return;
  if (client.raw('cabbageStroke567',{gameId:game.id,strokes:batch.map(({seq,kind,at})=>({seq,kind,at}))})===false) return;
  ui.lastFlush=now;
  for (const v of batch) v.sentAt486=now;
}

// Relative movement prevents a new touch from teleporting the blade into food.
// Hysteresis requires a real lift between cuts, even after releasing the finger.
export function gesture567({onPose=()=>{},onCross=()=>{},position=0}={}) {
  const s={position,active:false,armed:false,lastY:0,travel:90};
  s.begin=(y,travel=90)=>{s.active=true;s.lastY=y;s.travel=Math.max(56,Math.min(120,travel));s.armed=s.position<=SWIPE567.raised;if(s.armed)onCross('lift');onPose(s.position,true);};
  s.move=y=>{
    if (!s.active||!Number.isFinite(y)) return;
    const before=s.position;
    s.position=Math.max(0,Math.min(1,before+(y-s.lastY)/s.travel));s.lastY=y;
    onPose(s.position,true);
    if (!s.armed&&s.position<=SWIPE567.raised) {s.armed=true;onCross('lift');}
    else if (s.armed&&before<SWIPE567.contact&&s.position>=SWIPE567.contact) {s.armed=false;onCross('cut');}
  };
  s.end=(cancel=false)=>{if(cancel&&s.active)onCross('cancel');s.active=false;s.armed=false;onPose(s.position,false);};
  s.reset=()=>{s.end(true);s.position=0;onPose(0,false);};
  s.key=key=>{if(s.active)return;const up=key==='ArrowUp';s.position=up?0:1;onPose(s.position,false);onCross(up?'lift':'cut');};
  return s;
}

export function bindSwipe567(surface,options) {
  const gesture=gesture567(options),win=surface.ownerDocument?.defaultView??globalThis;
  const doc=surface.ownerDocument;const listeners=[];let pointer=null;
  const on=(el,name,fn)=>{el?.addEventListener?.(name,fn,{passive:false});listeners.push(()=>el?.removeEventListener?.(name,fn));};
  const allow=()=>options.enabled?.()!==false;
  const prevent=e=>{if(e.cancelable!==false)e.preventDefault();};
  const begin=(id,y,e)=>{if(pointer!==null||!allow())return;pointer=id;prevent(e);surface.focus?.({preventScroll:true});gesture.begin(y,Math.min(110,surface.clientHeight*.24));};
  const move=(id,y,e)=>{if(id!==pointer)return;prevent(e);if(!allow()){finish(id,true);return;}gesture.move(y);};
  const finish=(id,cancel=false)=>{if(id!==pointer)return;pointer=null;gesture.end(cancel);try{if(surface.hasPointerCapture?.(id))surface.releasePointerCapture(id);}catch{}};
  if(win.PointerEvent){
    on(surface,'pointerdown',e=>{if(e.button>0||e.isPrimary===false)return;begin(e.pointerId,e.clientY,e);if(pointer===e.pointerId)try{surface.setPointerCapture(e.pointerId);}catch{}});
    on(surface,'pointermove',e=>move(e.pointerId,e.clientY,e));
    on(surface,'pointerup',e=>{if(e.pointerId===pointer)prevent(e);finish(e.pointerId);});
    on(surface,'pointercancel',e=>finish(e.pointerId,true));
    on(surface,'lostpointercapture',e=>finish(e.pointerId,true));
  }else{
    on(surface,'touchstart',e=>{const t=e.changedTouches?.[0];if(t)begin(t.identifier,t.clientY,e);});
    on(surface,'touchmove',e=>{for(const t of e.changedTouches??[])move(t.identifier,t.clientY,e);});
    for(const kind of ['touchend','touchcancel'])on(surface,kind,e=>{for(const t of e.changedTouches??[])if(t.identifier===pointer){prevent(e);finish(pointer,kind==='touchcancel');}});
    on(surface,'mousedown',e=>{if(e.button===0)begin('mouse',e.clientY,e);});
    on(win,'mousemove',e=>move('mouse',e.clientY,e));on(win,'mouseup',()=>finish('mouse'));
  }
  const reset=()=>{if(pointer!==null)finish(pointer,true);gesture.reset();};
  on(win,'blur',reset);on(win,'resize',reset);
  on(doc,'visibilitychange',()=>{if(doc.visibilityState==='hidden')reset();});
  on(surface,'contextmenu',prevent);on(surface,'dragstart',prevent);
  return {gesture,reset,dispose(){reset();listeners.forEach(off=>off());}};
}
