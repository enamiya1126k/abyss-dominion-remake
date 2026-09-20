// Local order only. Touch scrolling is owned by Safari/Chromium, never pointermove.
export function orderedHand466(u,g,selfId){
 const key=`abyss-hand466:${g.id}:${selfId}`;
 if(u.orderKey466!==key){u.orderKey466=key;try{u.order466=JSON.parse(localStorage.getItem(key)??'[]')}catch{u.order466=[]}}
 const valid=new Set(g.hand.map(h=>h.uid));u.order466=[...new Set((Array.isArray(u.order466)?u.order466:[]).filter(id=>valid.has(id)))];const included=new Set(u.order466);for(const h of g.hand)if(!included.has(h.uid))u.order466.push(h.uid);const indices=new Map(u.order466.map((id,i)=>[id,i]));return [...g.hand].sort((a,b)=>indices.get(a.uid)-indices.get(b.uid));
}
export function deferHandRender474(c){const u=c.sgUI463;if(u?.handInteracting474||u?.handDragging466){u.handRenderPending474=true;return true}return false}
export function bindHand466(c,u,{canPlay=()=>null,onPlay=()=>{}}={}){
 const hand=c.root.querySelector('.sg-hand');if(!hand)return()=>{};
 let state=null,hold=null,idle=null,raf=null,watchdog=null,disposed=false;
 const flush=()=>{if(disposed||state?.down)return;u.handInteracting474=false;if(u.handRenderPending474){u.handRenderPending474=false;c.render()}};
 const settle=()=>{clearTimeout(idle);idle=setTimeout(flush,180)};
 const clearDrag=()=>{clearTimeout(hold);clearTimeout(watchdog);cancelAnimationFrame(raf);if(state){state.card.style.removeProperty('transform');state.card.classList.remove('is-dragging477');}hand.classList.remove('is-sorting477');hand.classList.remove('is-casting480');hand.classList.remove('is-cast-ready480');u.handDragging466=false};
 const tick=()=>{
  if(!state?.drag)return;const s=state,r=hand.getBoundingClientRect(),dy=s.y-s.startY,dx=s.x-s.startX;s.play=!!canPlay(s.card)&&dy< -20&&-dy>Math.abs(dx)*1.2;s.ready=s.play&&dy<=-75;hand.classList[s.play?'add':'remove']('is-casting480');hand.classList[s.ready?'add':'remove']('is-cast-ready480');
  if(!s.play&&s.x<r.left+28)hand.scrollLeft-=7;else if(!s.play&&s.x>r.right-28)hand.scrollLeft+=7;
  // Move the actual hand card, inside its tray. No detached clone or second card.
  s.card.style.removeProperty('transform');
  const others=[...hand.querySelectorAll('[data-uid]')].filter(x=>x!==s.card);
  const target=others.find(x=>{const b=x.getBoundingClientRect();return s.x<b.left+b.width/2});
  if(!s.play&&target&&s.card.nextElementSibling!==target)hand.insertBefore(s.card,target);else if(!s.play&&!target&&hand.lastElementChild!==s.card)hand.append(s.card);
  const b=s.card.getBoundingClientRect(),left=Math.max(r.left+3,Math.min(r.right-b.width-3,s.x-s.offsetX)),top=s.play?s.y-s.offsetY:Math.max(r.top+5,Math.min(r.bottom-b.height-5,s.y-s.offsetY));
  s.card.style.setProperty('transform',`translate3d(${left-b.left}px,${top-b.top}px,0) scale(1.025)`,'important');
  raf=requestAnimationFrame(tick);
 };
 const down=e=>{
  if(state||e.isPrimary===false||e.button>0)return;const card=e.target.closest('[data-uid]');if(!card)return;
  clearTimeout(idle);u.handInteracting474=true;state={id:e.pointerId,card,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,scroll:hand.scrollLeft,swipe:false,drag:false,down:true,touch:e.pointerType==='touch',before:[...hand.children]};
  watchdog=setTimeout(()=>{if(state)finish({pointerId:state.id,type:'pointercancel'})},20000);
  hold=setTimeout(()=>{if(!state?.down||state.swipe||disposed)return;const r=card.getBoundingClientRect();state.offsetX=state.x-r.left;state.offsetY=state.y-r.top;state.drag=true;u.handDragging466=true;u.tidyNotice468=false;card.classList.add('is-dragging477');hand.classList.add('is-sorting477');tick()},420);
 };
 const move=e=>{if(!state||e.pointerId!==state.id)return;state.x=e.clientX;state.y=e.clientY;if(!state.drag){if(Math.hypot(e.clientX-state.startX,e.clientY-state.startY)>8){clearTimeout(hold);state.swipe=true;if(!state.touch)hand.scrollLeft=state.scroll-(e.clientX-state.startX)}return}if(e.cancelable)e.preventDefault()};
 const finish=e=>{
  if(!state||e.pointerId!==state.id)return;const {drag,swipe}=state,playUid=drag&&state.play&&state.y-state.startY<=-75?canPlay(state.card):null,cancel=e.type==='pointercancel'||e.type==='blur';state.down=false;
  if(drag&&(cancel||state.play)){for(const card of state.before)hand.append(card);}
  if(drag&&!cancel&&!state.play){
   const visible=[...hand.querySelectorAll('[data-uid]')].flatMap(x=>x.dataset.handIds?.split(',')??[x.dataset.uid]),set=new Set(visible);let i=0;
   u.order466=(u.order466??visible).map(id=>set.has(id)?visible[i++]:id);u.sort='manual';u.scrolls??={};u.scrolls.hand={x:hand.scrollLeft,y:hand.scrollTop};
   try{localStorage.setItem(u.orderKey466,JSON.stringify(u.order466))}catch{}u.handRenderPending474=true;
  }
  if(drag||swipe||cancel)u.suppressHandClick466=Date.now()+450;
  clearDrag();state=null;u.handInteracting474=false;if(playUid&&!cancel){u.handRenderPending474=false;onPlay(playUid)}else settle();
 };
 const scroll=()=>{u.handInteracting474=true;u.suppressHandClick466=Date.now()+200;settle()};
 const click=e=>{if(Date.now()<(u.suppressHandClick466??0)){e.preventDefault();e.stopImmediatePropagation()}else{clearTimeout(idle);u.handInteracting474=false}};
 const touchmove=e=>{if(state?.drag&&e.cancelable)e.preventDefault()};
 const context=e=>e.preventDefault(),blur=()=>{if(state)finish({pointerId:state.id,type:'blur'})};
 hand.addEventListener('pointerdown',down);hand.addEventListener('touchmove',touchmove,{passive:false});hand.addEventListener('contextmenu',context);hand.addEventListener('scroll',scroll,{passive:true});hand.addEventListener('click',click,true);
 globalThis.document?.addEventListener('visibilitychange',blur);
 window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);window.addEventListener('blur',blur);
 return()=>{disposed=true;clearTimeout(idle);clearDrag();state=null;u.handInteracting474=false;hand.removeEventListener('pointerdown',down);hand.removeEventListener('touchmove',touchmove);hand.removeEventListener('contextmenu',context);hand.removeEventListener('scroll',scroll);hand.removeEventListener('click',click,true);globalThis.document?.removeEventListener('visibilitychange',blur);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);window.removeEventListener('blur',blur)};
}
