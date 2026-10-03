import {RUN587,control587,stepRunner587} from './Physics587.js';
import {clock563 as clock} from '../party/Arcade563.js';
import {unlock543} from '../cart/Audio543.js';
import {keyCode588,thumb588} from './Feel588.js';
const game=c=>c.state?.runners,ui=c=>c.runnersUI587,me=c=>game(c)?.players.find(p=>p.playerId===c.transport.selfId);
export const active587=c=>{const g=game(c),p=me(c);return g?.phase==='play'&&g.stage==='run'&&p?.alive&&p.finishTime==null&&!p.respawnAt&&c.ready()&&c.connected()&&clock(c)-g.serverAt<500;};
function target(c){const u=ui(c),held=kind=>[...u.pointers.values()].includes(kind)||[...u.keys].some(k=>kind==='left'?['ArrowLeft','KeyA'].includes(k):kind==='right'?['ArrowRight','KeyD'].includes(k):['Space','ArrowUp','KeyW'].includes(k));return{axis:Number(held('right'))-Number(held('left')),jump:held('jump')};}
export function send587(c,force=false){const u=ui(c);if(!active587(c))return false;const t=target(c),now=performance.now();u.intent=t;if(!force&&now-u.lastSent<75)return false;const g=game(c),seq=++u.seq,sent=c.raw('runnersInput587',{gameId:g.id,round:g.round,seq,action:'control',target:t});if(sent!==false){u.lastSent=now;if(t.jump&&!u.sentJump)u.pendingJump={seq,at:clock(c)};u.sentJump=t.jump;}return sent!==false;}
export function stop587(c,{send=true}={}){const u=ui(c);if(!u)return;const had=u.pointers?.size||u.keys?.size||u.intent?.axis||u.intent?.jump,ids=[...(u.pointers?.keys()??[])];u.pointers?.clear();u.keys?.clear();u.intent={axis:0,jump:false};u.pendingJump=null;if(send&&had)send587(c,true);u.sentJump=false;for(const b of u.buttons??[]){b.classList.remove('is-held');for(const id of ids)try{if(b.hasPointerCapture(id))b.releasePointerCapture(id);}catch{}}}
export function predict587(c,p,at){const g=game(c),u=ui(c),q={...p};if(!p.alive||p.respawnAt||p.finishTime!=null||g.phase!=='play'||g.stage!=='run')return q;
 const ms=Math.min(90,Math.max(0,at-g.serverAt));if(p.playerId===c.transport.selfId&&!p.auto){const pending=u.pendingJump;if(pending&&p.lastSeq>=pending.seq)u.pendingJump=null;control587(q,u.intent??{axis:0,jump:false},g.serverAt);if(pending&&p.lastSeq<pending.seq&&at-pending.at<200)q.jumpBufferUntil=g.serverAt+RUN587.buffer;}
 for(let dt=0;dt<ms;){const step=Math.min(RUN587.step,ms-dt);dt+=step;stepRunner587(q,g.serverAt+dt,g.elapsed+dt,step/1000,g);}return q;
}
export function bind587(c,on){const u=ui(c);u.buttons=[...u.root.querySelectorAll('[data-ru-control]')];
 for(const b of u.buttons){on(b,'pointerdown',e=>{if(e.button>0||!active587(c))return;e.preventDefault();unlock543(u);b.setPointerCapture(e.pointerId);u.pointers.set(e.pointerId,b.dataset.ruControl);b.classList.add('is-held');send587(c,true);});
  if(b.dataset.ruControl!=='jump')on(b,'pointermove',e=>{if(!u.pointers.has(e.pointerId)||!active587(c))return;e.preventDefault();const next=thumb588(e.clientX,e.clientY,b.parentElement.getBoundingClientRect());if(u.pointers.get(e.pointerId)!==next){u.pointers.set(e.pointerId,next);send587(c,true);}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])on(b,type,e=>{if(!u.pointers.has(e.pointerId))return;e.preventDefault();u.pointers.delete(e.pointerId);b.classList.toggle('is-held',[...u.pointers.values()].includes(b.dataset.ruControl));send587(c,true);});
 }
 on(window,'keyup',e=>{if(u.keys.delete(keyCode588(e))){e.preventDefault();send587(c,true);}});on(window,'blur',()=>stop587(c));
}
export function key587(c,e){const code=keyCode588(e);if(!c.root?.querySelector('.ru-play587')||/INPUT|TEXTAREA/.test(e.target?.tagName)||!code)return false;e.preventDefault();if(active587(c)&&!e.repeat){const u=ui(c);unlock543(u);u.keys.add(code);send587(c,true);}return true;}
export function controlsTick587(c){const u=ui(c);if(!active587(c)){stop587(c,{send:false});return;}if(u.pointers.size||u.keys.size||u.intent?.axis||u.intent?.jump)send587(c);for(const b of u.buttons)b.classList.toggle('is-held',b.dataset.ruControl==='jump'?!!u.intent.jump:b.dataset.ruControl==='left'?u.intent.axis<0:u.intent.axis>0);}
