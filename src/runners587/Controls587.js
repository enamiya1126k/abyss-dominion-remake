import {feedback592,thumb592} from './Feedback592.js';
import {predict591} from './Motion591.js';
import {clock563 as clock} from '../party/Arcade563.js';
import {unlock543} from '../cart/Audio543.js';
import {keyCode588} from './Feel588.js';
const game=c=>c.state?.runners,ui=c=>c.runnersUI587,me=c=>game(c)?.players.find(p=>p.playerId===c.transport.selfId);
export const active587=c=>{const g=game(c),p=me(c);return g?.phase==='play'&&g.stage==='run'&&p?.alive&&p.finishTime==null&&!p.respawnAt&&c.ready()&&c.connected()&&clock(c)-g.serverAt<500;};
function target(c){const u=ui(c),keys={left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD'],jump:['Space','ArrowUp','KeyW'],attack:['KeyX','KeyK']};const held=kind=>[...u.pointers.values()].includes(kind)||[...u.keys].some(k=>keys[kind].includes(k));return{axis:Number(held('right'))-Number(held('left')),jump:held('jump'),attack:held('attack')};}
export function send587(c,force=false){const u=ui(c);if(!active587(c))return false;const t=target(c),now=performance.now();u.intent=t;if(!force&&now-u.lastSent<60)return false;const g=game(c),seq=++u.seq,sent=c.raw('runnersInput587',{gameId:g.id,round:g.round,seq,action:'control',target:t});if(sent!==false){u.lastSent=now;(u.inputs591??=[]).push({seq,at:clock(c),target:t});if(u.inputs591.length>24)u.inputs591.shift();if(t.jump&&!u.sentJump)u.pendingJump={seq,at:clock(c)};u.sentJump=t.jump;}return sent!==false;}
export function stop587(c,{send=true}={}){const u=ui(c);if(!u)return;const had=u.pointers?.size||u.keys?.size||u.intent?.axis||u.intent?.jump||u.intent?.attack,ids=[...(u.pointers?.keys()??[])];u.pointers?.clear();u.keys?.clear();u.intent={axis:0,jump:false,attack:false};u.pendingJump=null;if(send&&had)send587(c,true);u.sentJump=false;for(const b of u.captureNodes592??u.buttons??[]){b.classList.remove('is-held');for(const id of ids)try{if(b.hasPointerCapture(id))b.releasePointerCapture(id);}catch{}}}
export const predict587=predict591;
export function bind587(c,on){const u=ui(c);u.buttons=[...u.root.querySelectorAll('[data-ru-control]')];
 const pad=u.root.querySelector('.ru-directions587');
 const refresh=()=>{const t=target(c);for(const b of u.buttons)b.classList.toggle('is-held',b.dataset.ruControl==='left'?t.axis<0:b.dataset.ruControl==='right'?t.axis>0:!!t[b.dataset.ruControl]);};
 for(const b of [pad,...u.buttons.filter(b=>!['left','right'].includes(b.dataset.ruControl))]){
  const direction=b===pad;
  on(b,'pointerdown',e=>{if(e.button>0||!active587(c))return;e.preventDefault();e.stopPropagation();unlock543(u);
   if(direction)u.padRect592=pad.getBoundingClientRect();
   try{b.setPointerCapture(e.pointerId);}catch{}
   u.pointers.set(e.pointerId,direction?thumb592(e.clientX,e.clientY,u.padRect592):b.dataset.ruControl);
   refresh();feedback592(u);send587(c,true);
  });
  if(direction)on(b,'pointermove',e=>{if(!u.pointers.has(e.pointerId)||!active587(c))return;e.preventDefault();
   const old=u.pointers.get(e.pointerId),next=thumb592(e.clientX,e.clientY,u.padRect592,old);
   if(old!==next){u.pointers.set(e.pointerId,next);refresh();if(next!=='neutral')feedback592(u);send587(c,true);}
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])on(b,type,e=>{if(!u.pointers.has(e.pointerId))return;e.preventDefault();u.pointers.delete(e.pointerId);refresh();send587(c,true);});
 }
 u.captureNodes592=[pad,...u.buttons];
 for(const type of ['contextmenu','selectstart','dragstart'])on(u.root,type,e=>e.preventDefault());
 on(u.root,'touchstart',e=>{if(e.target.closest('[data-ru-control],.ru-directions587'))e.preventDefault();});
 on(window,'keyup',e=>{if(u.keys.delete(keyCode588(e))){e.preventDefault();send587(c,true);}});on(window,'blur',()=>stop587(c));
}
export function key587(c,e){const code=keyCode588(e);if(!c.root?.querySelector('.ru-play587')||/INPUT|TEXTAREA/.test(e.target?.tagName)||!code)return false;e.preventDefault();if(active587(c)&&!e.repeat){const u=ui(c);unlock543(u);u.keys.add(code);send587(c,true);}return true;}
export function controlsTick587(c){const u=ui(c);if(!active587(c)){stop587(c,{send:false});return;}if(u.pointers.size||u.keys.size||u.intent?.axis||u.intent?.jump||u.intent?.attack)send587(c);for(const b of u.buttons)b.classList.toggle('is-held',b.dataset.ruControl==='attack'?!!u.intent.attack:b.dataset.ruControl==='jump'?!!u.intent.jump:b.dataset.ruControl==='left'?u.intent.axis<0:u.intent.axis>0);}
