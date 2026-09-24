// Build527: absolute world targets; the charge pointer never owns the movement pointer.
export function bindControls523(root,on,input,changed,enabled,unlock,worldPoint){
 const stage=root.querySelector('[data-sm-stage]'),shot=root.querySelector('[data-sm-shot]'),moves=new Set(),shots=new Set(),keys=new Set();let rect;
 const refresh=()=>{input.mode='vector';input.tx=null;input.ty=null;let x=Number(keys.has('right'))-Number(keys.has('left')),y=Number(keys.has('down'))-Number(keys.has('up')),d=Math.hypot(x,y);input.x=d?x/d:0;input.y=d?y/d:0;changed()};
 const target=e=>{const v=worldPoint?.(e.clientX-rect.left,e.clientY-rect.top);if(!v||!Number.isFinite(v.x)||!Number.isFinite(v.y))return;Object.assign(input,{mode:'target',tx:v.x,ty:v.y,x:0,y:0});changed()};
 on(stage,'pointerdown',e=>{if(!enabled()||e.target?.closest?.('button'))return;e.preventDefault();unlock();rect=stage.getBoundingClientRect();moves.add(e.pointerId);stage.setPointerCapture(e.pointerId);target(e)});
 on(stage,'pointermove',e=>{if(moves.has(e.pointerId)&&enabled()){e.preventDefault();target(e)}});
 // Releasing a tap keeps its destination. Cancellation stops movement immediately.
 on(stage,'pointerup',e=>moves.delete(e.pointerId));
 for(const type of['pointercancel','lostpointercapture'])on(stage,type,e=>{if(moves.delete(e.pointerId)){input.mode='vector';input.x=input.y=0;input.tx=input.ty=null;changed()}});
 const press=()=>{if(shot?.disabled||!enabled())return;unlock();input.press=true;input.cancel=false;shot.classList.add('is-held');changed()};
 const release=cancel=>{shot?.classList.remove('is-held');input[cancel?'cancel':'release']=true;changed()};
 on(shot,'pointerdown',e=>{if(shot.disabled||!enabled())return;e.preventDefault();shot.setPointerCapture(e.pointerId);const was=shots.size;shots.add(e.pointerId);if(!was)press()});
 for(const type of['pointerup','pointercancel','lostpointercapture'])on(shot,type,e=>{if(shots.delete(e.pointerId)&&!shots.size)release(type!=='pointerup')});
 const selector='[data-sm-stage],[data-sm-shot]';
 for(const type of['contextmenu','selectstart','dragstart','touchstart','touchmove','touchend'])on(root,type,e=>{if(e.target?.closest?.(selector)&&e.cancelable!==false)e.preventDefault()},{capture:true,passive:false});
 const key=e=>({ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'})[e.key];
 const keydown=e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||!enabled())return false;if(key(e)){e.preventDefault();keys.add(key(e));refresh();return true}if(e.key===' '){e.preventDefault();if(!e.repeat&&!shot?.disabled){const was=shots.size;shots.add('key');if(!was)press()}return true}return false};
 on(window,'keyup',e=>{if(key(e)){keys.delete(key(e));refresh()}if(e.key===' '&&shots.delete('key')&&!shots.size)release(false)});
 const clear=()=>{moves.clear();shots.clear();keys.clear();Object.assign(input,{mode:'vector',x:0,y:0,tx:null,ty:null,press:false,release:false,cancel:true});shot?.classList.remove('is-held');changed()};on(window,'blur',clear);
 return{clear,keydown,resize(){rect=stage?.getBoundingClientRect()}};
}
