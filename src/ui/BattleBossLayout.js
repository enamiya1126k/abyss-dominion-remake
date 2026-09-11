import {endgameSpriteBounds399,endgameArtFit399} from './EndgameSprite399.js?v=3.1.79-build399';
import {chapterTwoFrameBounds383} from './ChapterTwoSprite383.js?v=3.1.82-build402';
import {layoutBattleCircles405} from './BattleCircleLayout405.js?v=3.1.85-build405';
// Position against visible pixels, not the transparent sprite canvas. Cache
// one alpha scan per URL; idle animation does not trigger repeated layout work.
const boundsCache=new Map();
let observer=null,queuedFrame=0;
function visibleBounds(image){
 const endgame=endgameSpriteBounds399(image.dataset?.endgameSprite399);
 if(endgame)return endgame;
 const key=image.currentSrc||image.src;
 if(boundsCache.has(key))return boundsCache.get(key);
 let bounds={left:0,top:0,right:1,bottom:1};
 if(image.complete&&image.naturalWidth){
  try{
   const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
   const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0,128,128);
   const pixels=context.getImageData(0,0,128,128).data;let left=128,top=128,right=0,bottom=0;
   for(let y=0;y<128;y++)for(let x=0;x<128;x++)if(pixels[(y*128+x)*4+3]>24){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1)}
   if(right>left&&bottom>top)bounds={left:left/128,top:top/128,right:right/128,bottom:bottom/128};
  }catch{/* Cross-origin or unavailable art uses a conservative full box. */}
  boundsCache.set(key,bounds);
 }
 return bounds;
}
const overlaps=(a,b,gap=3)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;

// The normal silhouette uses Chapter I's 54–88px roaming-art size. Fitting
// transparent margins separately prevents a 128px canvas becoming a tiny foe.
export function chapterTwoArtScale382({width,height,slotWidth,headroom,normalSize,boss=false}){
 return Math.max(.01,Math.min(boss?1:normalSize/Math.max(1,height),Math.max(1,slotWidth-8)/Math.max(1,width),Math.max(1,headroom)/Math.max(1,height)));
}
function layoutChapterTwoEnemies382(root,arena){
 const arenaRect=arena.getBoundingClientRect();
 for(const unit of root.querySelectorAll('.side-enemies .side-battle-unit')){
  const art=unit.querySelector('.side-unit-sprite>.monster-visual'),image=art?.querySelector('svg[data-monster-atlas],img:not([hidden])'),card=unit.querySelector('.side-unit-card'),label=unit.querySelector('.battle-unit-floating-name');
  if(!art||!image||!image.dataset.monsterAtlas&&(!image.complete||!image.naturalWidth)||!card||!label)continue;
  unit.prepend(label);unit.classList.remove('boss-name-in-card');
  art.style.setProperty('translate','none','important');art.style.setProperty('scale','1','important');
  const native=chapterTwoFrameBounds383(image.dataset.monsterAtlas),source=native??visibleBounds(image),b=native??{...source,left:1-source.right,right:1-source.left};
  const ur=unit.getBoundingClientRect(),cr=card.getBoundingClientRect(),initial=image.getBoundingClientRect(),labelHeight=label.getBoundingClientRect().height;
  const top=Math.max(ur.top,arenaRect.top+4),headroom=cr.top-top-labelHeight-12;
  const scale=chapterTwoArtScale382({width:initial.width*(b.right-b.left),height:initial.height*(b.bottom-b.top),slotWidth:ur.width,headroom,normalSize:Math.max(54,Math.min(88,(globalThis.innerWidth||390)*.16)),boss:unit.classList.contains('party-floor-boss')});
  art.style.setProperty('scale',String(scale),'important');
  const ir=image.getBoundingClientRect(),dx=ur.left+ur.width/2-(ir.left+ir.width*(b.left+b.right)/2),dy=cr.top-5-(ir.top+ir.height*b.bottom);
  art.style.setProperty('translate',`${dx}px ${dy}px`,'important');
  label.style.setProperty('--chapter-name-y',`${ir.top+ir.height*b.top+dy-ur.top-labelHeight-5}px`);
  unit.dataset.bossLayout='ready';
 }
}

