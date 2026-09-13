import {motherLaw424} from '../primordial/Dial424.js';
import {chapterTwoFrameBounds383} from './ChapterTwoSprite383.js';
import {MOTHER_ID422} from '../primordial/Mother422.js';

export function motherPortraitStyle425(){
 const b=chapterTwoFrameBounds383(MOTHER_ID422);
 return `--mother-portrait-x425:${(b.left+b.right)*50}%;--mother-portrait-y425:${(b.top+b.bottom)*50}%;--mother-portrait-d425:${Math.max(b.right-b.left,b.bottom-b.top)*110}%`;
}
export function motherDialIndex425(b){
 const p=b?._motherDialPresentation425;
 if(p?.phase==='revealed'&&p.round===b.turn)return p.index;
 return b?.motherDial424?.lastRound?b.motherDial424.index:0;
}
export function motherDialText425(b){
 const p=b?._motherDialPresentation425;
 if(p?.round===b.turn&&p.phase==='spinning')return '十律輪が回転中…';
 const revealed=p?.round===b.turn&&p.phase==='revealed';
 if(revealed||b?.motherDial424?.lastRound===b?.turn){const l=motherLaw424(b.turn);return `${l.godName} ／ ${l.name}${revealed?'':'・発動済み'}`;}
 return '十律輪 ／ ラウンド開始時に作動';
}
export function motherDialMotion425({index,previousIndex=0,progress=0}){
 const t=Math.max(0,Math.min(1,progress)),from=-previousIndex*36,to=from+1080+((-index*36-from)%360+360)%360;
 // Fast initial sweep, a long deceleration, then a crisp numeral stop.
 return {angle:from+(to-from)*(1-(1-t)**4),growth:Math.min(1,t/.18)};
}
export function motherDialExpansion425(circle,arena){
 const cx=circle.left+circle.width/2,cy=circle.top+circle.height/2;
 const radius=Math.max(1,Math.min(cx-arena.left,arena.left+arena.width-cx,cy-arena.top,arena.top+arena.height-cy)-4);
 return {scale:Math.max(1,Math.min(1.18,radius*2/Math.max(1,circle.width))),dx:0,dy:0};
}

// Animates the existing boss backdrop. No clone, overlay, dialog or new timer
// per render. A root replaced by a speed/auto toggle rejoins at elapsed time.
export async function playMotherDial425({getRoot,law,previousIndex=0,speed=1,reducedMotion=false,onPhase=()=>{},isCurrent=()=>true,sound=()=>{},
 now=()=>performance.now(),raf=fn=>requestAnimationFrame(fn),cancel=id=>cancelAnimationFrame(id),delay=ms=>new Promise(r=>setTimeout(r,ms))}){
 const factor=Math.max(1,Number(speed)||1),spin=reducedMotion?120:Math.max(420,Math.round(1600/factor)),hold=Math.max(260,Math.round(680/factor)),shrink=reducedMotion?0:Math.max(100,Math.round(220/factor));
 let frame=0,active=true,binding=null,phase='spinning';const started=now(),touched=new Set();
 const bind=()=>{
  const root=getRoot(),circle=root?.querySelector('[data-mother-unit425] .mother-dial424'),arena=root?.querySelector('.battle-arena');
  if(!circle||!arena)return null;
  if(binding?.circle!==circle){
   const wheel=circle.querySelector('.mother-dial-wheel424'),c=circle.getBoundingClientRect(),a=(root.querySelector('.side-enemies')??arena).getBoundingClientRect();
   if(!wheel||!c.width)return null;
   binding={root,circle,wheel,expansion:motherDialExpansion425(c,a)};touched.add(binding);
  }
  return binding;
 };
 const paint=(progress,returning=0)=>{
  const b=bind();if(!b)return;
  const motion=motherDialMotion425({index:law.index,previousIndex,progress}),g=reducedMotion?0:motion.growth*(1-returning),e=b.expansion;
  b.circle.dataset.dialPhase425=phase;
  for(const numeral of b.wheel.querySelectorAll?.('[data-dial-numeral424]')??[])numeral.classList.toggle('is-selected433',phase!=='spinning'&&Number(numeral.dataset.dialNumeral424)===law.index);
  b.circle.style.setProperty('--dial-grow425',String(1+(e.scale-1)*g));
  b.circle.style.setProperty('--dial-dx425',`${e.dx*g}px`);b.circle.style.setProperty('--dial-dy425',`${e.dy*g}px`);
  b.wheel.style.setProperty('transform',`rotate(${phase!=='spinning'?-law.index*36:reducedMotion?-previousIndex*36:motion.angle}deg)`,'important');
  const result=b.root.querySelector('[data-mother-result425]');if(result)result.textContent=phase==='spinning'?'十律輪が回転中…':`${law.godName} ／ ${law.name}`;
 };
 const tick=()=>{if(!active||!isCurrent())return;paint(Math.min(1,(now()-started)/spin),phase==='returning'?Math.min(1,(now()-started-spin-hold)/Math.max(1,shrink)):0);frame=raf(tick);};
 try{
  onPhase('spinning');sound('start');frame=raf(tick);await delay(spin);if(!isCurrent())return;
  phase='revealed';onPhase('revealed');paint(1);if(binding)binding.wheel.style.setProperty('transform',`rotate(${-law.index*36}deg)`,'important');sound('stop');
  await delay(hold);if(!isCurrent())return;phase='returning';if(shrink)await delay(shrink);
 }finally{
  active=false;cancel(frame);
  for(const b of touched){delete b.circle.dataset.dialPhase425;for(const key of ['--dial-grow425','--dial-dx425','--dial-dy425'])b.circle.style.removeProperty(key);b.wheel.style.setProperty('transform',`rotate(${-law.index*36}deg)`,'important');}
 }
}
