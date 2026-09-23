export function controls524(root,on,input,send,enabled,unlock,aim){const reel=root.querySelector('[data-fi-reel]'),ease=root.querySelector('[data-fi-ease]'),stage=root.querySelector('[data-fi-stage]'),holds=new Set(),eases=new Set();let castPointer=null;
 const update=()=>{input.reel=holds.size>0&&eases.size===0;reel?.classList.toggle('is-held',input.reel);ease?.classList.toggle('is-held',eases.size>0);send()};
 for(const[el,set]of[[reel,holds],[ease,eases]]){on(el,'pointerdown',e=>{if(!enabled()||el.disabled)return;e.preventDefault();unlock();el.setPointerCapture(e.pointerId);set.add(e.pointerId);update()});for(const type of['pointerup','pointercancel','lostpointercapture'])on(el,type,e=>{if(set.delete(e.pointerId))update()})}
 on(stage,'pointerdown',e=>{if(!enabled()||e.target.closest?.('button'))return;e.preventDefault();castPointer=e.pointerId;stage.setPointerCapture(e.pointerId)});
 on(stage,'pointerup',e=>{if(e.pointerId!==castPointer)return;castPointer=null;if(!enabled())return;const b=stage.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;if(x>=.08&&x<=.92&&y>=.2&&y<=.73){unlock();aim(x,y)}});
 for(const type of['pointercancel','lostpointercapture'])on(stage,type,e=>{if(e.pointerId===castPointer)castPointer=null});
 for(const type of['contextmenu','selectstart','dragstart','touchstart','touchmove','touchend'])on(root,type,e=>{if(e.target?.closest?.('[data-fi-stage],[data-fi-reel],[data-fi-ease]')&&e.cancelable!==false)e.preventDefault()},{capture:true,passive:false});
 const clear=()=>{castPointer=null;holds.clear();eases.clear();update()};on(window,'blur',clear);
 const keydown=e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||!enabled())return false;if(e.key===' '){e.preventDefault();if(!e.repeat&&!reel.disabled){holds.add('key');unlock();update()}return true}if(e.key==='Shift'){e.preventDefault();eases.add('key');update();return true}return false};on(window,'keyup',e=>{if(e.key===' '&&holds.delete('key')||e.key==='Shift'&&eases.delete('key'))update()});
 return{clear,keydown};
}