export function layoutPartyBosses(root){
 if(!root?.isConnected)return;
 const arena=root.querySelector('.battle-arena');if(!arena)return;
 const placed=[];
 for(const unit of root.querySelectorAll('.side-battle-unit.party-floor-boss')){
  if(root.classList.contains('chapter-two-battle380')&&unit.closest('.side-enemies'))continue;
  const sprite=unit.querySelector('.side-unit-sprite'),art=unit.querySelector('.party-floor-boss-art'),image=art?.querySelector('img'),card=unit.querySelector('.side-unit-card'),label=unit.querySelector('.battle-unit-floating-name');
  if(!sprite||!art||!image||!card||!label)continue;
  // Undo only this routine's previous positioning before measuring again.
  sprite.append(label);unit.classList.remove('boss-name-in-card');
  art.style.setProperty('translate','none','important');label.style.removeProperty('--boss-name-y');
  const endgame=Boolean(endgameSpriteBounds399(image.dataset?.endgameSprite399));
  if(endgame)art.style.setProperty('scale','1','important');
  const source=visibleBounds(image),mirrored=endgame&&Boolean(unit.closest('.side-enemies'));
  const b=mirrored?{...source,left:1-source.right,right:1-source.left}:source;
  const cr=card.getBoundingClientRect(),ar=arena.getBoundingClientRect();
  if(endgame){
   const initial=image.getBoundingClientRect(),ur=unit.getBoundingClientRect();
   const headroom=cr.top-Math.max(ur.top,ar.top+4)-label.getBoundingClientRect().height-12;
   const scale=endgameArtFit399({width:initial.width*(b.right-b.left),height:initial.height*(b.bottom-b.top),slotWidth:Math.min(ur.width,ar.width-10),headroom});
   art.style.setProperty('scale',String(scale),'important');
  }
  const ir=image.getBoundingClientRect();
  const visibleBottom=ir.top+ir.height*b.bottom,visibleLeft=ir.left+ir.width*b.left,visibleRight=ir.left+ir.width*b.right;
  const dy=cr.top-5-visibleBottom;
  const dx=visibleLeft<ar.left+5?ar.left+5-visibleLeft:visibleRight>ar.right-5?ar.right-5-visibleRight:0;
  art.style.setProperty('translate',`${dx}px ${dy}px`,'important');
  const sr=sprite.getBoundingClientRect(),height=label.getBoundingClientRect().height;
  label.style.setProperty('--boss-name-y',`${ir.top+ir.height*b.top+dy-sr.top-height-5}px`);
  unit.dataset.bossLayout='ready';
  placed.push({unit,art,card,label,dx,visibleBottom});
  const lr=label.getBoundingClientRect(),obstacles=[...root.querySelectorAll('.side-unit-card,.battle-unit-floating-name')].filter(node=>node!==label&&!card.contains(node));
  if(lr.left<ar.left+2||lr.right>ar.right-2||lr.top<ar.top+2||obstacles.some(node=>overlaps(lr,node.getBoundingClientRect()))){
   // If the headroom is occupied, give the name its own row. It may never
   // cover another unit's HP, name, or its own level row.
   unit.classList.add('boss-name-in-card');card.prepend(label);
   const newTop=card.getBoundingClientRect().top;
   art.style.setProperty('translate',`${dx}px ${newTop-5-visibleBottom}px`,'important');
  }
 }
 // Moving a later unit's name into its card can enlarge that card toward an
 // earlier label. Resolve those new collisions after every unit is placed.
 for(let pass=0;pass<placed.length;pass++){
  let changed=false;
  for(const {unit,art,card,label,dx,visibleBottom} of placed){
   if(unit.classList.contains('boss-name-in-card'))continue;
   const bounds=label.getBoundingClientRect();
   if([...root.querySelectorAll('.side-unit-card,.battle-unit-floating-name')].some(node=>node!==label&&!card.contains(node)&&overlaps(bounds,node.getBoundingClientRect()))){
    unit.classList.add('boss-name-in-card');card.prepend(label);
    art.style.setProperty('translate',`${dx}px ${card.getBoundingClientRect().top-5-visibleBottom}px`,'important');changed=true;
   }
  }
  if(!changed)break;
 }
 if(root.classList.contains('chapter-two-battle380'))layoutChapterTwoEnemies382(root,arena);
 // Circle placement must follow all silhouette and name/card adjustments.
 layoutBattleCircles405(root,visibleBounds);
}

export function mountBattleBossLayout(root){
 observer?.disconnect();observer=null;if(queuedFrame)cancelAnimationFrame(queuedFrame);queuedFrame=0;
 if(!root?.querySelector('.side-unit-sprite'))return;
 const schedule=()=>{if(!root.isConnected||queuedFrame)return;queuedFrame=requestAnimationFrame(()=>{queuedFrame=0;layoutPartyBosses(root)})};
 queuedFrame=0;schedule();
 for(const image of root.querySelectorAll('.side-unit-sprite .monster-visual img'))if(!image.complete){image.addEventListener('load',schedule,{once:true});image.addEventListener('error',schedule,{once:true})}
 if(typeof ResizeObserver==='function'){observer=new ResizeObserver(schedule);observer.observe(root.querySelector('.battle-arena')??root)}
}
