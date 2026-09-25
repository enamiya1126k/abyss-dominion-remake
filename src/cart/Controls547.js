import {CART543 as C,clamp543} from './Rules543.js';
import {point543} from './Renderer543.js';
import {pull547} from './Sling547.js';
import {unlock543} from './Audio543.js';
const ui=c=>c.cartUI543;
const me=c=>c.state?.cart?.players.find(p=>p.playerId===c.transport.selfId);
export function canPull547(c){const g=c.state?.cart;return g?.phase==='play'&&me(c)&&!me(c).launched&&!ui(c).pending547&&c.ready()&&Date.now()+(c.offset??0)<g.roundAt+C.launchWindow}
function send(c,action,pull){
 const g=c.state?.cart;if(!canPull547(c))return false;
 const seq=++ui(c).seq;
 return c.raw('cartInput543',{gameId:g.id,round:g.round,seq,action,...(pull?{angle:pull.angle,power:pull.power}:{})})===false?false:seq;
}
function clear(c){const u=ui(c),id=u.pointer547,host=u.capture547;clearTimeout(u.pullTimer547);u.pullTimer547=null;u.pull547=null;u.pointer547=null;u.capture547=null;
 if(id!=null&&host?.hasPointerCapture(id))host.releasePointerCapture(id);
}
export function cancelPull547(c,notify=true){const u=ui(c);if(u?.pull547&&notify)send(c,'cancel');if(u)clear(c)}
export function shoot547(c){const u=ui(c),pull=u?.pull547;if(!pull?.active||!canPull547(c)){cancelPull547(c);return false}
 const seq=send(c,'shoot',pull);if(seq!==false)u.pending547={seq,round:c.state.cart.round,power:pull.power,angle:pull.angle};clear(c);return seq!==false;
}
function update(c,pull,force=false){const u=ui(c);u.pull547=pull;u.aim545=pull.angle;
 const now=performance.now(),remaining=75-(now-(u.lastPullSend547??-1000));
 const flush=()=>{u.pullTimer547=null;if(!u.pull547)return;u.lastPullSend547=performance.now();send(c,'pull',u.pull547)};
 if(force||remaining<=0){clearTimeout(u.pullTimer547);flush()}
 else if(u.pullTimer547==null)u.pullTimer547=setTimeout(flush,remaining);
}
export function bindSling547(c,root,signal){
 const u=ui(c),on=(host,event,fn)=>host.addEventListener(event,fn,{signal});
 const local=e=>{const b=root.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top}};
 let start,metrics;
 const sample=e=>pull547(start,local(e),metrics);
 on(root,'pointerdown',e=>{
  // A second finger cancels the pull. Its eventual lift must never be mistaken
  // for releasing the launch finger (including native pinch gesture sequences).
  if(e.pointerType==='touch'&&u.pointer547!=null&&e.pointerId!==u.pointer547){e.preventDefault();cancelPull547(c);return}
  if(e.button!==0||e.isPrimary===false||u.pointer547!=null||!e.target.closest('[data-ct-sling]')||!canPull547(c))return;
  e.preventDefault();unlock543(u);u.nodes.canvas.focus({preventScroll:true});
  const r=u.renderer,p=me(c),a=point543(r,p.x,p.y),x=point543(r,p.x+1,p.y),y=point543(r,p.x,p.y+1);
  start=local(e);metrics={width:r.width,height:r.height,xScale:x.x-a.x,yScale:a.y-y.y,skewX:y.x-a.x};
  u.pointer547=e.pointerId;u.capture547=root;root.setPointerCapture(e.pointerId);update(c,sample(e),true);
 });
 on(root,'pointermove',e=>{if(e.pointerId!==u.pointer547)return;e.preventDefault();if(!canPull547(c)){cancelPull547(c,false);return}update(c,sample(e))});
 on(root,'pointerup',e=>{if(e.pointerId!==u.pointer547)return;e.preventDefault();u.pull547=sample(e);if(u.pull547.active)shoot547(c);else cancelPull547(c)});
 on(root,'pointercancel',e=>{if(e.pointerId===u.pointer547)cancelPull547(c)});
 on(root,'lostpointercapture',e=>{if(e.pointerId===u.pointer547)cancelPull547(c)});
 on(root,'contextmenu',e=>{if(e.target.closest('[data-ct-sling]'))e.preventDefault()});
 on(window,'blur',()=>cancelPull547(c));
 on(document,'visibilitychange',()=>{if(document.hidden)cancelPull547(c)});
 return()=>cancelPull547(c);
}
export function slingKey547(c,e){
 if(!c.root?.querySelector('.ct-play547')||/INPUT|TEXTAREA/.test(e.target?.tagName)||e.altKey||e.ctrlKey||e.metaKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','Space','Escape'].includes(e.code))return false;
 // Let a real header button retain its normal keyboard behavior.
 if(e.target?.closest('button'))return false;
 e.preventDefault();if(e.code==='Escape'){cancelPull547(c);return true}if(!canPull547(c)||ui(c).pointer547!=null)return true;
 unlock543(ui(c));if(['Enter','Space'].includes(e.code)){if(!e.repeat)shoot547(c);return true}
 const old=ui(c).pull547??{power:.25,angle:0},power=clamp543(old.power+(e.code==='ArrowUp'?.05:e.code==='ArrowDown'?-.05:0),0,1),angle=clamp543(old.angle+(e.code==='ArrowLeft'?-.08:e.code==='ArrowRight'?.08:0),-C.maxAngle,C.maxAngle);
 update(c,{power:power>0?Math.max(.08,power):0,angle,active:power>0,keyboard:true},true);return true;
}
