// A stroke is committed only on release. Dragging from an animal never captures it.
export function bindFocus496(surface, { tap }, win=globalThis, pointer=!!globalThis.PointerEvent) {
  let active=null, blocked=false;
  const ids=new Set(), listeners=[];
  const on=(node,name,fn,options)=>{node?.addEventListener?.(name,fn,options);listeners.push(()=>node?.removeEventListener?.(name,fn,options))};
  const begin=(id,x,y,target,e)=>{
    ids.add(id);if(ids.size>1){blocked=true;active=null;return}
    if(blocked)return;e.preventDefault();
    const b=target.closest?.('[data-cn-target496]');
    active={id,x,y,max:0,target:b&&!b.disabled?Number(b.dataset.cnTarget496):null};
  };
  const move=(id,x,y,e)=>{if(active?.id!==id)return;e.preventDefault();active.max=Math.max(active.max,Math.hypot(x-active.x,y-active.y))};
  const end=(id,x,y,cancel=false)=>{
    const a=active;ids.delete(id);if(a?.id===id)active=null;
    if(!cancel&&!blocked&&a?.id===id){const dx=x-a.x,dy=y-a.y,d=Math.max(a.max,Math.hypot(dx,dy));
      if(d<=14&&a.target!==null)tap(a.target);
    }
    if(!ids.size)blocked=false;
  };
  const reset=()=>{active=null;ids.clear();blocked=false};
  if(pointer){
    on(surface,'pointerdown',e=>{if(e.button>0)return;begin(e.pointerId,e.clientX,e.clientY,e.target,e);try{surface.setPointerCapture?.(e.pointerId)}catch{}},{passive:false});
    on(win,'pointermove',e=>move(e.pointerId,e.clientX,e.clientY,e),{passive:false});
    on(win,'pointerup',e=>end(e.pointerId,e.clientX,e.clientY));
    on(win,'pointercancel',e=>end(e.pointerId,0,0,true));
    on(surface,'lostpointercapture',e=>end(e.pointerId,0,0,true));
  }else{
    on(surface,'touchstart',e=>{for(const t of e.changedTouches)begin(t.identifier,t.clientX,t.clientY,t.target,e)},{passive:false});
    on(win,'touchmove',e=>{for(const t of e.changedTouches)move(t.identifier,t.clientX,t.clientY,e)},{passive:false});
    on(win,'touchend',e=>{for(const t of e.changedTouches)end(t.identifier,t.clientX,t.clientY)});
    on(win,'touchcancel',e=>{for(const t of e.changedTouches)end(t.identifier,0,0,true)});
  }
  on(win,'blur',reset);on(globalThis.document,'visibilitychange',()=>{if(globalThis.document.visibilityState==='hidden')reset()});
  on(surface,'contextmenu',e=>e.preventDefault());
  return()=>{listeners.forEach(off=>off());reset()};
}
