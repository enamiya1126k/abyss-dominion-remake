import {CHAPTER_TWO_SPRITES392} from '../data/chapterTwoSprites392.js?v=3.1.72-build392';
import {CHAPTER_TWO_SPRITES391} from '../data/chapterTwoSprites391.js?v=3.1.71-build391';
import {CHAPTER_TWO_SPRITES390} from '../data/chapterTwoSprites390.js?v=3.1.70-build390';
import {CHAPTER_TWO_SPRITES389} from '../data/chapterTwoSprites389.js?v=3.1.69-build389';
import {CHAPTER_TWO_SPRITES388} from '../data/chapterTwoSprites388.js?v=3.1.68-build388';
import {CHAPTER_TWO_SPRITES387} from '../data/chapterTwoSprites387.js?v=3.1.67-build387';
import {CHAPTER_TWO_SPRITES386} from '../data/chapterTwoSprites386.js?v=3.1.66-build386';
import {CHAPTER_TWO_SPRITES385} from '../data/chapterTwoSprites385.js?v=3.1.65-build385';
import {CHAPTER_TWO_SPRITES383} from '../data/chapterTwoSprites383.js?v=3.1.63-build383';
import {CHAPTER_TWO_SPRITES384} from '../data/chapterTwoSprites384.js?v=3.1.64-build384';
let serial=0;
const cache=new Map();
export const CHAPTER_TWO_CANVAS_CACHE_LIMIT402=12;
export function chapterTwoSprite383(subject){const id=typeof subject==='string'?subject:subject?.visualSpeciesId??subject?.speciesId;return CHAPTER_TWO_SPRITES383[id]??CHAPTER_TWO_SPRITES384[id]??CHAPTER_TWO_SPRITES385[id]??CHAPTER_TWO_SPRITES386[id]??CHAPTER_TWO_SPRITES387[id]??CHAPTER_TWO_SPRITES388[id]??CHAPTER_TWO_SPRITES389[id]??CHAPTER_TWO_SPRITES390[id]??CHAPTER_TWO_SPRITES391[id]??CHAPTER_TWO_SPRITES392[id]??null;}
export function chapterTwoFrame383(subject,frame='idle1'){
 const atlas=chapterTwoSprite383(subject);if(!atlas)return null;
 const region=atlas.frames[frame==='idle'?'idle1':frame]??atlas.frames.idle1,[left,top,right,bottom]=region.box,scale=224/atlas.extent,width=(right-left)*scale,height=(bottom-top)*scale;
 return{atlas,region,left,top,sourceWidth:right-left,sourceHeight:bottom-top,x:(256-width)/2,y:244-height,width,height,scale};
}
export function chapterTwoClipPath383(region){return(region.paths??[region.clip]).map(points=>`M${points.split(' ').join('L')}Z`).join(' ');}
export function chapterTwoAtlasHtml383(id,frame,animationState){
 const f=chapterTwoFrame383(id,frame),clipId=`chapter-atlas-${++serial}`;
 return `<svg viewBox="0 0 256 256" aria-hidden="true" focusable="false" data-monster-atlas="${id}" data-monster-sprite data-frame="${frame}" data-animation-state="${animationState}"><svg data-atlas-window x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" viewBox="${f.left} ${f.top} ${f.sourceWidth} ${f.sourceHeight}" overflow="hidden"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><path d="${chapterTwoClipPath383(f.region)}" clip-rule="evenodd"/></clipPath></defs><image href="${f.atlas.url}" width="${f.atlas.width}" height="${f.atlas.height}" clip-path="url(#${clipId})"/></svg></svg>`;
}
export function setChapterTwoAtlasFrame383(svg,frame,animationState){
 const f=chapterTwoFrame383(svg.dataset.monsterAtlas,frame),window=svg.querySelector('[data-atlas-window]');if(!f||!window)return;
 svg.dataset.frame=frame;svg.dataset.animationState=animationState;
 for(const key of ['x','y','width','height'])window.setAttribute(key,String(f[key]));
 window.setAttribute('viewBox',`${f.left} ${f.top} ${f.sourceWidth} ${f.sourceHeight}`);
 window.querySelector('path').setAttribute('d',chapterTwoClipPath383(f.region));
}
export function chapterTwoFrameBounds383(subject){
 // Stable footprint for idle animation and name placement.
 const frames=['idle1','idle2','idle3'].map(frame=>chapterTwoFrame383(subject,frame));
 if(!frames[0])return null;
 return{left:Math.min(...frames.map(f=>f.x))/256,right:Math.max(...frames.map(f=>f.x+f.width))/256,top:Math.min(...frames.map(f=>f.y))/256,bottom:244/256};
}
export function chapterTwoCanvasFrame383(subject,frame){
 const f=chapterTwoFrame383(subject,frame);if(!f||typeof document==='undefined')return null;
 let entry=cache.get(f.atlas.url);
 if(!entry){
  while(cache.size>=CHAPTER_TWO_CANVAS_CACHE_LIMIT402){const oldest=cache.keys().next().value,stale=cache.get(oldest);stale.image.onload=null;stale.image.onerror=null;stale.frames.clear();cache.delete(oldest);}
  const image=new Image();entry={image,ready:false,frames:new Map()};cache.set(f.atlas.url,entry);image.onload=()=>entry.ready=true;image.src=f.atlas.url;
 }else{cache.delete(f.atlas.url);cache.set(f.atlas.url,entry);}
 if(!entry.ready)return null;
 const key=Object.hasOwn(f.atlas.frames,frame)?frame:'idle1';if(entry.frames.has(key))return entry.frames.get(key);
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');
 ctx.imageSmoothingEnabled=false;ctx.translate(f.x,f.y);ctx.scale(f.scale,f.scale);ctx.translate(-f.left,-f.top);
 ctx.beginPath();for(const points of f.region.paths??[f.region.clip]){points.split(' ').forEach((pair,i)=>{const [x,y]=pair.split(',').map(Number);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}ctx.clip('evenodd');ctx.drawImage(entry.image,0,0);
 entry.frames.set(key,canvas);return canvas;
}
