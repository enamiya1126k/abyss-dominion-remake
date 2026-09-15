const selector='.home-scene-power-value';
const installed=new WeakMap();

/** Fit only numeric labels; names and character art retain their own layout. */
export function installPowerTextFit446(root){
 if(!root||installed.has(root))return installed.get(root);
 let frame=0,stopped=false;
 const originals=new WeakMap(),plates=new Set();
 const schedule=()=>{if(!stopped&&!frame)frame=requestAnimationFrame(fit);};
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 function fit(){
  frame=0;if(stopped)return;
  const elements=[...root.querySelectorAll(selector)],current=new Set(elements.map(e=>e.parentElement));
  for(const p of plates)if(!current.has(p)){resize?.unobserve(p);plates.delete(p);}
  for(const p of current)if(!plates.has(p)){plates.add(p);resize?.observe(p);}
  for(const e of elements){
   if(!originals.has(e))originals.set(e,[e.style.getPropertyValue('font-size'),e.style.getPropertyPriority('font-size')]);
   const [value,priority]=originals.get(e);
   if(value)e.style.setProperty('font-size',value,priority);else e.style.removeProperty('font-size');
   const available=e.getBoundingClientRect().width;
   if(available<=1||!e.textContent.trim())continue;
   const range=document.createRange();range.selectNodeContents(e);
   for(let pass=0;pass<3;pass++){
    const width=range.getBoundingClientRect().width;
    if(width<=available-1||width<=0)break;
    const size=parseFloat(getComputedStyle(e).fontSize);
    e.style.setProperty('font-size',`${Math.max(1,Math.floor(size*(available-1)/width*100)/100)}px`,'important');
   }
  }
 }
 const mutation=new MutationObserver(schedule);
 mutation.observe(root,{subtree:true,childList:true,characterData:true});
 window.addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 document.fonts?.ready.then(schedule);
 document.fonts?.addEventListener('loadingdone',schedule);
 const stop=()=>{stopped=true;cancelAnimationFrame(frame);resize?.disconnect();mutation.disconnect();window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);document.fonts?.removeEventListener('loadingdone',schedule);installed.delete(root);};
 installed.set(root,stop);schedule();return stop;
}
