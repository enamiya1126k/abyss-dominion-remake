// Local order only. Touch scrolling is owned by Safari/Chromium, never pointermove.
export function orderedHand466(u,g,selfId){
 const key=`abyss-hand466:${g.id}:${selfId}`;
 if(u.orderKey466!==key){u.orderKey466=key;try{u.order466=JSON.parse(localStorage.getItem(key)??'[]')}catch{u.order466=[]}}
 const valid=new Set(g.hand.map(h=>h.uid));u.order466=[...new Set((Array.isArray(u.order466)?u.order466:[]).filter(id=>valid.has(id)))];const included=new Set(u.order466);for(const h of g.hand)if(!included.has(h.uid))u.order466.push(h.uid);const indices=new Map(u.order466.map((id,i)=>[id,i]));return [...g.hand].sort((a,b)=>indices.get(a.uid)-indices.get(b.uid));
}
export function deferHandRender474(c){const u=c.sgUI463;if(u?.handInteracting474||u?.handDragging466){u.handRenderPending474=true;return true}return false}
export function bindHand466(c,u){
 const hand=c.root.querySelector('.sg-hand');if(!hand)return()=>{};let state=null,hold=null,idle=null,ghost=null,raf=null,disposed=false;
 const flush=()=>{if(disposed||state?.drag||state?.down)return;u.handInteracting474=false;if(u.handRenderPending474){u.handRenderPending474=false;c.render()}};
 const settle=()=>{clearTimeout(idle);idle=setTimeout(flush,180)};
 const clearDrag=()=>{hand.removeEventListener('touchmove',touchmove);clearTimeout(hold);cancelAnimationFrame(raf);ghost?.remove();ghost=null;state?.card?.classList.remove('is-dragging466');hand.classList.remove('is-sorting466');u.handDragging466=false};
 const tick=()=>{if(!state?.drag)return;const r=hand.getBoundingClientRect();if(state.x<r.left+35)hand.scrollLeft-=8;else if(state.x>r.right-35)hand.scrollLeft+=8;ghost.style.setProperty('--ghost-x',state.x-state.w/2+'px');ghost.style.setProperty('--ghost-y',state.y-state.h*.55+'px');const cards=[...hand.querySelectorAll('[data-uid]')].filter(x=>x!==state.card);const target=cards.find(x=>{const r=x.getBoundingClientRect();return state.x<r.left+r.width/2});if(target&&state.card.nextElementSibling!==target)hand.insertBefore(state.card,target);else if(!target&&hand.lastElementChild!==state.card)hand.append(state.card);raf=requestAnimationFrame(tick)};
 const down=e=>{if(e.isPrimary===false||e.button>0)return;const card=e.target.closest('[data-uid]');if(!card)return;clearTimeout(idle);u.handInteracting474=true;state={id:e.pointerId,card,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,scroll:hand.scrollLeft,swipe:false,drag:false,down:true,touch:e.pointerType==='touch'};
 hold=setTimeout(()=>{if(!state?.down||state.swipe)return;state.drag=true;hand.addEventListener('touchmove',touchmove,{passive:false});u.handDragging466=true;const r=card.getBoundingClientRect();ghost=card.cloneNode(true);copyCardLook476(card,ghost);ghost.classList.add('sg-hand-ghost466','sg-hand-ghost474','sg-hand-ghost476');ghost.style.cssText+=`;position:fixed;left:0;top:0;width:${r.width}px;height:${r.height}px`;ghost.removeAttribute('data-sg-action');document.body.append(ghost);state.w=r.width;state.h=r.height;card.setPointerCapture?.(e.pointerId);card.classList.add('is-dragging466');hand.classList.add('is-sorting466');tick()},420)};
 const move=e=>{if(!state||e.pointerId!==state.id)return;state.x=e.clientX;state.y=e.clientY;if(!state.drag){if(Math.hypot(e.clientX-state.startX,e.clientY-state.startY)>8){clearTimeout(hold);state.swipe=true;if(!state.touch)hand.scrollLeft=state.scroll-(e.clientX-state.startX)}return}e.preventDefault()};
 const finish=e=>{if(!state||e.pointerId!==state.id)return;const {drag,swipe}=state;state.down=false;if(drag){const visible=[...hand.querySelectorAll('[data-uid]')].flatMap(x=>x.dataset.handIds?.split(',')??[x.dataset.uid]),set=new Set(visible);let i=0;u.order466=u.order466.map(id=>set.has(id)?visible[i++]:id);u.sort='manual';try{localStorage.setItem(u.orderKey466,JSON.stringify(u.order466))}catch{}u.handRenderPending474=true}if(drag||swipe||e.type==='pointercancel')u.suppressHandClick466=Date.now()+450;clearDrag();state=null;if(drag){u.handInteracting474=false;flush()}else settle()};
 const scroll=()=>{u.handInteracting474=true;u.suppressHandClick466=Date.now()+200;settle()};
 const click=e=>{if(Date.now()<(u.suppressHandClick466??0)){e.preventDefault();e.stopImmediatePropagation()}else{clearTimeout(idle);u.handInteracting474=false}};
 const touchmove=e=>{if(state?.drag)e.preventDefault()};const context=e=>e.preventDefault();
 for(const[n,fn]of[['pointerdown',down],['pointermove',move],['pointerup',finish],['pointercancel',finish],['contextmenu',context]])hand.addEventListener(n,fn);
 hand.addEventListener('scroll',scroll,{passive:true});hand.addEventListener('click',click,true);
 return()=>{disposed=true;clearTimeout(idle);clearDrag();u.handInteracting474=false;for(const[n,fn]of[['pointerdown',down],['pointermove',move],['pointerup',finish],['pointercancel',finish],['contextmenu',context],['scroll',scroll],['touchmove',touchmove]])hand.removeEventListener(n,fn);hand.removeEventListener('click',click,true)};
}

// The floating clone leaves .sg-screen; preserve its measured appearance during drag.
export function copyCardLook476(source,clone){
 const originals=[source,...source.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
 for(let i=0;i<originals.length;i++){const style=getComputedStyle(originals[i]);for(const key of style)copies[i].style.setProperty(key,style.getPropertyValue(key));}
}
