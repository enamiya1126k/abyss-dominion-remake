export function bindControls523(root,on,input,changed,enabled,unlock){
 const moves=new Map(),shots=new Set(),keys=new Set(),pad=root.querySelector('[data-sm-pad]'),shot=root.querySelector('[data-sm-shot]');let rect=null;
 const vector=e=>{const x=(e.clientX-rect.left)/rect.width*2-1,y=(e.clientY-rect.top)/rect.height*2-1,d=Math.hypot(x,y);if(d<.2)return{x:0,y:0};const a=Math.round(Math.atan2(y,x)/(Math.PI/4))*Math.PI/4;return{x:Math.cos(a),y:Math.sin(a)}};
 const refresh=()=>{const v=[...moves.values()].at(-1);let x=v?.x??(Number(keys.has('right'))-Number(keys.has('left'))),y=v?.y??(Number(keys.has('down'))-Number(keys.has('up'))),d=Math.hypot(x,y);if(d>1){x/=d;y/=d}input.x=x;input.y=y;pad?.style.setProperty('--sm-x',x);pad?.style.setProperty('--sm-y',y);changed()};
 on(pad,'pointerdown',e=>{if(!enabled())return;e.preventDefault();rect=pad.getBoundingClientRect();unlock();moves.set(e.pointerId,vector(e));pad.setPointerCapture(e.pointerId);refresh()});
 on(pad,'pointermove',e=>{if(!moves.has(e.pointerId))return;const v=vector(e),old=moves.get(e.pointerId);if(Math.abs(v.x-old.x)>.01||Math.abs(v.y-old.y)>.01){moves.set(e.pointerId,v);refresh()}});
 for(const type of['pointerup','pointercancel','lostpointercapture'])on(pad,type,e=>{if(moves.delete(e.pointerId))refresh()});
 const press=()=>{if(shot?.disabled||!enabled())return;unlock();input.press=true;input.cancel=false;shot.classList.add('is-held');changed()};
 const release=cancel=>{shot?.classList.remove('is-held');input[cancel?'cancel':'release']=true;changed()};
 on(shot,'pointerdown',e=>{if(shot.disabled||!enabled())return;e.preventDefault();shot.setPointerCapture(e.pointerId);const was=shots.size;shots.add(e.pointerId);if(!was)press()});
 for(const type of['pointerup','pointercancel','lostpointercapture'])on(shot,type,e=>{if(shots.delete(e.pointerId)&&!shots.size)release(type!=='pointerup')});
 for(const type of['contextmenu','selectstart','dragstart','touchstart','touchmove','touchend'])on(root,type,e=>{if(e.target?.closest?.('[data-sm-pad],[data-sm-shot]')&&e.cancelable!==false)e.preventDefault()},{capture:true,passive:false});
 const key=e=>({ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'})[e.key];
 const keydown=e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return false;if(key(e)){e.preventDefault();keys.add(key(e));refresh();return true}if(e.key===' '){e.preventDefault();if(!e.repeat&&!shot?.disabled&&enabled()){const was=shots.size;shots.add('key');if(!was)press()}return true}return false};
 on(window,'keyup',e=>{if(key(e)){keys.delete(key(e));refresh()}if(e.key===' '&&shots.delete('key')&&!shots.size)release(false)});
 const clear=()=>{moves.clear();shots.clear();keys.clear();input.x=0;input.y=0;input.press=false;input.release=false;input.cancel=true;shot?.classList.remove('is-held');refresh()};on(window,'blur',clear);
 return{clear,keydown,resize(){rect=pad?.getBoundingClientRect()}};
}
