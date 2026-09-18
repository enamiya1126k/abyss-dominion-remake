// Hand order belongs only to this viewer and never leaves the browser.
export function orderedHand466(u,g,selfId){
 const key=`abyss-hand466:${g.id}:${selfId}`;
 if(u.orderKey466!==key){u.orderKey466=key;try{u.order466=JSON.parse(localStorage.getItem(key)??'[]')}catch{u.order466=[]}}
 const valid=new Set(g.hand.map(h=>h.uid));u.order466=[...new Set((Array.isArray(u.order466)?u.order466:[]).filter(id=>valid.has(id)))];for(const h of g.hand)if(!u.order466.includes(h.uid))u.order466.push(h.uid);
 return [...g.hand].sort((a,b)=>u.order466.indexOf(a.uid)-u.order466.indexOf(b.uid));
}
export function bindHand466(c,u){
 const hand=c.root.querySelector('.sg-hand');if(!hand)return()=>{};let state=null,timer=null,ghost=null,raf=null;
 const clear=()=>{clearTimeout(timer);cancelAnimationFrame(raf);ghost?.remove();ghost=null;state?.card.classList.remove('is-dragging466');hand.classList.remove('is-sorting466');state=null;u.handDragging466=false};
 const tick=()=>{if(!state?.drag)return;const r=hand.getBoundingClientRect();if(state.x<r.left+35)hand.scrollLeft-=8;else if(state.x>r.right-35)hand.scrollLeft+=8;raf=requestAnimationFrame(tick)};
 const down=e=>{const card=e.target.closest('[data-uid]');if(e.button>0||!card?.dataset.uid)return;state={id:e.pointerId,card,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,scroll:hand.scrollLeft,swipe:false,drag:false};card.setPointerCapture?.(e.pointerId);timer=setTimeout(()=>{if(!state||state.swipe)return;state.drag=true;u.handDragging466=true;const r=card.getBoundingClientRect();ghost=card.cloneNode(true);ghost.classList.add('sg-hand-ghost466');ghost.style.cssText+=`;position:fixed;left:${state.x-r.width/2}px;top:${state.y-r.height*.55}px;width:${r.width}px;height:${r.height}px`;ghost.removeAttribute('data-sg-action');document.body.append(ghost);state.w=r.width;state.h=r.height;card.classList.add('is-dragging466');hand.classList.add('is-sorting466');tick()},420)};
 const move=e=>{if(!state||e.pointerId!==state.id)return;state.x=e.clientX;state.y=e.clientY;if(!state.drag){if(Math.hypot(e.clientX-state.startX,e.clientY-state.startY)>8){clearTimeout(timer);state.swipe=true;hand.scrollLeft=state.scroll-(e.clientX-state.startX)}return}e.preventDefault();ghost.style.left=e.clientX-state.w/2+'px';ghost.style.top=e.clientY-state.h*.55+'px';const cards=[...hand.querySelectorAll('[data-uid]')].filter(x=>x!==state.card);const target=cards.find(x=>{const r=x.getBoundingClientRect();return e.clientY<r.bottom&&e.clientX<r.left+r.width/2});if(target)hand.insertBefore(state.card,target);else hand.append(state.card)};
 const up=e=>{if(!state||e.pointerId!==state.id)return;const {drag,swipe}=state;if(drag){const visible=[...hand.querySelectorAll('[data-uid]')].flatMap(x=>x.dataset.handIds?.split(',')??[x.dataset.uid]),set=new Set(visible);let i=0;u.order466=u.order466.map(id=>set.has(id)?visible[i++]:id);u.sort='manual';try{localStorage.setItem(u.orderKey466,JSON.stringify(u.order466))}catch{}}if(drag||swipe)u.suppressHandClick466=Date.now()+500;clear();if(drag)c.render()};
 const cancel=()=>{u.suppressHandClick466=Date.now()+500;clear();c.render()};
 const click=e=>{if(Date.now()<(u.suppressHandClick466??0)){e.preventDefault();e.stopImmediatePropagation()}};
 const context=e=>e.preventDefault();
 hand.addEventListener('pointerdown',down);hand.addEventListener('pointermove',move);hand.addEventListener('pointerup',up);hand.addEventListener('pointercancel',cancel);hand.addEventListener('click',click,true);hand.addEventListener('contextmenu',context);
 return()=>{clear();for(const [n,fn]of[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['contextmenu',context]])hand.removeEventListener(n,fn);hand.removeEventListener('click',click,true)};
}
